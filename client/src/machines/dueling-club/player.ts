import { Machine, StateNodeConfig, assign, sendParent } from 'xstate';
import { Spell } from './common';

interface PlayerStateSchema {
    states: {
        normal: {};
        checkHp: {};
        turnFinished: {};
        defeat: {};
    };
}

interface PlayerContext {
    id: number
    hp: number
    effectTurns: number
    accuracy: number
}

export const DEFAULT_ACCURACY = 0.66;
const BASE_DAMAGE = 10;

export type PlayerEvent =
    | { type: 'ATTACK', spell: Spell }
    | { type: 'ATTACK_MISSED' }

export type PlayerToParentEvent =
    | { type: 'TURN_RESOLVED', player: number, message?: string }
    | { type: 'COMPLETION', id: number }

export const playerMachine = Machine<PlayerContext, PlayerStateSchema, PlayerEvent>({
    id: 'player',
    initial: 'normal',
    states: {
        normal: {
            on: {
                ATTACK: {
                    actions: 'computeHp',
                    target: 'checkHp',
                },
                ATTACK_MISSED: {
                    target: 'checkHp'
                }
            }
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
                    target: 'normal'
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
    },
    guards: {
        hpZero: (context, _) => context.hp <= 0,
        effectExpired: (context, _) => context.effectTurns <= 0,
    },
});
