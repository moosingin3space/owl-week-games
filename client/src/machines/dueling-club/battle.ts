import { Machine, ActorRef, send, sendParent, assign } from 'xstate';
import { produce } from 'immer'
import { Spell } from './common';
import { PlayerEvent, PlayerToParentEvent } from './player';

interface BattleStateSchema {
    states: {
        turnIdle: {};
        waitForReady: {};
        checkCanExchange: {};
        exchangeAttacks: {};
        checkAllResolved: {};
    };
}

const numPlayers = 2

export interface BattleContext {
    players: Array<ActorRef<PlayerEvent>>;
    selectedSpells: Array<(Spell | null)>;
    resolved: Array<boolean>;
}

export type BattleEvent =
    | { type: 'PLAYER_READY', player: 0, spell: Spell }
    | { type: 'PLAYER_READY', player: 1, spell: Spell }
    | PlayerToParentEvent

export type BattleToParentEvent =
    | { type: 'BATTLE_TURN_RESOLVED' }

export const battleMachine = Machine<BattleContext, BattleStateSchema, BattleEvent>({
    id: 'battle',
    initial: 'turnIdle',
    states: {
        turnIdle: {
            entry: 'clearTurnState',
            always: 'waitForReady',
        },
        waitForReady: {
            on: {
                PLAYER_READY: {
                    actions: 'markPlayerReady',
                    target: 'checkCanExchange',
                }
            }
        },
        checkCanExchange: {
            on: {
                '': [
                    {
                        target: 'exchangeAttacks',
                        cond: 'allReady',
                        actions: [
                            send((context, _event) => ({ type: 'ATTACK', spell: context.selectedSpells[0] }),
                                 { to: (context) => context.players[1] }),
                            send((context, _event) => ({ type: 'ATTACK', spell: context.selectedSpells[1] }),
                                 { to: (context) => context.players[0] }),
                        ]
                    },
                    { target: 'waitForReady' }
                ]
            }
        },
        exchangeAttacks: {
            on: {
                TURN_RESOLVED: {
                    actions: 'markResolved',
                    target: 'checkAllResolved'
                },
            }
        },
        checkAllResolved: {
            on: {
                '': [
                    {
                        target: 'turnIdle',
                        cond: 'allResolved',
                        actions: 'tellParentResolved',
                    },
                    { target: 'exchangeAttacks' }
                ]
            }
        },
    }
},
{
    actions: {
        clearTurnState: assign({
            selectedSpells: (_context, _event) => Array(numPlayers).fill(null),
            resolved: (_context, _event) => Array(numPlayers).fill(false),
        }),
        markPlayerReady: assign({
            selectedSpells: (context, event) => (produce(context.selectedSpells, draftSpells => { draftSpells[event.player] = event.spell })),
        }),
        tellParentResolved: sendParent({ type: 'BATTLE_TURN_RESOLVED' }),
        markResolved: assign({
            resolved: (context, event) => (produce(context.resolved, draftResolved => { draftResolved[event.player] = true }))
        }),
    },
    guards: {
        allReady: (context, _event) => context.selectedSpells.map((spell) => (spell != null)).reduce((accumulator, currentValue) => (accumulator && currentValue)),
        allResolved: (context, _event) => context.resolved.reduce((accumulator, currentValue) => (accumulator && currentValue)),
    },
});
