/*
 *
 * Helper: `checkIfCertificatesExists`
 *
 */
import { readFile } from "fs/promises";
import chalk from "chalk";
import { findRootYarnWorkSpaces, checkPathExists } from "@zatca-server/helpers";
import readClientsConfigData from "./readClientsConfigData.mjs";

const boldWhite = chalk.bold.white;

const checkCertFile = async (rootYarnWorkSpaces, filePath) => {
  const fullFilePath = `${rootYarnWorkSpaces}/${filePath}`;

  const doesFileExsist = await checkPathExists(fullFilePath);

  if (doesFileExsist) {
    const fileContent = await readFile(fullFilePath, "utf-8");
    return fileContent && /[a-zA-Z]|\d/gm.test(fileContent)
      ? false
      : `${boldWhite(fullFilePath)} is empty .`;
  }

  return `${boldWhite(fullFilePath)} doesn't exist .`;
};

const checkIfCertificatesExists = async () => {
  const rootYarnWorkSpaces = await findRootYarnWorkSpaces();
  const clients = await readClientsConfigData();

  const keys = Object.keys(clients);

  if (!keys.length) {
    return ["clients not found."];
  }

  let configPromises = [];

  for (let index = 0; index < keys.length; index++) {
    const clientName = keys[index];

    const { privateCertPath, publicCertPath, taxPayerPath, cnfFilePath } =
      clients[clientName];

    configPromises = configPromises.concat(
      checkCertFile(rootYarnWorkSpaces, privateCertPath),
      checkCertFile(rootYarnWorkSpaces, publicCertPath),
      checkCertFile(rootYarnWorkSpaces, taxPayerPath),
      checkCertFile(rootYarnWorkSpaces, cnfFilePath)
    );
  }

  configPromises = configPromises.flat().filter(Boolean);

  const errors = (await Promise.all(configPromises)).filter(Boolean);

  return errors;
};

export default checkIfCertificatesExists;
