/*
 *
 * Helper: `initInitialCnfFiles`.
 *
 */
import { createCmdMessage, isObjectHasData } from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import checkIfCertificatesExists from "../../helpers/checkIfCertificatesExists.mjs";
import createOrganizationConfigFile from "./createOrganizationConfigFile.mjs";
import writeCertsOrganizationData from "../../helpers/writeCertsOrganizationData.mjs";
import { API_VALUES } from "../../constants.mjs";

const { FETCH_INITIAL_CONFIG_SUPPLIERS } = API_VALUES;

const initInitialCnfFiles = async (baseAPiUrl, forceInitiatingCnf) => {
  const errors = await checkIfCertificatesExists();

  if (!errors.length && !forceInitiatingCnf) {
    createCmdMessage({
      type: "info",
      message: `skip initiating the organization certificates...`,
    });
    return;
  }

  createCmdMessage({
    type: "info",
    message: `fetch organization and creating the certificates...`,
  });

  const { result } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: FETCH_INITIAL_CONFIG_SUPPLIERS,
    requestMethod: "GET",
  });

  //   const result = {
  //     "organizationNo": "00",
  //     "countryIdCode": "SA",
  //     "organizationUnitName": "3009510732",
  //     "vatName": "شركة مجموعة الفيحاء للخدمات الطبية",
  //     "genralOrganizationName": "شركة مجموعة الفيحاء للخدمات الطبية",
  //     "vatNumber": "300951073200003",
  //     "registeredAddress": "الرياض",
  //     "businessCategory": "Health Care",
  //     "invoiceKind": "1100",
  //     "serialNumber": "1-Device|2-234|3-fyh",
  //     "email": "HANYGAMEEL@FAIHAGROUP.COM"
  // }

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
    cnfFilePath: "certs/config.cnf",
    csidData: {},
    productionCsidData: {},
  });
};

export default initInitialCnfFiles;
