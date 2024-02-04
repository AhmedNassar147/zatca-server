/*
 *
 * Helper: `writeCertsOrganizationData`.
 *
 */
import { writeFile } from "fs/promises";
import getOrganizationsDataJsonFilePath from "./getOrganizationDataJsonFilePath.mjs";
import readCertsOrganizationData from "./readCertsOrganizationData.mjs";

const writeCertsOrganizationData = async (newValues) => {
  const filePath = await getOrganizationsDataJsonFilePath();
  const organizationData = await readCertsOrganizationData();

  const newData = JSON.stringify(
    {
      ...organizationData,
      ...newValues,
    },
    null,
    2
  );

  await writeFile(filePath, newData);
};

export default writeCertsOrganizationData;
