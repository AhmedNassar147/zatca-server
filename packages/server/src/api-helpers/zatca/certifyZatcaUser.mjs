/*
 *
 * Helper: `certifyZatcaUser`.
 *
 */
import createInitialComplianceInvoicesData from "./createInitialComplianceInvoicesData.mjs";
import readCertsOrganizationsData from "../../helpers/readCertsOrganizationsData.mjs";
import sendZatcaInvoice from "./sendZatcaInvoice.mjs";
import { API_VALUES } from "../../constants.mjs";

const { POST_INITIAL_INVOICES } = API_VALUES;

const certifyZatcaUser = async (organizationNo, sandbox) => {
  const { invoiceKind } = await readCertsOrganizationsData(organizationNo);

  const invoicesData = createInitialComplianceInvoicesData(invoiceKind);

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

  return results;
};

export default certifyZatcaUser;
