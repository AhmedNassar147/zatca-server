/*
 *
 * Helper: `createInitialComplianceInvoicesData`
 *
 */
import { randomUUID } from "crypto";
import { getCurrentDate } from "@zatca-server/helpers";

const baseInvoiceData = {
  paymentMeansCode: "10",
  supplier: {
    crnNo: "Iccsiporex",
    streetName: "King Fahahd st",
    additionalStreetName: "street name",
    buildingNumber: "0000",
    plotIdentification: "0000",
    citySubdivisionName: "West",
    cityName: "Khobar",
    postalZone: "31952",
    countrySubentity: "moderia",
    countryIdCode: "SA",
    vatName: "ShaEk",
    vatNumber: "300056985100003",
  },
  customer: {
    crnNo: "00000000",
    streetName: "King Fahahd st",
    additionalStreetName: "King Fahahd st",
    buildingNumber: "4444",
    plotIdentification: "01252",
    citySubdivisionName: "East",
    cityName: "city",
    postalZone: "55555",
    countrySubentity: "moderia",
    countryIdCode: "SA",
    vatName: "mohammed almalki",
  },
  products: [
    {
      id: "1",
      quantity: 1,
      totalWithoutTax: "10.00",
      taxAmount: "1.50",
      totalWithTax: "11.50",
      productName: "phone",
      taxCategory: "S",
      taxPercent: "15.00",
      price: "10.00",
      unitCode: "PCE",
      discount: 0,
      discountReasonCode: "95",
      discountReason: "Discount",
    },
  ],
  totalDiscountAmount: "0.0",
  discountReasonCode: "95",
  discountReason: "Discount",
  totalTaxPercent: "15.00",
  totalTaxAmount: "1.50",
  totalWithoutTax: "10.00",
  totalWithTax: "11.50",
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
    invoiceNote: "ABC",
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
    // deliveryDate: "25-12-2023",
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
