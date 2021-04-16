import { Machine, assign } from 'xstate'
import produce from 'immer'
import { randUniform, weightedFlip } from './randomness'

export interface Spell {
    display: string
    description: string
    icon: string
    offense: number
    defense: number
    effect: Effect | null
}

export interface Character {
    name: string
}

export const spells : Array<Spell> = [
    {
        display: 'Rictusempra',
        description: 'Does damage to your opponent.',
        icon: 'rictusempra',
        offense: 1.8,
        defense: 1.0,
        effect: null,
    },
    {
        display: 'Stupefy',
        description: 'Damages your opponent and stuns them for one turn.',
        icon: 'stupefy',
        offense: 1.5,
        defense: 1.0,
        effect: null,
    },
    {
        display: 'Petrificus Totalis',
        description: 'Binds your opponent.',
        icon: 'petrificus-totalis',
        offense: 0,
        defense: 1.0,
        effect: { name: 'bound' },
    },
    {
        display: 'Incarcerus',
        description: 'Binds your opponent with ropes.',
        icon: 'incarcerus',
        offense: 1.0,
        defense: 1.0,
        effect: { name: 'bound' },
    },
    {
        display: 'Expelliarmus',
        description: 'Disarms your opponent for 4 turns.',
        icon: 'expelliarmus',
        offense: 0,
        defense: 0,
        effect: { name: 'disarmed' },
    },
    {
        display: 'Protego',
        description: 'Increases your defenses this turn.',
        icon: 'protego',
        offense: 0,
        defense: 1.5,
        effect: null,
    },
    {
        display: 'Impedimenta',
        description: 'Strikes and increases your defenses this turn.',
        icon: 'impedimenta',
        offense: 1.25,
        defense: 1.5,
        effect: null,
    },
    {
        display: 'Levicorpus',
        description: 'Flips your opponent for one turn.',
        icon: 'levicorpus',
        offense: 1.0,
        defense: 1.0,
        effect: { name: 'flipped' },
    }
];

export const characters : Array<Character> = [
    { name: 'harry' },
    { name: 'poc-1' },
    { name: 'brunette' },
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
        draw: {};
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
                    cond: 'bothHpZero',
                    target: 'draw',
                },
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
        },
        draw: {
            on: {
                AGAIN: 'characterSelect',
            }
        },
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
                const oppSpell = spells[randUniform(0, spells.length)];
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
            bothHpZero: (context, _event) => context.player.hp <= 0 && context.opponent.hp <= 0,
            userHpZero: (context, _event) => context.player.hp <= 0,
            opponentHpZero: (context, _event) => context.opponent.hp <= 0,
        }
    })
