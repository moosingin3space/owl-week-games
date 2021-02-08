const Books = {
    'rictusempra': {
        name: "Rictusempra",
        description: "Does damage to your opponent.",
        offense: 1.8,
        defense: 1.0,
        effect: null,
    },
    'stupefy': {
        name: "Stupefy",
        description: "Damages your opponent and stuns them for one turn.",
        offense: 1.5,
        defense: 1.0,
        effect: null,
    },
    'petrificus-totalis': {
        name: "Petrificus Totalis",
        description: "Binds your opponent.",
        offense: 0,
        defense: 1.0,
        effect: 'bound'
    },
    'incarcerus': {
        name: "Incarcerus",
        description: "Binds your opponent with ropes.",
        offense: 1.0,
        defense: 1.0,
        effect: 'bound'
    },
    'expelliarmus': {
        name: "Expelliarmus",
        description: "Disarms your opponent for 4 turns.",
        offense: 0,
        defense: 0,
        effect: 'disarmed'
    },
    'protego': {
        name: "Protego",
        description: "Increases your defenses this turn.",
        offense: 0,
        defense: 5.0,
        effect: null
    },
    'impedimenta': {
        name: "Impedimenta",
        description: "Strikes and increases your defenses this turn.",
        offense: 1.25,
        defense: 1.5,
        effect: null
    },
    'levicorpus': {
        name: "Levicorpus",
        description: "Flips your opponent for one turn.",
        offense: 1.0,
        defense: 1.0,
        effect: 'flipped'
    }
};

const Characters = [
    'harry',
    'poc-1',
    'brunette-girl',
    'malfoy',
    'poc-2',
    'redhead',
    'asian'
];

const Effects = {
    'bound': {
        displayName: 'Bound',
        turns: 3,
        apply(character) {
            character.defense -= 5;
            character.accuracy -= 0.75;
        },
        undo(character) {
            character.defense += 5;
            character.accuracy += 0.75;
        },
    },
    'vomiting-slugs': {
        displayName: 'Vomiting Slugs',
        turns: 5,
        apply(character) {
            character.accuracy -= 0.2;
        },
        undo(character) {
            character.accuracy += 0.2;
        },
        onTurn(character) {
            character.hp -= 5;
        }
    },
    'jelly-legs': {
        displayName: 'Jelly Legs',
        turns: 3,
        apply(character) {
            character.accuracy -= 0.3;
            character.attack -= 5;
        },
        undo(character) {
            character.accuracy += 0.3;
            character.attack += 5;
        }
    },
    'flipped': {
        displayName: 'Flipped',
        turns: 1,
        apply(character) {
            character.accuracy -= 0.5;
        },
        undo(character) {
            character.accuracy += 0.5;
        },
        onTurn(character) {
            character.hp -= 10;
        }
    },
    'disarmed': {
        displayName: 'Disarmed',
        turns: 4,
        apply(character) {
            character.defense -= 10;
            character.accuracy -= 0.75;
        },
        undo(character) {
            character.defense += 10;
            character.accuracy += 0.75;
        }
    }
};

export { Books, Characters, Effects };