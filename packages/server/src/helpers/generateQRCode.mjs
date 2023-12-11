/*
 *
 * Helper: `generateQRCode`.
 *
 */
import { covertDateToStandardDate } from "@zatca-server/helpers";

const TLV = (tags) => {
  const tlvTags = [];
  tags.forEach((tag, i) => {
    const tagValueBuffer = Buffer.from(tag);
    const tlvValue = Buffer.from([
      i + 1,
      tagValueBuffer.byteLength,
      ...tagValueBuffer,
    ]);
    tlvTags.push(tlvValue);
  });
  return Buffer.concat(tlvTags);
};

const generateQRCode = ({
  invoiceXml,
  digitalSignature,
  certificatePublicKeyBuffer,
  certificateSignature,
  invoiceHash,
}) => {
  let sellerName = invoiceXml.get(
    "Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName"
  );

  if (sellerName) {
    sellerName = sellerName[0];
  }

  let vatNumber = invoiceXml.get(
    "Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"
  );

  if (vatNumber) {
    vatNumber = (vatNumber[0] || "").toString();
  }

  let invoiceTotal = invoiceXml.get(
    "Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount"
  );

  if (invoiceTotal) {
    const [{ "#text": value }] = invoiceTotal;
    invoiceTotal = (value || "").toString();
  }

  let vatTotal = invoiceXml.get("Invoice/cac:TaxTotal");

  if (vatTotal) {
    const [
      {
        "cbc:TaxAmount": { "#text": value },
      },
    ] = vatTotal;
    vatTotal = (value || "").toString();
  }

  const [issueDate] = invoiceXml.get("Invoice/cbc:IssueDate") || [];
  const [issueTime] = invoiceXml.get("Invoice/cbc:IssueTime") || [];

  // Detect if simplified invoice or not (not used currently assuming all simplified tax invoice)
  // const invoice_type = invoiceXml
  //   .get("Invoice/cbc:InvoiceTypeCode")?.[0]
  //   ["@_name"].toString();

  const datetime = `${issueDate} ${issueTime}`;
  const formattedDatetime = covertDateToStandardDate(datetime);

  const qr_tlv = TLV([
    sellerName,
    vatNumber,
    formattedDatetime,
    invoiceTotal,
    vatTotal,
    invoiceHash,
    Buffer.from(digitalSignature),
    certificatePublicKeyBuffer,
    certificateSignature,
  ]);

  return qr_tlv.toString("base64");
};

export default generateQRCode;
