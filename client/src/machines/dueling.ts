import { Machine, assign } from 'xstate'
import produce from 'immer'
import { randUniform, weightedFlip } from './randomness'
import { IGatsbyImageData } from "gatsby-plugin-image"
import { useStaticQuery, graphql } from "gatsby"

export interface Spell {
    name: string
    display: string
    description: string
    offense: number
    defense: number
    effect: Effect | null
}

interface HasHeadshot {
    headshot: IGatsbyImageData
}

export interface Character {
    name: string
}

export const spells : Array<Spell> = []; // TODO

export const characters : Array<Character> = [
    { name: 'harry' },
    { name: 'poc-1' },
    { name: 'brunette-girl' },
    { name: 'malfoy' },
    { name: 'poc-2' },
    { name: 'redhead' },
    { name: 'asian' },
];

export type Effect =
    | { name: 'bound' }
    | { name: 'vomiting-slugs' }
    | { name: 'jelly-legs' }
    | { name: 'flipped' }
    | { name: 'disarmed' }

interface HasCharacter {
    character: Character | null
}

export interface Stats {
    hp: number
    accuracy: number
    attack: number
    defense: number
    effect: Effect | null // TODO typesafe
    effectCounter: number | null
}

export interface DuelingContext extends HasCharacter {
    player: Stats
    opponent: Stats
    opponentCharacter: Character | null
}

interface DuelingStateSchema {
    states: {
        intro: {};
        characterSelect: {};
        battle: {};
        spellResult: {};
        victory: {};
        defeat: {};
    }
}

export type DuelingEvent =
    | { type: 'START' }
    | { type: 'PICK_CHARACTER', selected: Character }
    | { type: 'CAST_SPELL', spell: Spell }
    | { type: 'AGAIN' }

export const duelingMachine = Machine<DuelingContext, DuelingStateSchema, DuelingEvent>({
    id: 'dueling',
    initial: 'intro',
    context: {
        character: null,
        player: {
            hp: 100,
            accuracy: 1.0,
            attack: 25,
            defense: 10,
            effect: null,
            effectCounter: null,
        },
        opponent: {
            hp: 100,
            accuracy: 1.0,
            attack: 25,
            defense: 10,
            effect: null,
            effectCounter: null,
        },
        opponentCharacter: null
    },
    states: {
        intro: {
            on: {
                START: 'characterSelect'
            }
        },
        characterSelect: {
            entry: 'clearDuelState',
            on: {
                PICK_CHARACTER: {
                    actions: 'selectCharacter',
                    target: 'battle',
                }
            }
        },
        battle: {
            on: {
                CAST_SPELL: {
                    actions: 'computeSpellResult',
                    target: 'spellResult',
                }
            }
        },
        spellResult: {
            always: [
                {
                    cond: 'userHpZero',
                    target: 'defeat',
                },
                {
                    cond: 'opponentHpZero',
                    target: 'victory',
                },
                {
                    target: 'battle',
                }
            ]
        },
        victory: {
            on: {
                AGAIN: 'characterSelect',
            }
        },
        defeat: {
            on: {
                AGAIN: 'characterSelect',
            }
        }
    }
},
    {
        actions: {
            clearDuelState: assign((_context, _event) => ({
                character: null,
                player: {
                    hp: 100,
                    accuracy: 1.0,
                    attack: 25,
                    defense: 10,
                    effect: null,
                    effectCounter: null,
                },
                opponent: {
                    hp: 100,
                    accuracy: 1.0,
                    attack: 25,
                    defense: 10,
                    effect: null,
                    effectCounter: null,
                    character: null,
                }
            })),
            selectCharacter: assign({
                character: (_context, event) => {
                    if (event.type != 'PICK_CHARACTER') {
                        // TODO assert
                        return null;
                    }
                    return event.selected
                },
                opponentCharacter: (_context, _event) => characters[randUniform(0, characters.length)]
            }),
            computeSpellResult: assign((context, event) => {
                if (event.type != 'CAST_SPELL') {
                    // TODO assert
                    return context;
                }
                let oppSpell = spells[randUniform(0, spells.length)];
                return produce(context, draftContext => {
                    let myDamage = (context.opponent.attack * oppSpell.offense)
                                 - (context.player.defense * event.spell.defense);
                    const oppHits = weightedFlip(context.opponent.accuracy);
                    if (!oppHits) {
                        myDamage = 0;
                    }

                    let oppDamage = (context.player.attack * event.spell.offense)
                                  - (context.opponent.defense * oppSpell.defense);
                    const iHit = weightedFlip(context.player.accuracy);
                    if (!iHit) {
                        oppDamage = 0;
                    }

                    // Clamp damage
                    if (myDamage < 0) { myDamage = 0; }
                    if (oppDamage < 0) { oppDamage = 0; }

                    draftContext.player.hp -= myDamage;
                    draftContext.opponent.hp -= oppDamage;

                    // TODO logs?
                    // TODO how do I do these in xstate?

                    // TODO effects
                })
            }),
        },
        guards: {
            userHpZero: (context, _event) => context.player.hp <= 0,
            opponentHpZero: (context, _event) => context.opponent.hp <= 0,
        }
    })
