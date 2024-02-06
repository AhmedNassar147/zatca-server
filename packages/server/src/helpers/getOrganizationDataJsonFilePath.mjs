/*
 *
 * Helper: `getOrganizationDataJsonFilePath`.
 *
 */
import getCertsFolderPath from "./getCertsFolderPath.mjs";

const getOrganizationDataJsonFilePath = async () => {
  const certsFolderPath = await getCertsFolderPath();

  return `${certsFolderPath}/organization.json`;
};

export default getOrganizationDataJsonFilePath;
