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
    const scrollButtons = clone.querySelectorAll(".scroller");
    for (const character of Characters) {
        const characterElt = characterTempl.content.cloneNode(true);
        const div = characterElt.querySelector("div.character");
        const button = characterElt.querySelector("button");
        div.classList.add(character);
        carousel.appendChild(characterElt);
        button.addEventListener('click', () => selectedCharacter(character));
    }

    scrollButtons[0].addEventListener('click', () => {
        if (!carousel.classList.contains("push-right")) {
            carousel.classList.add("push-left");
            scrollButtons[0].setAttribute("disabled", "disabled");
        }
        carousel.classList.remove("push-right");
        scrollButtons[1].removeAttribute("disabled");
    });
    scrollButtons[1].addEventListener('click', () => {
        if (!carousel.classList.contains("push-left")) {
            carousel.classList.add("push-right");
            scrollButtons[1].setAttribute("disabled", "disabled");
        }
        carousel.classList.remove("push-left");
        scrollButtons[0].removeAttribute("disabled");
    });

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
    userHpBar.style.width = `${currentDuelState.player.hp|0}%`;
    oppHpBar.style.width = `${currentDuelState.opponent.hp|0}%`;
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
    const otherCharacters = Characters.filter(c => c != charName);
    const opponentChar = randUniform(0, otherCharacters.length);
    currentDuelState.opponent.character = otherCharacters[opponentChar];
    resetDueler(currentDuelState.player);
    resetDueler(currentDuelState.opponent);
    displayFight();
}

function showMessage(explElt, msg) {
    const newElt = document.createElement("span");
    newElt.classList.add("duel-description");
    newElt.classList.add("new");
    newElt.textContent = msg;

    const animationEndHandler = () => {
        newElt.classList.remove("new");
        setTimeout(() => {
            newElt.removeEventListener('animationend', animationEndHandler);
            newElt.classList.add("end");
            newElt.addEventListener('transitionend', () => {
                newElt.remove();
            });
        }, 2000); // this timeout is the amount of time the message should be visible
    };

    newElt.addEventListener('animationend', animationEndHandler);
    explElt.appendChild(newElt);
}

function castSpell(selection) {
    const booksElt = mainElt.querySelector(".books-inner");
    booksElt.classList.add("dueling");

    const bookNames = Object.getOwnPropertyNames(Books);
    const oppSpell = randUniform(0, bookNames.length);
    const [myExpl, oppExpl] = mainElt.querySelectorAll(".explanation")

    showMessage(myExpl, `You cast ${selection.name}`);
    showMessage(oppExpl, `Opponent casts ${Books[bookNames[oppSpell]].name}`);

    setTimeout(() => {
        // TODO display animations
        resolveDuel(selection, Books[bookNames[oppSpell]]);
    }, 600); // this timeout is the wand animation duration
}

function resolveDuel(mySpell, oppSpell) {
    const userHpBar = mainElt.querySelector("#user-hp");
    const oppHpBar = mainElt.querySelector("#opp-hp");
    const userEffect = mainElt.querySelector("#user-effect");
    const oppEffect = mainElt.querySelector("#opp-effect");
    const [myExpl, oppExpl] = mainElt.querySelectorAll(".explanation");

    let myDamage = (currentDuelState.opponent.attack * oppSpell.offense)
                   - (currentDuelState.player.defense * mySpell.defense);
    const oppHits = weightedFlip(currentDuelState.opponent.accuracy);
    if (!oppHits) {
        myDamage = 0;
        showMessage(oppExpl, "Opponent missed!");
    }
    
    let oppDamage = (currentDuelState.player.attack * mySpell.offense)
                    - (currentDuelState.opponent.defense * oppSpell.defense);
    const iHit = weightedFlip(currentDuelState.player.accuracy);
    if (!iHit) {
        oppDamage = 0;
        showMessage(myExpl, "You missed!");
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

    if (myDamage == 0 && oppHits) {
        showMessage(oppExpl, "Opponent did no damage!");
    } else if (oppHits) {
        showMessage(oppExpl, "Opponent hits!");
    }
    if (oppDamage == 0 && iHit) {
        showMessage(myExpl, "You did no damage!");
    } else if (iHit) {
        showMessage(myExpl, "You hit!");
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
        setTimeout(displayFinal, 2750);
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

    setTimeout(nextRound, 2750);
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
    const instrs = clone.querySelector("h3");
    const button = clone.querySelector("button");

    if (currentDuelState.player.hp == 0) {
        if (currentDuelState.opponent.hp == 0) {
            instrs.textContent = "The duel results in a draw."
        } else {
            instrs.textContent = "Your opponent has won!";
        }
        winnerElt.classList.add(currentDuelState.opponent.character);
    } else {
        instrs.textContent = "You won!";
        winnerElt.classList.add(gameState.character);
    }

    button.addEventListener('click', resetGame);

    const child = mainElt.querySelector("section");
    mainElt.replaceChild(clone, child);
}

resetGame();