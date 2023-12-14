/*
 *
 * Helper: `reportInvoice`.
 *
 */
import { encodeStringToBase64, readJsonFile } from "@zatca-server/helpers";
import createZatcaRequest from "./createZatcaRequest.mjs";
import createZatcaAuthHeaders from "./createZatcaAuthHeaders.mjs";
import {
  BASE_API_HEADERS,
  API_IDS_NAMES,
  CSID_FILE_PATH,
} from "../constants.mjs";

const { REPORT_SIMPLIFIED_INVOICE, REPORT_STANDARD_INVOICE } = API_IDS_NAMES;

const reportInvoice = async ({ invoiceHash, uuid, invoice }) => {
  const encodedInvoice = encodeStringToBase64(invoice);

  const bodyData = {
    invoiceHash,
    uuid,
    invoice: encodedInvoice,
  };

  const {
    productionCsidData: { binarySecurityToken, secret },
  } = await readJsonFile(CSID_FILE_PATH, true);

  const authHeaders = createZatcaAuthHeaders(binarySecurityToken, secret);

  const requestHeaders = {
    ...BASE_API_HEADERS,
    "Accept-Version": "V2",
    "Accept-Language": "en",
    "Clearance-Status": "0",
    ...authHeaders,
  };

  const response = await createZatcaRequest({
    resourceName: POST_ZATCA_COMPLIANCE_INVOICES,
    bodyData,
    requestHeaders,
  });

  return {
    requestHeaders,
    bodyData,
    response,
  };
};

export default reportInvoice;
