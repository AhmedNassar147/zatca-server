/*
 *
 * Helper: `stopTheProcessIfCertificateNotFound`.
 *
 */
import chalk from "chalk";
import {
  findRootYarnWorkSpaces,
  checkPathExists,
  createCmdMessage,
} from "@zatca-server/helpers";
import readCertsOrganizationsData from "./readCertsOrganizationsData.mjs";

const stopTheProcessIfCertificateNotFound = async () => {
  const organizationsData = await readCertsOrganizationsData();
  const rootYarnWorkSpaces = await findRootYarnWorkSpaces();

  createCmdMessage({
    type: "info",
    message: "checking certificates ...",
  });

  const values = Object.values(organizationsData);

  const paths = values
    .map(({ privateCertPath, publicCertPath, taxPayerPath }) => [
      privateCertPath,
      publicCertPath,
      taxPayerPath,
    ])
    .flat();

  const configPromises = paths.map(async (fullPath) => {
    const doesFileExsist = await checkPathExists(
      `${rootYarnWorkSpaces}/${fullPath}`
    );
    return !doesFileExsist
      ? `${chalk.bold.white(fullPath)} doesn't exist`
      : false;
  });

  const errors = (await Promise.all(configPromises)).filter(Boolean);

  if (errors.length) {
    errors.forEach((error) =>
      createCmdMessage({
        type: "error",
        message: error,
      })
    );

    process.kill(process.pid);
  }
};

export default stopTheProcessIfCertificateNotFound;
