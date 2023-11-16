/*
 *
 * Helper: `createZatcaRequest`.
 *
 */
import createFetchRequest from "./createFetchRequest.mjs";
import { API_BASE_URLS, CLI_CONFIG } from "../constants.mjs";

const { ZATCA_PRODUCTION, ZATCA_DEVELOPMENT } = API_BASE_URLS;
const { production } = CLI_CONFIG;

const createZatcaRequest = async ({
  bodyData,
  requestParams,
  requestMethod,
  transformApiResults,
  retryTimes,
  retryDelay,
  requestHeaders,
  resourceName,
}) => {
  const baseAPiUrl = production ? ZATCA_PRODUCTION : ZATCA_DEVELOPMENT;

  return await createFetchRequest({
    baseAPiUrl,
    requestParams,
    requestHeaders,
    resourceName,
    transformApiResults,
    body: bodyData,
    retryTimes,
    retryDelay,
    requestMethod,
    // errorMessage: "Nphies server is not connected",
  });
};

export default createZatcaRequest;
