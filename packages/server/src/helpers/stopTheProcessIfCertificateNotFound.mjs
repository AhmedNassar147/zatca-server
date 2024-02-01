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
import readCertsOrganizationData from "./readCertsOrganizationData.mjs";

const stopTheProcessIfCertificateNotFound = async () => {
  const { privateCertPath, publicCertPath, taxPayerPath } =
    await readCertsOrganizationData();
  const rootYarnWorkSpaces = await findRootYarnWorkSpaces();

  createCmdMessage({
    type: "info",
    message: "checking certificates ...",
  });

  const paths = [privateCertPath, publicCertPath, taxPayerPath];

  const configPromises = paths.map(async (fullPath) => {
    const doesFileExsist = await checkPathExists(
      `${rootYarnWorkSpaces}/${fullPath}`
    );
    return !doesFileExsist
      ? `${chalk.bold.white(fullPath)} doesn't exist`
      : false;
  });

  const errors = (await Promise.all(configPromises)).filter(Boolean);

  if (!errors.length) {
    createCmdMessage({
      type: "success",
      message: "certificates checked ☺",
    });

    return;
  }

  errors.forEach((error) =>
    createCmdMessage({
      type: "error",
      message: error,
    })
  );

  process.kill(process.pid);
  process.exit(process.exitCode);
};

export default stopTheProcessIfCertificateNotFound;
