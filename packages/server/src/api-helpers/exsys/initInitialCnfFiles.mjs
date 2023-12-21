/*
 *
 * Helper: `initInitialCnfFiles`.
 *
 */
import { writeFile } from "fs/promises";
import { createCmdMessage, isArrayHasData } from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import createOrganizationConfigFile from "./createOrganizationConfigFile.mjs";
import getOrganizationsDataJsonFilePath from "../../helpers/getOrganizationsDataJsonFilePath.mjs";
import { API_VALUES } from "../../constants.mjs";

const { FETCH_INITIAL_CONFIG_SUPPLIERS } = API_VALUES;

const initInitialCnfFiles = async (baseAPiUrl) => {
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
      };

      return acc;
    },
    {}
  );

  const organizationsDataFilePath = await getOrganizationsDataJsonFilePath();

  await writeFile(
    organizationsDataFilePath,
    JSON.stringify(organizationCertsData, null, 2)
  );
};

export default initInitialCnfFiles;
