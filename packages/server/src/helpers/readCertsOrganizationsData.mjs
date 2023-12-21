/*
 *
 * Helper: `readCertsOrganizationsData`.
 *
 */
import { readJsonFile } from "@zatca-server/helpers";
import getOrganizationsDataJsonFilePath from "./getOrganizationsDataJsonFilePath.mjs";

const readCertsOrganizationsData = async (organizationNo) => {
  const filePath = await getOrganizationsDataJsonFilePath();
  const _organizationsData = await readJsonFile(filePath, true);

  const organizationsData = _organizationsData || {};

  return organizationNo
    ? organizationsData[organizationNo] || {}
    : organizationsData;
};

export default readCertsOrganizationsData;
