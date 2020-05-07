const Books = [
    'rictusempra',
    'stupefy',
    'petrificus-totalis',
    'incarcerus',
    'expelliarmus',
    'protego',
    'impedimenta',
    'levicorpus'
];

const Characters = [
    'gryffindor-boy',
    'gryffindor-girl',
    
    'slytherin-boy',
    'slytherin-girl',

    'hufflepuff-boy',
    'hufflepuff-girl',

    'ravenclaw-boy',
    'ravenclaw-girl'
];

const Effects = {
    'bound': {
        displayName: 'Bound',
        turns: 3,
        apply(character) {
            character.mobile = false;
        },
        undo(character) {
            character.mobile = true;
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
    'stunned': {
        displayName: 'Stunned',
        turns: 1,
        apply(character) {
            character.mobile = false;
        },
        undo(character) {
            character.mobile = true;
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
    }
};

export { Books, Characters, Effects };