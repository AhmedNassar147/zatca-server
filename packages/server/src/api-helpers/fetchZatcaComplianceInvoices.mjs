/*
 *
 * Helper: `fetchZatcaComplianceInvoices`.
 *
 */
import createZatcaRequest from "./createZatcaRequest.mjs";

const fetchZatcaComplianceInvoices = async () => {
  const bodyData = {
    invoiceHash: "PbJ99NiNVq+ZM+bi4NZveW7Q/SqV0O8t1+0BSzymqqA=",
    uuid: "8e6000cf-1a98-4174-b3e7-b5d5954bc10d",
    invoice: "",
  };

  const requestHeaders = {
    "Accept-Version": "V2",
    "Accept-Language": "en",
  };

  const response = await createZatcaRequest({
    bodyData,
    requestHeaders,
  });

  return response;
};

export default fetchZatcaComplianceInvoices;
