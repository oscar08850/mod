import * as bcu from 'bigint-crypto-utils'
export class RSAPublicKey {
  private readonly e: bigint
  private readonly n: bigint

  constructor (e: bigint, n: bigint) {
    this.e = e
    this.n = n
  }

  public getExpE (): bigint {
    return this.e
  }

  public getModN (): bigint {
    return this.n
  }

  public encrypt (m: bigint): bigint {
    return bcu.modPow(m, this.e, this.n) // obtenim c (missatge encriptat) // C = m^e (mod n)
  }

  public verify (s: bigint): bigint {
    return bcu.modPow(s, this.e, this.n) // obtenim h (hash encriptat) s^e (mod n)
  }

  public blind (r: bigint, m: bigint): bigint {
    const n: bigint = this.getModN()
    const aux = m * (r ** this.e)
    const menBlind = bcu.modPow(aux, 1, n)
    return menBlind
  }

  public unblind (r: bigint, sigmaP: bigint): bigint {
    const n: bigint = this.getModN()
    const aux = sigmaP * (r ** -1n)
    const firma = bcu.modPow(aux, 1, n)
    return firma
  }
}

export class RSAPrivateKey {
  private readonly d: bigint
  private readonly pubKey: RSAPublicKey

  constructor (d: bigint, pubKey: RSAPublicKey) {
    this.d = d
    this.pubKey = pubKey
  }

  public getExpD (): bigint {
    return this.d
  }

  public getRSAPublicKey (): RSAPublicKey {
    return this.pubKey
  }

  public decrypt (c: bigint): bigint {
    return bcu.modPow(c, this.d, this.pubKey.getModN()) // obtenim m (missatge enviat)
  }

  public sign (h: bigint): bigint {
    return bcu.modPow(h, this.d, this.pubKey.getModN()) // obtenim s (resum hash)
  }
}

export async function genPrime (nbits: number): Promise<bigint> {
  let n: bigint = BigInt(10)
  while (!await bcu.isProbablyPrime(n)) {
    n = await bcu.prime(nbits)
  }

  return n
}

function isCoprime (a: bigint, b: bigint): boolean {
  const exp: bigint = BigInt(1)
  return bcu.gcd(a, b) === exp
}

function genE (mcm: bigint, nbits: number): bigint {
  let e: bigint = bcu.randBetween(mcm, BigInt(1))
  while (!isCoprime(e, mcm)) {
    e = bcu.randBetween(mcm, BigInt(1))
  }

  return e
}

export async function generateRSAKeys (nbits = 2048): Promise<RSAPrivateKey> {
  // 2 Numeros primos
  const p: bigint = await genPrime(nbits)
  const q: bigint = await genPrime(nbits)

  // Calculem n y phi(n)
  const n: bigint = p * q
  const phiN: bigint = BigInt((p - BigInt(1)) * (q - BigInt(1)))

  // Generem l'exponent e:
  const mcm: bigint = bcu.lcm(p - BigInt(1), q - BigInt(1))
  const e: bigint = await genE(mcm, nbits)

  // Generem l'exponent d:
  const d: bigint = bcu.modInv(e, phiN) // ed = 1 mod(phiN)

  const pubKey: RSAPublicKey = new RSAPublicKey(e, n)
  const privKey: RSAPrivateKey = new RSAPrivateKey(d, pubKey)

  return privKey
}
