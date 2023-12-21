/*
 *
 * Helper: `getOrganizationsDataJsonFilePath`.
 *
 */
import { findRootYarnWorkSpaces } from "@zatca-server/helpers";

const getOrganizationsDataJsonFilePath = async () => {
  const rootYarnWorkSpacePath = await findRootYarnWorkSpaces();

  return `${rootYarnWorkSpacePath}/certs/organizations.json`;
};

export default getOrganizationsDataJsonFilePath;
