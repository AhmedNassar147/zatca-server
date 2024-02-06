/*
 *
 * Helper: `checkIfCertificatesExists`
 *
 */
import { readFile } from "fs/promises";
import chalk from "chalk";
import { findRootYarnWorkSpaces, checkPathExists } from "@zatca-server/helpers";
import readCertsOrganizationData from "./readCertsOrganizationData.mjs";

const checkIfCertificatesExists = async () => {
  const { privateCertPath, publicCertPath, taxPayerPath, cnfFilePath } =
    await readCertsOrganizationData();

  const rootYarnWorkSpaces = await findRootYarnWorkSpaces();

  const paths = [privateCertPath, publicCertPath, taxPayerPath, cnfFilePath];

  const configPromises = paths.map(async (fullPath) => {
    const fullFilePath = `${rootYarnWorkSpaces}/${fullPath}`;

    const doesFileExsist = await checkPathExists(
      `${rootYarnWorkSpaces}/${fullPath}`
    );

    if (doesFileExsist) {
      const fileContent = await readFile(fullFilePath, "utf-8");
      return fileContent && /[a-zA-Z]|\d/gm.test(fileContent)
        ? false
        : `${chalk.bold.white(fullPath)} is empty.`;
    }

    return `${chalk.bold.white(fullPath)} doesn't exist.`;
  });

  const errors = (await Promise.all(configPromises)).filter(Boolean);

  return errors;
};

await checkIfCertificatesExists();

export default checkIfCertificatesExists;
