import { Machine, State, SpawnedActorRef, assign, spawn, send, forwardTo, actions } from 'xstate';
import { battleMachine, BattleToParentEvent } from './battle';
import { playerMachine, PlayerEvent, PlayerToParentEvent } from './player';
import { Character, Spell, characters, spells } from './common';

import { randUniform } from '../randomness';

const { stop } = actions;

interface UxStateSchema {
    states: {
        intro: {};
        config: {};
        preBattle: {};
        battle: {
            states: {
                waitSpellChoice: {};
                waitSpellTarget: {};
                resolving: {};
                waitNext: {};
            };
        };
        win: {};
        loss: {};
        draw: {};
    }
}

export interface UxContext {
    humanCharacter: Character | null;
    aiCharacter: Character | null;

    selectedSpell: Spell | null;

    human: SpawnedActorRef<PlayerEvent> | null;
    ai: SpawnedActorRef<PlayerEvent> | null;
}

export type UxEvent =
    | { type: 'START' }
    | { type: 'PICK_CHARACTER', selected: Character }
    | { type: 'CHOOSE_SPELL', selected: Spell }
    | { type: 'TARGET_SPELL', targetPosition: number }
    | { type: 'NEXT_TURN' }
    | { type: 'AGAIN' }
    | BattleToParentEvent
    | PlayerToParentEvent

export const uxMachine = Machine<UxContext, UxStateSchema, UxEvent>({
    id: 'ux',
    initial: 'intro',
    context: {
        humanCharacter: null,
        aiCharacter: null,

        selectedSpell: null,

        human: null,
        ai: null,
    },
    states: {
        intro: {
            on: {
                START: 'config'
            }
        },
        config: {
            entry: assign({
                humanCharacter: (_context, _event) => null,
                aiCharacter: (_context, _event) => null,
                human: (_context, _event) => null,
                ai: (_context, _event) => null,
            }),
            on: {
                PICK_CHARACTER: {
                    actions: assign({
                        humanCharacter: (_context, event) => event.selected,
                        aiCharacter: (_context, _event) => characters[randUniform(0, characters.length-1)],
                    }),
                    target: 'preBattle',
                },
            }
        },
        preBattle: {
            on: {
                '': {
                    actions: assign({
                        human: (_context, _event) => spawn(playerMachine.withContext({ id: 0, hp: 100, effectTurns: 0, damage: 25 }), { sync: true }),
                        ai: (_context, _event) => spawn(playerMachine.withContext({ id: 1, hp: 100, effectTurns: 0, damage: 50 }), { sync: true }),
                    }),
                    target: 'battle',
                }
            }
        },
        battle: {
            invoke: [
                {
                    id: 'battle',
                    src: (context, _event) => battleMachine.withContext({
                        players: [context.human!, context.ai!],
                        selectedSpells: [null, null],
                        resolved: [false, false],
                    })
                }
            ],
            initial: 'waitSpellChoice',
            states: {
                waitSpellChoice: {
                    entry: assign({
                        selectedSpell: (_context, _event) => null,
                    }),
                    on: {
                        CHOOSE_SPELL: {
                            actions: assign({
                                selectedSpell: (_context, event) => event.selected,
                            }),
                            target: 'waitSpellTarget',
                        }
                    }
                },
                waitSpellTarget: {
                    on: {
                        TARGET_SPELL: {
                            // TODO determine if the spell hit
                            actions: [
                                send(
                                    (context, _event) => ({ type: 'PLAYER_READY', player: 0, spell: context.selectedSpell }),
                                    { to: 'battle' }),
                                // TODO make this AI actually decent
                                send(
                                    (_context, _event) => ({ type: 'PLAYER_READY', player: 1, spell: spells[randUniform(0, spells.length-1)] }),
                                    { to: 'battle' }),
                            ],
                            target: 'resolving',
                        }
                    }
                },
                resolving: {
                    on: {
                        TURN_RESOLVED: { actions: forwardTo('battle') },
                        BATTLE_TURN_RESOLVED: 'waitNext',
                        COMPLETION: [
                            {
                                cond: (context, _event) => context.human!.state.context.hp == 0 && context.ai!.state.context.hp != 0,
                                target: '#ux.loss',
                                internal: false,
                            },
                            {
                                cond: (context, _event) => context.human!.state.context.hp != 0 && context.ai!.state.context.hp == 0,
                                target: '#ux.win',
                                internal: false,
                            },
                            {
                                cond: (context, _event) => context.human!.state.context.hp == 0 && context.ai!.state.context.hp == 0,
                                target: '#ux.draw',
                                internal: false,
                            }
                        ]
                    }
                },
                waitNext: {
                    on: {
                        NEXT_TURN: 'waitSpellChoice'
                    }
                }
            }
        },
        win: {
            entry: ['stopHuman', 'stopAi'],
            on: {
                AGAIN: 'config',
            }
        },
        loss: {
            entry: ['stopHuman', 'stopAi'],
            on: {
                AGAIN: 'config',
            }
        },
        draw: {
            entry: ['stopHuman', 'stopAi'],
            on: {
                AGAIN: 'config',
            }
        },
    }
},
{
    actions: {
        stopHuman: stop((context, _event) => context.human!),
        stopAi: stop((context, _event) => context.ai!),
    }
});

export type UxState = State<UxContext, UxEvent, UxStateSchema>;
