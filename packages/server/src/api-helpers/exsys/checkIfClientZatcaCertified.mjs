/*
 *
 * Helper: `checkIfClientZatcaCertified`.
 *
 */
import { createCmdMessage } from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import { API_VALUES, SERVER_CONFIG } from "../../constants.mjs";

const { CHECK_IS_CURRENT_CLIENT_CERTIFIED } = API_VALUES;
const { authorization } = SERVER_CONFIG;

const checkIfClientZatcaCertified = async (baseAPiUrl) => {
  const { result, error } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: CHECK_IS_CURRENT_CLIENT_CERTIFIED,
    requestMethod: "GET",
    requestParams: {
      authorization,
    },
  });

  const { certified } = result || {};

  const isCertified = certified === "Y";

  if (!isCertified) {
    createCmdMessage({
      type: "info",
      message: "client is not zatca certified yet !",
      data: error,
    });
  }

  return {
    isCertified,
  };
};

export default checkIfClientZatcaCertified;
