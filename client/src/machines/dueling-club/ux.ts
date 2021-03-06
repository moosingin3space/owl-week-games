import { Machine, State, SpawnedActorRef, assign, spawn, send, forwardTo, actions } from 'xstate';
import { battleMachine, BattleToParentEvent } from './battle';
import { playerMachine, PlayerEvent, PlayerToParentEvent, DEFAULT_ACCURACY, DEFAULT_DAMAGE } from './player';
import { Character, Spell, characters, spells } from './common';

import { weightedFlip, randUniform } from '../randomness';

const { pure, stop } = actions;

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

    lastHumanSpell: Spell | null;
    lastAiSpell: Spell | null;
}

type InternalEvent =
    | { type: 'WON' }
    | { type: 'LOSS' }
    | { type: 'DRAW' }

export type UxEvent =
    | { type: 'START' }
    | { type: 'PICK_CHARACTER', selected: Character }
    | { type: 'CHOOSE_SPELL', selected: Spell }
    | { type: 'TARGET_SPELL', targetPosition: number }
    | { type: 'NEXT_TURN' }
    | { type: 'AGAIN' }
    | BattleToParentEvent
    | PlayerToParentEvent
    | InternalEvent

const chooseCharacter = (userSelected: Character) => {
    const index = randUniform(0, characters.length-1);
    if (characters[index].name == userSelected.name) {
        return characters[index+1 % characters.length];
    } else {
        return characters[index];
    }
};

export const uxMachine = Machine<UxContext, UxStateSchema, UxEvent>({
    id: 'ux',
    initial: 'intro',
    context: {
        humanCharacter: null,
        aiCharacter: null,

        selectedSpell: null,

        human: null,
        ai: null,

        lastHumanSpell: null,
        lastAiSpell: null,
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
                        aiCharacter: (_context, event) => chooseCharacter(event.selected),
                    }),
                    target: 'preBattle',
                },
            }
        },
        preBattle: {
            on: {
                '': {
                    actions: assign({
                        human: (_context, _event) => spawn(playerMachine.withContext({
                            id: 0,
                            hp: 100,
                            accuracy: DEFAULT_ACCURACY,
                            effect: null,
                            effectTurns: 0,
                            lastSpellUsed: null,
                        }), { sync: true }),
                        ai: (_context, _event) => spawn(playerMachine.withContext({
                            id: 1,
                            hp: 100,
                            accuracy: DEFAULT_ACCURACY,
                            effect: null,
                            effectTurns: 0,
                            lastSpellUsed: null,
                        }), { sync: true }),
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
                        ready: [false, false],
                        castSpells: [null, null],
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
                            actions: [
                                pure((context, event) => {
                                    const greenThresh = context.human!.state.context.accuracy;
                                    const yellowThresh = greenThresh / 2.5;
                                    const green = event.targetPosition > greenThresh;
                                    const yellow = event.targetPosition > yellowThresh;
                                    let hit = green;
                                    if (yellow && !green) {
                                        let proportion = (event.targetPosition - yellowThresh) / (greenThresh - yellowThresh);
                                        // clamp at 25%
                                        if (proportion < 0.25) {
                                            proportion = 0.25;
                                        }
                                        // generate random number
                                        hit = weightedFlip(proportion);
                                    }
                                    let spell = context.selectedSpell;
                                    if (!hit) {
                                        spell = null;
                                    }
                                    return send({ type: 'PLAYER_READY', player: 0, spell }, { to: 'battle' });
                                }),
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
                        COMPLETION: { actions: forwardTo('battle') },
                        BATTLE_TURN_RESOLVED: {
                            actions: assign({
                                lastHumanSpell: (_context, event) => event.userSpell,
                                lastAiSpell: (_context, event) => event.opponentSpell,
                            }),
                            target: 'waitNext'
                        },
                        BATTLE_COMPLETION: {
                            actions: pure((_context, event) => {
                                if (event.player == 0) {
                                    return send({ type: 'LOSS' });
                                } else if (event.player == 1) {
                                    return send({ type: 'WON' });
                                }
                                return send({ type: 'DRAW'});
                            })
                        },
                        WON: '#ux.win',
                        LOSS: '#ux.loss',
                        DRAW: '#ux.draw',
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
