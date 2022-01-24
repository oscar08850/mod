export declare class RSAPublicKey {
    private readonly e;
    private readonly n;
    constructor(e: bigint, n: bigint);
    getExpE(): bigint;
    getModN(): bigint;
    encrypt(m: bigint): bigint;
    verify(s: bigint): bigint;
    blind(r: bigint, m: bigint): bigint;
    unblind(r: bigint, sigmaP: bigint): bigint;
}
export declare class RSAPrivateKey {
    private readonly d;
    private readonly pubKey;
    constructor(d: bigint, pubKey: RSAPublicKey);
    getExpD(): bigint;
    getRSAPublicKey(): RSAPublicKey;
    decrypt(c: bigint): bigint;
    sign(h: bigint): bigint;
}
export declare function genPrime(nbits: number): Promise<bigint>;
export declare function generateRSAKeys(nbits?: number): Promise<RSAPrivateKey>;
//# sourceMappingURL=RSA.d.ts.map