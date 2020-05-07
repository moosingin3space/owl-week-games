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

export { weightedFlip };