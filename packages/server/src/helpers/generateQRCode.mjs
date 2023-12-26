/*
 *
 * Helper: `generateQRCode`.
 *
 */
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
  digitalSignature,
  certificatePublicKeyBuffer,
  certificateSignature,
  invoiceHash,
  supplierVatName,
  supplierVatNumber,
  totalVatAmount,
  totalTaxInclusiveAmount,
  formattedDatetime,
}) => {
  // Detect if simplified invoice or not (not used currently assuming all simplified tax invoice)
  // const invoice_type = invoiceXml
  //   .get("Invoice/cbc:InvoiceTypeCode")?.[0]
  //   ["@_name"].toString();

  const qr_tlv = TLV([
    supplierVatName,
    supplierVatNumber,
    formattedDatetime,
    totalTaxInclusiveAmount,
    totalVatAmount,
    invoiceHash,
    Buffer.from(digitalSignature),
    certificatePublicKeyBuffer,
    certificateSignature,
  ]);

  return qr_tlv.toString("base64");
};

export default generateQRCode;
