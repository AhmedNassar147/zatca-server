/*
 *
 * Helper: `readAndEncodeCertToBase64`.
 *
 */
import readCertFile from "./readCertFile.mjs";
import encodeStringToBase64 from "./encodeStringToBase64.mjs";

const readAndEncodeCertToBase64 = async (certFilePath, removeHeaders) => {
  const rawCertContent = await readCertFile(certFilePath, removeHeaders);
  const encodedCertContent = encodeStringToBase64(rawCertContent);

  return encodedCertContent;
};

export default readAndEncodeCertToBase64;
