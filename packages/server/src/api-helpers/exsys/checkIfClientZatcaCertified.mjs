/*
 *
 * Helper: `checkIfClientZatcaCertified`.
 *
 */
import { createCmdMessage, isObjectHasData } from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import { API_VALUES, SERVER_CONFIG } from "../../constants.mjs";
import writeClientsConfigData from "../../helpers/writeClientsConfigData.mjs";

const { CHECK_IS_CURRENT_CLIENT_CERTIFIED } = API_VALUES;
const { authorization } = SERVER_CONFIG;

const checkIfClientZatcaCertified = async (baseAPiUrl, client, sandbox) => {
  const { result, error } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: CHECK_IS_CURRENT_CLIENT_CERTIFIED,
    requestMethod: "GET",
    requestParams: {
      authorization,
      sandbox,
      client,
    },
  });

  const { certified, productionCsidData, csidData } = result || {};

  const isCertified = certified === "Y";

  if (!isCertified) {
    createCmdMessage({
      type: "info",
      message: `client=${client} is not zatca certified yet!`,
      data: error,
    });
  }

  await writeClientsConfigData(
    {
      csidData: csidData || {},
      productionCsidData: productionCsidData || {},
    },
    client
  );

  return {
    isCertified,
    shouldIssueInitialCsid: !isObjectHasData(csidData),
  };
};

export default checkIfClientZatcaCertified;
