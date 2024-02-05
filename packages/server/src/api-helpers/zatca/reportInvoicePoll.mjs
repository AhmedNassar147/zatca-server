/**
 *
 * Helper: `reportInvoicePoll`.
 *
 */
import {
  delayProcess,
  isObjectHasData,
  writeResultFile,
  createCmdMessage,
} from "@zatca-server/helpers";
import reportInvoice from "./reportInvoice.mjs";
import { API_VALUES } from "../../constants.mjs";
import createFetchRequest from "../createFetchRequest.mjs";
const { FETCH_INVOICE_DATA, POST_REPORTED_INVOICE_DATA_TO_EXSYS } = API_VALUES;

const TIMEOUT_MS = 2 * 1000;

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

  // const { trx_pk } = invoiceData;
  const reportResult = await reportInvoice(sandbox, invoiceData);

  await writeResultFile({
    folderName: "report_data",
    data: {
      exsysInvoiceData: invoiceData,
      reportResult,
      // dataSentToExsys: bodyData,
    },
  });

  // const bodyData = {
  //   trx_pk,
  //   qrBase64,
  //   invoiceHash,
  // };

  // const { result: postResult, error } = await createFetchRequest({
  //   baseAPiUrl,
  //   resourceNameUrl: POST_REPORTED_INVOICE_DATA_TO_EXSYS,
  //   bodyData,
  // });

  // const { status } = postResult || {};
  // const isPostedToExsys = status === "success";

  // await writeResultFile({
  //   folderName: "qr_data",
  //   data: {
  //     exsysInvoiceData: invoiceData,
  //     isPostedToExsys,
  //     dataSentToExsys: bodyData,
  //   },
  // });

  // if (!isPostedToExsys) {
  //   createCmdMessage({
  //     type: "error",
  //     message: "some error happened when posting QR data to exsys",
  //     data: error,
  //   });
  // }

  // await reportInvoicePoll(baseAPiUrl);
};

export default reportInvoicePoll;
