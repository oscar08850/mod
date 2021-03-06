# Class: RSAPrivateKey

## Table of contents

### Constructors

- [constructor](RSAPrivateKey.md#constructor)

### Methods

- [decrypt](RSAPrivateKey.md#decrypt)
- [getExpD](RSAPrivateKey.md#getexpd)
- [getRSAPublicKey](RSAPrivateKey.md#getrsapublickey)
- [sign](RSAPrivateKey.md#sign)

## Constructors

### constructor

• **new RSAPrivateKey**(`d`, `pubKey`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `bigint` |
| `pubKey` | [`RSAPublicKey`](RSAPublicKey.md) |

#### Defined in

[RSA.ts:46](https://github.com/oscar08850/mod/blob/7433e5e/src/ts/RSA.ts#L46)

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

[RSA.ts:59](https://github.com/oscar08850/mod/blob/7433e5e/src/ts/RSA.ts#L59)

___

### getExpD

▸ **getExpD**(): `bigint`

#### Returns

`bigint`

#### Defined in

[RSA.ts:51](https://github.com/oscar08850/mod/blob/7433e5e/src/ts/RSA.ts#L51)

___

### getRSAPublicKey

▸ **getRSAPublicKey**(): [`RSAPublicKey`](RSAPublicKey.md)

#### Returns

[`RSAPublicKey`](RSAPublicKey.md)

#### Defined in

[RSA.ts:55](https://github.com/oscar08850/mod/blob/7433e5e/src/ts/RSA.ts#L55)

___

### sign

▸ **sign**(`h`): `bigint`

#### Parameters

| Name | Type |
| :------ | :------ |
| `h` | `bigint` |

#### Returns

`bigint`

#### Defined in

[RSA.ts:63](https://github.com/oscar08850/mod/blob/7433e5e/src/ts/RSA.ts#L63)
