import * as bcu from 'bigint-crypto-utils'

// ================ CLASS ================

export class SharedKey {
  private readonly s: bigint
  private readonly Λ: number
  private readonly t: number
  private readonly p: bigint

  constructor (s: bigint, Λ: number, t: number, p: bigint) {
    this.s = s // Shared key
    this.Λ = Λ // Position of the fragment
    this.t = t // Threshold
    this.p = p // Module
  }

  public getSharedKeyS (): bigint {
    return this.s
  }

  public getPositionΛ (): number {
    return this.Λ
  }

  public getThreshold (): number {
    return this.t
  }

  public getModP (): bigint {
    return this.p
  }
}

// ===========================================
// ================ FUNCTIONS ================

// var SharedKeys:SharedKey[] = new Array()

async function genPrime (nbits: number): Promise<bigint> {
  let n: bigint = BigInt(10)
  while (!await bcu.isProbablyPrime(n)) {
    n = await bcu.prime(nbits)
  }

  return n
}

function getRandomInt (min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function genSharedKeys (s: bigint, t: number, n: number, nbits: number): Promise<SharedKey[]> {
  // s Shared key

  // Λ  Position of the fragment
  // t  Threshold
  // p  Module

  const order: number = t - 1 // se necesitan 3 de los 5 para desbloquear
  const coeff: number[] = []
  let i: number = 0
  let j: number = 0
  const SharedKeys: SharedKey[] = []
  let y: bigint = s // y es el secreto

  // Determinació arbitrària dels mòdul p
  const p: bigint = await genPrime(nbits)

  // Determinació arbitrària dels n = ordre coeficients
  while (i < order) {
    coeff[i] = getRandomInt(1, 1000)
    i++
  }

  i = 0

  while (i < n) {
    // Funció F(X)=F(i+1)
    y = s // y es el secreto

    while (j < order) {
      y = y + BigInt(coeff[j] * ((i + 1) ** (j + 1)))
      // S + 258*1^1
      // S + 258*1^1 + 154*1^2  + 458*1^3
      j++
    }
    y = bcu.modPow(y, 1, p) // y^1 (mod p)
    SharedKeys[i] = new SharedKey(y, i + 1, t, p)
    i++ // Creamos las s1, s2, s3 ,s4, s5 (Solo necesitamos 3 para descifrarlo)
    j = 0
  }
  return SharedKeys
}

export function LagrangeInterpolation (receivedSharedKeys: SharedKey[]): bigint {
  let i: number = 0
  let result: bigint = 0n
  const t: number = receivedSharedKeys[0].getThreshold()

  let product: bigint = BigInt(1)
  let j: number = 0

  const p: bigint = receivedSharedKeys[0].getModP()

  let numerator: number = 0
  let denominator: number = 0

  // Sumatori de i ϵ Λ
  while (i < t) {
    j = 0

    // Productori de Λ
    while (j < t) {
      if (receivedSharedKeys[i].getPositionΛ() !== receivedSharedKeys[j].getPositionΛ()) {
        numerator = receivedSharedKeys[j].getPositionΛ().valueOf()
        denominator = receivedSharedKeys[j].getPositionΛ().valueOf() - receivedSharedKeys[i].getPositionΛ().valueOf()

        // Fer el mòdul invers és indispensable perquè no es pot convertir un número decimal a bigint. Per aquest motiu cal separar el numerador del denominador
        product = bcu.modInv(BigInt(denominator), p) * BigInt(numerator) * product
      }
      j++
    }

    result = result + receivedSharedKeys[i].getSharedKeyS().valueOf() * product
    product = BigInt(1)
    i++
  }

  return bcu.modPow(result, 1, p)
}
