/*
 *
 * Helper: `reportInvoice`.
 *
 */
import sendZatcaInvoice from "./sendZatcaInvoice.mjs";
import { API_VALUES, ZATCA_INVOICE_TYPE_CODE } from "../../constants.mjs";

const { REPORT_ACTUAL_SIMPLIFIED_INVOICE, REPORT_ACTUAL_STANDARD_INVOICE } =
  API_VALUES;

const { SIMPLIFIED } = ZATCA_INVOICE_TYPE_CODE;

const reportInvoice = async (sandbox, invoiceData) => {
  const { transactionTypeCode } = invoiceData;
  const isSimplified = transactionTypeCode === SIMPLIFIED;

  const resourceNameUrl = isSimplified
    ? REPORT_ACTUAL_SIMPLIFIED_INVOICE
    : REPORT_ACTUAL_STANDARD_INVOICE;

  const response = await sendZatcaInvoice({
    resourceNameUrl,
    sandbox,
    invoiceData,
    useProductionCsid: true,
  });

  return response;
};

export default reportInvoice;
