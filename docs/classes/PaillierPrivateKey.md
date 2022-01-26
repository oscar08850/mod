# Class: PaillierPrivateKey

## Table of contents

### Constructors

- [constructor](PaillierPrivateKey.md#constructor)

### Methods

- [decrypt](PaillierPrivateKey.md#decrypt)
- [getLambda](PaillierPrivateKey.md#getlambda)
- [getMu](PaillierPrivateKey.md#getmu)
- [getPubKey](PaillierPrivateKey.md#getpubkey)

## Constructors

### constructor

• **new PaillierPrivateKey**(`lambda`, `mu`, `pubKey`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `lambda` | `bigint` |
| `mu` | `bigint` |
| `pubKey` | [`PaillierPublicKey`](PaillierPublicKey.md) |

#### Defined in

[Paillier.ts:51](https://github.com/oscar08850/mod/blob/7433e5e/src/ts/Paillier.ts#L51)

## Methods

### decrypt

▸ **decrypt**(`c`): `bigint`

#### Parameters

| Name | Type |
| :------ | :------ |
| `c` | `bigint` |

#### Returns

`bigint`

#### Defined in

[Paillier.ts:69](https://github.com/oscar08850/mod/blob/7433e5e/src/ts/Paillier.ts#L69)

___

### getLambda

▸ **getLambda**(): `bigint`

#### Returns

`bigint`

#### Defined in

[Paillier.ts:57](https://github.com/oscar08850/mod/blob/7433e5e/src/ts/Paillier.ts#L57)

___

### getMu

▸ **getMu**(): `bigint`

#### Returns

`bigint`

#### Defined in

[Paillier.ts:61](https://github.com/oscar08850/mod/blob/7433e5e/src/ts/Paillier.ts#L61)

___

### getPubKey

▸ **getPubKey**(): [`PaillierPublicKey`](PaillierPublicKey.md)

#### Returns

[`PaillierPublicKey`](PaillierPublicKey.md)

#### Defined in

[Paillier.ts:65](https://github.com/oscar08850/mod/blob/7433e5e/src/ts/Paillier.ts#L65)
