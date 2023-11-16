/*
 *
 * Helper: `encodeStringToBase64`.
 *
 */
const encodeStringToBase64 = (value) =>
  Buffer.from(value, "utf8").toString("base64");

export default encodeStringToBase64;
