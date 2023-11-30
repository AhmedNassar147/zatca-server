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

  const { binarySecurityToken, secret } = await readJsonFile(
    CSID_FILE_PATH,
    true
  );

  const authHeaders = createZatcaAuthHeaders(binarySecurityToken, secret);

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

// VFVsSlFqUnFRME5CV1dsblFYZEpRa0ZuU1VkQldYZG5lRzByUWsxQmIwZERRM0ZIVTAwME9VSkJUVU5OUWxWNFJYcEJVa0puVGxaQ1FVMU5RMjFXU21KdVduWmhWMDV3WW0xamQwaG9ZMDVOYWsxNFRWUk5kMDFVVlhkUFJFMDFWMmhqVGsxcVozaE5WRWsxVFdwRmQwMUVRWGRYYWtKTlRWRnpkME5SV1VSV1VWRkhSWGRLVkZGVVJWUk5Ra1ZIUVRGVlJVTjNkMHROZWtGM1RVUlZNazlVWnpGTlZFVlVUVUpGUjBFeFZVVkRaM2RMVTFkT2FtTXliSGRpTTBwc1pVUkZWRTFDUlVkQk1WVkZRWGQzUzFOWFRtcGpNbXgzWWpOS2JHVkVRbGROUWtGSFFubHhSMU5OTkRsQlowVkhRbE4xUWtKQlFVdEJNRWxCUWtoeE5ITkZkRlYwYUdSa2JrZGxUVEUyZEVGNGFtbzRaVTFTT1Vzd05uQmFkV0Z4TTJwVU1GZDZVbVJLYW5ZdmNFOVZRVm81YVdaNFUwYzBNR05zVkdFd1dGb3JRamMzU0dsMmRIZEViWFZJZWxSVFRVNDJhbWRaT0hkbldYZDNSRUZaUkZaU01GUkJVVWd2UWtGSmQwRkVRamhDWjA1V1NGSkZSV1JVUW5wd1NFVjNZbnBGWjAxQ05FZEJNVlZGUWtGM1dFMVRNVlJoUjBaR1lUTjNlVXhXVG05WlZWWnlaa1JOZEZVeWFHaFNWM040U0hwQlpFSm5iMHByYVdGS2F5OUpjMXBCUlVKRVFUaDZUVVJCZDA1VVdUVlBSRlY0VFVSQmQwMUVUWGhFVkVGTVFtZE9Wa0pCZDAxQ1JFVjRUVVJCZUVONlFVcENaMDVXUWtKdlRVRnNUa0pOVVRSM1JFRlpSRlpSVVZCRVFWWlVXVmQ0YkdONlFVdENaMmR4YUd0cVQxQlJVVVJCWjA1SlFVUkNSa0ZwUVVsdFdXSXZNV2t2ZFZaQlJ6RlRjRlV6UkU1TFV6Rk9SRzVOVFhsYVdqVllhMGhCVlRSb1ZrYzBVMUZKYUVGTE5YTXpPVUZOUVZnNWJrZHFja2RqZEVSWmVuRmxWRFkyTkhwVFZVMHdTRkJOUVdkTmQwVlBSWFZ2OnZDbENhWmVHdi9BQVRBeFplajZ2K0x6VDM1dWRoZnIrYmFQOUJhWWdXN0U9
