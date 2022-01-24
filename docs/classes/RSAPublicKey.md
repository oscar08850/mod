# Class: RSAPublicKey

## Table of contents

### Constructors

- [constructor](RSAPublicKey.md#constructor)

### Methods

- [blind](RSAPublicKey.md#blind)
- [encrypt](RSAPublicKey.md#encrypt)
- [getExpE](RSAPublicKey.md#getexpe)
- [getModN](RSAPublicKey.md#getmodn)
- [unblind](RSAPublicKey.md#unblind)
- [verify](RSAPublicKey.md#verify)

## Constructors

### constructor

• **new RSAPublicKey**(`e`, `n`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `e` | `bigint` |
| `n` | `bigint` |

#### Defined in

[RSA.ts:6](https://github.com/oscar08850/mod/blob/f6a1753/src/ts/RSA.ts#L6)

## Methods

### blind

▸ **blind**(`r`, `m`): `bigint`

#### Parameters

| Name | Type |
| :------ | :------ |
| `r` | `bigint` |
| `m` | `bigint` |

#### Returns

`bigint`

#### Defined in

[RSA.ts:27](https://github.com/oscar08850/mod/blob/f6a1753/src/ts/RSA.ts#L27)

___

### encrypt

▸ **encrypt**(`m`): `bigint`

#### Parameters

| Name | Type |
| :------ | :------ |
| `m` | `bigint` |

#### Returns

`bigint`

#### Defined in

[RSA.ts:19](https://github.com/oscar08850/mod/blob/f6a1753/src/ts/RSA.ts#L19)

___

### getExpE

▸ **getExpE**(): `bigint`

#### Returns

`bigint`

#### Defined in

[RSA.ts:11](https://github.com/oscar08850/mod/blob/f6a1753/src/ts/RSA.ts#L11)

___

### getModN

▸ **getModN**(): `bigint`

#### Returns

`bigint`

#### Defined in

[RSA.ts:15](https://github.com/oscar08850/mod/blob/f6a1753/src/ts/RSA.ts#L15)

___

### unblind

▸ **unblind**(`r`, `sigmaP`): `bigint`

#### Parameters

| Name | Type |
| :------ | :------ |
| `r` | `bigint` |
| `sigmaP` | `bigint` |

#### Returns

`bigint`

#### Defined in

[RSA.ts:34](https://github.com/oscar08850/mod/blob/f6a1753/src/ts/RSA.ts#L34)

___

### verify

▸ **verify**(`s`): `bigint`

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `bigint` |

#### Returns

`bigint`

#### Defined in

[RSA.ts:23](https://github.com/oscar08850/mod/blob/f6a1753/src/ts/RSA.ts#L23)
