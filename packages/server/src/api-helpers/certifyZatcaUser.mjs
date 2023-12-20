/*
 *
 * Helper: `certifyZatcaUser`.
 *
 */
import { API_VALUES } from "../constants.mjs";
import createInitialComplianceInvoicesData from "../helpers/createInitialComplianceInvoicesData.mjs";
import sendZatcaInvoice from "./sendZatcaInvoice.mjs";

const { POST_INITIAL_INVOICES } = API_VALUES;

const certifyZatcaUser = async (sandbox) => {
  const invoicesData = createInitialComplianceInvoicesData("1100");

  const resourceNameUrl = POST_INITIAL_INVOICES[sandbox];
  let results = [];

  while (invoicesData.length) {
    const [invoiceData] = invoicesData.splice(0, 1);
    const result = await sendZatcaInvoice({
      sandbox,
      resourceNameUrl,
      useProductionCsid: false,
      invoiceData,
    });

    results = results.concat(result);

    const {
      response: { status },
    } = result;

    if (status !== 200) {
      break;
    }
  }

  return certifyZatcaUser;
};
