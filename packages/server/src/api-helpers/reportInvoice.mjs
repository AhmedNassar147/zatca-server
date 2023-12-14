/*
 *
 * Helper: `reportInvoice`.
 *
 */
import sendZatcaInvoice from "./sendZatcaInvoice.mjs";
import { API_VALUES } from "../constants.mjs";

const { REPORT_ACTUAL_SIMPLIFIED_INVOICE, REPORT_ACTUAL_STANDARD_INVOICE } =
  API_VALUES;

const reportInvoice = async ({ invoiceHash, uuid, invoice, isSimplified }) => {
  const response = await sendZatcaInvoice({
    resourceNameUrl: isSimplified
      ? REPORT_ACTUAL_SIMPLIFIED_INVOICE
      : REPORT_ACTUAL_STANDARD_INVOICE,
    invoiceHash,
    uuid,
    invoice,
  });

  return response;
};

export default reportInvoice;
