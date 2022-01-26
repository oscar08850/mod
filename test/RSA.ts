// import { modPow } from 'bigint-crypto-utils'
// import { genPrime } from '../src/ts/RSA'

describe('provant de generar un parell de claus RSA amb generateRSAKeys()', function () {
  const inputs = [2048, 1024, 512] // [2048, 1024, 512, 256, 128, 64, 32]
  for (const nbits of inputs) {
    describe(`generateRSAKeys(${nbits})`, function () {
      this.timeout(100000)
      it('A encripta con pubB, y B descrifra con privB', async function () {
        const valB = await _pkg.generateRSAKeys(nbits)

        const mensajePlain = BigInt(2)
        console.log(`mensaje plano: ${mensajePlain}`)

        const mensajeCifrado = valB.getRSAPublicKey().encrypt(mensajePlain)
        console.log(`mensaje cifrado: ${mensajeCifrado}`)

        const mensajeDescifrado = valB.decrypt(mensajeCifrado)
        console.log(`mensaje descifrado: ${mensajeDescifrado}`)

        chai.expect(mensajePlain).to.equal(mensajeDescifrado)
      })
      it(' B envía un mensaje firmado a A; y A lo verifica con pubB', async function () {
        const valA = await _pkg.generateRSAKeys(nbits)
        const valB = await _pkg.generateRSAKeys(nbits)
        const mensajePlain = BigInt(2)
        const mensajeCifradoParaB = valA.getRSAPublicKey().encrypt(mensajePlain)
        const mensajeFirmado = valB.sign(mensajeCifradoParaB)
        const mensajeVerficado = valB.getRSAPublicKey().verify(mensajeFirmado)

        chai.expect(mensajeCifradoParaB).to.equal(mensajeVerficado)
      })/*
      it('A ciega un mensaje, envía el mensaje cegado a B, B lo firma y lo devuelve, A lo desciega y obtiene la firma del mensaje original (se puede verificar con pubB)', async function () {
        const valA = await _pkg.generateRSAKeys(nbits)
        const valB = await _pkg.generateRSAKeys(nbits)
        const mensajePlain = BigInt(2)

        const primo = await genPrime(nbits)
        const mensBlind = valA.getRSAPublicKey().blind(primo, mensajePlain)

        const mensBlindFirmado = valB.sign(mensBlind)

        const firma = valA.getRSAPublicKey().unblind(primo, mensBlindFirmado)

        const comprobante = modPow(mensajePlain, valB.getExpD(), valA.getRSAPublicKey().getModN())
        chai.expect(firma).to.equal(comprobante)
      }) */
    })
  }
})
