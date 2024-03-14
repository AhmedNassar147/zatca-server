/*
 *
 * Helper: `sendZatcaInitialInvoices`.
 *
 */
import { writeFile } from "fs/promises";
import chalk from "chalk";
import { createCmdMessage, createRootFolder } from "@zatca-server/helpers";
import issueCertificate from "./issueCertificate.mjs";
import createInitialComplianceInvoicesData from "./createInitialComplianceInvoicesData.mjs";
import readClientsConfigData from "../../helpers/readClientsConfigData.mjs";
import sendZatcaInvoice from "./sendZatcaInvoice.mjs";
import { API_VALUES } from "../../constants.mjs";

const boldWhite = chalk.bold.white;

const { POST_ZATCA_INITIAL_INVOICES } = API_VALUES;

const printResultData = async (results, client, sandbox) => {
  const { xmlFiles, data } = results.reduce(
    (acc, { signedInvoiceString, ...other }) => {
      acc.data.push(other);
      acc.xmlFiles.push(signedInvoiceString);

      return acc;
    },
    {
      xmlFiles: [],
      data: [],
    }
  );

  const basePath = await createRootFolder(
    `results/${client}/${sandbox}/initial-invoices`
  );

  await writeFile(`${basePath}/result.json`, JSON.stringify(data, null, 2));

  for (let index = 0; index < xmlFiles.length; index++) {
    const fileData = xmlFiles[index];
    await writeFile(`${basePath}/${index + 1}.xml`, fileData);
  }
};

const sendZatcaInitialInvoices = async ({
  baseAPiUrl,
  client,
  sandbox,
  shouldIssueInitialCsid,
  shouldIssueProductionCsid,
}) => {
  let initialComplianceError;

  if (shouldIssueInitialCsid) {
    const { errors } = await issueCertificate({
      baseAPiUrl,
      client,
      sandbox,
      isProductionCsid: false,
    });

    initialComplianceError = errors;
  }

  if (initialComplianceError) {
    return Promise.resolve(initialComplianceError);
  }

  const {
    sharedInvoiceData,
    clients: {
      [client]: { invoiceKind, supplier },
    },
  } = await readClientsConfigData();

  const initialInvoice = {
    ...sharedInvoiceData,
    supplier,
  };

  const invoicesData = createInitialComplianceInvoicesData(
    invoiceKind,
    initialInvoice
  );

  const resourceNameUrl = POST_ZATCA_INITIAL_INVOICES[sandbox];
  let results = [];

  const invoicesLength = invoicesData.length;

  if (invoicesLength) {
    createCmdMessage({
      type: "info",
      message: `Sending initial invoice (${boldWhite(
        invoicesLength
      )}) for client=${boldWhite(client)} and sandbox=${boldWhite(sandbox)}`,
    });
  }

  while (invoicesData.length) {
    const [invoiceData] = invoicesData.splice(0, 1);
    const result = await sendZatcaInvoice({
      sandbox,
      resourceNameUrl,
      useProductionCsid: false,
      invoiceData,
      client,
    });

    results.push(result);
  }

  await printResultData(results, client, sandbox);

  if (shouldIssueProductionCsid) {
    const { errors } = await issueCertificate({
      baseAPiUrl,
      client,
      sandbox,
      isProductionCsid: true,
    });

    if (errors) {
      return Promise.resolve(errors);
    }
  }
};

export default sendZatcaInitialInvoices;
