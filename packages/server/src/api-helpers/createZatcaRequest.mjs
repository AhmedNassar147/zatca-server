/*
 *
 * Helper: `createZatcaRequest`.
 *
 */
import createFetchRequest from "./createFetchRequest.mjs";
import {
  API_BASE_URLS,
  CLI_CONFIG,
  ZATCA_SANDBOX_TYPES,
} from "../constants.mjs";

const { ZATCA_SIMULATION, ZATCA_DEV_PORTAL } = API_BASE_URLS;
const { sandbox } = CLI_CONFIG;

const { simulation } = ZATCA_SANDBOX_TYPES;

const baseAPiUrl = sandbox === simulation ? ZATCA_SIMULATION : ZATCA_DEV_PORTAL;

const createZatcaRequest = async ({
  bodyData,
  requestParams,
  requestMethod,
  transformApiResults,
  retryTimes,
  retryDelay,
  requestHeaders,
  resourceNameUrl,
}) => {
  return await createFetchRequest({
    baseAPiUrl,
    requestParams,
    requestHeaders,
    resourceNameUrl,
    transformApiResults,
    body: bodyData,
    retryTimes,
    retryDelay,
    requestMethod,
    errorMessage: "zatca server is not connected",
  });
};

export default createZatcaRequest;
