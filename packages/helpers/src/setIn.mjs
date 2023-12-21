/*
 *
 * Helper: `setIn`.
 *
 */
const castToPath = (initialPath) =>
  Array.isArray(initialPath) ? initialPath : initialPath.split(".");

const setIn = (value, path, source) => {
  // we take another ref so we don't mutate the original source
  const target = JSON.parse(JSON.stringify(source || {}));
  const keys = castToPath(path);
  let mostNestedObj = target;
  let keyIndex = 0;
  const keysLength = keys.length;

  /* set remaining keys */
  while (keyIndex < keysLength) {
    const key = keys[keyIndex];
    const isLastKey = keyIndex === keysLength - 1;

    if (isLastKey) {
      // @ts-ignore
      mostNestedObj[key] = value;
    } else {
      // @ts-ignore
      if (!mostNestedObj[key]) {
        // @ts-ignore
        mostNestedObj[key] = {};
      }
      // @ts-ignore
      mostNestedObj = mostNestedObj[key];
    }

    keyIndex++;
  }

  return target;
};

export default setIn;
