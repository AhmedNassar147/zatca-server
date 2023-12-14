/*
 *
 * Helper: `sendZatcaInvoice`.
 *
 */
import { readJsonFile, createCmdMessage } from "@zatca-server/helpers";
import createZatcaRequest from "./createZatcaRequest.mjs";
import createZatcaAuthHeaders from "./createZatcaAuthHeaders.mjs";
import { BASE_API_HEADERS, CSID_FILE_PATH } from "../constants.mjs";

const sendZatcaInvoice = async ({
  resourceNameUrl,
  useProductionCsid,
  invoiceHash,
  uuid,
  invoice,
}) => {
  const bodyData = {
    invoiceHash,
    uuid,
    invoice,
  };

  const {
    binarySecurityToken,
    secret,
    productionCsidData: {
      binarySecurityToken: productionBinarySecurityToken,
      secret: productionSecret,
    },
  } = await readJsonFile(CSID_FILE_PATH, true);

  const options = useProductionCsid
    ? [productionBinarySecurityToken, productionSecret]
    : [binarySecurityToken, secret];

  if (!options.length) {
    createCmdMessage({
      type: "error",
      message: `${
        useProductionCsid ? "production " : ""
      }binarySecurityToken or secret wasn't found in ${CSID_FILE_PATH}`,
    });

    process.kill(process.pid);
  }

  const requestHeaders = {
    ...BASE_API_HEADERS,
    "Accept-Version": "V2",
    "Accept-Language": "en",
    ...(useProductionCsid ? { "Clearance-Status": "0" } : null),
    ...createZatcaAuthHeaders(...options),
  };

  const response = await createZatcaRequest({
    resourceNameUrl,
    bodyData,
    requestHeaders,
  });

  return {
    requestHeaders,
    bodyData,
    response,
  };
};

export default sendZatcaInvoice;
