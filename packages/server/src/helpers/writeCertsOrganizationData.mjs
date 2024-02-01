/*
 *
 * Helper: `writeCertsOrganizationData`.
 *
 */
import { writeFile } from "fs/promises";
import { setIn } from "@zatca-server/helpers";
import getOrganizationsDataJsonFilePath from "./getOrganizationDataJsonFilePath.mjs";

const writeCertsOrganizationData = async (value, path, source) => {
  const filePath = await getOrganizationsDataJsonFilePath();

  const newData = path ? setIn(value, path, source) : value;

  await writeFile(filePath, JSON.stringify(newData, null, 2));
};

export default writeCertsOrganizationData;
