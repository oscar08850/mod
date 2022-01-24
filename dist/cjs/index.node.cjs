'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var bcu = require('bigint-crypto-utils');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var bcu__namespace = /*#__PURE__*/_interopNamespace(bcu);

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
        return bcu__namespace.modPow(m, this.e, this.n); // obtenim c (missatge encriptat) // C = m^e (mod n)
    }
    verify(s) {
        return bcu__namespace.modPow(s, this.e, this.n); // obtenim h (hash encriptat) s^e (mod n)
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
        return bcu__namespace.modPow(c, this.d, this.pubKey.getModN()); // obtenim m (missatge enviat)
    }
    sign(h) {
        return bcu__namespace.modPow(h, this.d, this.pubKey.getModN()); // obtenim s (resum hash)
    }
}
async function genPrime$1(nbits) {
    let n = BigInt(10);
    while (!await bcu__namespace.isProbablyPrime(n)) {
        n = await bcu__namespace.prime(nbits);
    }
    return n;
}
function isCoprime(a, b) {
    const exp = BigInt(1);
    return bcu__namespace.gcd(a, b) === exp;
}
function genE(mcm, nbits) {
    let e = bcu__namespace.randBetween(mcm, BigInt(1));
    while (!isCoprime(e, mcm)) {
        e = bcu__namespace.randBetween(mcm, BigInt(1));
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
    const mcm = bcu__namespace.lcm(p - BigInt(1), q - BigInt(1));
    const e = await genE(mcm);
    // Generem l'exponent d:
    const d = bcu__namespace.modInv(e, phiN); // ed = 1 mod(phiN)
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
        const r = bcu__namespace.randBetween(this.n2);
        return (bcu__namespace.modPow(this.g, m, this.n2) * bcu__namespace.modPow(r, this.n, this.n2)) % this.n2;
    }
    add(cs) {
        let ret = 1n;
        for (const c of cs) {
            ret *= c;
        }
        return ret % this.n2;
    }
    multiply(c, m) {
        return bcu__namespace.modPow(c, m, this.n2);
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
        return (L(bcu__namespace.modPow(c, this.lambda, this.pubKey.getN2()), this.pubKey.getN()) * this.mu) % this.pubKey.getN();
    }
}
// ===========================================
// ================ FUNCTIONS ================
async function getPrime(nbits) {
    let n = 10n;
    while (!await bcu__namespace.isProbablyPrime(n)) {
        n = await bcu__namespace.prime(nbits);
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
    const lambda = bcu__namespace.lcm(p - 1n, q - 1n);
    const g = bcu__namespace.randBetween(n2, 1n);
    const mu = bcu__namespace.modInv(L(bcu__namespace.modPow(g, lambda, n2), n), n);
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
    while (!await bcu__namespace.isProbablyPrime(n)) {
        n = await bcu__namespace.prime(nbits);
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
        y = bcu__namespace.modPow(y, 1, p);
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
                product = bcu__namespace.modInv(BigInt(denominator), p) * BigInt(numerator) * product;
            }
            j++;
        }
        result = result + receivedSharedKeys[i].getSharedKeyS().valueOf() * product;
        product = BigInt(1);
        i++;
    }
    return bcu__namespace.modPow(result, 1, p);
}

exports.LagrangeInterpolation = LagrangeInterpolation;
exports.PaillierPrivateKey = PaillierPrivateKey;
exports.PaillierPublicKey = PaillierPublicKey;
exports.RSAPrivateKey = RSAPrivateKey;
exports.RSAPublicKey = RSAPublicKey;
exports.SharedKey = SharedKey;
exports.genSharedKeys = genSharedKeys;
exports.generatePaillierKeys = generatePaillierKeys;
exports.generateRSAKeys = generateRSAKeys;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubm9kZS5janMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cy9SU0EudHMiLCIuLi8uLi9zcmMvdHMvUGFpbGxpZXIudHMiLCIuLi8uLi9zcmMvdHMvU2VjcmV0LXNoYXJpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOm51bGwsIm5hbWVzIjpbImJjdSIsImdlblByaW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQUNhLFlBQVk7SUFJdkIsWUFBYSxDQUFTLEVBQUUsQ0FBUztRQUMvQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQ1g7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ2Q7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ2Q7SUFFTSxPQUFPLENBQUUsQ0FBUztRQUN2QixPQUFPQSxjQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNyQztJQUVNLE1BQU0sQ0FBRSxDQUFTO1FBQ3RCLE9BQU9BLGNBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3JDO0NBQ0Y7TUFDWSxhQUFhO0lBSXhCLFlBQWEsQ0FBUyxFQUFFLE1BQW9CO1FBQzFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7S0FDckI7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ2Q7SUFFTSxlQUFlO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtLQUNuQjtJQUVNLE9BQU8sQ0FBRSxDQUFTO1FBQ3ZCLE9BQU9BLGNBQUcsQ0FBQyxN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
