/*
 *
 * Helper: `getCertificateInfo`.
 *
 */
import { X509Certificate } from "crypto";
import { Certificate } from "@fidm/x509";
import { removeCertificateUnwantedLines } from "@zatca-server/helpers";
import createCertificateHash from "./createCertificateHash.mjs";

const getCertificateInfo = (eInvoiceCertificate) => {
  const cleanedCertificate = removeCertificateUnwantedLines(
    eInvoiceCertificate,
    true
  );

  const hash = createCertificateHash(cleanedCertificate);
  const { serialNumber, issuer } = new X509Certificate(eInvoiceCertificate);

  // Signature, and public key extraction from x509 PEM certificate (asn1 rfc5280)
  // Crypto module does not have those functionalities so i'm the crypto boy now :(
  // https://github.com/nodejs/node/blob/main/src/crypto/crypto_x509.cc
  // https://linuxctl.com/2017/02/x509-certificate-manual-signature-verification/
  // https://github.com/junkurihara/js-x509-utils/blob/develop/src/x509.js
  // decode binary x509-formatted object
  const { publicKeyRaw, signature } = Certificate.fromPEM(
    Buffer.from(eInvoiceCertificate)
  );

  return {
    certificateHash: hash,
    certificateIssuer: issuer.split("\n").reverse().join(", "),
    certificateSerialNumber: BigInt(`0x${serialNumber}`).toString(10),
    certificatePublicKeyBuffer: publicKeyRaw,
    certificateSignature: signature,
    cleanedCertificate,
  };
};

export default getCertificateInfo;
