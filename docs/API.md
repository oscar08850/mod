# @cyber/ciber-modules - v0.0.1

My module description. Please update with your module data.

**`remarks`**
This module runs perfectly in node.js and browsers

## Table of contents

### Classes

- [PaillierPrivateKey](classes/PaillierPrivateKey.md)
- [PaillierPublicKey](classes/PaillierPublicKey.md)
- [RSAPrivateKey](classes/RSAPrivateKey.md)
- [RSAPublicKey](classes/RSAPublicKey.md)
- [SharedKey](classes/SharedKey.md)

### Functions

- [LagrangeInterpolation](API.md#lagrangeinterpolation)
- [genSharedKeys](API.md#gensharedkeys)
- [generatePaillierKeys](API.md#generatepaillierkeys)
- [generateRSAKeys](API.md#generatersakeys)

## Functions

### LagrangeInterpolation

▸ **LagrangeInterpolation**(`receivedSharedKeys`): `bigint`

#### Parameters

| Name | Type |
| :------ | :------ |
| `receivedSharedKeys` | [`SharedKey`](classes/SharedKey.md)[] |

#### Returns

`bigint`

#### Defined in

[Secret-sharing.ts:90](https://github.com/oscar08850/mod/blob/3be4b2e/src/ts/Secret-sharing.ts#L90)

___

### genSharedKeys

▸ **genSharedKeys**(`s`, `t`, `n`, `nbits`): `Promise`<[`SharedKey`](classes/SharedKey.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `s` | `bigint` |
| `t` | `number` |
| `n` | `number` |
| `nbits` | `number` |

#### Returns

`Promise`<[`SharedKey`](classes/SharedKey.md)[]\>

#### Defined in

[Secret-sharing.ts:55](https://github.com/oscar08850/mod/blob/3be4b2e/src/ts/Secret-sharing.ts#L55)

___

### generatePaillierKeys

▸ **generatePaillierKeys**(`nbits?`): `Promise`<[`PaillierPrivateKey`](classes/PaillierPrivateKey.md)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `nbits` | `number` | `2048` |

#### Returns

`Promise`<[`PaillierPrivateKey`](classes/PaillierPrivateKey.md)\>

#### Defined in

[Paillier.ts:99](https://github.com/oscar08850/mod/blob/3be4b2e/src/ts/Paillier.ts#L99)

___

### generateRSAKeys

▸ **generateRSAKeys**(`nbits?`): `Promise`<[`RSAPrivateKey`](classes/RSAPrivateKey.md)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `nbits` | `number` | `2048` |

#### Returns

`Promise`<[`RSAPrivateKey`](classes/RSAPrivateKey.md)\>

#### Defined in

[RSA.ts:76](https://github.com/oscar08850/mod/blob/3be4b2e/src/ts/RSA.ts#L76)
