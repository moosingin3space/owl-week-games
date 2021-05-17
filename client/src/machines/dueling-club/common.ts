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
        description: 'Causes opponent to buckle with laughter.',
        icon: 'rictusempra',
        offense: 1.8,
        defense: 1.0,
        effect: null,
    },
    {
        display: 'Stupefy',
        description: 'Stuns opponent.',
        icon: 'stupefy',
        offense: 1.5,
        defense: 1.0,
        effect: null,
    },
    {
        display: 'Petrificus Totalis',
        description: 'Binds your opponent for 3 turns.',
        icon: 'petrificus-totalis',
        offense: 0,
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
        description: "Shields you from opponent's spell.",
        icon: 'protego',
        offense: 0,
        defense: 1.5,
        effect: null,
    },
    {
        display: 'Impedimenta',
        description: 'Strikes and slows opponent.',
        icon: 'impedimenta',
        offense: 1.25,
        defense: 1.5,
        effect: null,
    },
    {
        display: 'Levicorpus',
        description: 'Flips your opponent for next turn.',
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
