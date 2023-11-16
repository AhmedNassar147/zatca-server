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
import { CERTS_FILE_NAMES } from "../constants.mjs";

const stopTheProcessIfCertificateNotFound = async () => {
  const rootPath = await findRootYarnWorkSpaces();

  createCmdMessage({
    type: "info",
    message: "checking certificates ...",
  });

  const configPromises = Object.keys(CERTS_FILE_NAMES).map(async (key) => {
    const basePath = CERTS_FILE_NAMES[key];
    const fullPath = `${rootPath}/${basePath}`;

    const doesFileExsist = await checkPathExists(fullPath);
    return !doesFileExsist
      ? `${chalk.bold.white(basePath)} doesn't exist`
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
