/*
 *
 * Helper: `createInvoiceXml`.
 *
 */

const hasNoNumberValue = (value) =>
  !value || ["0.00", "0.0", "00.00"].includes(value);

const createTagIfValueFound = (value, tag, condition) => {
  const valueFound = condition || !!value;
  return !!valueFound ? `<${tag}>${value}</${tag}>` : "";
};

const createAccountingSupplierOrCustomerXml = (type, data) => {
  const {
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
  } = data || {};

  const isSupplier = type === "supplier";
  const mainTagName = isSupplier
    ? "AccountingSupplierParty"
    : "AccountingCustomerParty";

  const restValue = !crnNo
    ? ""
    : `\n<cac:Party>
    <cac:PartyIdentification>
      <cbc:ID schemeID="CRN">${crnNo}</cbc:ID>
    </cac:PartyIdentification>
    <cac:PostalAddress>
      <cbc:StreetName>${streetName}</cbc:StreetName>
      ${createTagIfValueFound(additionalStreetName, "cbc:AdditionalStreetName")}
      ${createTagIfValueFound(buildingNumber, "cbc:BuildingNumber")}
      ${createTagIfValueFound(plotIdentification, "cbc:PlotIdentification")}
      ${createTagIfValueFound(citySubdivisionName, "cbc:CitySubdivisionName")}
      <cbc:CityName>${cityName}</cbc:CityName>
      ${createTagIfValueFound(postalZone, "cbc:PostalZone")}
      <cbc:CountrySubentity>${countrySubentity}</cbc:CountrySubentity>
      <cac:Country>
        <cbc:IdentificationCode>${countryIdCode}</cbc:IdentificationCode>
      </cac:Country>
    </cac:PostalAddress>
    <cac:PartyTaxScheme>
      ${createTagIfValueFound(vatNumber, "cbc:CompanyID")}
      <cac:TaxScheme>
        <cbc:ID>VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:PartyTaxScheme>
    <cac:PartyLegalEntity>
      <cbc:RegistrationName>${vatName}</cbc:RegistrationName>
    </cac:PartyLegalEntity>
    </cac:Party>\n`;

  return `<cac:${mainTagName}>${restValue}</cac:${mainTagName}>`;
};

const createTaxCategoryXml = ({
  taxCategory,
  taxPercent,
  taxExemptionReasonCode,
  taxExemptionReason,
}) => `<cac:TaxCategory>
<cbc:ID>${taxCategory}</cbc:ID>
<cbc:Percent>${taxPercent || "0.00"}</cbc:Percent>
${createTagIfValueFound(taxExemptionReasonCode, "cbc:TaxExemptionReasonCode")}
${createTagIfValueFound(taxExemptionReason, "cbc:TaxExemptionReason")}
<cac:TaxScheme>
  <cbc:ID>VAT</cbc:ID>
  <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
</cac:TaxScheme>
</cac:TaxCategory>`;

const createAllowanceChargeXml = ({
  discountAmount,
  taxPercent,
  taxCategory,
  discountReasonCode = "95",
  discountReason = "Discount",
}) => {
  const chargeIndicator = discountReasonCode === "95" ? "false" : "true";

  const taxSection = !hasNoNumberValue(taxPercent)
    ? createTaxCategoryXml({ taxCategory, taxPercent })
    : "";

  return `<cac:AllowanceCharge>
    <cbc:ChargeIndicator>${chargeIndicator}</cbc:ChargeIndicator>
    <cbc:AllowanceChargeReasonCode>${discountReasonCode}</cbc:AllowanceChargeReasonCode>
    <cbc:AllowanceChargeReason>${discountReason}</cbc:AllowanceChargeReason>
    <cbc:Amount currencyID="SAR">${discountAmount || "0.00"}</cbc:Amount>
    ${taxSection}
    </cac:AllowanceCharge>`;
};

const createTaxTotalXml = (totalVatAmount, products) => {
  const subtotalsXml = products
    // .filter(({ taxAmount }) => !hasNoNumberValue(taxAmount))
    .map(
      ({
        taxAmount,
        taxCategory,
        taxPercent,
        taxableAmount,
        taxExemptionReasonCode,
        taxExemptionReason,
      }) => `<cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="SAR">${taxableAmount}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="SAR">${taxAmount}</cbc:TaxAmount>
        ${createTaxCategoryXml({
          taxCategory,
          taxPercent,
          taxExemptionReasonCode,
          taxExemptionReason,
        })}
      </cac:TaxSubtotal>`
    )
    .join("\n");

  return `<cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${totalVatAmount}</cbc:TaxAmount>
    ${subtotalsXml}
  </cac:TaxTotal>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${totalVatAmount}</cbc:TaxAmount>
  </cac:TaxTotal>
  `;
};

const createProductLineXml = ({
  id,
  productName,
  quantity,
  unitCode,
  netPrice,
  discountAmount,
  discountReasonCode,
  discountReason,
  lineNetAmount,
  taxCategory,
  taxPercent,
  taxAmount,
  taxRoundingAmount,
}) => {
  const allowanceChargeXml = createAllowanceChargeXml({
    discountAmount,
    discountReasonCode,
    discountReason,
    taxCategory,
  });

  return `<cac:InvoiceLine>
  <cbc:ID>${id}</cbc:ID>
  <cbc:InvoicedQuantity unitCode="${unitCode}">${quantity}</cbc:InvoicedQuantity>
  <cbc:LineExtensionAmount currencyID="SAR">${lineNetAmount}</cbc:LineExtensionAmount>
  ${allowanceChargeXml}
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${taxAmount}</cbc:TaxAmount>
    <cbc:RoundingAmount currencyID="SAR">${taxRoundingAmount}</cbc:RoundingAmount>
  </cac:TaxTotal>
  <cac:Item>
    <cbc:Name>${productName}</cbc:Name>
    <cac:ClassifiedTaxCategory>
      <cbc:ID>${taxCategory}</cbc:ID>
      <cbc:Percent>${taxPercent || "0.00"}</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID>VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:ClassifiedTaxCategory>
  </cac:Item>
  <cac:Price>
    <cbc:PriceAmount currencyID="SAR">${netPrice}</cbc:PriceAmount>
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
  deliveryDate,
  previousInvoiceHash,
  products,
  supplier,
  customer,
  totalDiscountAmount,
  totalVatAmount,
  totalExtensionAmount,
  totalTaxExclusiveAmount,
  totalTaxInclusiveAmount,
  totalPrepaidAmount,
  totalPayableAmount,
}) => {
  const accountingSupplierXml = createAccountingSupplierOrCustomerXml(
    "supplier",
    supplier
  );

  const accountingCustomerXml = createAccountingSupplierOrCustomerXml(
    "customer",
    customer
  );

  const totalTaxXml = createTaxTotalXml(totalVatAmount, products);

  const invoiceLinesXml = products.map(createProductLineXml).join("\n");

  const paymentMeansSection = !!paymentMeansCode
    ? `<cac:PaymentMeans>
        <cbc:PaymentMeansCode>${paymentMeansCode}</cbc:PaymentMeansCode>
      ${createTagIfValueFound(paymentInstructionNote, "cbc:InstructionNote")}
      </cac:PaymentMeans>`
    : "";

  const billingReferenceXml = !!cancelledInvoiceNo
    ? `<cac:BillingReference>
        <cac:InvoiceDocumentReference>
          <cbc:ID>${cancelledInvoiceNo}</cbc:ID>
        </cac:InvoiceDocumentReference>
      </cac:BillingReference>`
    : "";

  const allowanceChargeXml = createAllowanceChargeXml({
    discountAmount: totalDiscountAmount,
    taxPercent: "15",
    taxCategory: "S",
  });

  const deliveryXml = !!deliveryDate
    ? `<cac:Delivery>
        <cbc:ActualDeliveryDate>${deliveryDate}</cbc:ActualDeliveryDate>
      </cac:Delivery>`
    : "";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    SET_UBL_EXTENSIONS_STRING
  </ext:UBLExtensions>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${invoiceSerialNo}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
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
  ${deliveryXml}
  ${allowanceChargeXml}
  ${paymentMeansSection}
  ${totalTaxXml}
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SAR">${totalExtensionAmount}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SAR">${totalTaxExclusiveAmount}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SAR">${totalTaxInclusiveAmount}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="SAR">${totalDiscountAmount}</cbc:AllowanceTotalAmount>
    <cbc:PrepaidAmount currencyID="SAR">${totalPrepaidAmount}</cbc:PrepaidAmount>
    <cbc:PayableAmount currencyID="SAR">${totalPayableAmount}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${invoiceLinesXml}
</Invoice>`;

  return xml;
};

export default createInvoiceXml;
