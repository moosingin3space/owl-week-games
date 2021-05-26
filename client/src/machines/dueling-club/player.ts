import { Machine, State, assign, send, sendParent, actions } from 'xstate';
import { Spell } from './common';

const { pure } = actions;

interface PlayerStateSchema {
    states: {
        conditionalTurnStart: {};
        normal: {};
        flipped: {};
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
const ACCURACY_FLIPPED = 0.20;
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
                    { target: 'normal' },
                ]
            }
        },
        normal: {
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
            exit: ['unflipMe', 'unapplyEffects'],
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
        unflipMe: assign({ accuracy: (_context, _event) => DEFAULT_ACCURACY }),
        unapplyEffects: assign({ effect: (_context, _event) => null }),
        applyEffects: pure((_context, event) => {
            if (event.type != 'ATTACK') {
                // TODO assert
                console.error('invalid state to call applyEffects from');
                return [];
            }
            if (event.spell.effect) {
                return assign({ effect: (_context, _event) => event.spell.effect.name });
            }
            return [];
        }),
    },
    guards: {
        hpZero: (context, _) => context.hp <= 0,
        flipped: (context, _) => context.effect == 'flipped',
        effectExpired: (context, _) => context.effectTurns <= 0,
    },
});
