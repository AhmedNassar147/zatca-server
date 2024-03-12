/*
 *
 * Helper: `readClientsConfigData`.
 *
 */
import { writeFile } from "fs/promises";
import { checkPathExists, readJsonFile } from "@zatca-server/helpers";
import getClientsFilePath from "./getClientsFilePath.mjs";

const readClientsConfigData = async (clientName) => {
  const clientsFilePath = await getClientsFilePath();

  if (!(await checkPathExists(clientsFilePath))) {
    await writeFile(clientsFilePath, JSON.stringify({}, null, 2));

    return {};
  }

  const clientsConfigData = await readJsonFile(clientsFilePath, true);

  const { clients } = clientsConfigData || {};

  return clientName ? clients[clientName] || {} : clientsData;
};

export default readClientsConfigData;
