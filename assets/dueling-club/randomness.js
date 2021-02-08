function prng(len=16) {
    const entropy = new Uint8Array(len);
    window.crypto.getRandomValues(entropy);
    let result = 0;

    for (let i = 0; i < len; i++) {
        result += Number(entropy[i])/Math.pow(256, (i+1));
    }
    return result;
}

function weightedFlip(pr) {
    return prng() < pr;
}

function randUniform(min, max) {
    const raw = prng();
    const scaled = min + raw*(max-min);
    return Math.floor(scaled);
}

function getCumulativeProbs(ratios) {
    let sum = 0;
    const toReturn = ratios.map(ratio => {
        sum += ratio;
        return sum;
    });
    return toReturn.map(x => x / sum);
}

function sampleOnce(cumulativeProbs) {
    const raw = prng();

    let cur = 0;
    while (raw > cumulativeProbs[cur]) {
        cur++;
    }
    return cur;
}

function choice(collection, N, ratios) {
    if (ratios === undefined) {
        ratios = collection.map(() => 1);
    }

    let cumulativeProbs = getCumulativeProbs(ratios);

    let toReturn = [];
    for (let i = 0; i < N; i++) {
        const chosen = sampleOnce(cumulativeProbs);
        toReturn.push(collection[chosen]);
    }
    return toReturn;
}

export { randUniform, weightedFlip, choice };