/*
 *
 * Helper: `issueCertificate`.
 *
 */
import {
  decodeBase64ToString,
  readAndEncodeCertToBase64,
  createCmdMessage,
} from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import createZatcaAuthHeaders from "./createZatcaAuthHeaders.mjs";
import readCertsOrganizationData from "../../helpers/readCertsOrganizationData.mjs";
import writeCertsOrganizationData from "../../helpers/writeCertsOrganizationData.mjs";
import {
  BASE_API_HEADERS,
  SERVER_CONFIG,
  API_VALUES,
} from "../../constants.mjs";

const { otp, authorization } = SERVER_CONFIG;
const {
  FETCH_ZATCA_INITIAL_CSID,
  FETCH_ZATCA_PRODUCTION_CSID,
  POST_IF_CLIENT_CERTIFIED,
} = API_VALUES;

const baseRequestHeaders = {
  ...BASE_API_HEADERS,
  "Accept-Version": "V2",
};

const createOrganizationDataUpdater =
  (baseAPiUrl, csidData, isProductionCsid) => async (_values) => {
    const path = isProductionCsid ? "productionCsidData" : "csidData";
    const values = _values || {};

    await writeCertsOrganizationData({ [path]: values });
    const { binarySecurityToken, secret } = values;

    await createFetchRequest({
      baseAPiUrl,
      resourceNameUrl: POST_IF_CLIENT_CERTIFIED,
      bodyData: {
        certified:
          isProductionCsid && !!binarySecurityToken && !!secret ? "Y" : "N",
        authorization,
        csidData: isProductionCsid ? csidData : values,
        productionCsidData: isProductionCsid ? values : {},
      },
    });
  };

const createRequestHeadersAndBodyWithComplianceCsidData = async (
  taxPayerPath,
  csidData,
  isProductionCsid
) => {
  const { binarySecurityToken, secret, requestID } = csidData || {};

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

const issueCertificate = async (baseAPiUrl, sandbox, isProductionCsid) => {
  createCmdMessage({
    type: "info",
    message: `issue ${
      isProductionCsid ? "production csid data" : "initial csid data"
    }`,
  });

  const organizationData = await readCertsOrganizationData();
  const { taxPayerPath, csidData } = organizationData;

  let { bodyData, requestHeaders } =
    await createRequestHeadersAndBodyWithComplianceCsidData(
      taxPayerPath,
      csidData,
      isProductionCsid
    );

  const resourceNameUrl = (
    isProductionCsid ? FETCH_ZATCA_PRODUCTION_CSID : FETCH_ZATCA_INITIAL_CSID
  )[sandbox];

  const response = await createFetchRequest({
    resourceNameUrl,
    bodyData,
    requestHeaders,
    zatcaSandbox: sandbox,
  });

  const updateOrganizationData = createOrganizationDataUpdater(
    baseAPiUrl,
    csidData,
    isProductionCsid
  );

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
    await updateOrganizationData(result);

    createCmdMessage({
      type: "error",
      message: `error when creating the ${
        isProductionCsid ? "production" : "initial"
      } csid data`,
      data: errors,
    });

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

    await updateOrganizationData(data);
  }

  return {
    requestHeaders,
    bodyData,
    response,
  };
};

export default issueCertificate;
