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
}) =>
  TLV([
    supplierVatName,
    supplierVatNumber,
    formattedDatetime,
    totalTaxInclusiveAmount,
    totalVatAmount,
    invoiceHash,
    Buffer.from(digitalSignature),
    certificatePublicKeyBuffer,
    certificateSignature,
  ]).toString("base64");

export default generateQRCode;
