/*
 *
 * Helper: `createZatcaComplianceInvoicesRequest`.
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

const { POST_ZATCA_COMPLIANCE_INVOICES } = API_IDS_NAMES;

const createZatcaComplianceInvoicesRequest = async ({
  invoiceHash,
  uuid,
  invoice,
}) => {
  const encodedInvoice = encodeStringToBase64(invoice);

  const bodyData = {
    invoiceHash, // <ds:DigestValue>
    uuid, // <cbc-UUID>
    invoice: encodedInvoice,
  };

  const { decodedToken, secret } = await readJsonFile(CSID_FILE_PATH, true);

  const authHeaders = createZatcaAuthHeaders(decodedToken, secret);

  const requestHeaders = {
    ...BASE_API_HEADERS,
    "Accept-Version": "V2",
    "Accept-Language": "en",
    ...authHeaders,
  };

  return {
    bodyData,
    requestHeaders,
  };

  const response = await createZatcaRequest({
    resourceName: POST_ZATCA_COMPLIANCE_INVOICES,
    bodyData,
    requestHeaders,
  });

  return response;
};

export default createZatcaComplianceInvoicesRequest;
