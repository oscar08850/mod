import { genSharedKeys, LagrangeInterpolation } from '../src/ts'// SharedKey

describe('Provant de generar claus compartides a partir del secret', function () {
  const inputs = [2048, 1024, 512, 256, 128, 64, 32]
  for (const nbits of inputs) {
    describe(`genSharedKeys(3,5,11,${nbits})`, function () {
      it('Hauria de demostrar que a partir del secret es creen les claus compartides i amb aquestes es pot recuperar el secret', async function () {
        this.timeout(10000)
        const SharedKeys: _pkg.SharedKey[] = await genSharedKeys(11n, 3, 5, nbits)
        chai.expect(BigInt(11)).to.equal(LagrangeInterpolation(SharedKeys))
      })
    })
  }
})
