import * as bcu from 'bigint-crypto-utils';

class RSAPublicKey {
    constructor(e, n) {
        this.e = e;
        this.n = n;
    }
    getExpE() {
        return this.e;
    }
    getModN() {
        return this.n;
    }
    encrypt(m) {
        return bcu.modPow(m, this.e, this.n); // obtenim c (missatge encriptat) // C = m^e (mod n)
    }
    verify(s) {
        return bcu.modPow(s, this.e, this.n); // obtenim h (hash encriptat) s^e (mod n)
    }
}
class RSAPrivateKey {
    constructor(d, pubKey) {
        this.d = d;
        this.pubKey = pubKey;
    }
    getExpD() {
        return this.d;
    }
    getRSAPublicKey() {
        return this.pubKey;
    }
    decrypt(c) {
        return bcu.modPow(c, this.d, this.pubKey.getModN()); // obtenim m (missatge enviat)
    }
    sign(h) {
        return bcu.modPow(h, this.d, this.pubKey.getModN()); // obtenim s (resum hash)
    }
}
async function genPrime$1(nbits) {
    let n = BigInt(10);
    while (!await bcu.isProbablyPrime(n)) {
        n = await bcu.prime(nbits);
    }
    return n;
}
function isCoprime(a, b) {
    const exp = BigInt(1);
    return bcu.gcd(a, b) === exp;
}
function genE(mcm, nbits) {
    let e = bcu.randBetween(mcm, BigInt(1));
    while (!isCoprime(e, mcm)) {
        e = bcu.randBetween(mcm, BigInt(1));
    }
    return e;
}
async function generateRSAKeys(nbits = 2048) {
    // Qualsevol 2 nombres primers
    const p = await genPrime$1(nbits);
    const q = await genPrime$1(nbits);
    // Calculem el mòdul
    const n = p * q;
    const phiN = BigInt((p - BigInt(1)) * (q - BigInt(1)));
    // Generem l'exponent e:
    const mcm = bcu.lcm(p - BigInt(1), q - BigInt(1));
    const e = await genE(mcm);
    // Generem l'exponent d:
    const d = bcu.modInv(e, phiN); // ed = 1 mod(phiN)
    const pubKey = new RSAPublicKey(e, n);
    const privKey = new RSAPrivateKey(d, pubKey);
    return privKey;
}

// ================ CLASS ================
class PaillierPublicKey {
    constructor(n, n2, g) {
        this.n = n;
        this.n2 = n2;
        this.g = g;
    }
    getN() {
        return this.n;
    }
    getN2() {
        return this.n2;
    }
    getG() {
        return this.g;
    }
    encrypt(m) {
        const r = bcu.randBetween(this.n2);
        return (bcu.modPow(this.g, m, this.n2) * bcu.modPow(r, this.n, this.n2)) % this.n2;
    }
    add(cs) {
        let ret = 1n;
        for (const c of cs) {
            ret *= c;
        }
        return ret % this.n2;
    }
    multiply(c, m) {
        return bcu.modPow(c, m, this.n2);
    }
}
class PaillierPrivateKey {
    constructor(lambda, mu, pubKey) {
        this.lambda = lambda;
        this.mu = mu;
        this.pubKey = pubKey;
    }
    getLambda() {
        return this.lambda;
    }
    getMu() {
        return this.mu;
    }
    getPubKey() {
        return this.pubKey;
    }
    decrypt(c) {
        return (L(bcu.modPow(c, this.lambda, this.pubKey.getN2()), this.pubKey.getN()) * this.mu) % this.pubKey.getN();
    }
}
// ===========================================
// ================ FUNCTIONS ================
async function getPrime(nbits) {
    let n = 10n;
    while (!await bcu.isProbablyPrime(n)) {
        n = await bcu.prime(nbits);
    }
    return n;
}
/*
function isCoprime (a: bigint, b: bigint): boolean {
  const exp: bigint = 1n
  return bcu.gcd(a, b) === exp
}
*/
function L(x, n) {
    let mu = 1n;
    mu = (x - 1n) / n;
    return mu;
}
async function generatePaillierKeys(nbits = 2048) {
    // Get Primes
    const q = await getPrime(Math.floor(nbits / 2) + 1);
    const p = await getPrime(Math.floor(nbits) / 2);
    // Set modular space
    const n = q * p;
    const n2 = n ** 2n;
    // Set lambda
    const lambda = bcu.lcm(p - 1n, q - 1n);
    const g = bcu.randBetween(n2, 1n);
    const mu = bcu.modInv(L(bcu.modPow(g, lambda, n2), n), n);
    // public key
    const pubKey = new PaillierPublicKey(n, n2, g);
    const privKey = new PaillierPrivateKey(lambda, mu, pubKey);
    return privKey;
}
// ===========================================

// ================ CLASS ================
class SharedKey {
    constructor(s, Λ, t, p) {
        this.s = s; // Shared key
        this.Λ = Λ; // Position of the fragment
        this.t = t; // Threshold
        this.p = p; // Module
    }
    getSharedKeyS() {
        return this.s;
    }
    getPositionΛ() {
        return this.Λ;
    }
    getThreshold() {
        return this.t;
    }
    getModP() {
        return this.p;
    }
}
// ===========================================
// ================ FUNCTIONS ================
// var SharedKeys:SharedKey[] = new Array()
async function genPrime(nbits) {
    let n = BigInt(10);
    while (!await bcu.isProbablyPrime(n)) {
        n = await bcu.prime(nbits);
    }
    return n;
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function genSharedKeys(s, t, n, nbits) {
    const order = t - 1;
    const coeff = [];
    let i = 0;
    let j = 0;
    const SharedKeys = [];
    let y = s;
    // Determinació arbitrària dels mòdul p
    const p = await genPrime(nbits);
    // Determinació arbitrària dels n=ordre coeficients
    while (i < order) {
        coeff[i] = getRandomInt(1, 1000);
        i++;
    }
    i = 0;
    while (i < n) {
        // Funció F(X)=F(i+1)
        y = s;
        while (j < order) {
            y = y + BigInt(coeff[j] * ((i + 1) ** (j + 1)));
            j++;
        }
        y = bcu.modPow(y, 1, p);
        SharedKeys[i] = new SharedKey(y, i + 1, t, p);
        i++;
        j = 0;
    }
    return SharedKeys;
}
function LagrangeInterpolation(receivedSharedKeys) {
    let i = 0;
    let result = 0n;
    const t = receivedSharedKeys[0].getThreshold();
    let product = BigInt(1);
    let j = 0;
    const p = receivedSharedKeys[0].getModP();
    let numerator = 0;
    let denominator = 0;
    // Sumatori de i ϵ Λ
    while (i < t) {
        j = 0;
        // Productori de Λ
        while (j < t) {
            if (receivedSharedKeys[i].getPositionΛ() !== receivedSharedKeys[j].getPositionΛ()) {
                numerator = receivedSharedKeys[j].getPositionΛ().valueOf();
                denominator = receivedSharedKeys[j].getPositionΛ().valueOf() - receivedSharedKeys[i].getPositionΛ().valueOf();
                // Fer el mòdul invers és indispensable perquè no es pot convertir un número decimal a bigint. Per aquest motiu cal separar el numerador del denominador
                product = bcu.modInv(BigInt(denominator), p) * BigInt(numerator) * product;
            }
            j++;
        }
        result = result + receivedSharedKeys[i].getSharedKeyS().valueOf() * product;
        product = BigInt(1);
        i++;
    }
    return bcu.modPow(result, 1, p);
}

export { LagrangeInterpolation, PaillierPrivateKey, PaillierPublicKey, RSAPrivateKey, RSAPublicKey, SharedKey, genSharedKeys, generatePaillierKeys, generateRSAKeys };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubm9kZS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3RzL1JTQS50cyIsIi4uLy4uL3NyYy90cy9QYWlsbGllci50cyIsIi4uLy4uL3NyYy90cy9TZWNyZXQtc2hhcmluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6bnVsbCwibmFtZXMiOlsiZ2VuUHJpbWUiXSwibWFwcGluZ3MiOiI7O01BQ2EsWUFBWTtJQUl2QixZQUFhLENBQVMsRUFBRSxDQUFTO1FBQy9CLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDWDtJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDZDtJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDZDtJQUVNLE9BQU8sQ0FBRSxDQUFTO1FBQ3ZCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDckM7SUFFTSxNQUFNLENBQUUsQ0FBUztRQUN0QixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3JDO0NBQ0Y7TUFDWSxhQUFhO0lBSXhCLFlBQWEsQ0FBUyxFQUFFLE1BQW9CO1FBQzFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7S0FDckI7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ2Q7SUFFTSxlQUFlO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtLQUNuQjtJQUVNLE9BQU8sQ0FBRSxDQUFTO1FBQ3ZCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMs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