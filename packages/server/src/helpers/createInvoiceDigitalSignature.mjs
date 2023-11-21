/*
 *
 * Helper: `createInvoiceDigitalSignature`.
 *
 */
import { createSign } from "crypto";
import { readCertFile } from "@zatca-server/helpers";
import { CERTS_FILE_NAMES } from "../constants.mjs";

const { privateCertPath } = CERTS_FILE_NAMES;

const createInvoiceDigitalSignature = async (invoiceHash) => {
  const invoiceHashBytes = Buffer.from(invoiceHash, "base64");

  const privateKeyContent = await readCertFile(privateCertPath);

  const sign = createSign("sha256");
  sign.update(invoiceHashBytes);

  const signature = Buffer.from(sign.sign(privateKeyContent)).toString(
    "base64"
  );

  return signature;
};

export default createInvoiceDigitalSignature;
