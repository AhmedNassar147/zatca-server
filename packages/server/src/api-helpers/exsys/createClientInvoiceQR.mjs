/*
 *
 * Helper: `createClientInvoiceQR`.
 *
 */
import {
  delayProcess,
  isObjectHasData,
  writeResultFile,
  createCmdMessage,
} from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import readClientsConfigData from "../../helpers/readClientsConfigData.mjs";
import createInvoiceQRAndCertificateInfo from "../../helpers/createInvoiceQRAndCertificateInfo.mjs";
import { API_VALUES } from "../../constants.mjs";

const { FETCH_EXSYS_QR_INVOICE_DATA, POST_INVOICE_DATA_QR_RESULT_TO_EXSYS } =
  API_VALUES;

const TIMEOUT_MS = 2 * 1000;

const createClientInvoiceQR = async (baseAPiUrl) => {
  const { result } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: FETCH_EXSYS_QR_INVOICE_DATA,
    requestMethod: "GET",
  });

  const { data: invoiceData } = result || {};

  if (!isObjectHasData(invoiceData)) {
    createCmdMessage({
      type: "info",
      message: "skipping generating invoice QR because of empty invoice",
      data: invoiceData,
    });
    await delayProcess(TIMEOUT_MS);
    await createClientInvoiceQR(baseAPiUrl);
    return;
  }

  const {
    privateCertPath,
    csidData: { decodedToken: eInvoiceCertificate },
  } = await readClientsConfigData();

  const { invoiceHash, qrBase64 } = await createInvoiceQRAndCertificateInfo({
    invoiceData,
    eInvoiceCertificate,
    privateCertPath,
  });

  const { trx_pk } = invoiceData;

  const bodyData = {
    trx_pk,
    qrBase64,
    invoiceHash,
  };

  const { result: postResult, error } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: POST_INVOICE_DATA_QR_RESULT_TO_EXSYS,
    bodyData,
  });

  const { status } = postResult || {};
  const isPostedToExsys = status === "success";

  await writeResultFile({
    folderName: "qr_data",
    data: {
      exsysInvoiceData: invoiceData,
      isPostedToExsys,
      dataSentToExsys: bodyData,
    },
  });

  if (!isPostedToExsys) {
    createCmdMessage({
      type: "error",
      message: "some error happened when posting QR data to exsys",
      data: error,
    });
  }

  await createClientInvoiceQR(baseAPiUrl);
};

export default createClientInvoiceQR;
