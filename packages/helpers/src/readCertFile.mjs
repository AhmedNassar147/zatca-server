/*
 *
 * Helper: `readCertFile`.
 *
 */
import { readFile } from "fs/promises";
import findRootYarnWorkSpaces from "./findRootYarnWorkSpaces.mjs";
import removeCertificateUnwantedLines from "./removeCertificateUnwantedLines.mjs";

const readCertFile = async (certFilePath, removeHeaders = false) => {
  const rootPath = await findRootYarnWorkSpaces();
  const fullCertFilePath = `${rootPath}/${certFilePath}`;
  const rawCertContent = await readFile(fullCertFilePath, "utf8");

  return removeCertificateUnwantedLines(rawCertContent, removeHeaders);
};

export default readCertFile;
