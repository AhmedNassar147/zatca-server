/*
 *
 * Helper: `readCertsOrganizationData`.
 *
 */
import { readJsonFile } from "@zatca-server/helpers";
import getOrganizationDataJsonFilePath from "./getOrganizationDataJsonFilePath.mjs";

const readCertsOrganizationData = async () => {
  const filePath = await getOrganizationDataJsonFilePath();
  const _organizationData = await readJsonFile(filePath, true);

  return _organizationData || {};
};

export default readCertsOrganizationData;
