/*
 *
 * Helper: `fetchZatcaComplianceCertificate`.
 *
 */
import { writeFile } from "fs/promises";
import { decodeBase64ToString } from "@zatca-server/helpers";
import createZatcaRequest from "./createZatcaRequest.mjs";
import {
  BASE_API_HEADERS,
  SERVER_CONFIG,
  API_IDS_NAMES,
  CSID_FILE_PATH,
} from "../constants.mjs";

const { otp } = SERVER_CONFIG;
const { POST_ZATCA_COMPLIANCE } = API_IDS_NAMES;

// after final csid
// invoices/reporting/single for simplified
// invoices/clearance/single for standard

const fetchZatcaComplianceCertificate = async (encodedPayerTaxCert) => {
  const bodyData = {
    csr: encodedPayerTaxCert,
  };

  const requestHeaders = {
    ...BASE_API_HEADERS,
    "Accept-Version": "V2",
    OTP: otp,
  };

  const { result, error } = await createZatcaRequest({
    resourceName: POST_ZATCA_COMPLIANCE,
    bodyData,
    requestHeaders,
  });

  const { requestID, dispositionMessage, binarySecurityToken, secret, errors } =
    result || {};

  if (errors || error) {
    return errors || error;
  }

  if (binarySecurityToken) {
    const decodedToken = decodeBase64ToString(binarySecurityToken);

    const data = {
      requestID,
      dispositionMessage,
      secret,
      binarySecurityToken,
      decodedToken: `-----BEGIN CERTIFICATE-----\n${decodedToken}\n-----END CERTIFICATE-----`,
    };

    await writeFile(CSID_FILE_PATH, JSON.stringify(data, null, 2));
  }
};

export default fetchZatcaComplianceCertificate;
