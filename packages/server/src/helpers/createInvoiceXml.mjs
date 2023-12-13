/*
 *
 * Helper: `createInvoiceXml`.
 *
 */
const createAccountingSupplierOrCustomerXml = (
  type,
  {
    streetName,
    additionalStreetName,
    buildingNumber,
    plotIdentification,
    citySubdivisionName,
    cityName,
    postalZone,
    countrySubentity,
    countryIdCode,
    vatName,
    vatNumber,
    crnNo,
  }
) => {
  const isSupplier = type === "supplier";
  const mainTagName = isSupplier
    ? "AccountingSupplierParty"
    : "AccountingCustomerParty";

  const companyIdXml = !!vatNumber
    ? `<cbc:CompanyID>${vatNumber}</cbc:CompanyID>`
    : "";

  const restValue = !crnNo
    ? ""
    : `\n<cac:PartyIdentification>
    <cbc:ID schemeID="CRN">${crnNo}</cbc:ID>
  </cac:PartyIdentification>
  <cac:PostalAddress>
    <cbc:StreetName>${streetName}</cbc:StreetName>
    <cbc:AdditionalStreetName>${additionalStreetName}</cbc:AdditionalStreetName>
    <cbc:BuildingNumber>${buildingNumber}</cbc:BuildingNumber>
    <cbc:PlotIdentification>${plotIdentification}</cbc:PlotIdentification>
    <cbc:CitySubdivisionName>${citySubdivisionName}</cbc:CitySubdivisionName>
    <cbc:CityName>${cityName}</cbc:CityName>
    <cbc:PostalZone>${postalZone}</cbc:PostalZone>
    <cbc:CountrySubentity>${countrySubentity}</cbc:CountrySubentity>
    <cac:Country>
      <cbc:IdentificationCode>${countryIdCode}</cbc:IdentificationCode>
    </cac:Country>
  </cac:PostalAddress>
  <cac:PartyTaxScheme>
    ${companyIdXml}
    <cac:TaxScheme>
      <cbc:ID>VAT</cbc:ID>
    </cac:TaxScheme>
  </cac:PartyTaxScheme>
  <cac:PartyLegalEntity>
    <cbc:RegistrationName>${vatName}</cbc:RegistrationName>
  </cac:PartyLegalEntity>\n`;

  return `<cac:${mainTagName}>
      <cac:Party>${restValue}</cac:Party>
    </cac:${mainTagName}>`;
};

const hasNoNumberValue = (value) => !value || ["0.00", "0.0"].includes(value);

const createAllowanceChargeXml = ({
  totalDiscountAmount,
  totalTaxPercent,
  discountReasonCode = "95",
  discountReason = "Discount",
}) => {
  const taxSection = !hasNoNumberValue(totalTaxPercent)
    ? `<cac:TaxCategory>
        <cbc:ID schemeID="UN/ECE 5305" schemeAgencyID="6">S</cbc:ID>
        <cbc:Percent>${totalTaxPercent}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID schemeID="UN/ECE 5153" schemeAgencyID="6">VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>`
    : "";

  return `<cac:AllowanceCharge>
    <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
    <cbc:AllowanceChargeReasonCode>${discountReasonCode}</cbc:AllowanceChargeReasonCode>
    <cbc:AllowanceChargeReason>${discountReason}</cbc:AllowanceChargeReason>
    <cbc:Amount currencyID="SAR">${totalDiscountAmount || "0.0"}</cbc:Amount>
    ${taxSection}
    </cac:AllowanceCharge>`;
};

const createTaxTotalXml = (totalTaxAmount, products) => {
  const subtotalsXml = products
    .map(
      ({
        totalWithoutTax,
        taxAmount,
        taxCategory,
        taxPercent,
      }) => `<cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID="SAR">${totalWithoutTax}</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID="SAR">${taxAmount}</cbc:TaxAmount>
          <cac:TaxCategory>
            <cbc:ID>${taxCategory}</cbc:ID>
            <cbc:Percent>${taxPercent}</cbc:Percent>
            <cac:TaxScheme>
              <cbc:ID>VAT</cbc:ID>
            </cac:TaxScheme>
          </cac:TaxCategory>
        </cac:TaxSubtotal>`
    )
    .join("\n");

  return `<cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${totalTaxAmount}</cbc:TaxAmount>
    ${subtotalsXml}
  </cac:TaxTotal>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${totalTaxAmount}</cbc:TaxAmount>
  </cac:TaxTotal>
  `;
};

const createProductLineXml = ({
  id,
  unitCode,
  quantity,
  totalWithoutTax,
  taxAmount,
  totalWithTax,
  productName,
  taxCategory,
  taxPercent,
  price,
  discount,
  discountReasonCode,
  discountReason,
}) => {
  const allowanceChargeXml = createAllowanceChargeXml({
    totalDiscountAmount: discount,
    discountReasonCode,
    discountReason,
  });

  return `<cac:InvoiceLine>
  <cbc:ID>${id}</cbc:ID>
  <cbc:InvoicedQuantity unitCode="${unitCode}">${quantity}</cbc:InvoicedQuantity>
  <cbc:LineExtensionAmount currencyID="SAR">${totalWithoutTax}</cbc:LineExtensionAmount>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${taxAmount}</cbc:TaxAmount>
    <cbc:RoundingAmount currencyID="SAR">${totalWithTax}</cbc:RoundingAmount>
  </cac:TaxTotal>
  <cac:Item>
    <cbc:Name>${productName}</cbc:Name>
    <cac:ClassifiedTaxCategory>
      <cbc:ID>${taxCategory}</cbc:ID>
      <cbc:Percent>${taxPercent}</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID>VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:ClassifiedTaxCategory>
  </cac:Item>
  <cac:Price>
    <cbc:PriceAmount currencyID="SAR">${price}</cbc:PriceAmount>
    ${allowanceChargeXml}
  </cac:Price>
</cac:InvoiceLine>`;
};

const createInvoiceXml = ({
  invoiceSerialNo,
  uuid,
  issueDate,
  issueTime,
  transactionTypeCode,
  invoiceTypeCode,
  invoiceNote,
  invoiceNoteLang = "ar",
  cancelledInvoiceNo,
  paymentMeansCode,
  paymentInstructionNote,
  invoiceCounterNo,
  previousInvoiceHash,
  products,
  totalDiscountAmount,
  discountReasonCode,
  discountReason,
  totalTaxPercent,
  totalTaxAmount,
  totalWithoutTax,
  totalWithTax,
  supplier,
  customer,
}) => {
  const accountingSupplierXml = createAccountingSupplierOrCustomerXml(
    "supplier",
    supplier
  );

  const accountingCustomerXml = createAccountingSupplierOrCustomerXml(
    "customer",
    customer
  );

  const totalTaxXml = createTaxTotalXml(totalTaxAmount, products);

  const invoiceLinesXml = products.map(createProductLineXml).join("\n");

  const paymentInstructionXml = paymentInstructionNote
    ? `<cbc:InstructionNote>${paymentInstructionNote}</cbc:InstructionNote>`
    : "";

  const paymentMeansSection = !!paymentMeansCode
    ? `<cac:PaymentMeans>
        <cbc:PaymentMeansCode>${paymentMeansCode}</cbc:PaymentMeansCode>
        ${paymentInstructionXml}
      </cac:PaymentMeans>`
    : "";

  const billingReferenceXml = !!cancelledInvoiceNo
    ? `<cac:BillingReference>
        <cac:InvoiceDocumentReference>
          <cbc:ID>Invoice Number: ${cancelledInvoiceNo}</cbc:ID>
        </cac:InvoiceDocumentReference>
      </cac:BillingReference>`
    : "";

  const allowanceChargeXml = createAllowanceChargeXml({
    totalDiscountAmount,
    totalTaxPercent,
    discountReasonCode,
    discountReason,
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ccts="urn:un:unece:uncefact:documentation:2" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2" xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2" xmlns:udt="urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2" xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:sac="urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2" xmlns:sbc="urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2" xmlns:sig="urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2" xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <ext:UBLExtensions>
    SET_UBL_EXTENSIONS_STRING
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${invoiceSerialNo}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}Z</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${transactionTypeCode}">${invoiceTypeCode}</cbc:InvoiceTypeCode>
  <cbc:Note languageID="${invoiceNoteLang}">${invoiceNote || ""}</cbc:Note>
  <cbc:DocumentCurrencyCode>SAR</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  ${billingReferenceXml}
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>${invoiceCounterNo}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${previousInvoiceHash}</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>QR</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">SET_QR_CODE_DATA</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  <cac:Signature>
    <cbc:ID>urn:oasis:names:specification:ubl:signature:Invoice</cbc:ID>
    <cbc:SignatureMethod>urn:oasis:names:specification:ubl:dsig:enveloped:xades</cbc:SignatureMethod>
  </cac:Signature>
  ${accountingSupplierXml}
  ${accountingCustomerXml}
  ${paymentMeansSection}
  ${allowanceChargeXml}
  ${totalTaxXml}
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${totalWithoutTax}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${totalWithoutTax}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${totalWithTax}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="SAR">${
      totalDiscountAmount || "0.00"
    }</cbc:AllowanceTotalAmount>
    <cbc:PrepaidAmount currencyID="SAR">0.00</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="SAR">${totalWithTax}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${invoiceLinesXml}
</Invoice>`;

  // return xml.replace(/\n|\s{2,}/g, "");
  return xml;
};

export default createInvoiceXml;
