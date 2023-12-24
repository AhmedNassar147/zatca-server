/*
 *
 * Helper: `createInitialComplianceInvoicesData`
 *
 */
import { randomUUID } from "crypto";
import { getCurrentDate } from "@zatca-server/helpers";

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
  // products: [
  //   {
  //     id: "1",
  //     quantity: 1,
  //     totalWithoutTax: "10.00",
  //     taxAmount: "1.50",
  //     totalWithTax: "11.50",
  //     productName: "phone",
  //     taxCategory: "S",
  //     taxPercent: "15.00",
  //     price: "10.00",
  //     unitCode: "PCE",
  //     discount: 0,
  //     discountReasonCode: "95",
  //     discountReason: "Discount",
  //   },
  // ],

  products: [
    {
      id: "1",
      productName: "O-BURBERRY 1344 55 1166 نظارة طبية",
      taxCategory: "Z",
      taxExemptionReasonCode: "VATEX-SA-35",
      taxExemptionReason: "Medicines and medical equipment",
      quantity: 1,
      baseAmount: "910.00",
      price: "900.00",
      unitCode: "EACH",
      discount: "10.00",
      discountReasonCode: "95",
      discountReason: "Discount",
      taxAmount: "0.00",
      totalWithoutTax: "900.00",
      totalWithTax: "900.00",
    },
    {
      id: "2",
      productName: "احبال ومطاطات نظارات 15",
      taxCategory: "S",
      quantity: 1,
      taxPercent: "15.00",
      price: "15.00",
      unitCode: "EACH",
      discount: "0.00",
      taxAmount: "2.25",
      totalWithoutTax: "15.00",
      totalWithTax: "17.25",
    },
  ],
  // totalDiscountAmount: "0.0",
  // discountReasonCode: "95",
  // discountReason: "Discount",
  // totalTaxPercent: "15.00",
  // totalTaxAmount: "1.50",
  // totalWithoutTax: "10.00",
  // totalWithTax: "11.50",

  totalDiscountAmount: "0.00",
  totalTaxPercent: "15.00",
  totalTaxAmount: "2.25",
  totalWithoutTax: "915.00",
  totalWithTax: "917.25",
  taxCategory: "S",
};

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
  totalDiscountAmount,
  discountReasonCode,
  discountReason,
  totalTaxPercent,
  totalTaxAmount,
  totalWithoutTax,
  totalWithTax,
  deliveryDate,
  taxCategory,
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
    totalDiscountAmount,
    discountReasonCode,
    discountReason,
    totalTaxPercent,
    totalTaxAmount,
    totalWithoutTax,
    totalWithTax,
    supplier,
    customer,
    deliveryDate,
    taxCategory,
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
