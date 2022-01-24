export declare class PaillierPublicKey {
    private readonly n;
    private readonly n2;
    private readonly g;
    constructor(n: bigint, n2: bigint, g: bigint);
    getN(): bigint;
    getN2(): bigint;
    getG(): bigint;
    encrypt(m: bigint): bigint;
    add(cs: Array<bigint>): bigint;
    multiply(c: bigint, m: bigint): bigint;
}
export declare class PaillierPrivateKey {
    private readonly lambda;
    private readonly mu;
    private readonly pubKey;
    constructor(lambda: bigint, mu: bigint, pubKey: PaillierPublicKey);
    getLambda(): bigint;
    getMu(): bigint;
    getPubKey(): PaillierPublicKey;
    decrypt(c: bigint): bigint;
}
export declare function generatePaillierKeys(nbits?: number): Promise<PaillierPrivateKey>;
//# sourceMappingURL=Paillier.d.ts.map