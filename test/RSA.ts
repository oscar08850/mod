describe('provant de generar un parell de claus RSA amb generateRSAKeys()', function () {
  const inputs = [2048, 1024, 512] // [2048, 1024, 512, 256, 128, 64, 32]
  for (const nbits of inputs) {
    describe(`generateRSAKeys(${nbits})`, function () {
      it('should evaluate that both keys are able to encrypt and decrypt', async function () {
        this.timeout(10000)
        const val = await _pkg.generateRSAKeys(nbits)

        // Te voy a dar un BigInt de valor 2
        // Mirame que sea igual a: El desencriptado del encriptado de un BigInt de valor 2
        // usando las claves RSA generadas y guardadas en la variable val

        const mensajePlain = BigInt(2)
        console.log(`mensaje plano: ${mensajePlain}`)

        const mensajeCifrado = val.getRSAPublicKey().encrypt(mensajePlain)
        console.log(`mensaje cifrado: ${mensajeCifrado}`)

        const mensajeDescifrado = val.decrypt(mensajeCifrado)
        console.log(`mensaje descifrado: ${mensajeDescifrado}`)

        chai.expect(mensajePlain).to.equal(mensajeDescifrado)

        // chai.expect(BigInt(2)).to.equal(val.decrypt(val.getRSAPublicKey().encrypt(BigInt(2))))
      })
    })
  }
})
