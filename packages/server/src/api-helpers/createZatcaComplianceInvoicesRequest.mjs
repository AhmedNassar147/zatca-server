/*
 *
 * Helper: `createZatcaComplianceInvoicesRequest`.
 *
 */
import createZatcaRequest from "./createZatcaRequest.mjs";
import createZatcaAuthHeaders from "./createZatcaAuthHeaders.mjs";
import { BASE_API_HEADERS, API_IDS_NAMES } from "../constants.mjs";

const { POST_ZATCA_CHECK_COMPLIANCE_INVOICES } = API_IDS_NAMES;

const createZatcaComplianceInvoicesRequest = async () => {
  const bodyData = {
    invoiceHash: "PbJ99NiNVq+ZM+bi4NZveW7Q/SqV0O8t1+0BSzymqqA=", // <ds:DigestValue>
    uuid: "8e6000cf-1a98-4174-b3e7-b5d5954bc10d", // <cbc-UUID>
    invoice: "", // all the invoice xml encoded to base64, Buffer.from(signed_xml_string).toString("base64")
  };

  const authHeaders = createZatcaAuthHeaders();

  const requestHeaders = {
    ...BASE_API_HEADERS,
    "Accept-Version": "V2",
    "Accept-Language": "en",
    ...authHeaders,
  };

  const response = await createZatcaRequest({
    resourceName: POST_ZATCA_CHECK_COMPLIANCE_INVOICES,
    bodyData,
    requestHeaders,
  });

  return response;
};

export default createZatcaComplianceInvoicesRequest;
