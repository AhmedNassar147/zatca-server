/*
 *
 * Helper: `reportInvoicePoll`.
 *
 */
import {
  delayProcess,
  isObjectHasData,
  createCmdMessage,
} from "@zatca-server/helpers";
import reportInvoice from "./reportInvoice.mjs";
import { API_VALUES } from "../../constants.mjs";
import createFetchRequest from "../createFetchRequest.mjs";
const { FETCH_INVOICE_DATA } = API_VALUES;

const TIMEOUT_MS = 1 * 1000;

const reportInvoicePoll = async (baseAPiUrl, sandbox) => {
  const { result } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: FETCH_INVOICE_DATA,
    requestMethod: "GET",
  });

  const { data: invoiceData } = result || {};

  if (!isObjectHasData(invoiceData)) {
    createCmdMessage({
      type: "info",
      message: "skip sending invoice to zatca because the invoice is empty",
      data: invoiceData,
    });
    await delayProcess(TIMEOUT_MS);
    await reportInvoicePoll(baseAPiUrl, sandbox);
    return;
  }

  await reportInvoice(baseAPiUrl, sandbox, invoiceData);
  await reportInvoicePoll(baseAPiUrl, sandbox);
};

export default reportInvoicePoll;
