/*
 *
 * Helper: `reportInvoice`.
 *
 */
import { isArrayHasData, writeResultFile } from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import sendZatcaInvoice from "./sendZatcaInvoice.mjs";
import { API_VALUES, ZATCA_INVOICE_TYPE_CODE } from "../../constants.mjs";

const { POST_ZATCA_FINIAL_INVOICES, POST_REPORTED_INVOICE_DATA_TO_EXSYS } =
  API_VALUES;

const { SIMPLIFIED } = ZATCA_INVOICE_TYPE_CODE;

const createWarningOrErrorMessages = (values, initial) => {
  let message;

  if (isArrayHasData(values)) {
    message = values.reduce((acc, { message }) => {
      acc += ` --- ${message}`;

      return acc;
    }, initial || "");
  }

  return message;
};

const reportInvoice = async (baseAPiUrl, sandbox, invoiceData) => {
  const { transactionTypeCode, trx_pk, uuid } = invoiceData;

  const resourceNameUrl =
    POST_ZATCA_FINIAL_INVOICES[sandbox][transactionTypeCode];

  const {
    qrBase64,
    signedInvoiceString,
    bodyData: { invoiceHash },
    response,
  } = await sendZatcaInvoice({
    resourceNameUrl,
    sandbox,
    invoiceData,
    useProductionCsid: true,
  });

  const { error, result, validationResults } = response || {};
  const { reportingStatus, clearanceStatus } = result || {};
  const { status, warningMessages, errorMessages } = validationResults || {};

  const _errorMessages = createWarningOrErrorMessages(errorMessages, error);
  const _warningMessages = createWarningOrErrorMessages(warningMessages);

  const requestParams = {
    trx_pk,
    invoiceHash,
    qrBase64,
    status,
    errorMessages: _errorMessages,
    warningMessages: _warningMessages,
    reportingORclearanceStatus: reportingStatus || clearanceStatus,
  };

  const bodyData = {
    ...requestParams,
    uuid,
    isSimplified: transactionTypeCode === SIMPLIFIED,
    invoiceData,
    zatcaResults: result,
    signedInvoiceString,
  };

  const exsysUpdateResponse = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: POST_REPORTED_INVOICE_DATA_TO_EXSYS,
    requestParams,
    bodyData,
  });

  await writeResultFile({
    folderName: "reportInvoice-TEST",
    data: {
      exsysUpdateResponse,
      paramsSentToPostExsys: requestParams,
      bodyDataSentToPostExsys: bodyData,
    },
  });
};

export default reportInvoice;
