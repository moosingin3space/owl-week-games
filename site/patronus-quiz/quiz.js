import Questions from '/patronus-quiz/questions.js';

let quizQuestion = -1;

let answerState = {
};

const mainElt = document.querySelector("main");
const questionCard = document.querySelector("#question-card");
const answerTemp = document.querySelector("#answer");
const attrTemp = document.querySelector("#attribution");
const endTemp = document.querySelector("#end-of-game");
const gameOpener = mainElt.querySelector("section[data-first]").cloneNode(true);

function scrollTop() {
    window.focus();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function resetGame() {
    quizQuestion = -1;
    for (const point in Questions.answers) {
        answerState[point] = 0;
    }
    const child = mainElt.querySelector("section");
    if (!child.getAttribute("data-first")) {
        mainElt.replaceChild(gameOpener, child);
    }
    setupListeners(mainElt);
}

function enableAdvanceButton(button) {
    button.removeAttribute("disabled");
}

function setupListeners(elt) {
    const button = elt.querySelector("button.next");
    button.addEventListener("click", advanceQuestion);
    const options = elt.querySelectorAll("input[type=radio]");
    for (const opt of options) {
        opt.addEventListener("click", () => enableAdvanceButton(button));
    }
}

function recordVote(elt) {
    const selected = elt.querySelector("input:checked");
    if (!selected) {
        return;
    }
    const point = selected.value;
    if (point in answerState) {
        answerState[point]++;
    } else {
        console.error(`${point} is not a valid answerState`);
    }
}

function addAttribution(attrib, elt) {
    if (!attrib) {
        return;
    }
    const clone = attrTemp.content.cloneNode(true);
    const links = clone.querySelectorAll("a");
    links[0].textContent = attrib.title;
    links[0].setAttribute("href", attrib.webpage);

    links[1].textContent = attrib.author.name;
    links[1].setAttribute("href", attrib.author.profile);

    links[2].textContent = attrib.license.name;
    links[2].setAttribute("href", attrib.license.link);

    const mods = clone.querySelector("i");
    mods.textContent = attrib.modifications;

    elt.appendChild(clone);
}

function displayResults(elt) {
    const clone = endTemp.content.cloneNode(true);
    const header = clone.querySelector("h1");
    const paragraph = clone.querySelector("p.text");
    const attr = clone.querySelector("p.attribution");
    const image = clone.querySelector("img");
    let maxAnswer = 'inconclusive';
    let numAnswers = 0;
    for (const ans in answerState) {
        if (answerState[ans] >= numAnswers) {
            maxAnswer = ans;
            numAnswers = answerState[ans];
        }
    }
    let infinitive = 'a';
    const firstChar = Array.from(maxAnswer)[0];
    if (firstChar == 'a' || firstChar == 'e' || firstChar == 'i'
            || firstChar == 'o' || firstChar == 'u') {
        infinitive = "an";
    }
    header.textContent = `Your Patronus is ${infinitive} ${maxAnswer}!`
    const text = Questions.answers[maxAnswer].text;
    paragraph.textContent = text;
    image.src = Questions.answers[maxAnswer].image;
    addAttribution(Questions.answers[maxAnswer].attribution, attr);

    const button = clone.querySelector("button");
    button.addEventListener("click", resetGame);

    mainElt.replaceChild(clone, elt);
}

function advanceQuestion() {
    const child = mainElt.querySelector("section");
    if (!child.getAttribute("data-first")) {
        recordVote(child);
    }

    quizQuestion++;
    
    if (quizQuestion >= Questions.questions.length) {
        displayResults(child);
        scrollTop();
        return;
    }

    const clone = questionCard.content.cloneNode(true);
    const questionTitleElt = clone.querySelector("h3");
    questionTitleElt.textContent = Questions.questions[quizQuestion].title;
    const questionImageElt = clone.querySelector("img");
    questionImageElt.src = Questions.questions[quizQuestion].image || "";
    const questionAttributionElt = clone.querySelector("p.attribution");
    addAttribution(Questions.questions[quizQuestion].attribution, questionAttributionElt);
    const answersList = clone.querySelector("ul");
    for (const answer of Questions.questions[quizQuestion].answers) {
        const answerClone = answerTemp.content.cloneNode(true);
        const input = answerClone.querySelector("input");
        const label = answerClone.querySelector("label");
        label.textContent = answer.text;
        label.setAttribute("for", answer.point);
        input.setAttribute("id", answer.point);
        input.setAttribute("value", answer.point);
        answersList.appendChild(answerClone);
    }
    setupListeners(clone);

    mainElt.replaceChild(clone, child);
    scrollTop();
}

resetGame();