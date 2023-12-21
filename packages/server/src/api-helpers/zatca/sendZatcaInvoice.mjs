/*
 *
 * Helper: `sendZatcaInvoice`.
 *
 */
import { createCmdMessage } from "@zatca-server/helpers";
import createFetchRequest from "../createFetchRequest.mjs";
import createZatcaAuthHeaders from "./createZatcaAuthHeaders.mjs";
import readCertsOrganizationsData from "../../helpers/readCertsOrganizationsData.mjs";
import generateSignedXMLString from "../../helpers/generateSignedXMLString.mjs";
import { BASE_API_HEADERS } from "../../constants.mjs";

const sendZatcaInvoice = async ({
  sandbox,
  resourceNameUrl,
  useProductionCsid,
  invoiceData,
  organizationNo,
}) => {
  const {
    privateCertPath,
    csidData: {
      binarySecurityToken,
      secret,
      decodedToken: eInvoiceCertificate,
    },
    productionCsidData,
  } = await readCertsOrganizationsData(organizationNo);

  const { invoiceHash, encodedInvoiceXml, signedInvoiceString } =
    await generateSignedXMLString({
      invoiceData,
      eInvoiceCertificate,
      privateCertPath,
    });

  const { uuid } = invoiceData;

  const bodyData = {
    invoiceHash,
    uuid,
    invoice: encodedInvoiceXml,
  };

  const {
    binarySecurityToken: productionBinarySecurityToken,
    secret: productionSecret,
  } = productionCsidData || {};

  const options = useProductionCsid
    ? [productionBinarySecurityToken, productionSecret]
    : [binarySecurityToken, secret];

  if (!options.length) {
    createCmdMessage({
      type: "error",
      message: `${
        useProductionCsid ? "production " : ""
      }binarySecurityToken or secret wasn't found`,
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

  const response = await createFetchRequest({
    resourceNameUrl,
    bodyData,
    requestHeaders,
    zatcaSandbox: sandbox,
  });

  return {
    requestHeaders,
    bodyData,
    response,
    signedInvoiceString,
  };
};

export default sendZatcaInvoice;
