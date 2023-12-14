/*
 *
 * Helper: `issueCertificate`.
 *
 */
import { writeFile } from "fs/promises";
import {
  decodeBase64ToString,
  readJsonFile,
  readAndEncodeCertToBase64,
} from "@zatca-server/helpers";
import createZatcaRequest from "./createZatcaRequest.mjs";
import createZatcaAuthHeaders from "./createZatcaAuthHeaders.mjs";
import {
  BASE_API_HEADERS,
  SERVER_CONFIG,
  API_IDS_NAMES,
  CSID_FILE_PATH,
  CERTS_FILE_NAMES,
} from "../constants.mjs";

const { otp } = SERVER_CONFIG;
const { POST_ZATCA_COMPLIANCE_CSID, POST_ZATCA_FINAL_CSID } = API_IDS_NAMES;
const { taxPayerPath } = CERTS_FILE_NAMES;

const baseRequestHeaders = {
  ...BASE_API_HEADERS,
  "Accept-Version": "V2",
};

const createRequestHeadersAndBodyWithComplianceCsidData = async (
  isProductionCsid
) => {
  if (!isProductionCsid) {
    // don't remove cert headers
    const encodedPayerTaxCert = await readAndEncodeCertToBase64(taxPayerPath);

    const requestHeaders = {
      ...baseRequestHeaders,
      OTP: otp,
    };

    return {
      requestHeaders,
      bodyData: {
        csr: encodedPayerTaxCert,
      },
    };
  }

  const complianceCsidData = await readJsonFile(CSID_FILE_PATH, true);
  const { binarySecurityToken, secret, requestID } = complianceCsidData;

  const requestHeaders = {
    ...baseRequestHeaders,
    ...createZatcaAuthHeaders(binarySecurityToken, secret),
  };

  return {
    requestHeaders,
    bodyData: { compliance_request_id: requestID },
    complianceCsidData,
  };
};

const issueCertificate = async (isProductionCsid) => {
  let { bodyData, requestHeaders, complianceCsidData } =
    await createRequestHeadersAndBodyWithComplianceCsidData(isProductionCsid);

  const resourceName = isProductionCsid
    ? POST_ZATCA_FINAL_CSID
    : POST_ZATCA_COMPLIANCE_CSID;

  const response = await createZatcaRequest({
    resourceName,
    bodyData,
    requestHeaders,
  });

  const { result, error } = response;

  const {
    requestID,
    dispositionMessage,
    binarySecurityToken,
    secret,
    tokenType,
    errors,
  } = result || {};

  const _errors = errors || error;

  if (_errors) {
    return {
      requestHeaders,
      bodyData,
      response,
      errors: _errors,
    };
  }

  if (binarySecurityToken) {
    const decodedToken = decodeBase64ToString(binarySecurityToken);

    const data = {
      requestID,
      dispositionMessage,
      tokenType,
      secret,
      binarySecurityToken,
      decodedToken: `-----BEGIN CERTIFICATE-----\n${decodedToken}\n-----END CERTIFICATE-----`,
    };

    const finalValues = isProductionCsid
      ? { ...complianceCsidData, productionCsidData: data }
      : data;

    await writeFile(CSID_FILE_PATH, JSON.stringify(finalValues, null, 2));
  }

  return {
    requestHeaders,
    bodyData,
    response,
  };
};

export default issueCertificate;
