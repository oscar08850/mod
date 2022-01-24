describe('Provant de crear un crypto-sistema Paillier', function () {
  const keyBits = [2048, 1024, 512, 256, 128, 64, 32]
  for (const bits of keyBits) {
    describe(`Crypto-Sistema de ${bits} bits.`, function () {
      let keys: _pkg.PaillierPrivateKey
      this.timeout(10000)
      it(`Hauria de crear un sistema on pallier d'${bits} bits,`, async function () {
        keys = await _pkg.generatePaillierKeys(bits)
        chai.expect(keys).to.be.an.instanceOf(_pkg.PaillierPrivateKey)
        chai.expect(keys.getPubKey()).to.be.an.instanceOf(_pkg.PaillierPublicKey)
      })
      it('Hauria de ser capaç d\'encriptar i d\'esencriptar', function () {
        const c: bigint = keys.getPubKey().encrypt(2n)
        const m: bigint = keys.decrypt(c)
        chai.expect(2n).to.equal(m)
      })
      it('Hauria de ser capaç de sumar un vector de bigints', function () {
        const ms: Array<bigint> = [2n, 3n, 4n]
        const cs: Array<bigint> = []
        for (const m of ms) {
          cs.push(keys.getPubKey().encrypt(m))
        }
        chai.expect(9n).to.equal(keys.decrypt(keys.getPubKey().add(cs)))
      })
      it('Hauria de ser capaç de multiplicar un m a un c', function () {
        const m = 2n
        const c = keys.getPubKey().encrypt(3n)
        chai.expect(6n).to.equal(keys.decrypt(keys.getPubKey().multiply(c, m)))
      })
    })
  }
})
