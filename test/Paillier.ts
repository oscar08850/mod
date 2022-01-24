describe('Provant de crear un crypto-sistema Paillier', function () {
  const keyBits = [2048, 1024] // [2048, 1024, 512, 256, 128, 64, 32]
  for (const bits of keyBits) {
    describe(`Crypto-Sistema de ${bits} bits.`, function () {
      let keys: _pkg.PaillierPrivateKey
      this.timeout(10000)
      it(`Creamos un sistema de Paillier de ${bits} bits,`, async function () {
        keys = await _pkg.generatePaillierKeys(bits)
        chai.expect(keys).to.be.an.instanceOf(_pkg.PaillierPrivateKey)
        chai.expect(keys.getPubKey()).to.be.an.instanceOf(_pkg.PaillierPublicKey)
      })
      it('Encriptamos un BigInt, lo desencriptamos y comprobamos que sean iguales', function () {
        const c: bigint = keys.getPubKey().encrypt(2n)
        const m: bigint = keys.decrypt(c)
        chai.expect(2n).to.equal(m)
      })
      it('Sumamos los BigInt de un vector de BigInts y comprobamos que el resultado es el esperado', function () {
        const ms: Array<bigint> = [2n, 3n, 4n] // 2 + 3 + 4 = 9
        const cs: Array<bigint> = []
        for (const m of ms) {
          // metemos los valores encriptados uno a uno en el vector cs (votos)
          cs.push(keys.getPubKey().encrypt(m))
        }
        chai.expect(9n).to.equal(keys.decrypt(keys.getPubKey().add(cs)))
      })
    })
  }
})
