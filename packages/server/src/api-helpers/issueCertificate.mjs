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
import getCsidJsonFilePath from "../helpers/getCsidJsonFilePath.mjs";
import {
  BASE_API_HEADERS,
  SERVER_CONFIG,
  CERTS_FILE_NAMES,
  API_VALUES,
} from "../constants.mjs";

const { otp } = SERVER_CONFIG;
const { taxPayerPath } = CERTS_FILE_NAMES;
const { FETCH_FINAL_CSID, POST_ZATCA_COMPLIANCE_CSID } = API_VALUES;

const baseRequestHeaders = {
  ...BASE_API_HEADERS,
  "Accept-Version": "V2",
};

const createRequestHeadersAndBodyWithComplianceCsidData = async (
  csidFilePath,
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

  const complianceCsidData = await readJsonFile(csidFilePath, true);
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

const issueCertificate = async (sandbox, isProductionCsid) => {
  const csidFilePath = await getCsidJsonFilePath();

  let { bodyData, requestHeaders, complianceCsidData } =
    await createRequestHeadersAndBodyWithComplianceCsidData(
      csidFilePath,
      isProductionCsid
    );

  const resourceNameUrl = isProductionCsid
    ? FETCH_FINAL_CSID[sandbox]
    : POST_ZATCA_COMPLIANCE_CSID;

  const response = await createZatcaRequest({
    resourceNameUrl,
    bodyData,
    requestHeaders,
    sandbox,
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

    await writeFile(csidFilePath, JSON.stringify(finalValues, null, 2));
  }

  return {
    requestHeaders,
    bodyData,
    response,
  };
};

export default issueCertificate;
