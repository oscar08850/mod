import { genSharedKeys, LagrangeInterpolation } from '../src/ts'// SharedKey

describe('Provant de generar claus compartides a partir del secret', function () {
  const inputs = [2048, 1024] // [2048, 1024, 512, 256, 128, 64, 32]
  for (const nbits of inputs) {
    // A genera un secreto como un numero, A reparte N partes del secreto y lo borra, se juntan p partes y se recupera el secreto
    describe(`genSharedKeys(3,5,11,${nbits})`, function () {
      it('A partir de un secreto, recuperamos el secreto mediante las claves compartidas.', async function () {
        this.timeout(100000)

        const SharedKeys: _pkg.SharedKey[] = await genSharedKeys(42n, 3, 5, nbits)

        chai.expect(BigInt(42)).to.equal(LagrangeInterpolation(SharedKeys))
      })
    })
  }
})
