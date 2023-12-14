/*
 *
 * Helper: `fetchZatcaProductionCsid`.
 *
 */
import { readJsonFile } from "@zatca-server/helpers";
import createZatcaRequest from "./createZatcaRequest.mjs";
import createZatcaAuthHeaders from "./createZatcaAuthHeaders.mjs";
import {
  BASE_API_HEADERS,
  API_IDS_NAMES,
  CSID_FILE_PATH,
} from "../constants.mjs";

const { POST_ZATCA_FINAL_CSID } = API_IDS_NAMES;

const fetchZatcaProductionCsid = async () => {
  const { binarySecurityToken, secret, requestID } = await readJsonFile(
    CSID_FILE_PATH,
    true
  );

  const authHeaders = createZatcaAuthHeaders(binarySecurityToken, secret);

  const requestHeaders = {
    ...BASE_API_HEADERS,
    "Accept-Version": "V2",
    ...authHeaders,
  };

  const bodyData = { compliance_request_id: requestID };

  const response = await createZatcaRequest({
    resourceName: POST_ZATCA_FINAL_CSID,
    bodyData,
    requestHeaders,
  });

  return {
    response,
    bodyData,
    requestHeaders,
  };
};

export default fetchZatcaProductionCsid;
