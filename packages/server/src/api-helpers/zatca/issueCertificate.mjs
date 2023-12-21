/*
 *
 * Helper: `issueCertificate`.
 *
 */
import {
  decodeBase64ToString,
  readAndEncodeCertToBase64,
} from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import createZatcaAuthHeaders from "./createZatcaAuthHeaders.mjs";
import readCertsOrganizationsData from "../../helpers/readCertsOrganizationsData.mjs";
import writeCertsOrganizationsData from "../../helpers/writeCertsOrganizationsData.mjs";
import {
  BASE_API_HEADERS,
  SERVER_CONFIG,
  API_VALUES,
} from "../../constants.mjs";

const { otp } = SERVER_CONFIG;
const { FETCH_FINAL_CSID, POST_ZATCA_COMPLIANCE_CSID } = API_VALUES;

const baseRequestHeaders = {
  ...BASE_API_HEADERS,
  "Accept-Version": "V2",
};

const createRequestHeadersAndBodyWithComplianceCsidData = async (
  taxPayerPath,
  csidData,
  isProductionCsid
) => {
  const { binarySecurityToken, secret, requestID } = csidData;

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

  const requestHeaders = {
    ...baseRequestHeaders,
    ...createZatcaAuthHeaders(binarySecurityToken, secret),
  };

  return {
    requestHeaders,
    bodyData: { compliance_request_id: requestID },
  };
};

const issueCertificate = async (organizationNo, sandbox, isProductionCsid) => {
  const organizationsData = await readCertsOrganizationsData();
  const { taxPayerPath, csidData } = organizationsData[organizationNo];

  let { bodyData, requestHeaders } =
    await createRequestHeadersAndBodyWithComplianceCsidData(
      taxPayerPath,
      csidData,
      isProductionCsid
    );

  const resourceNameUrl = isProductionCsid
    ? FETCH_FINAL_CSID[sandbox]
    : POST_ZATCA_COMPLIANCE_CSID;

  const response = await createFetchRequest({
    resourceNameUrl,
    bodyData,
    requestHeaders,
    zatcaSandbox: sandbox,
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

    const path = `${organizationNo}.${
      isProductionCsid ? "productionCsidData" : "csidData"
    }`;

    await writeCertsOrganizationsData(data, path, organizationsData);
  }

  return {
    requestHeaders,
    bodyData,
    response,
  };
};

export default issueCertificate;
