/*
 *
 * Helper: `writeClientsConfigData`.
 *
 */
import { writeFile } from "fs/promises";
import { setIn } from "@zatca-server/helpers";
import getClientsFilePath from "./getClientsFilePath.mjs";
import readClientsConfigData from "./readClientsConfigData.mjs";

const writeClientsConfigData = async (value, keyPath) => {
  const filePath = await getClientsFilePath();
  const clientsConfigData = await readClientsConfigData();

  if (typeof value === "function") {
    const newValues = await value(clientsConfigData);
    const newData = JSON.stringify(newValues, null, 2);
    await writeFile(filePath, newData);

    return;
  }

  const newValues = keyPath ? setIn(value, keyPath, clientsData) : value;

  const newData = JSON.stringify(newValues, null, 2);

  await writeFile(filePath, newData);
};

export default writeClientsConfigData;
