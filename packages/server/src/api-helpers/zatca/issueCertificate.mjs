/*
 *
 * Helper: `issueCertificate`.
 *
 */
import {
  decodeBase64ToString,
  readAndEncodeCertToBase64,
  createCmdMessage,
  setIn,
} from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import createZatcaAuthHeaders from "./createZatcaAuthHeaders.mjs";
import readClientsConfigData from "../../helpers/readClientsConfigData.mjs";
import writeClientsConfigData from "../../helpers/writeClientsConfigData.mjs";
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
  ({ baseAPiUrl, sandbox, client, csidData, isProductionCsid, childNames }) =>
  async (_values) => {
    const values = _values || {};
    const { binarySecurityToken, secret } = values;

    const certified = !!isProductionCsid && !!binarySecurityToken && !!secret;

    const bodyData = {
      certified,
      csidData: isProductionCsid ? csidData : values,
      productionCsidData: isProductionCsid ? values : {},
    };

    const _childNames = childNames || [client];

    await writeClientsConfigData(async (config) =>
      _childNames.reduce((acc, clientName) => {
        acc = setIn(bodyData, `clients.${clientName}`, config);
        return acc;
      }, config)
    );

    await createFetchRequest({
      baseAPiUrl,
      resourceNameUrl: POST_IF_CLIENT_CERTIFIED,
      requestParams: {
        client,
        sandbox,
      },
      bodyData: {
        authorization,
        ...bodyData,
        certified: certified ? "Y" : "N",
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

const issueCertificate = async ({
  baseAPiUrl,
  client,
  sandbox,
  isProductionCsid,
}) => {
  createCmdMessage({
    type: "info",
    message: `issue ${
      isProductionCsid ? "production csid data" : "initial csid data"
    } for client=${client} and sandbox=${sandbox}`,
  });

  const { taxPayerPath, csidData, childNames } = await readClientsConfigData(
    client
  );

  const { bodyData, requestHeaders } =
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

  const updateOrganizationData = createOrganizationDataUpdater({
    baseAPiUrl,
    sandbox,
    client,
    csidData,
    isProductionCsid,
    childNames,
  });

  const { result, error, isSuccess } = response;

  const {
    requestID,
    dispositionMessage,
    binarySecurityToken,
    secret,
    tokenType,
    errors,
  } = result || {};

  const _errors = [errors, isSuccess ? error : result]
    .filter(Boolean)
    .flat()
    .join(" ");

  if (_errors) {
    await updateOrganizationData();

    createCmdMessage({
      type: "error",
      message: `error when creating the ${
        isProductionCsid ? "production" : "initial"
      } csid data for client=${client} and sandbox=${sandbox}`,
      data: _errors,
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
