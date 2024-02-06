/*
 *
 * Helper: `createInitialComplianceInvoicesData`
 *
 */
import { randomUUID } from "crypto";
import { getCurrentDate } from "@zatca-server/helpers";
import { ZATCA_INVOICE_TYPE_CODE } from "../../constants.mjs";

const { SIMPLIFIED, STANDARD } = ZATCA_INVOICE_TYPE_CODE;

// consider chargeAmount is 0.00 for now
// if taxPercent doesn't exist set taxExemptionReasonCode and taxExemptionReason values

// netPrice = the unit price before discount
// discountAmount = the total discount for item all qty
// lineNetAmount = (netPrice * quantity) -  discountAmount
// taxAmount = (lineNetAmount * taxPercent / 100)
// taxRoundingAmount =  lineNetAmount + taxAmount

// taxSubtotals[*].taxableAmount = ∑(lineNetAmount for current category) (- invoiceDiscountAmount for current category IF category is "s")
// taxSubtotals[*].taxAmount = (taxSubtotals.taxableAmount * taxPercent / 100)

// totalExtensionAmount = ∑(lineNetAmount)
// invoiceDiscountAmount: the discount for document level
// totalTaxExclusiveAmount = totalExtensionAmount - invoiceDiscountAmount
// totalVatAmount = ∑(taxSubtotals[*].taxAmount),
// totalTaxInclusiveAmount = totalTaxExclusiveAmount + totalVatAmount
// totalChargeAmount =  ∑(chargeAmount)

// totalPrepaidAmount = 0.00
// totalPayableAmount = totalTaxInclusiveAmount - totalPrepaidAmount

// -------------------------------------------------------------------------------------

const createInitialComplianceInvoiceData = ({
  transactionTypeCode,
  invoiceTypeCode,
  invoiceCounterNo,
  billingReferenceId,
  supplier,
  customer,
  paymentMeansCode,
  paymentInstructionNote,
  products,
  deliveryDate,
  latestDeliveryDate,
  invoiceDiscountAmount,
  totalVatAmount,
  totalExtensionAmount,
  totalChargeAmount,
  totalTaxExclusiveAmount,
  totalTaxInclusiveAmount,
  totalPrepaidAmount,
  totalPayableAmount,
  taxSubtotals,
  discountReasonCode,
  discountReason,
  taxCategory,
  taxPercent,
  previousInvoiceHash,
  invoiceNoteLang,
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
    invoiceNoteLang,
    invoiceNote: "compliance invoice note",
    invoiceCounterNo,
    billingReferenceId,
    paymentMeansCode,
    paymentInstructionNote,
    previousInvoiceHash,
    products,
    invoiceDiscountAmount,
    totalVatAmount,
    totalExtensionAmount,
    totalChargeAmount,
    totalTaxExclusiveAmount,
    totalTaxInclusiveAmount,
    totalPrepaidAmount,
    totalPayableAmount,
    taxSubtotals,
    supplier,
    customer,
    deliveryDate,
    latestDeliveryDate,
    discountReasonCode,
    discountReason,
    taxCategory,
    taxPercent,
  };
};

const createInitialComplianceInvoicesData = (invoiceKind, initialInvoice) => {
  const usesSimpleInvoices = invoiceKind === "0100";
  const usesStandardInvoices = invoiceKind === "1000";
  const usesBothInvoices = invoiceKind === "1100";

  const invoicesData = [];

  if (usesSimpleInvoices || usesBothInvoices) {
    const { customer, ...otherInvoiceData } = initialInvoice;
    const { vatNumber, ...otherCustomerData } = customer;

    invoicesData.push({
      ...otherInvoiceData,
      transactionTypeCode: SIMPLIFIED,
      customer: otherCustomerData,
    });
  }

  if (usesStandardInvoices || usesBothInvoices) {
    invoicesData.push({ ...initialInvoice, transactionTypeCode: STANDARD });
  }

  const length = invoicesData.length;

  return invoicesData
    .reduce((acc, invoiceValues, index) => {
      const isZeroIndex = !index;
      const counter = index + 1;
      const invoiceCounterNo = isZeroIndex ? counter : length + counter;

      acc.push(
        createInitialComplianceInvoiceData({
          ...invoiceValues,
          invoiceTypeCode: "388",
          invoiceCounterNo: invoiceCounterNo,
        }),
        createInitialComplianceInvoiceData({
          ...invoiceValues,
          invoiceTypeCode: "383",
          billingReferenceId: "0",
          paymentInstructionNote: "anything",
          invoiceCounterNo: invoiceCounterNo + 1,
        }),
        createInitialComplianceInvoiceData({
          ...invoiceValues,
          invoiceTypeCode: "381",
          billingReferenceId: "0",
          paymentInstructionNote: "anything",
          invoiceCounterNo: invoiceCounterNo + 2,
        })
      );

      return acc;
    }, [])
    .flat();
};

export default createInitialComplianceInvoicesData;
