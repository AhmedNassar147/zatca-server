/*
 *
 * Helper: `createFetchRequest`.
 *
 */
import chalk from "chalk";
import axios from "axios";
import { delayProcess, createCmdMessage } from "@zatca-server/helpers";
import {
  BASE_API_HEADERS,
  HTTP_STATUS_CODE,
  API_BASE_URLS,
} from "../constants.mjs";

const { ZATCA_BASE_URL } = API_BASE_URLS;

const createFetchRequest = (options) => {
  const {
    baseAPiUrl: _baseAPiUrl,
    resourceNameUrl,
    requestParams,
    requestMethod = "POST",
    requestHeaders = BASE_API_HEADERS,
    bodyData,
    transformApiResults,
    httpStatusCodes = HTTP_STATUS_CODE,
    retryTimes = 0,
    retryDelay = 0,
    zatcaSandbox,
  } = options;

  let baseAPiUrl = _baseAPiUrl;

  if (zatcaSandbox) {
    baseAPiUrl = ZATCA_BASE_URL;
  }

  if (!resourceNameUrl) {
    throw new Error("resourceName is not found in `EXSYS_API_IDS`");
  }

  let currentResourceName = resourceNameUrl;

  if (requestParams) {
    const searchParams = new URLSearchParams(requestParams);
    currentResourceName += `?${searchParams.toString()}`;
  }

  const API_URL = currentResourceName
    ? `${baseAPiUrl}${
        currentResourceName.startsWith("?")
          ? currentResourceName
          : `/${currentResourceName}`
      }`
    : baseAPiUrl;

  const fetchOptions = {
    method: requestMethod,
    headers: requestHeaders,
    data: bodyData,
    url: API_URL,
  };

  return new Promise((resolve) => {
    const wrapper = (n) => {
      axios(fetchOptions)
        .then((apiResponse) => {
          const { status, data } = apiResponse;
          const message = httpStatusCodes[status];
          const isSuccess = message === "success";

          const baseValues = {
            status,
            isSuccess,
            error: isSuccess ? undefined : message,
          };

          if (transformApiResults) {
            const result = transformApiResults(apiResponse);
            return resolve({
              ...baseValues,
              result,
            });
          }

          resolve({
            ...baseValues,
            result: data,
          });
        })
        .catch(async (error) => {
          const errorMessage = zatcaSandbox
            ? "zatca server has an error"
            : "something went wrong";

          const { response } = error || {};
          const { data: responseData, status } = response || {};
          if (n > 0) {
            await delayProcess(retryDelay);
            wrapper(--n);
          } else {
            createCmdMessage({
              type: "error",
              message: `${errorMessage} when calling ${chalk.white.bold(
                API_URL
              )}`,
            });
            resolve({
              isSuccess: false,
              error: errorMessage,
              status,
              result: responseData,
            });
          }
        });
    };

    wrapper(retryTimes);
  });
};

export default createFetchRequest;
