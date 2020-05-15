import { Books, Characters, Effects } from '/dueling-club/assets.js';
import { randUniform, weightedFlip, choice } from '/dueling-club/randomness.js';

const characterSelection = document.querySelector("#character-selection");
const fightTempl = document.querySelector("#fight");
const characterTempl = document.querySelector("#character");
const bookTempl = document.querySelector("#book");
const finalTempl = document.querySelector("#final-screen");
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
};

function resetDueler(dueler) {
    dueler.hp = 100;
    dueler.accuracy = 1.0;
    dueler.attack = 25;
    dueler.defense = 10;
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

function createBooksSelector(booksElt) {
    const bookNames = Object.getOwnPropertyNames(Books);
    const books = choice(bookNames, 5);
    for (const book of books) {
        const bookClone = bookTempl.content.cloneNode(true);
        const button = bookClone.querySelector("button");
        button.textContent = Books[book].name;
        button.setAttribute("title", Books[book].description);
        button.addEventListener('click', () => castSpell(Books[book]));
        booksElt.appendChild(bookClone);
    }
}

function syncHp(userHpBar, oppHpBar) {
    userHpBar.value = currentDuelState.player.hp;
    oppHpBar.value = currentDuelState.opponent.hp;
}

function displayFight() {
    const clone = fightTempl.content.cloneNode(true);

    const characterElts = clone.querySelectorAll(".character");
    characterElts[0].classList.add(gameState.character);
    characterElts[1].classList.add(currentDuelState.opponent.character);

    const userHpBar = clone.querySelector("#user-hp");
    const oppHpBar = clone.querySelector("#opp-hp");
    syncHp(userHpBar, oppHpBar);

    const booksElt = clone.querySelector(".books-inner");
    createBooksSelector(booksElt);

    const child = mainElt.querySelector("section");
    mainElt.replaceChild(clone, child);
}

function selectedCharacter(charName) {
    gameState.character = charName;
    const opponentChar = randUniform(0, Characters.length);
    currentDuelState.opponent.character = Characters[opponentChar];
    resetDueler(currentDuelState.player);
    resetDueler(currentDuelState.opponent);
    displayFight();
}

function castSpell(selection) {
    const booksElt = mainElt.querySelector(".books-inner");
    booksElt.classList.add("dueling");

    const bookNames = Object.getOwnPropertyNames(Books);
    const oppSpell = randUniform(0, bookNames.length);
    const myExpl = mainElt.querySelector("#my-what-happened");
    const oppExpl = mainElt.querySelector("#opp-what-happened");
    const mySpellExpl = mainElt.querySelector("#my-spell");
    const oppSpellExpl = mainElt.querySelector("#opp-spell");

    myExpl.textContent = "";
    oppExpl.textContent = "";

    mySpellExpl.textContent = selection.name;
    oppSpellExpl.textContent = Books[bookNames[oppSpell]].name;

    setTimeout(() => {
        // TODO display animations
        resolveDuel(selection, Books[bookNames[oppSpell]]);
    }, 450);
}

function resolveDuel(mySpell, oppSpell) {
    const userHpBar = mainElt.querySelector("#user-hp");
    const oppHpBar = mainElt.querySelector("#opp-hp");
    const userEffect = mainElt.querySelector("#user-effect");
    const oppEffect = mainElt.querySelector("#opp-effect");
    const myExpl = mainElt.querySelector("#my-what-happened");
    const oppExpl = mainElt.querySelector("#opp-what-happened");

    let myDamage = (currentDuelState.opponent.attack * oppSpell.offense)
                   - (currentDuelState.player.defense * mySpell.defense);
    const oppHits = weightedFlip(currentDuelState.opponent.accuracy);
    if (!oppHits) {
        myDamage = 0;
        oppExpl.textContent = "Opponent missed!";
    }
    
    let oppDamage = (currentDuelState.player.attack * mySpell.offense)
                    - (currentDuelState.opponent.defense * oppSpell.defense);
    const iHit = weightedFlip(currentDuelState.player.accuracy);
    if (!iHit) {
        oppDamage = 0;
        myExpl.textContent = "You missed!";
    }

    // Clamp damage
    if (myDamage < 0) {
        myDamage = 0;
    }
    if (oppDamage < 0) {
        oppDamage = 0;
    }

    currentDuelState.player.hp -= myDamage;
    currentDuelState.opponent.hp -= oppDamage;

    if (myDamage == 0 && oppExpl.textContent == "") {
        oppExpl.textContent = "Opponent did no damage.";
    }
    if (oppDamage == 0 && myExpl.textContent == "") {
        myExpl.textContent = "You did no damage.";
    }

    // Clamp HP
    let duelEnded = false;
    if (currentDuelState.player.hp < 0) {
        currentDuelState.player.hp = 0;
        duelEnded = true;
    }
    if (currentDuelState.opponent.hp < 0) {
        currentDuelState.opponent.hp = 0;
        duelEnded = true;
    }

    syncHp(userHpBar, oppHpBar);

    if (duelEnded) {
        setTimeout(displayFinal, 1500);
        return;
    }

    const oldOppEffect = currentDuelState.opponent.effect;
    const oldMyEffect = currentDuelState.player.effect;
    if (mySpell.effect != null && currentDuelState.opponent.effect == null && iHit) {
        currentDuelState.opponent.effect = mySpell.effect;
        currentDuelState.opponent.effectCounter = Effects[mySpell.effect].turns;
        Effects[mySpell.effect].apply(currentDuelState.opponent);
        oppEffect.textContent = Effects[mySpell.effect].displayName;
    }
    if (oppSpell.effect != null && currentDuelState.player.effect == null && oppHits) {
        currentDuelState.player.effect = oppSpell.effect;
        currentDuelState.player.effectCounter = Effects[oppSpell.effect].turns;
        Effects[oppSpell.effect].apply(currentDuelState.player);
        userEffect.textContent = Effects[oppSpell.effect].displayName;
    }
    if (currentDuelState.player.effect != null && oldMyEffect != null) {
        currentDuelState.player.effectCounter--;
        if (currentDuelState.player.effectCounter == 0) {
            Effects[currentDuelState.player.effect].undo(currentDuelState.player);
            currentDuelState.player.effect = null;
            userEffect.textContent = "";
        }
    }
    if (currentDuelState.opponent.effect != null && oldOppEffect != null) {
        currentDuelState.opponent.effectCounter--;
        if (currentDuelState.opponent.effectCounter == 0) {
            Effects[currentDuelState.opponent.effect].undo(currentDuelState.opponent);
            currentDuelState.opponent.effect = null;
            oppEffect.textContent = "";
        }
    }

    setTimeout(nextRound, 450);
}

function nextRound() {
    const booksElt = mainElt.querySelector(".books");
    const old = booksElt.firstChild;
    const booksInnerElt = document.createElement("div");
    booksInnerElt.classList.add("books-inner");
    createBooksSelector(booksInnerElt);
    booksElt.replaceChild(booksInnerElt, old);
}

function displayFinal() {
    const clone = finalTempl.content.cloneNode(true);
    const winnerElt = clone.querySelector("#winner");
    const loserElt = clone.querySelector("#loser");
    const instrs = clone.querySelector(".instructions");
    const button = clone.querySelector("button");

    if (currentDuelState.player.hp == 0) {
        if (currentDuelState.opponent.hp == 0) {
            instrs.textContent = "The duel results in a draw."
        } else {
            instrs.textContent = "Your opponent has won!";
        }
        winnerElt.classList.add(currentDuelState.opponent.character);
        loserElt.classList.add(gameState.character);
    } else {
        instrs.textContent = "You won!";
        winnerElt.classList.add(gameState.character);
        loserElt.classList.add(currentDuelState.opponent.character);
    }

    button.addEventListener('click', resetGame);

    const child = mainElt.querySelector("section");
    mainElt.replaceChild(clone, child);
}

resetGame();