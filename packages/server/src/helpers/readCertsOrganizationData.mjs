/*
 *
 * Helper: `readCertsOrganizationData`.
 *
 */
import { writeFile } from "fs/promises";
import { checkPathExists, readJsonFile } from "@zatca-server/helpers";
import getOrganizationDataJsonFilePath from "./getOrganizationDataJsonFilePath.mjs";

const readCertsOrganizationData = async () => {
  const organizationFilePath = await getOrganizationDataJsonFilePath();

  if (!(await checkPathExists(organizationFilePath))) {
    await writeFile(organizationFilePath, JSON.stringify({}, null, 2));
  }

  return await readJsonFile(organizationFilePath, true);
};

export default readCertsOrganizationData;
