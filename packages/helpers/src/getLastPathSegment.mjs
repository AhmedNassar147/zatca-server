/*
 *
 * Helper: `getLastPathSegment`.
 *
 */
const getLastPathSegment = (pathString) =>
  pathString.substring(pathString.lastIndexOf("/") + 1);

export default getLastPathSegment;
