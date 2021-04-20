import { Machine, MachineConfig, ActorRef, send, assign } from 'xstate';
import { produce } from 'immer'
import { Spell } from './common';
import { PlayerEvent } from './player';

interface BattleStateSchema {
    states: {
        waitForReady: {};
        exchangeAttacks: {};
        done: {};
    };
}

const numPlayers = 2

export interface BattleContext {
    players: Array<ActorRef<PlayerEvent>>
    selectedSpells: Array<(Spell | null)>
    resolved: Array<boolean>

    winner: number
}

export type BattleEvent =
    | { type: 'START' }
    | { type: 'PLAYER_READY', player: 0, spell: Spell }
    | { type: 'PLAYER_READY', player: 1, spell: Spell }
    | { type: 'ATTACK_RESOLVED', player: 0 }
    | { type: 'ATTACK_RESOLVED', player: 1 }
    | { type: 'DEFEATED', player: 0 }
    | { type: 'DEFEATED', player: 1 }

const machineConfig: MachineConfig<BattleContext, BattleStateSchema, BattleEvent> = {
    id: 'battle',
    initial: 'waitForReady',
    states: {
        waitForReady: {
            entry: assign({
                selectedSpells: (_context, _event) => Array(numPlayers).fill(null),
                resolved: (_context, _event) => Array(numPlayers).fill(false),
            }),
            on: {
                PLAYER_READY: [
                    {
                        actions: assign({
                            selectedSpells: (context, event) => (produce(context.selectedSpells, draftSpells => {
                                draftSpells[event.player] = event.spell
                            })),
                        })
                    },
                    {
                        target: 'exchangeAttacks',
                        cond: (context, _) => context.selectedSpells.map((spell) => (spell != null))
                                                .reduce((accumulator, currentValue) => (accumulator && currentValue))
                    }
                ]
            }
        },
        exchangeAttacks: {
            entry: [
                send((context, _event) => ({ type: 'ATTACK', spell: context.selectedSpells[0] }),
                     { to: (context) => context.players[1] }),
                send((context, _event) => ({ type: 'ATTACK', spell: context.selectedSpells[1] }),
                     { to: (context) => context.players[0] }),
            ],
            on: {
                ATTACK_RESOLVED: {
                    actions: assign({
                        resolved: (context, event) => (produce(context.resolved, draftResolved => {
                            draftResolved[event.player] = true
                        }))
                    })
                },
                DEFEATED: {
                    actions: assign({ winner: (_context, event) => event.player }),
                    target: 'done',
                }
            }
        },
        done: {
            type: 'final'
        }
    }
};

export const BattleMachine = Machine(machineConfig)
