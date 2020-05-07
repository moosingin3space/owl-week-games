import { Books, Characters } from '/dueling-club/assets.js';
import { weightedFlip } from '/dueling-club/randomness.js';

const characterSelection = document.querySelector("#character-selection");
const characterTempl = document.querySelector("#character");
const mainElt = document.querySelector("main");
const gameOpener = mainElt.querySelector("section[data-opening]").cloneNode(true);

let gameState = {
    character: null,
    wins: 0,
    losses: 0,
};

let currentDuelState = {
    player: {
        hp: 100,
        accuracy: 1.0,
        attack: 10,
        defense: 5,
        mobile: true,
        effect: null,
        effectCounter: null,
    },
    opponent: {
        hp: 100,
        accuracy: 1.0,
        attack: 10,
        defense: 5,
        effect: null,
        effectCounter: null,
    }
};

function resetDueler(dueler) {
    dueler.hp = 100;
    dueler.accuracy = 1.0;
    dueler.attack = 10;
    dueler.defense = 5;
    dueler.mobile = true;
    dueler.effect = null;
    dueler.effectCounter = null;
}

function resetGame() {
    gameState.character = null;
    gameState.wins = 0;
    gameState.losses = 0;
    resetDueler(currentDuelState.player);
    resetDueler(currentDuelState.opponent);
    const child = mainElt.querySelector("section");
    if (!child.getAttribute("data-opening")) {
        mainElt.replaceChild(gameOpener, child);
    }
    const button = mainElt.querySelector("button");
    button.addEventListener('click', displayCharSelector);
}

function displayCharSelector() {
    const clone = characterSelection.content.cloneNode(true);
    const carousel = clone.querySelector(".character-carousel-inner");
    for (const character of Characters) {
        const characterElt = characterTempl.content.cloneNode(true);
        const div = characterElt.querySelector("div.character");
        const button = characterElt.querySelector("button");
        div.classList.add(character);
        carousel.appendChild(characterElt);
        button.addEventListener('click', () => selectedCharacter(character));
    }

    const child = mainElt.querySelector("section");
    mainElt.replaceChild(clone, child);
}

function selectedCharacter(charName) {
    console.log(`You chose ${charName}!`);
    // TODO
}

resetGame();