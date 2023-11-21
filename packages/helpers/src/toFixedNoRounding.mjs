/*
 *
 * Helper: `toFixedNoRounding`.
 *
 */
const toFixedNoRounding = (value, digits = 2) => {
  const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + digits + "})?", "g");
  const m = String(value).match(reg);

  if (m?.length) {
    const a = m[0];
    const dot = a.indexOf(".");
    if (dot === -1) {
      return a + "." + "0".repeat(digits);
    }
    const b = digits - (a.length - dot) + 1;
    return b > 0 ? a + "0".repeat(b) : a;
  }
  return "0.00";
};

export default toFixedNoRounding;
