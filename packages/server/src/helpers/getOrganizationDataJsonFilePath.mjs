/*
 *
 * Helper: `getOrganizationDataJsonFilePath`.
 *
 */
import { findRootYarnWorkSpaces } from "@zatca-server/helpers";

const getOrganizationDataJsonFilePath = async () => {
  const rootYarnWorkSpacePath = await findRootYarnWorkSpaces();

  return `${rootYarnWorkSpacePath}/certs/organization.json`;
};

export default getOrganizationDataJsonFilePath;
