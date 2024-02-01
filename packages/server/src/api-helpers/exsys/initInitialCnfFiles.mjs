/*
 *
 * Helper: `initInitialCnfFiles`.
 *
 */
import { createCmdMessage, isObjectHasData } from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import createOrganizationConfigFile from "./createOrganizationConfigFile.mjs";
import writeCertsOrganizationData from "../../helpers/writeCertsOrganizationData.mjs";
import { API_VALUES } from "../../constants.mjs";

const { FETCH_INITIAL_CONFIG_SUPPLIERS } = API_VALUES;

const initInitialCnfFiles = async (baseAPiUrl) => {
  createCmdMessage({
    type: "info",
    message: `fetch organization and creating the certificates...`,
  });

  const { result } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: FETCH_INITIAL_CONFIG_SUPPLIERS,
    requestMethod: "GET",
  });

  const { invoiceKind, vatName, vatNumber } = result || {};

  if (!isObjectHasData(result)) {
    createCmdMessage({
      type: "error",
      message: "the initial supplier wasn't found",
    });

    process.kill(process.pid);
    process.exit(process.exitCode);
  }

  await createOrganizationConfigFile(result);

  await writeCertsOrganizationData({
    invoiceKind,
    vatName,
    vatNumber,
    privateCertPath: "certs/privateKey.pem",
    publicCertPath: "certs/publicKey.pem",
    taxPayerPath: "certs/taxpayer.csr",
    csidData: {},
    productionCsidData: {},
  });
};

export default initInitialCnfFiles;
