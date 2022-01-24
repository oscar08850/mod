export declare class SharedKey {
    private readonly s;
    private readonly Λ;
    private readonly t;
    private readonly p;
    constructor(s: bigint, Λ: number, t: number, p: bigint);
    getSharedKeyS(): bigint;
    getPositionΛ(): number;
    getThreshold(): number;
    getModP(): bigint;
}
export declare function genSharedKeys(s: bigint, t: number, n: number, nbits: number): Promise<SharedKey[]>;
export declare function LagrangeInterpolation(receivedSharedKeys: SharedKey[]): bigint;
//# sourceMappingURL=Secret-sharing.d.ts.map