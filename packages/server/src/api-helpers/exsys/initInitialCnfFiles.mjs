/*
 *
 * Helper: `initInitialCnfFiles`.
 *
 */
import { createCmdMessage, isArrayHasData } from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import createOrganizationConfigFile from "./createOrganizationConfigFile.mjs";
import writeCertsOrganizationsData from "../../helpers/writeCertsOrganizationsData.mjs";
import { API_VALUES } from "../../constants.mjs";

const { FETCH_INITIAL_CONFIG_SUPPLIERS } = API_VALUES;

const initInitialCnfFiles = async (baseAPiUrl) => {
  createCmdMessage({
    type: "info",
    message: `fetch organizations and creating it's certs...`,
  });

  const { result } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: FETCH_INITIAL_CONFIG_SUPPLIERS,
    requestMethod: "GET",
  });

  const { data } = result || {};

  if (!isArrayHasData(data)) {
    createCmdMessage({
      type: "error",
      message: "the initial suppliers wasn't found",
    });

    process.kill(process.pid);
    process.exit(process.exitCode);
  }

  const configPromises = data.map(createOrganizationConfigFile);

  await Promise.all(configPromises);

  const organizationCertsData = data.reduce(
    (acc, { organizationNo, invoiceKind, vatName, vatNumber }) => {
      acc[organizationNo] = {
        ...(acc[organizationNo] || {}),
        invoiceKind,
        vatName,
        vatNumber,
        privateCertPath: `certs/${organizationNo}/privateKey.pem`,
        publicCertPath: `certs/${organizationNo}/publicKey.pem`,
        taxPayerPath: `certs/${organizationNo}/taxpayer.csr`,
        csidData: {},
        productionCsidData: {},
      };

      return acc;
    },
    {}
  );

  await writeCertsOrganizationsData(organizationCertsData);
};

export default initInitialCnfFiles;
