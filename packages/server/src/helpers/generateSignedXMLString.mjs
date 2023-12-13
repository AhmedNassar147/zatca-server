/*
 *
 * Helper: `generateSignedXMLString`.
 *
 */
import { covertDateToStandardDate, readJsonFile } from "@zatca-server/helpers";
import getCertificateInfo from "./getCertificateInfo.mjs";
import createInvoiceHash from "./createInvoiceHash.mjs";
import createInvoiceDigitalSignature from "./createInvoiceDigitalSignature.mjs";
import generateQRCode from "./generateQRCode.mjs";
import XMLDocument from "./xmlParser.mjs";
import createInvoiceXml from "./createInvoiceXml.mjs";
import createFinalUblExtensionsSectionXml from "./createFinalUblExtensionsSectionXml.mjs";
import { CSID_FILE_PATH } from "../constants.mjs";

/**
 * This hurts to do :'(. I hope that it's only temporary and ZATCA decides to just minify the XML before doing any hashing on it.
 * there is no logical reason why the validation expects an incorrectly indented XML.
 * Anyway, this is a function that fucks up the indentation in order to match validator hashing.
 */
const fixSignedPropertiesIndentation = (signedInvoiceString) => {
  let fixer = signedInvoiceString;
  let signedPropsLines = fixer
    .split("<ds:Object>")[1]
    .split("</ds:Object>")[0]
    .split("\n");
  let fixedLines = [];
  // Stripping first 4 spaces
  signedPropsLines.map((line) => fixedLines.push(line.slice(4, line.length)));
  signedPropsLines = signedPropsLines.slice(0, signedPropsLines.length - 1);
  fixedLines = fixedLines.slice(0, fixedLines.length - 1);

  fixer = fixer.replace(signedPropsLines.join("\n"), fixedLines.join("\n"));
  return fixer;
};

const generateSignedXMLString = async (invoiceData) => {
  const { decodedToken: eInvoiceCertificate } = await readJsonFile(
    CSID_FILE_PATH,
    true
  );

  const invoiceXml = createInvoiceXml(invoiceData);
  const invoiceCopy = new XMLDocument(invoiceXml);

  const invoiceHash = createInvoiceHash(invoiceCopy);

  const {
    certificateHash,
    certificateIssuer,
    certificateSerialNumber,
    certificatePublicKeyBuffer,
    certificateSignature,
    cleanedCertificate,
  } = getCertificateInfo(eInvoiceCertificate);

  const digitalSignature = await createInvoiceDigitalSignature(invoiceHash);

  const { issueDate, issueTime, totalTaxAmount, totalWithTax, supplier } =
    invoiceData;

  const { vatName, vatNumber } = supplier || {};
  const datetime = `${issueDate} ${issueTime}`;
  const signTimestamp = covertDateToStandardDate(datetime);

  const qrBase64 = generateQRCode({
    digitalSignature,
    certificatePublicKeyBuffer,
    certificateSignature,
    invoiceHash,
    supplierVatName: vatName,
    supplierVatNumber: vatNumber,
    totalWithTax,
    totalTaxAmount,
    formattedDatetime: signTimestamp,
  });

  const ublSignatureXmlString = createFinalUblExtensionsSectionXml({
    signTimestamp,
    certificateHash,
    certificateIssuer,
    certificateSerialNumber,
    invoiceHash,
    digitalSignature,
    cleanedCertificate,
  });

  // Set signing elements
  const signedInvoiceString = invoiceCopy
    .toString()
    .replace("SET_UBL_EXTENSIONS_STRING", ublSignatureXmlString)
    .replace("SET_QR_CODE_DATA", qrBase64);

  let signedInvoice = new XMLDocument(signedInvoiceString).toString();

  signedInvoice = signedInvoice.replace(
    "<cbc:ProfileID>",
    "\n    <cbc:ProfileID>"
  );
  signedInvoice = signedInvoice.replace(
    "<cac:AccountingSupplierParty>",
    "\n    \n    <cac:AccountingSupplierParty>"
  );

  const signedInvoiceIndentationFixedString =
    fixSignedPropertiesIndentation(signedInvoice);

  return {
    signedInvoiceString: signedInvoiceIndentationFixedString,
    invoiceHash,
    qrBase64,
  };
};

export default generateSignedXMLString;
