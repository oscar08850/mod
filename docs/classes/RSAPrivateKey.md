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

[RSA.ts:31](https://github.com/Big-3/Moduls-Ciber/blob/f68201c/src/ts/RSA.ts#L31)

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

[RSA.ts:44](https://github.com/Big-3/Moduls-Ciber/blob/f68201c/src/ts/RSA.ts#L44)

___

### getExpD

▸ **getExpD**(): `bigint`

#### Returns

`bigint`

#### Defined in

[RSA.ts:36](https://github.com/Big-3/Moduls-Ciber/blob/f68201c/src/ts/RSA.ts#L36)

___

### getRSAPublicKey

▸ **getRSAPublicKey**(): [`RSAPublicKey`](RSAPublicKey.md)

#### Returns

[`RSAPublicKey`](RSAPublicKey.md)

#### Defined in

[RSA.ts:40](https://github.com/Big-3/Moduls-Ciber/blob/f68201c/src/ts/RSA.ts#L40)

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

[RSA.ts:48](https://github.com/Big-3/Moduls-Ciber/blob/f68201c/src/ts/RSA.ts#L48)
