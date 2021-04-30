import { Machine, StateNodeConfig, assign, sendParent } from 'xstate';
import { Spell } from './common';

interface PlayerStateSchema {
    states: {
        normal: {};
        check: {};
        defeat: {};
    };
}

interface PlayerContext {
    id: number
    hp: number
    damage: number
    effectTurns: number
}

export type PlayerEvent =
    | { type: 'ATTACK', spell: Spell }

export type PlayerToParentEvent =
    | { type: 'TURN_RESOLVED', player: number, message?: string }
    | { type: 'COMPLETION' }

export const playerMachine = Machine<PlayerContext, PlayerStateSchema, PlayerEvent>({
    id: 'player',
    initial: 'normal',
    states: {
        normal: {
            on: {
                ATTACK: [
                    {
                        actions: [
                            'computeHp',
                            sendParent((context, _event) => ({
                                type: 'TURN_RESOLVED',
                                player: context.id,
                                message: 'Spell hits!',
                            }))
                        ],
                        target: 'check',
                    }
                ]
            }
        },
        check: {
            on: {
                '': [
                    { cond: 'hpZero', target: 'defeat' },
                    { target: 'normal' },
                ]
            }
        },
        defeat: {
            entry: sendParent((_context, _event) => ({ type: 'COMPLETION' })),
            type: 'final'
        }
    }
},
{
    actions: {
        decrementCount: assign({ effectTurns: (context, _) => context.effectTurns - 1 }),
        computeHp: assign({ hp: (context, _event) => context.hp - context.damage }),
    },
    guards: {
        hpZero: (context, _) => context.hp <= 0,
        effectExpired: (context, _) => context.effectTurns <= 0,
    },
});
