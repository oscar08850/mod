import * as bcu from 'bigint-crypto-utils'

// ================ CLASS ================

export class PaillierPublicKey {
  private readonly n: bigint
  private readonly n2: bigint
  private readonly g: bigint

  constructor (n: bigint, n2: bigint, g: bigint) {
    this.n = n
    this.n2 = n2
    this.g = g
  }

  public getN (): bigint {
    return this.n
  }

  public getN2 (): bigint {
    return this.n2
  }

  public getG (): bigint {
    return this.g
  }

  public encrypt (m: bigint): bigint {
    const r: bigint = bcu.randBetween(this.n2)
    return (bcu.modPow(this.g, m, this.n2) * bcu.modPow(r, this.n, this.n2)) % this.n2
  }

  public add (cs: Array<bigint>): bigint {
    let ret: bigint = 1n
    for (const c of cs) {
      ret *= c
    }
    return ret % this.n2
  }

  public multiply (c: bigint, m: bigint): bigint {
    return bcu.modPow(c, m, this.n2)
  }
}

export class PaillierPrivateKey {
  private readonly lambda: bigint
  private readonly mu: bigint
  private readonly pubKey: PaillierPublicKey

  constructor (lambda: bigint, mu: bigint, pubKey: PaillierPublicKey) {
    this.lambda = lambda
    this.mu = mu
    this.pubKey = pubKey
  }

  public getLambda (): bigint {
    return this.lambda
  }

  public getMu (): bigint {
    return this.mu
  }

  public getPubKey (): PaillierPublicKey {
    return this.pubKey
  }

  public decrypt (c: bigint): bigint {
    return (L(bcu.modPow(c, this.lambda, this.pubKey.getN2()), this.pubKey.getN()) * this.mu) % this.pubKey.getN()
  }
}

// ===========================================
// ================ FUNCTIONS ================

async function getPrime (nbits: number): Promise<bigint> {
  let n: bigint = 10n
  while (!await bcu.isProbablyPrime(n)) {
    n = await bcu.prime(nbits)
  }

  return n
}

/*
function isCoprime (a: bigint, b: bigint): boolean {
  const exp: bigint = 1n
  return bcu.gcd(a, b) === exp
}
*/

function L (x: bigint, n: bigint): bigint {
  let mu: bigint = 1n
  mu = (x - 1n) / n
  return mu
}

export async function generatePaillierKeys (nbits: number = 2048): Promise<PaillierPrivateKey> {
  // Get Primes
  const q: bigint = await getPrime(Math.floor(nbits / 2) + 1)
  const p: bigint = await getPrime(Math.floor(nbits) / 2)

  // Set modular space
  const n: bigint = q * p
  const n2: bigint = n ** 2n

  // Set lambda
  const lambda: bigint = bcu.lcm(p - 1n, q - 1n)

  const g: bigint = bcu.randBetween(n2, 1n)
  const mu: bigint = bcu.modInv(L(bcu.modPow(g, lambda, n2), n), n)

  // public key
  const pubKey: PaillierPublicKey = new PaillierPublicKey(n, n2, g)
  const privKey: PaillierPrivateKey = new PaillierPrivateKey(lambda, mu, pubKey)
  return privKey
}

// ===========================================
