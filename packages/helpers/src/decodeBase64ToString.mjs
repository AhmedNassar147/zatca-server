/*
 *
 * Helper: `decodeBase64ToString`.
 *
 */
const decodeBase64ToString = (base64) =>
  Buffer.from(base64, "base64").toString();

export default decodeBase64ToString;
