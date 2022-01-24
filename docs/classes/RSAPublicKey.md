# Class: RSAPublicKey

## Table of contents

### Constructors

- [constructor](RSAPublicKey.md#constructor)

### Methods

- [encrypt](RSAPublicKey.md#encrypt)
- [getExpE](RSAPublicKey.md#getexpe)
- [getModN](RSAPublicKey.md#getmodn)
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

[RSA.ts:6](https://github.com/oscar08850/mod/blob/3be4b2e/src/ts/RSA.ts#L6)

## Methods

### encrypt

▸ **encrypt**(`m`): `bigint`

#### Parameters

| Name | Type |
| :------ | :------ |
| `m` | `bigint` |

#### Returns

`bigint`

#### Defined in

[RSA.ts:19](https://github.com/oscar08850/mod/blob/3be4b2e/src/ts/RSA.ts#L19)

___

### getExpE

▸ **getExpE**(): `bigint`

#### Returns

`bigint`

#### Defined in

[RSA.ts:11](https://github.com/oscar08850/mod/blob/3be4b2e/src/ts/RSA.ts#L11)

___

### getModN

▸ **getModN**(): `bigint`

#### Returns

`bigint`

#### Defined in

[RSA.ts:15](https://github.com/oscar08850/mod/blob/3be4b2e/src/ts/RSA.ts#L15)

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

[RSA.ts:23](https://github.com/oscar08850/mod/blob/3be4b2e/src/ts/RSA.ts#L23)
