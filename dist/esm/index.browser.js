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
    blind(r, m) {
        const n = this.getModN();
        const aux = m * (r ** this.e);
        const menBlind = bcu.modPow(aux, 1, n);
        return menBlind;
    }
    unblind(r, sigmaP) {
        const n = this.getModN();
        const aux = sigmaP * (r ** -1n);
        const firma = bcu.modPow(aux, 1, n);
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
    // 2 Numeros primos
    const p = await genPrime$1(nbits);
    const q = await genPrime$1(nbits);
    // Calculem n y phi(n)
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
// =========================================== //
// ================ FUNCTIONS ================ //
async function getPrime(nbits) {
    let n = 10n;
    while (!await bcu.isProbablyPrime(n)) {
        n = await bcu.prime(nbits);
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
    // Set lambda  ==> ?? = lcm(p-1,q-1)
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
    constructor(s, ??, t, p) {
        this.s = s; // Shared key
        this.?? = ??; // Position of the fragment
        this.t = t; // Threshold
        this.p = p; // Module
    }
    getSharedKeyS() {
        return this.s;
    }
    getPosition??() {
        return this.??;
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
    // s Shared key
    // ??  Position of the fragment
    // t  Threshold
    // p  Module
    const order = t - 1; // se necesitan 3 de los 5 para desbloquear
    const coeff = [];
    let i = 0;
    let j = 0;
    const SharedKeys = [];
    let y = s; // y es el secreto
    // Determinaci?? arbitr??ria dels m??dul p
    const p = await genPrime(nbits);
    // Calculo aleatorio de los coeficientes
    while (i < order) {
        coeff[i] = getRandomInt(1, 1000);
        i++;
    }
    i = 0;
    while (i < n) {
        // Funci?? F(X)=F(i+1)
        y = s; // y es el secreto
        while (j < order) {
            y = y + BigInt(coeff[j] * ((i + 1) ** (j + 1)));
            // S + 258*1^1
            // S + 258*1^1 + 154*1^2  + 458*1^3
            j++;
        }
        y = bcu.modPow(y, 1, p); // y^1 (mod p)
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
    // Sumatori de i ?? ??
    while (i < t) {
        j = 0;
        // Productorio de ??
        while (j < t) {
            if (receivedSharedKeys[i].getPosition??() !== receivedSharedKeys[j].getPosition??()) {
                numerator = receivedSharedKeys[j].getPosition??().valueOf();
                denominator = receivedSharedKeys[j].getPosition??().valueOf() - receivedSharedKeys[i].getPosition??().valueOf();
                product = bcu.modInv(BigInt(denominator), p) * BigInt(numerator) * product;
            }
            j++;
        }
        result = result + receivedSharedKeys[i].getSharedKeyS().valueOf() * product;
        product = 1n;
        i++;
    }
    return bcu.modPow(result, 1, p);
}

export { LagrangeInterpolation, PaillierPrivateKey, PaillierPublicKey, RSAPrivateKey, RSAPublicKey, SharedKey, genSharedKeys, generatePaillierKeys, generateRSAKeys };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguYnJvd3Nlci5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3RzL1JTQS50cyIsIi4uLy4uL3NyYy90cy9QYWlsbGllci50cyIsIi4uLy4uL3NyYy90cy9TZWNyZXQtc2hhcmluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6bnVsbCwibmFtZXMiOlsiZ2VuUHJpbWUiXSwibWFwcGluZ3MiOiI7O01BQ2EsWUFBWTtJQUl2QixZQUFhLENBQVMsRUFBRSxDQUFTO1FBQy9CLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDWDtJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDZDtJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDZDtJQUVNLE9BQU8sQ0FBRSxDQUFTO1FBQ3ZCLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDckM7SUFFTSxNQUFNLENBQUUsQ0FBUztRQUN0QixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3JDO0lBRU0sS0FBSyxDQUFFLENBQVMsRUFBRSxDQUFTO1FBQ2hDLE1BQU0sQ0FBQyxHQUFXLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTtRQUNoQyxNQUFNLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDdEMsT0FBTyxRQUFRLENBQUE7S0FDaEI7SUFFTSxPQUFPLENBQUUsQ0FBUyxFQUFFLE1BQWM7UUFDdkMsTUFBTSxDQUFDLEdBQVcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ2hDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUMvQixNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDbkMsT0FBTyxLQUFLLENBQUE7S0FDYjtDQUNGO01BRVksYUFBYTtJQUl4QixZQUFhLENBQVMsRUFBRSxNQUFvQjtRQUMxQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0tBQ3JCO0lBRU0sT0FBTztRQUNaLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUNkO0lBRU0sZUFBZTtRQUNwQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUE7S0FDbkI7SUFFTSxPQUFPLENBQUUsQ0FBUztRQUN2QixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO0tBQ3BEO0lBRU0sSUFBSSxDQUFFLENBQVM7UUFDcEIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtLQUNwRDtDQUNGO0FBRU0sZUFBZUEsVUFBUSxDQUFFLEtBQWE7SUFDM0MsSUFBSSxDQUFDLEdBQVcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzFCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDcEMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUMzQjtJQUVELE9BQU8sQ0FBQyxDQUFBO0FBQ1YsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFFLENBQVMsRUFBRSxDQUFTO0lBQ3RDLE1BQU0sR0FBRyxHQUFXLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM3QixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQTtBQUM5QixDQUFDO0FBRUQsU0FBUyxJQUFJLENBQUUsR0FBVyxFQUFFLEtBQWE7SUFDdkMsSUFBSSxDQUFDLEdBQVcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDL0MsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUU7UUFDekIsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3BDO0lBRUQsT0FBTyxDQUFDLENBQUE7QUFDVixDQUFDO0FBRU0sZUFBZSxlQUFlLENBQUUsS0FBSyxHQUFHLElBQUk7O0lBRWpELE1BQU0sQ0FBQyxHQUFXLE1BQU1BLFVBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN2QyxNQUFNLENBQUMsR0FBVyxNQUFNQSxVQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7O0lBR3ZDLE1BQU0sQ0FBQyxHQUFXLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDdkIsTUFBTSxJQUFJLEdBQVcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTs7SUFHOUQsTUFBTSxHQUFHLEdBQVcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN6RCxNQUFNLENBQUMsR0FBVyxNQUFNLElBQUksQ0FBQyxHQUFVLENBQUMsQ0FBQTs7SUFHeEMsTUFBTSxDQUFDLEdBQVcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFFckMsTUFBTSxNQUFNLEdBQWlCLElBQUksWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNuRCxNQUFNLE9BQU8sR0FBa0IsSUFBSSxhQUFhLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBRTNELE9BQU8sT0FBTyxDQUFBO0FBQ2hCOztBQzVHQTtNQUVhLGlCQUFpQjtJQUs1QixZQUFhLENBQVMsRUFBRSxFQUFVLEVBQUUsQ0FBUztRQUMzQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO1FBQ1osSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDWDtJQUVNLElBQUk7UUFDVCxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDZDtJQUVNLEtBQUs7UUFDVixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUE7S0FDZjtJQUVNLElBQUk7UUFDVCxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDZDtJQUVNLE9BQU8sQ0FBRSxDQUFTO1FBQ3ZCLE1BQU0sQ0FBQyxHQUFXLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFBO0tBQ25GO0lBRU0sR0FBRyxDQUFFLEVBQWlCO1FBQzNCLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQTtRQUNwQixLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNsQixHQUFHLElBQUksQ0FBQyxDQUFBO1NBQ1Q7UUFDRCxPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFBO0tBQ3JCO0lBRU0sUUFBUSxDQUFFLENBQVMsRUFBRSxDQUFTO1FBQ25DLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtLQUNqQztDQUNGO01BRVksa0JBQWtCO0lBSzdCLFlBQWEsTUFBYyxFQUFFLEVBQVUsRUFBRSxNQUF5QjtRQUNoRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQTtRQUNaLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0tBQ3JCO0lBRU0sU0FBUztRQUNkLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtLQUNuQjtJQUVNLEtBQUs7UUFDVixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUE7S0FDZjtJQUVNLFNBQVM7UUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUE7S0FDbkI7SUFFTSxPQUFPLENBQUUsQ0FBUztRQUN2QixPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUE7S0FDL0c7Q0FDRjtBQUVEO0FBQ0E7QUFFQSxlQUFlLFFBQVEsQ0FBRSxLQUFhO0lBQ3BDLElBQUksQ0FBQyxHQUFXLEdBQUcsQ0FBQTtJQUNuQixPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ3BDLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDM0I7SUFFRCxPQUFPLENBQUMsQ0FBQTtBQUNWLENBQUM7QUFFRDtBQUNBLFNBQVMsQ0FBQyxDQUFFLENBQVMsRUFBRSxDQUFTO0lBQzlCLElBQUksRUFBRSxHQUFXLEVBQUUsQ0FBQTtJQUNuQixFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUNqQixPQUFPLEVBQUUsQ0FBQTtBQUNYLENBQUM7QUFFTSxlQUFlLG9CQUFvQixDQUFFLFFBQWdCLElBQUk7O0lBRTlELE1BQU0sQ0FBQyxHQUFXLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQzNELE1BQU0sQ0FBQyxHQUFXLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7O0lBR3ZELE1BQU0sQ0FBQyxHQUFXLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDdkIsTUFBTSxFQUFFLEdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7SUFHMUIsTUFBTSxNQUFNLEdBQVcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUU5QyxNQUFNLENBQUMsR0FBVyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUN6QyxNQUFNLEVBQUUsR0FBVyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7O0lBR2pFLE1BQU0sTUFBTSxHQUFzQixJQUFJLGlCQUFpQixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDakUsTUFBTSxPQUFPLEdBQXVCLElBQUksa0JBQWtCLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUM5RSxPQUFPLE9BQU8sQ0FBQTtBQUNoQixDQUFDO0FBRUQ7O0FDL0dBO01BRWEsU0FBUztJQU1wQixZQUFhLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVM7UUFDckQsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNWLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDWDtJQUVNLGFBQWE7UUFDbEIsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ2Q7SUFFTSxZQUFZO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUNkO0lBRU0sWUFBWTtRQUNqQixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDZDtJQUVNLE9BQU87UUFDWixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDZDtDQUNGO0FBRUQ7QUFDQTtBQUVBO0FBRUEsZUFBZSxRQUFRLENBQUUsS0FBYTtJQUNwQyxJQUFJLENBQUMsR0FBVyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDMUIsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNwQyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQzNCO0lBRUQsT0FBTyxDQUFDLENBQUE7QUFDVixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUUsR0FBVyxFQUFFLEdBQVc7SUFDN0MsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDcEIsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDckIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO0FBQzFELENBQUM7QUFFTSxlQUFlLGFBQWEsQ0FBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxLQUFhOzs7OztJQU9qRixNQUFNLEtBQUssR0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQTtJQUMxQixJQUFJLENBQUMsR0FBVyxDQUFDLENBQUE7SUFDakIsSUFBSSxDQUFDLEdBQVcsQ0FBQyxDQUFBO0lBQ2pCLE1BQU0sVUFBVSxHQUFnQixFQUFFLENBQUE7SUFDbEMsSUFBSSxDQUFDLEdBQVcsQ0FBQyxDQUFBOztJQUdqQixNQUFNLENBQUMsR0FBVyxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTs7SUFHdkMsT0FBTyxDQUFDLEdBQUcsS0FBSyxFQUFFO1FBQ2hCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQ2hDLENBQUMsRUFBRSxDQUFBO0tBQ0o7SUFFRCxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRUwsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFOztRQUVaLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFTCxPQUFPLENBQUMsR0FBRyxLQUFLLEVBQUU7WUFDaEIsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBOzs7WUFHL0MsQ0FBQyxFQUFFLENBQUE7U0FDSjtRQUNELENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDdkIsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM3QyxDQUFDLEVBQUUsQ0FBQTtRQUNILENBQUMsR0FBRyxDQUFDLENBQUE7S0FDTjtJQUNELE9BQU8sVUFBVSxDQUFBO0FBQ25CLENBQUM7U0FFZSxxQkFBcUIsQ0FBRSxrQkFBK0I7SUFDcEUsSUFBSSxDQUFDLEdBQVcsQ0FBQyxDQUFBO0lBQ2pCLElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQTtJQUN2QixNQUFNLENBQUMsR0FBVyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtJQUV0RCxJQUFJLE9BQU8sR0FBVyxFQUFFLENBQUE7SUFDeEIsSUFBSSxDQUFDLEdBQVcsQ0FBQyxDQUFBO0lBRWpCLE1BQU0sQ0FBQyxHQUFXLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBRWpELElBQUksU0FBUyxHQUFXLENBQUMsQ0FBQTtJQUN6QixJQUFJLFdBQVcsR0FBVyxDQUFDLENBQUE7O0lBRzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNaLENBQUMsR0FBRyxDQUFDLENBQUE7O1FBR0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ1osSUFBSSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtnQkFDakYsU0FBUyxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFBO2dCQUMxRCxXQUFXLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUE7Z0JBRTdHLE9BQU8sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxDQUFBO2FBQzNFO1lBQ0QsQ0FBQyxFQUFFLENBQUE7U0FDSjtRQUVELE1BQU0sR0FBRyxNQUFNLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFBO1FBQzNFLE9BQU8sR0FBRyxFQUFFLENBQUE7UUFDWixDQUFDLEVBQUUsQ0FBQTtLQUNKO0lBRUQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7QUFDakM7Ozs7In0=
