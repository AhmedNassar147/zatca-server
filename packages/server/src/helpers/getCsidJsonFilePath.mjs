/*
 *
 * Helper: `getCsidJsonFilePath`.
 *
 */
import { findRootYarnWorkSpaces } from "@zatca-server/helpers";

const getCsidJsonFilePath = async () => {
  const rootYarnWorkSpacePath = await findRootYarnWorkSpaces();

  return `${rootYarnWorkSpacePath}/certs/csid.json`;
};

export default getCsidJsonFilePath;
