/*
 *
 * Helper: `checkIfClientZatcaCertified`.
 *
 */
import { createCmdMessage, isObjectHasData } from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import { API_VALUES, SERVER_CONFIG } from "../../constants.mjs";
import writeCertsOrganizationData from "../../helpers/writeCertsOrganizationData.mjs";

const { CHECK_IS_CURRENT_CLIENT_CERTIFIED } = API_VALUES;
const { authorization } = SERVER_CONFIG;

const checkIfClientZatcaCertified = async (baseAPiUrl, sandbox) => {
  const { result, error } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: CHECK_IS_CURRENT_CLIENT_CERTIFIED,
    requestMethod: "GET",
    requestParams: {
      authorization,
      sandbox,
    },
  });

  const { certified, productionCsidData, csidData } = result || {};

  const isCertified = certified === "Y";

  if (!isCertified) {
    createCmdMessage({
      type: "info",
      message: "client is not zatca certified yet!",
      data: error,
    });
  }

  await writeCertsOrganizationData({
    csidData,
    productionCsidData,
  });

  return {
    isCertified,
    shouldIssueInitialCsid: !isObjectHasData(csidData),
  };
};

export default checkIfClientZatcaCertified;
