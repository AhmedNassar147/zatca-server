/*
 *
 * Helper: `getCertsFolderPath`.
 *
 */
import { findRootYarnWorkSpaces } from "@zatca-server/helpers";

const getCertsFolderPath = async () => {
  const root = await findRootYarnWorkSpaces();

  return `${root}/certs`;
};

export default getCertsFolderPath;
