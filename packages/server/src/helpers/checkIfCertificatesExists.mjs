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

export const checkClientCertificates = (
  rootYarnWorkSpaces,
  { privateCertPath, publicCertPath, taxPayerPath, cnfFilePath }
) => [
  checkCertFile(rootYarnWorkSpaces, privateCertPath),
  checkCertFile(rootYarnWorkSpaces, publicCertPath),
  checkCertFile(rootYarnWorkSpaces, taxPayerPath),
  checkCertFile(rootYarnWorkSpaces, cnfFilePath),
];

export const areClientCertificatesExist = async (
  rootYarnWorkSpaces,
  client
) => {
  let result = checkClientCertificates(rootYarnWorkSpaces, client);

  result = result.flat().filter(Boolean);

  const errors = (await Promise.all(result)).filter(Boolean);

  return !errors.length;
};

const checkIfCertificatesExists = async () => {
  const rootYarnWorkSpaces = await findRootYarnWorkSpaces();
  const { clients } = await readClientsConfigData();

  const keys = Object.keys(clients);

  if (!keys.length) {
    return ["clients not found."];
  }

  let configPromises = [];

  for (let index = 0; index < keys.length; index++) {
    const clientName = keys[index];

    const client = clients[clientName];

    configPromises = configPromises.concat(
      ...checkClientCertificates(rootYarnWorkSpaces, client)
    );
  }

  configPromises = configPromises.flat().filter(Boolean);

  const errors = (await Promise.all(configPromises)).filter(Boolean);

  return errors;
};

export default checkIfCertificatesExists;
