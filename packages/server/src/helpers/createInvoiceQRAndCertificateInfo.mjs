/*
 *
 * Helper: `createInvoiceQRAndCertificateInfo`.
 *
 */

import { covertDateToStandardDate } from "@zatca-server/helpers";
import createInvoiceXml from "./createInvoiceXml.mjs";
import XMLDocument from "./xmlParser.mjs";
import createInvoiceHash from "./createInvoiceHash.mjs";
import getCertificateInfo from "./getCertificateInfo.mjs";
import createInvoiceDigitalSignature from "./createInvoiceDigitalSignature.mjs";
import generateQRCode from "./generateQRCode.mjs";

const createInvoiceQRAndCertificateInfo = async ({
  invoiceData,
  eInvoiceCertificate,
  privateCertPath,
}) => {
  const {
    issueDate,
    issueTime,
    supplier,
    totalVatAmount,
    totalTaxInclusiveAmount,
  } = invoiceData;

  const { vatName, vatNumber } = supplier || {};
  const datetime = `${issueDate} ${issueTime}`;
  const signTimestamp = covertDateToStandardDate(datetime);

  const [, fixedIssueTime] = signTimestamp.split("T");

  const invoiceXml = createInvoiceXml({
    ...invoiceData,
    issueTime: fixedIssueTime,
  });
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

  const digitalSignature = await createInvoiceDigitalSignature(
    invoiceHash,
    privateCertPath
  );

  const qrBase64 = generateQRCode({
    digitalSignature,
    certificatePublicKeyBuffer,
    certificateSignature,
    invoiceHash,
    supplierVatName: vatName,
    supplierVatNumber: vatNumber,
    totalVatAmount,
    totalTaxInclusiveAmount,
    formattedDatetime: signTimestamp,
  });

  return {
    invoiceCopy,
    invoiceXml,
    invoiceHash,
    qrBase64,
    digitalSignature,
    certificateHash,
    certificateIssuer,
    certificateSerialNumber,
    cleanedCertificate,
    signTimestamp,
  };
};

export default createInvoiceQRAndCertificateInfo;
