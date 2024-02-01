/*
 *
 * Helper: `sendZatcaInitialInvoices`.
 *
 */
import { writeFile } from "fs/promises";
import {
  isObjectHasData,
  createCmdMessage,
  createRootFolder,
} from "@zatca-server/helpers";
import createInitialComplianceInvoicesData from "./createInitialComplianceInvoicesData.mjs";
import readCertsOrganizationsData from "../../helpers/readCertsOrganizationsData.mjs";
import createFetchRequest from "../createFetchRequest.mjs";
import sendZatcaInvoice from "./sendZatcaInvoice.mjs";
import { API_VALUES } from "../../constants.mjs";

const { POST_INITIAL_INVOICES, FETCH_INVOICE_DATA_FOR_INITIAL_COMPLIANCE } =
  API_VALUES;

const printResultData = async (organizationNo, results) => {
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

  const basePaths = await createRootFolder(`results/${organizationNo}`);

  await writeFile(`${basePaths}/result.json`, JSON.stringify(data, null, 2));

  for (let index = 0; index < xmlFiles.length; index++) {
    const fileData = xmlFiles[index];
    await writeFile(`${basePaths}/invoice_${index + 1}.xml`, fileData);
  }
};

const sendZatcaInitialInvoices = async (
  organizationNo,
  sandbox,
  logResults
) => {
  const { result: initialInvoice, error } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: FETCH_INVOICE_DATA_FOR_INITIAL_COMPLIANCE,
    requestMethod: "GET",
  });

  const hasError = !isObjectHasData(initialInvoice) || !!error;

  if (hasError) {
    createCmdMessage({
      type: "error",
      message: error || "initial invoice for compliance not found",
    });
    process.exit(process.exitCode);
  }

  const { invoiceKind } = await readCertsOrganizationsData(organizationNo);

  const invoicesData = createInitialComplianceInvoicesData(
    invoiceKind,
    initialInvoice
  );

  const resourceNameUrl = POST_INITIAL_INVOICES[sandbox];
  let results = [];

  while (invoicesData.length) {
    const [invoiceData] = invoicesData.splice(0, 1);
    const result = await sendZatcaInvoice({
      sandbox,
      resourceNameUrl,
      useProductionCsid: false,
      invoiceData,
      organizationNo,
    });

    results.push(result);
  }

  if (logResults) {
    await printResultData(organizationNo, results);
  }

  return results;
};

export default sendZatcaInitialInvoices;
