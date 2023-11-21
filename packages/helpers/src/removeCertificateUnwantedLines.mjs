/*
 *
 * Helper: `removeCertificateUnwantedLines`.
 *
 */
const removeCertificateUnwantedLines = (certificateString, removeHeaders) => {
  let rawCertContent = certificateString;

  if (removeHeaders) {
    rawCertContent = rawCertContent.replace(/-----\w.+-----(\n)?/gm, "");
  }

  return rawCertContent.trim();
};

export default removeCertificateUnwantedLines;
