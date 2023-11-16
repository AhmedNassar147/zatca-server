/*
 *
 * Helper: `readAndEncodeCertToBase64`.
 *
 */
import { readFile } from "fs/promises";
import findRootYarnWorkSpaces from "./findRootYarnWorkSpaces.mjs";
import encodeStringToBase64 from "./encodeStringToBase64.mjs";

const readAndEncodeCertToBase64 = async (certFilePath) => {
  const rootPath = await findRootYarnWorkSpaces();
  const fullCertFilePath = `${rootPath}/${certFilePath}`;

  let rawCertContent = await readFile(fullCertFilePath, "utf8");
  rawCertContent = rawCertContent.replace(/\n$/, "");

  const encodedCertContent = encodeStringToBase64(rawCertContent);

  return encodedCertContent;
};

export default readAndEncodeCertToBase64;
