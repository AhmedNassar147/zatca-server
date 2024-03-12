/*
 *
 * Helper: `sendZatcaInitialInvoices`.
 *
 */
import { writeFile } from "fs/promises";
import { createRootFolder } from "@zatca-server/helpers";
import issueCertificate from "./issueCertificate.mjs";
import createInitialComplianceInvoicesData from "./createInitialComplianceInvoicesData.mjs";
import readClientsConfigData from "../../helpers/readClientsConfigData.mjs";
import sendZatcaInvoice from "./sendZatcaInvoice.mjs";
import { API_VALUES } from "../../constants.mjs";

const { POST_ZATCA_INITIAL_INVOICES } = API_VALUES;

const printResultData = async (results, client) => {
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

  const basePath = await createRootFolder(`results/${client}/initial-invoices`);

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
  issueProductionCsid,
}) => {
  const { errors } = await issueCertificate({
    baseAPiUrl,
    client,
    sandbox,
    isProductionCsid: false,
  });

  if (errors) {
    return Promise.resolve(errors);
  }

  const {
    sharedInvoiceData,
    [client]: { invoiceKind, supplier },
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

  await printResultData(results, client);

  if (issueProductionCsid) {
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
