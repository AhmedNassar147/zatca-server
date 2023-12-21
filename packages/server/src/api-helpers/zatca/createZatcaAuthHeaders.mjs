/*
 *
 * Helper: `createZatcaAuthHeaders`.
 *
 */
import {
  removeCertificateUnwantedLines,
  encodeStringToBase64,
} from "@zatca-server/helpers";

const createZatcaAuthHeaders = (certificate, secret) => {
  if (certificate && secret) {
    let finalCertificate = certificate;
    const isRawCertificate = certificate.startsWith("-----");

    if (isRawCertificate) {
      const cleanedCertificate = removeCertificateUnwantedLines(
        certificate,
        true
      );

      finalCertificate = encodeStringToBase64(cleanedCertificate);
    }

    const basic = encodeStringToBase64(`${finalCertificate}:${secret}`);

    // Basic encodeStringToBase64($binarySecurityToken:$secret)
    return {
      Authorization: `Basic ${basic}`,
    };
  }

  return null;
};

export default createZatcaAuthHeaders;
