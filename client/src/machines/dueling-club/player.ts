import { Machine, State, assign, send, sendParent, actions } from 'xstate';
import { Spell } from './common';

const { pure } = actions;

interface PlayerStateSchema {
    states: {
        conditionalTurnStart: {};
        normal: {};
        flipped: {};
        disarmed: {};
        bound: {};
        checkHp: {};
        turnFinished: {};
        defeat: {};
    };
}

export interface PlayerContext {
    id: number
    hp: number
    effect: string | null
    effectTurns: number
    accuracy: number
}

export const DEFAULT_ACCURACY = 0.66;
const ACCURACY_FLIPPED = 0.90;
const ACCURACY_DISARMED = 0.95;
const ACCURACY_BOUND = 0.80;
const BASE_DAMAGE = 10;

export type PlayerEvent =
    | { type: 'ATTACK', spell: Spell }
    | { type: 'ATTACK_MISSED' }

export type PlayerToParentEvent =
    | { type: 'TURN_RESOLVED', player: number, message?: string }
    | { type: 'COMPLETION', id: number }

export type PlayerState = State<PlayerContext, PlayerEvent, PlayerStateSchema>;

export const playerMachine = Machine<PlayerContext, PlayerStateSchema, PlayerEvent>({
    id: 'player',
    initial: 'normal',
    states: {
        conditionalTurnStart: {
            on: {
                '': [
                    { cond: 'flipped', target: 'flipped' },
                    { cond: 'disarmed', target: 'disarmed' },
                    { cond: 'bound', target: 'bound' },
                    { target: 'normal' },
                ]
            }
        },
        normal: {
            entry: 'makeNormalAccuracy',
            on: {
                ATTACK: {
                    actions: ['computeHp', 'applyEffects'],
                    target: 'checkHp',
                },
                ATTACK_MISSED: 'checkHp',
            }
        },
        flipped: {
            entry: 'flipMe',
            on: {
                ATTACK: {
                    actions: 'computeHp',
                    target: 'checkHp',
                },
                ATTACK_MISSED: 'checkHp',
            },
            exit: 'checkEffect',
        },
        disarmed: {
            entry: 'disarmMe',
            on: {
                ATTACK: {
                    actions: 'computeHp',
                    target: 'checkHp',
                },
                ATTACK_MISSED: 'checkHp',
            },
            exit: 'checkEffect',
        },
        bound: {
            entry: 'bindMe',
            on: {
                ATTACK: {
                    actions: 'computeHp',
                    target: 'checkHp',
                },
                ATTACK_MISSED: 'checkHp',
            },
            exit: 'checkEffect',
        },
        checkHp: {
            on: {
                '': [
                    { cond: 'hpZero', target: 'defeat' },
                    { target: 'turnFinished' },
                ]
            }
        },
        turnFinished: {
            on: {
                '': {
                    actions: sendParent((context, _event) => ({
                        type: 'TURN_RESOLVED',
                        player: context.id,
                    })),
                    target: 'conditionalTurnStart'
                }
            }
        },
        defeat: {
            entry: sendParent((context, _event) => ({ type: 'COMPLETION', id: context.id })),
            type: 'final'
        }
    }
},
{
    actions: {
        decrementCount: assign({ effectTurns: (context, _) => context.effectTurns - 1 }),
        computeHp: assign({
            hp: (context, event) => context.hp - BASE_DAMAGE * event.spell.offense
        }),
        flipMe: assign({ accuracy: (_context, _event) => ACCURACY_FLIPPED }),
        bindMe: assign({ accuracy: (_context, _event) => ACCURACY_BOUND }),
        disarmMe: assign({ accuracy: (_context, _event) => ACCURACY_DISARMED }),
        makeNormalAccuracy: assign({ accuracy: (_context, _event) => DEFAULT_ACCURACY }),
        checkEffect: pure((context, _event) => {
            const newEffectTurns = context.effectTurns - 1;
            if (newEffectTurns <= 0) {
                return assign({ effect: (_context, _event) => null });
            } else {
                return assign({ effectTurns: (context, _) => newEffectTurns });
            }
        }),
        applyEffects: pure((_context, event) => {
            if (event.type != 'ATTACK') {
                // TODO assert
                console.error('invalid state to call applyEffects from');
                return [];
            }
            if (event.spell.effect) {
                return assign({
                    effect: (_context, _event) => event.spell.effect.name,
                    effectTurns: (_context, _event) => event.spell.effect.turns,
                });
            }
            return [];
        }),
    },
    guards: {
        hpZero: (context, _) => context.hp <= 0,
        flipped: (context, _) => context.effect == 'flipped',
        disarmed: (context, _) => context.effect == 'disarmed',
        bound: (context, _) => context.effect == 'bound',
    },
});
