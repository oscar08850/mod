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
    blind(r, m) {
        const n = this.getModN();
        const aux = m * (r ** this.e);
        const menBlind = bcu__namespace.modPow(aux, 1, n);
        return menBlind;
    }
    unblind(r, sigmaP) {
        const n = this.getModN();
        const aux = sigmaP * (r ** -1n);
        const firma = bcu__namespace.modPow(aux, 1, n);
        return firma;
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
    // 2 Numeros primos
    const p = await genPrime$1(nbits);
    const q = await genPrime$1(nbits);
    // Calculem n y phi(n)
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
// =========================================== //
// ================ FUNCTIONS ================ //
async function getPrime(nbits) {
    let n = 10n;
    while (!await bcu__namespace.isProbablyPrime(n)) {
        n = await bcu__namespace.prime(nbits);
    }
    return n;
}
// L(u) = (u-1)/n
function L(u, n) {
    let mu = 1n;
    mu = (u - 1n) / n;
    return mu;
}
async function generatePaillierKeys(nbits = 2048) {
    // Generamos los primos p , q
    const q = await getPrime(Math.floor(nbits / 2) + 1);
    const p = await getPrime(Math.floor(nbits) / 2);
    // creamos las variables de los modulos n y n^2
    const n = q * p;
    const n2 = n ** 2n;
    // Set lambda  ==> λ = lcm(p-1,q-1)
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
    // s Shared key
    // Λ  Position of the fragment
    // t  Threshold
    // p  Module
    const order = t - 1; // se necesitan 3 de los 5 para desbloquear
    const coeff = [];
    let i = 0;
    let j = 0;
    const SharedKeys = [];
    let y = s; // y es el secreto
    // Determinació arbitrària dels mòdul p
    const p = await genPrime(nbits);
    // Calculo aleatorio de los coeficientes
    while (i < order) {
        coeff[i] = getRandomInt(1, 1000);
        i++;
    }
    i = 0;
    while (i < n) {
        // Funció F(X)=F(i+1)
        y = s; // y es el secreto
        while (j < order) {
            y = y + BigInt(coeff[j] * ((i + 1) ** (j + 1)));
            // S + 258*1^1
            // S + 258*1^1 + 154*1^2  + 458*1^3
            j++;
        }
        y = bcu__namespace.modPow(y, 1, p); // y^1 (mod p)
        SharedKeys[i] = new SharedKey(y, i + 1, t, p);
        i++; // Creamos las s1, s2, s3 ,s4, s5 (Solo necesitamos 3 para descifrarlo)
        j = 0;
    }
    return SharedKeys;
}
function LagrangeInterpolation(receivedSharedKeys) {
    let i = 0;
    let result = 0n;
    const t = receivedSharedKeys[0].getThreshold();
    let product = 1n;
    let j = 0;
    const p = receivedSharedKeys[0].getModP();
    let numerator = 0;
    let denominator = 0;
    // Sumatori de i ϵ Λ
    while (i < t) {
        j = 0;
        // Productorio de Λ
        while (j < t) {
            if (receivedSharedKeys[i].getPositionΛ() !== receivedSharedKeys[j].getPositionΛ()) {
                numerator = receivedSharedKeys[j].getPositionΛ().valueOf();
                denominator = receivedSharedKeys[j].getPositionΛ().valueOf() - receivedSharedKeys[i].getPositionΛ().valueOf();
                product = bcu__namespace.modInv(BigInt(denominator), p) * BigInt(numerator) * product;
            }
            j++;
        }
        result = result + receivedSharedKeys[i].getSharedKeyS().valueOf() * product;
        product = 1n;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubm9kZS5janMiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90cy9SU0EudHMiLCIuLi8uLi9zcmMvdHMvUGFpbGxpZXIudHMiLCIuLi8uLi9zcmMvdHMvU2VjcmV0LXNoYXJpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOm51bGwsIm5hbWVzIjpbImJjdSIsImdlblByaW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQUNhLFlBQVk7SUFJdkIsWUFBYSxDQUFTLEVBQUUsQ0FBUztRQUMvQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQ1g7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ2Q7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ2Q7SUFFTSxPQUFPLENBQUUsQ0FBUztRQUN2QixPQUFPQSxjQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNyQztJQUVNLE1BQU0sQ0FBRSxDQUFTO1FBQ3RCLE9BQU9BLGNBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3JDO0lBRU0sS0FBSyxDQUFFLENBQVMsRUFBRSxDQUFTO1FBQ2hDLE1BQU0sQ0FBQyxHQUFXLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNoQyxNQUFNLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixNQUFNLFFBQVEsR0FBR0EsY0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3RDLE9BQU8sUUFBUSxDQUFBO0tBQ2hCO0lBRU0sT0FBTyxDQUFFLENBQVMsRUFBRSxNQUFjO1FBQ3ZDLE1BQU0sQ0FBQyxHQUFXLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNoQyxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDL0IsTUFBTSxLQUFLLEdBQUdBLGNBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNuQyxPQUFPLEtBQUssQ0FBQTtLQUNiO0NBQ0Y7TUFFWSxhQUFhO0lBSXhCLFlBQWEsQ0FBUyxFQUFFLE1BQW9CO1FBQzFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7S0FDckI7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ2Q7SUFFTSxlQUFlO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtLQUNuQjtJQUVNLE9BQU8sQ0FBRSxDQUFTO1FBQ3ZCLE9BQU9BLGNBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0tBQ3BEO0lBRU0sSUFBSSxDQUFFLENBQVM7UUFDcEIsT0FBT0EsY0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7S0FDcEQ7Q0FDRjtBQUVNLGVBQWVDLFVBQVEsQ0FBRSxLQUFhO0lBQzNDLElBQUksQ0FBQyxHQUFXLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUMxQixPQUFPLENBQUMsTUFBTUQsY0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNwQyxDQUFDLEdBQUcsTUFBTUEsY0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUMzQjtJQUVELE9BQU8sQ0FBQyxDQUFBO0FBQ1YsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFFLENBQVMsRUFBRSxDQUFTO0lBQ3RDLE1BQU0sR0FBRyxHQUFXLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixPQUFPQSxjQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUE7QUFDOUIsQ0FBQztBQUVELFNBQVMsSUFBSSxDQUFFLEdBQVcsRUFBRSxLQUFhO0lBQ3ZDLElBQUksQ0FBQyxHQUFXQSxjQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUMvQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRTtRQUN6QixDQUFDLEdBQUdBLGNBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3BDO0lBRUQsT0FBTyxDQUFDLENBQUE7QUFDVixDQUFDO0FBRU0sZUFBZSxlQUFlLENBQUUsS0FBSyxHQUFHLElBQUk7O0lBRWpELE1BQU0sQ0FBQyxHQUFXLE1BQU1DLFVBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN2QyxNQUFNLENBQUMsR0FBVyxNQUFNQSxVQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7O0lBR3ZDLE1BQU0sQ0FBQyxHQUFXLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDdkIsTUFBTSxJQUFJLEdBQVcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTs7SUFHOUQsTUFBTSxHQUFHLEdBQVdELGNBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDekQsTUFBTSxDQUFDLEdBQVcsTUFBTSxJQUFJLENBQUMsR0FBVSxDQUFDLENBQUE7O0lBR3hDLE1BQU0sQ0FBQyxHQUFXQSxjQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUVyQyxNQUFNLE1BQU0sR0FBaUIsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ25ELE1BQU0sT0FBTyxHQUFrQixJQUFJLGFBQWEsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFFM0QsT0FBTyxPQUFPLENBQUE7QUFDaEI7O0FDNUdBO01BRWEsaUJBQWlCO0lBSzVCLFlBQWEsQ0FBUyxFQUFFLEVBQVUsRUFBRSxDQUFTO1FBQzNDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUE7UUFDWixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUNYO0lBRU0sSUFBSTtRQUNULE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUNkO0lBRU0sS0FBSztRQUNWLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQTtLQUNmO0lBRU0sSUFBSTtRQUNULE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUNkO0lBRU0sT0FBTyxDQUFFLENBQVM7UUFDdkIsTUFBTSxDQUFDLEdBQVdBLGNBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQzFDLE9BQU8sQ0FBQ0EsY0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUdBLGNBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUE7S0FDbkY7SUFFTSxHQUFHLENBQUUsRUFBaUI7UUFDM0IsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFBO1FBQ3BCLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFO1lBQ2xCLEdBQUcsSUFBSSxDQUFDLENBQUE7U0FDVDtRQUNELE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUE7S0FDckI7SUFFTSxRQUFRLENBQUUsQ0FBUyxFQUFFLENBQVM7UUFDbkMsT0FBT0EsY0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtLQUNqQztDQUNGO01BRVksa0JBQWtCO0lBSzdCLFlBQWEsTUFBYyxFQUFFLEVBQVUsRUFBRSxNQUF5QjtRQUNoRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNaLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0tBQ3JCO0lBRU0sU0FBUztRQUNkLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtLQUNuQjtJQUVNLEtBQUs7UUFDVixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUE7S0FDZjtJQUVNLFNBQVM7UUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUE7S0FDbkI7SUFFTSxPQUFPLENBQUUsQ0FBUztRQUN2QixPQUFPLENBQUMsQ0FBQyxDQUFDQSxjQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO0tBQy9HO0NBQ0Y7QUFFRDtBQUNBO0FBRUEsZUFBZSxRQUFRLENBQUUsS0FBYTtJQUNwQyxJQUFJLENBQUMsR0FBVyxHQUFHLENBQUE7SUFDbkIsT0FBTyxDQUFDLE1BQU1BLGNBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDcEMsQ0FBQyxHQUFHLE1BQU1BLGNBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDM0I7SUFFRCxPQUFPLENBQUMsQ0FBQTtBQUNWLENBQUM7QUFFRDtBQUNBLFNBQVMsQ0FBQyxDQUFFLENBQVMsRUFBRSxDQUFTO0lBQzlCLElBQUksRUFBRSxHQUFXLEVBQUUsQ0FBQTtJQUNuQixFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUNqQixPQUFPLEVBQUUsQ0FBQTtBQUNYLENBQUM7QUFFTSxlQUFlLG9CQUFvQixDQUFFLFFBQWdCLElBQUk7O0lBRTlELE1BQU0sQ0FBQyxHQUFXLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQzNELE1BQU0sQ0FBQyxHQUFXLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7O0lBR3ZELE1BQU0sQ0FBQyxHQUFXLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDdkIsTUFBTSxFQUFFLEdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7SUFHMUIsTUFBTSxNQUFNLEdBQVdBLGNBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7SUFFOUMsTUFBTSxDQUFDLEdBQVdBLGNBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ3pDLE1BQU0sRUFBRSxHQUFXQSxjQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQ0EsY0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBOztJQUdqRSxNQUFNLE1BQU0sR0FBc0IsSUFBSSxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2pFLE1BQU0sT0FBTyxHQUF1QixJQUFJLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDOUUsT0FBTyxPQUFPLENBQUE7QUFDaEIsQ0FBQztBQUVEOztBQy9HQTtNQUVhLFNBQVM7SUFNcEIsWUFBYSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQ3JELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQ1g7SUFFTSxhQUFhO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUNkO0lBRU0sWUFBWTtRQUNqQixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDZDtJQUVNLFlBQVk7UUFDakIsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ2Q7SUFFTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ2Q7Q0FDRjtBQUVEO0FBQ0E7QUFFQTtBQUVBLGVBQWUsUUFBUSxDQUFFLEtBQWE7SUFDcEMsSUFBSSxDQUFDLEdBQVcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzFCLE9BQU8sQ0FBQyxNQUFNQSxjQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ3BDLENBQUMsR0FBRyxNQUFNQSxjQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQzNCO0lBRUQsT0FBTyxDQUFDLENBQUE7QUFDVixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUUsR0FBVyxFQUFFLEdBQVc7SUFDN0MsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDcEIsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDckIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO0FBQzFELENBQUM7QUFFTSxlQUFlLGFBQWEsQ0FBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxLQUFhOzs7OztJQU9qRixNQUFNLEtBQUssR0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQTtJQUMxQixJQUFJLENBQUMsR0FBVyxDQUFDLENBQUE7SUFDakIsSUFBSSxDQUFDLEdBQVcsQ0FBQyxDQUFBO0lBQ2pCLE1BQU0sVUFBVSxHQUFnQixFQUFFLENBQUE7SUFDbEMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxDQUFBOztJQUdqQixNQUFNLENBQUMsR0FBVyxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTs7SUFHdkMsT0FBTyxDQUFDLEdBQUcsS0FBSyxFQUFFO1FBQ2hCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQ2hDLENBQUMsRUFBRSxDQUFBO0tBQ0o7SUFFRCxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRUwsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFOztRQUVaLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFTCxPQUFPLENBQUMsR0FBRyxLQUFLLEVBQUU7WUFDaEIsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBOzs7WUFHL0MsQ0FBQyxFQUFFLENBQUE7U0FDSjtRQUNELENBQUMsR0FBR0EsY0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3ZCLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDN0MsQ0FBQyxFQUFFLENBQUE7UUFDSCxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQ047SUFDRCxPQUFPLFVBQVUsQ0FBQTtBQUNuQixDQUFDO1NBRWUscUJBQXFCLENBQUUsa0JBQStCO0lBQ3BFLElBQUksQ0FBQyxHQUFXLENBQUMsQ0FBQTtJQUNqQixJQUFJLE1BQU0sR0FBVyxFQUFFLENBQUE7SUFDdkIsTUFBTSxDQUFDLEdBQVcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUE7SUFFdEQsSUFBSSxPQUFPLEdBQVcsRUFBRSxDQUFBO0lBQ3hCLElBQUksQ0FBQyxHQUFXLENBQUMsQ0FBQTtJQUVqQixNQUFNLENBQUMsR0FBVyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUVqRCxJQUFJLFNBQVMsR0FBVyxDQUFDLENBQUE7SUFDekIsSUFBSSxXQUFXLEdBQVcsQ0FBQyxDQUFBOztJQUczQixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDWixDQUFDLEdBQUcsQ0FBQyxDQUFBOztRQUdMLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNaLElBQUksa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLEtBQUssa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLEVBQUU7Z0JBQ2pGLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtnQkFDMUQsV0FBVyxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFBO2dCQUU3RyxPQUFPLEdBQUdBLGNBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUE7YUFDM0U7WUFDRCxDQUFDLEVBQUUsQ0FBQTtTQUNKO1FBRUQsTUFBTSxHQUFHLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUE7UUFDM0UsT0FBTyxHQUFHLEVBQUUsQ0FBQTtRQUNaLENBQUMsRUFBRSxDQUFBO0tBQ0o7SUFFRCxPQUFPQSxjQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDakM7Ozs7Ozs7Ozs7OzsifQ==
