import { Machine, ActorRef, send, sendParent, assign, actions } from 'xstate';
import { produce } from 'immer'
import { Spell } from './common';
import { PlayerEvent, PlayerToParentEvent } from './player';

const { pure } = actions;

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
    ready: Array<boolean>;
}

export type BattleEvent =
    | { type: 'PLAYER_READY', player: 0, spell: Spell | null }
    | { type: 'PLAYER_READY', player: 1, spell: Spell | null }
    | PlayerToParentEvent

export type BattleToParentEvent =
    | { type: 'BATTLE_TURN_RESOLVED' }
    | { type: 'BATTLE_COMPLETION', player: number }

const sendAttack = (player: number, opponent: number) => pure((context: BattleContext, _event) => {
    if (context.selectedSpells[player] != null) {
        return send({ type: 'ATTACK', spell: context.selectedSpells[player] }, { to: context.players[opponent] });
    } else {
        return send({ type: 'ATTACK_MISSED' }, { to: context.players[opponent] });
    }
});

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
                            sendAttack(0, 1),
                            sendAttack(1, 0),
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
                COMPLETION: {
                    actions: sendParent((_context, event) => ({
                        type: 'BATTLE_COMPLETION',
                        player: event.id
                    })),
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
            ready: (_context, _event) => Array(numPlayers).fill(false),
        }),
        markPlayerReady: assign({
            selectedSpells: (context, event) => (produce(context.selectedSpells, draftSpells => { draftSpells[event.player] = event.spell })),
            ready: (context, event) => (produce(context.ready, draftReady => { draftReady[event.player] = true })),
        }),
        tellParentResolved: sendParent({ type: 'BATTLE_TURN_RESOLVED' }),
        markResolved: assign({
            resolved: (context, event) => (produce(context.resolved, draftResolved => { draftResolved[event.player] = true }))
        }),
    },
    guards: {
        allReady: (context, _event) => context.ready.reduce((accumulator, currentValue) => (accumulator && currentValue)),
        allResolved: (context, _event) => context.resolved.reduce((accumulator, currentValue) => (accumulator && currentValue)),
    },
});
