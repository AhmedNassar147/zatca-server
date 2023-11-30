/*
 *
 * Helper: `encodeStringToBase64`.
 *
 */
const encodeStringToBase64 = (value) => Buffer.from(value).toString("base64");

export default encodeStringToBase64;
