/*
 *
 * Helper: `issueCertificate`.
 *
 */
import chalk from "chalk";
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
  ZATCA_SANDBOX_TYPES,
} from "../../constants.mjs";

const boldWhite = chalk.bold.white;

const { authorization, otp, sotp, potp } = SERVER_CONFIG;
const {
  FETCH_ZATCA_INITIAL_CSID,
  FETCH_ZATCA_PRODUCTION_CSID,
  POST_IF_CLIENT_CERTIFIED,
} = API_VALUES;

const OTP_BASED_SANDBOX = {
  [ZATCA_SANDBOX_TYPES.developer]: otp,
  [ZATCA_SANDBOX_TYPES.simulation]: sotp,
  [ZATCA_SANDBOX_TYPES.production]: potp,
};

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

    const _childNames = [client, childNames].flat().filter(Boolean);

    await writeClientsConfigData((config) =>
      _childNames.reduce((acc, clientName) => {
        const clientConfig = config.clients[clientName];
        const newData = { ...clientConfig, ...bodyData };
        return setIn(newData, `clients.${clientName}`, acc);
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
  otp,
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
    } for client=${boldWhite(client)} and sandbox=${boldWhite(sandbox)}`,
  });

  const { taxPayerPath, csidData, childNames } = await readClientsConfigData(
    client
  );

  const { bodyData, requestHeaders } =
    await createRequestHeadersAndBodyWithComplianceCsidData(
      taxPayerPath,
      OTP_BASED_SANDBOX[sandbox],
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
    createCmdMessage({
      type: "error",
      message: _errors,
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
