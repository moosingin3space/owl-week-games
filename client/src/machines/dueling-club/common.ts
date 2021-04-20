/* This file defines the types we care about */

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
        effect: { name: 'bound', turns: 3 },
    },
    {
        display: 'Expelliarmus',
        description: 'Disarms your opponent for 2 turns.',
        icon: 'expelliarmus',
        offense: 0,
        defense: 0,
        effect: { name: 'disarmed', turns: 2 },
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
        effect: { name: 'flipped', turns: 1 },
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
    | { name: 'bound', turns: 3 }
    | { name: 'flipped', turns: 1 }
    | { name: 'disarmed', turns: 2 }
