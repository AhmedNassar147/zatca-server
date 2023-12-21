/*
 *
 * Helper: `writeCertsOrganizationsData`.
 *
 */
import { writeFile } from "fs/promises";
import { setIn } from "@zatca-server/helpers";
import getOrganizationsDataJsonFilePath from "./getOrganizationsDataJsonFilePath.mjs";

const writeCertsOrganizationsData = async (value, path, source) => {
  const filePath = await getOrganizationsDataJsonFilePath();

  const newData = path ? setIn(value, path, source) : value;

  await writeFile(filePath, JSON.stringify(newData, null, 2));
};

export default writeCertsOrganizationsData;
