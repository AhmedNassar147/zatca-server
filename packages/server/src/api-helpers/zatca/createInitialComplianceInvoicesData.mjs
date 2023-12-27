/*
 *
 * Helper: `createInitialComplianceInvoicesData`
 *
 */
import { randomUUID } from "crypto";
import { getCurrentDate } from "@zatca-server/helpers";

// item with tax only
// invoiceDiscountAmount: "0.00",
// totalChargeAmount: "0.00",
// totalVatAmount: "2.25",
// totalExtensionAmount: "15.00",
// totalTaxExclusiveAmount: "15.00",
// totalTaxInclusiveAmount: "17.25",
// totalPrepaidAmount: "0.00",
// totalPayableAmount: "17.25",
// discountReasonCode: "",
// discountReason: "",
// taxCategory: "S",
// taxPercent: "15",
// products: [
//   {
//     id: "1",
//     productName: "احبال ومطاطات نظارات 15",
//     taxCategory: "S",
//     quantity: 1,
//     taxPercent: "15",
//     netPrice: "15.00",
//     unitCode: "EACH",
//     discountAmount: "0.00",
//     taxAmount: "2.25",
//     lineNetAmount: "15.00",
//     taxableAmount: "15.00",
//     taxRoundingAmount: "17.25",
//     chargeAmount: "0.00",
//   },
// ],

// invoice with standard with discount and tax rates
// taxCategory: "S",
// taxPercent: "15",
// discountReasonCode: "95",
// discountReason: "discount",
// invoiceDiscountAmount: "0.00",
//   totalChargeAmount: "0.00",
//   totalVatAmount: "71.25",
//   totalExtensionAmount: "475.00",
//   totalTaxExclusiveAmount: "475.00",
//   totalTaxInclusiveAmount: "546.25",
//   totalPrepaidAmount: "0.00",
//   totalPayableAmount: "546.25",
//   products: [
//     {
//       id: "1",
//       productName: "احبال ومطاطات نظارات 15",
//       taxCategory: "S",
//       quantity: 10,
//       taxPercent: "15",
//       netPrice: "10.00",
//       unitCode: "EACH",
//       discountAmount: "50.00",
//       discountReasonCode: "95",
//       discountReason: "Discount",
//       taxAmount: "15.00",
//       lineNetAmount: "100.00",
//       taxableAmount: "100.00",
//       taxRoundingAmount: "115.00",
//       chargeAmount: "0.00",
//     },
//     {
//       id: "2",
//       productName: "سلاسل نظارات 100",
//       taxCategory: "S",
//       quantity: 5,
//       taxPercent: "15",
//       netPrice: "75.00",
//       unitCode: "EACH",
//       discountAmount: "125.00",
//       discountReasonCode: "95",
//       discountReason: "Discount",
//       taxAmount: "56.25",
//       lineNetAmount: "375.00",
//       taxableAmount: "375.00",
//       taxRoundingAmount: "431.25",
//       chargeAmount: "0.00",
//     },
//   ],

const baseInvoiceData = {
  // paymentMeansCode: "10",
  paymentMeansCode: "30",
  supplier: {
    vatName: "شركة المباني الخفيفة سيبوركس",
    vatNumber: "300056985100003",
    crnNo: "1010009671",
    streetName: "2nd industrial city",
    additionalStreetName: "186",
    buildingNumber: "6396",
    plotIdentification: "00",
    citySubdivisionName: "RIyadh",
    cityName: "RIyadh",
    postalZone: "14331",
    countrySubentity: "SA",
    countryIdCode: "SA",
  },
  customer: {
    vatName: "شركة بوبا العربية للتأمين التعاوني-جدة-شارع الروضة",
    vatNumber: "300149066600003",
    crnNo: "123",
    streetName: "جدة-شارع الروضة",
    cityName: "MEK",
    countrySubentity: "SA",
    countryIdCode: "SA",
  },
  totalChargeAmount: "0.00",
  totalVatAmount: "0.00",
  totalExtensionAmount: "800.00",
  totalTaxExclusiveAmount: "800.00",
  totalTaxInclusiveAmount: "800.00",
  totalPrepaidAmount: "0.00",
  totalPayableAmount: "800.00",
  products: [
    {
      id: "1",
      productName: "O-ZITRONE ZN 18 001 17P نظارة طبية",
      taxCategory: "Z",
      taxExemptionReasonCode: "VATEX-SA-35",
      taxExemptionReason: "Medicines and medical equipment",
      quantity: 1,
      taxPercent: "0",
      netPrice: "400.00",
      unitCode: "EACH",
      discountAmount: "80.00",
      discountReasonCode: "95",
      discountReason: "Discount",
      taxAmount: "0.00",
      lineNetAmount: "400.00",
      taxableAmount: "400.00",
      taxRoundingAmount: "400.00",
      chargeAmount: "0.00",
    },
    {
      id: "2",
      productName: "CRIZAL 1.5 SPH -0.50 عدسات طبية",
      taxCategory: "Z",
      taxExemptionReasonCode: "VATEX-SA-35",
      taxExemptionReason: "Medicines and medical equipment",
      quantity: 2,
      taxPercent: "0",
      netPrice: "200.00",
      unitCode: "EACH",
      discountAmount: "60.00",
      discountReasonCode: "95",
      discountReason: "Discount",
      taxAmount: "0.00",
      lineNetAmount: "400.00",
      taxableAmount: "400.00",
      taxRoundingAmount: "400.00",
      chargeAmount: "0.00",
    },
  ],

  taxCategory: "S",
  taxPercent: "15",
  discountReasonCode: "95",
  discountReason: "discount",
};

// consider chargeAmount is 0.00 for now
// if taxPercent doesn't exist set taxExemptionReasonCode and taxExemptionReason values

// netPrice = the price after discount
// discountAmount = the total discount for item all qty
// lineNetAmount = netPrice * quantity => (netPrice × quantity) + chargeAmount
// taxAmount = the total tax amount for item all qty => (taxableAmount * taxPercent / 100)
// taxableAmount = lineNetAmount
// taxRoundingAmount =  lineNetAmount + taxAmount

// totalChargeAmount =  ∑(chargeAmount)

// invoiceDiscountAmount: the discount for document level

// totalExtensionAmount = ∑(lineNetAmount)

// totalTaxExclusiveAmount = totalExtensionAmount - invoiceDiscountAmount

// totalVatAmount = ∑(taxAmount) - invoiceDiscountAmount,

// totalTaxInclusiveAmount = totalTaxExclusiveAmount + totalVatAmount

// totalPrepaidAmount = 0.00
// totalPayableAmount = totalTaxInclusiveAmount - totalPrepaidAmount

// -------------------------------------------------------------------------------------

const createInitialComplianceInvoiceData = ({
  transactionTypeCode,
  invoiceTypeCode,
  invoiceCounterNo,
  cancelledInvoiceNo,
  supplier,
  customer,
  paymentMeansCode,
  paymentInstructionNote,
  products,
  deliveryDate,
  invoiceDiscountAmount,
  totalVatAmount,
  totalExtensionAmount,
  totalChargeAmount,
  totalTaxExclusiveAmount,
  totalTaxInclusiveAmount,
  totalPrepaidAmount,
  totalPayableAmount,
  discountReasonCode,
  discountReason,
  taxCategory,
  taxPercent,
}) => {
  const uuid = randomUUID();
  const [invoiceSerialNo] = uuid.split("-");

  const { dateString, time } = getCurrentDate(true);

  return {
    invoiceSerialNo,
    uuid,
    issueDate: dateString,
    issueTime: time,
    transactionTypeCode,
    invoiceTypeCode,
    invoiceNoteLang: "ar",
    invoiceNote: "invoice note",
    invoiceCounterNo,
    cancelledInvoiceNo,
    paymentMeansCode,
    paymentInstructionNote,
    previousInvoiceHash:
      "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==",
    products,
    invoiceDiscountAmount,
    totalVatAmount,
    totalExtensionAmount,
    totalChargeAmount,
    totalTaxExclusiveAmount,
    totalTaxInclusiveAmount,
    totalPrepaidAmount,
    totalPayableAmount,
    supplier,
    customer,
    deliveryDate,
    discountReasonCode,
    discountReason,
    taxCategory,
    taxPercent,
  };
};

const createSimpleInvoices = () => [
  // simplified invoice
  createInitialComplianceInvoiceData({
    ...baseInvoiceData,
    transactionTypeCode: "0200000",
    invoiceTypeCode: "388",
    invoiceCounterNo: 1,
  }),
  // simplified debit invoice
  createInitialComplianceInvoiceData({
    ...baseInvoiceData,
    transactionTypeCode: "0200000",
    invoiceTypeCode: "383",
    invoiceCounterNo: 2,
    cancelledInvoiceNo: "0",
    paymentInstructionNote: "anything",
  }),
  // simplified credit invoice
  createInitialComplianceInvoiceData({
    ...baseInvoiceData,
    transactionTypeCode: "0200000",
    invoiceTypeCode: "381",
    invoiceCounterNo: 3,
    cancelledInvoiceNo: "0",
    paymentInstructionNote: "anything",
  }),
];

const createStandardInvoices = () => [
  // standard invoice
  createInitialComplianceInvoiceData({
    ...baseInvoiceData,
    transactionTypeCode: "0100000",
    invoiceTypeCode: "388",
    invoiceCounterNo: 4,
    deliveryDate: "2023-12-25",
  }),

  // standard debit invoice
  createInitialComplianceInvoiceData({
    ...baseInvoiceData,
    transactionTypeCode: "0100000",
    invoiceTypeCode: "383",
    invoiceCounterNo: 5,
    cancelledInvoiceNo: "0",
    paymentInstructionNote: "anything",
  }),
  // standard credit invoice
  createInitialComplianceInvoiceData({
    ...baseInvoiceData,
    transactionTypeCode: "0100000",
    invoiceTypeCode: "381",
    invoiceCounterNo: 6,
    cancelledInvoiceNo: "0",
    paymentInstructionNote: "anything",
  }),
];

const createInitialComplianceInvoicesData = (usedInvoiceType) => {
  const usesSimpleInvoices = usedInvoiceType === "0100";
  const usesStandardInvoices = usedInvoiceType === "1000";
  // const usesBothInvoices = usedInvoiceType === "1100";

  if (usesSimpleInvoices) {
    return createSimpleInvoices();
  }

  if (usesStandardInvoices) {
    return createStandardInvoices();
  }

  return [...createSimpleInvoices(), ...createStandardInvoices()];
};

export default createInitialComplianceInvoicesData;

// -------------------------------------------------------------------------------------
// const ItemNetPrice = BT-148 - BT-147
// const ItemTaxRoundingAmount = BT-131 + InvoiceLine\TaxTotal\TaxAmount

// BT-129 InvoicedQuantity => InvoiceLine\InvoicedQuantity
// BT-146 ItemNetPrice => price InvoiceLine\Price\PriceAmount ItemNetPrice
// BT-131 ItemLineNetAmount InvoiceLine\LineExtensionAmount (ItemLineNetAmount)
// BT-147 ItemPriceDiscount InvoiceLine\Price\AllowanceCharge\Amount (where ChargeIndicator = false)
// BT-148 ItemGrossPrice InvoiceLine\Price\AllowanceCharge\BaseAmount
// BT-141 ItemPriceCharge InvoiceLine\Price\AllowanceCharge\Amount (where ChargeIndicator = true)
// BT-149 ItemPriceBaseQuantity => InvoiceLine\Price\BaseQuantity
//  ItemVatRate InvoiceLine\TaxTotal\RoundingAmount (ItemTaxRoundingAmount)

// const PayableAmount = BT-112 - BT-113 + BT-114;

// BT-106 => cac:LegalMonetaryTotal\LineExtensionAmount => totalExtensionAmount
// BT-109 => cac:LegalMonetaryTotal\TaxExclusiveAmount  => BR-CO-13 (invoiceTotalAmountWithoutVAT)
// BT-112 => cac:LegalMonetaryTotal\TaxInclusiveAmount => BR-CO-15 (invoiceTotalAmountWithVat)
// BT-107 => cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount => allowanceTotalAmount
// BT-108 => cac:LegalMonetaryTotal/cbc:ChargeTotalAmount => chargeTotalAmount
// BT-113 => cac:LegalMonetaryTotal/cbc:PrepaidAmount
// BT-114 => cac:LegalMonetaryTotal/cbc:PayableRoundingAmount
// BT-115 => cac:LegalMonetaryTotal\LegalMonetaryTotal\PayableAmount => PayableAmount
