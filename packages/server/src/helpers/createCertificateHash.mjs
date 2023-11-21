/*
 *
 * Helper: `createCertificateHash`.
 *
 */
import { createHash } from "crypto";

const createCertificateHash = (certificateString) =>
  Buffer.from(
    createHash("sha256").update(certificateString).digest("hex")
  ).toString("base64");

export default createCertificateHash;
