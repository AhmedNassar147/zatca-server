/*
 *
 * Helper: `certifyZatcaUser`.
 *
 */
import createInitialComplianceInvoicesData from "./createInitialComplianceInvoicesData.mjs";
import sendZatcaInvoice from "./sendZatcaInvoice.mjs";
import { API_VALUES } from "../../constants.mjs";

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

    results.push(result);
  }

  return results;
};

export default certifyZatcaUser;
