/*
 *
 * Helper: `initInitialCnfFiles`.
 *
 */
import { createCmdMessage, isObjectHasData } from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import createClientConfigFile from "./createClientConfigFile.mjs";
import getCertsFolderPath from "../../helpers/getCertsFolderPath.mjs";
import writeClientsConfigData from "../../helpers/writeClientsConfigData.mjs";
import stopTheProcessIfCertificateNotFound from "../../helpers/stopTheProcessIfCertificateNotFound.mjs";
import sendZatcaInitialInvoices from "../zatca/sendZatcaInitialInvoices.mjs";
import { API_VALUES } from "../../constants.mjs";

const { FETCH_INITIAL_CONFIG_SUPPLIERS } = API_VALUES;

const initInitialCnfFiles = async (baseAPiUrl, sandbox) => {
  createCmdMessage({
    type: "info",
    message: `Fetching clients initial data...`,
  });

  const { result } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: FETCH_INITIAL_CONFIG_SUPPLIERS,
    requestMethod: "GET",
    requestParams: {
      sandbox,
    },
  });

  const { sharedInvoiceData, clients } = result || {};
  const hasNoSharedData = !isObjectHasData(sharedInvoiceData);
  const hasNoClients = !isObjectHasData(clients);

  if (hasNoSharedData) {
    createCmdMessage({
      type: "error",
      message: "sharedInvoiceData is empty",
    });
  }

  if (hasNoClients) {
    createCmdMessage({
      type: "error",
      message: "there is no client provided",
    });
  }

  if (hasNoSharedData || hasNoClients) {
    process.kill(process.pid);
    process.exit(process.exitCode);
  }

  const certsFolderPath = await getCertsFolderPath();

  const keys = Object.keys(clients);

  const getClientConfigData = (
    clientName,
    parentName,
    childNames,
    currentConfig
  ) => {
    // you will only find `parentName` when current client certs based on parent
    const curredClient = parentName || clientName;

    const clientConfig = clients[curredClient];

    const {
      organizationNo,
      useThisOrganizationForZatcaCertification,
      vatName,
      vatNumber,
      streetName,
      additionalStreetName,
      buildingNumber,
      plotIdentification,
      citySubdivisionName,
      cityName,
      postalZone,
      countrySubentity,
      countryIdCode,
      crnNo,
      email,
      genralOrganizationName,
      organizationUnitName,
      registeredAddress,
      businessCategory,
      invoiceKind,
      serialNumber,
      zatcaData,
    } = {
      ...clientConfig,
      ...currentConfig,
    };

    const {
      certified: _certified,
      csidData,
      productionCsidData,
    } = zatcaData || {};

    const certified = _certified === "Y";
    const _csidData = csidData || {};
    const shouldIssueInitialCsid = !isObjectHasData(csidData);

    return {
      invoiceKind,
      vatName,
      vatNumber,
      organizationNo,
      useThisOrganizationForZatcaCertification,
      parentName,
      // you will find `childNames` when it's parent and useThisOrganizationForZatcaCertification === "Y" && has child related to it
      childNames,
      curredClient,
      privateCertPath: `certs/${curredClient}/privateKey.pem`,
      publicCertPath: `certs/${curredClient}/publicKey.pem`,
      taxPayerPath: `certs/${curredClient}/taxpayer.csr`,
      cnfFilePath: `certs/${curredClient}/config.cnf`,
      shouldIssueInitialCsid: shouldIssueInitialCsid || !certified,
      clientsConfigsFileOptions: {
        email,
        countryIdCode,
        vatName,
        vatNumber,
        genralOrganizationName,
        organizationUnitName,
        registeredAddress,
        businessCategory,
        invoiceKind,
        serialNumber,
      },
      supplier: {
        streetName,
        additionalStreetName,
        buildingNumber,
        plotIdentification,
        citySubdivisionName,
        cityName,
        postalZone,
        countrySubentity,
        countryIdCode,
        vatName,
        vatNumber,
        crnNo,
      },
      certified,
      csidData: _csidData,
      productionCsidData: productionCsidData || {},
    };
  };

  const {
    clientsConfigsFilesPromises,
    clientsConfig,
    clientsThatShouldSendInitialInvoices,
  } = keys.reduce(
    (acc, clientName) => {
      const clientConfig = clients[clientName];
      const { parentName, childNames } = clientConfig;

      const {
        shouldIssueInitialCsid,
        certified,
        clientsConfigsFileOptions,
        useThisOrganizationForZatcaCertification,
        curredClient,
        ...extraClientConfig
      } = getClientConfigData(clientName, parentName, childNames, clientConfig);

      const shouldCreateCertificatesForCurrentBranch =
        useThisOrganizationForZatcaCertification === "Y";

      if (shouldCreateCertificatesForCurrentBranch) {
        const mainCertsFolderPath = `${certsFolderPath}/${clientName}`;
        acc.clientsConfigsFilesPromises.push([
          mainCertsFolderPath,
          clientsConfigsFileOptions,
        ]);
      }

      if (shouldCreateCertificatesForCurrentBranch && shouldIssueInitialCsid) {
        acc.clientsThatShouldSendInitialInvoices.push({
          client: curredClient,
          issueProductionCsid: shouldIssueInitialCsid || !certified,
        });
      }

      acc.clientsConfig = {
        ...acc.clientsConfig,
        [clientName]: {
          shouldCreateCertificatesForCurrentBranch,
          certified,
          ...extraClientConfig,
        },
      };

      return acc;
    },
    {
      clientsConfigsFilesPromises: [],
      clientsConfig: {},
      clientsThatShouldSendInitialInvoices: [],
    }
  );

  await Promise.all([
    ...clientsConfigsFilesPromises.map(
      async (options) => await createClientConfigFile(...options)
    ),
    await writeClientsConfigData({ clients: clientsConfig, sharedInvoiceData }),
  ]);

  await stopTheProcessIfCertificateNotFound();

  if (clientsThatShouldSendInitialInvoices.length) {
    await Promise.all(
      clientsThatShouldSendInitialInvoices.map(
        async ({ client, issueProductionCsid }) =>
          await sendZatcaInitialInvoices({
            baseAPiUrl,
            client,
            sandbox,
            issueProductionCsid,
          })
      )
    );
  }
};

export default initInitialCnfFiles;
