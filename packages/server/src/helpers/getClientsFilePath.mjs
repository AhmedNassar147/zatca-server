/*
 *
 * Helper: `getClientConfigFilePath`.
 *
 */
import { findRootYarnWorkSpaces } from "@zatca-server/helpers";

const getClientConfigFilePath = async () => {
  const rootPath = await findRootYarnWorkSpaces();

  return `${rootPath}/clients-config.json`;
};

export default getClientConfigFilePath;
