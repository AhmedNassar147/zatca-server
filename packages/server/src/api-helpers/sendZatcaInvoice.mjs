/*
 *
 * Helper: `sendZatcaInvoice`.
 *
 */
import { readJsonFile, createCmdMessage } from "@zatca-server/helpers";
import createZatcaRequest from "./createZatcaRequest.mjs";
import createZatcaAuthHeaders from "./createZatcaAuthHeaders.mjs";
import getCsidJsonFilePath from "../helpers/getCsidJsonFilePath.mjs";
import { BASE_API_HEADERS } from "../constants.mjs";
import generateSignedXMLString from "../helpers/generateSignedXMLString.mjs";

const sendZatcaInvoice = async ({
  sandbox,
  resourceNameUrl,
  useProductionCsid,
  invoiceData,
}) => {
  const { invoiceHash, encodedInvoiceXml, signedInvoiceString } =
    await generateSignedXMLString(invoiceData);

  const { uuid } = invoiceData;

  const bodyData = {
    invoiceHash,
    uuid,
    invoice: encodedInvoiceXml,
  };

  const csidFilePath = await getCsidJsonFilePath();

  const {
    binarySecurityToken,
    secret,
    productionCsidData: {
      binarySecurityToken: productionBinarySecurityToken,
      secret: productionSecret,
    },
  } = await readJsonFile(csidFilePath, true);

  const options = useProductionCsid
    ? [productionBinarySecurityToken, productionSecret]
    : [binarySecurityToken, secret];

  if (!options.length) {
    createCmdMessage({
      type: "error",
      message: `${
        useProductionCsid ? "production " : ""
      }binarySecurityToken or secret wasn't found in ${csidFilePath}`,
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
    sandbox,
  });

  return {
    requestHeaders,
    bodyData,
    response,
    signedInvoiceString,
  };
};

export default sendZatcaInvoice;
