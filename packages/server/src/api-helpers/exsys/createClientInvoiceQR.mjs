/*
 *
 * Helper: `createClientInvoiceQR`.
 *
 */

import {
  delayProcess,
  isObjectHasData,
  writeResultFile,
  createCmdMessage,
} from "@zatca-server/helpers";
import readCertsOrganizationsData from "../../helpers/readCertsOrganizationsData.mjs";
import createFetchRequest from "../createFetchRequest.mjs";
import { API_VALUES } from "../../constants.mjs";

const { FETCH_EXSYS_QR_INVOICE_DATA, POST_INVOICE_DATA_QR_RESULT_TO_EXSYS } =
  API_VALUES;

const loopTimeoutMS = 4 * 1000;

// {
//   "trx_pk": 2,
//   "invoiceSerialNo": "129629",
//   "uuid": "10d0485a-308b-4a84-8cda-109c58df2e60",
//   "issueDate": "2023-12-27",
//   "issueTime": "09:14:26",
//   "transactionTypeCode": "388",
//   "invoiceTypeCode": "0100000",
//   "taxCategory": "Z",
//   "taxExemptionReasonCode": "VATEX-SA-35",
//   "taxExemptionReason": "Medicines and medical equipment",
//   "deliveryDate": "2023-12-27",
//   "invoiceNoteLang": "ar",
//   "previousInvoiceHash": "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==",
//   "invoiceCounterNo": 2,
//   "paymentMeansCode": "30",
//   "invoiceDiscountAmount": "0.00",
//   "totalChargeAmount": "0.00",
//   "totalVatAmount": "0.00",
//   "totalExtensionAmount": "800.00",
//   "totalTaxExclusiveAmount": "800.00",
//   "totalTaxInclusiveAmount": "800.00",
//   "AllowanceTotalAmount": "0.00",
//   "totalPrepaidAmount": "0.00",
//   "totalPayableAmount": "800.00",
//   "products": [
//     {
//       "id": "1",
//       "productName": "O-ZITRONE ZN 18 001 17P نظارة طبية",
//       "taxCategory": "Z",
//       "taxExemptionReasonCode": "VATEX-SA-35",
//       "taxExemptionReason": "Medicines and medical equipment",
//       "quantity": 1,
//       "taxPercent": "0",
//       "netPrice": "400.00",
//       "unitCode": "EACH",
//       "discountAmount": "0.00",
//       "taxAmount": "0.00",
//       "lineNetAmount": "400.00",
//       "taxableAmount": "400.00",
//       "taxRoundingAmount": "400.00",
//       "chargeAmount": "0.00"
//     },
//     {
//       "id": "2",
//       "productName": "CRIZAL 1.5 SPH -0.50 عدسات طبية",
//       "taxCategory": "Z",
//       "taxExemptionReasonCode": "VATEX-SA-35",
//       "taxExemptionReason": "Medicines and medical equipment",
//       "quantity": 2,
//       "taxPercent": "0",
//       "netPrice": "200.00",
//       "unitCode": "EACH",
//       "discountAmount": "0.00",
//       "taxAmount": "0.00",
//       "lineNetAmount": "400.00",
//       "taxableAmount": "400.00",
//       "taxRoundingAmount": "400.00",
//       "chargeAmount": "0.00"
//     }
//   ],
//   "supplier": {
//     "vatName": "شركة المباني الخفيفة سيبوركس",
//     "vatNumber": "300056985100003",
//     "crnNo": "1010009671",
//     "streetName": "2nd industrial city",
//     "additionalStreetName": "186",
//     "buildingNumber": "6396",
//     "plotIdentification": "1234",
//     "citySubdivisionName": "RIyadh",
//     "cityName": "RIyadh",
//     "postalZone": "22234",
//     "countrySubentity": "SA",
//     "countryIdCode": "SA"
//   },
//   "customer": {
//     "vatName": "شركة بوبا العربية للتأمين التعاوني-جدة-شارع الروضة",
//     "vatNumber": " 300149066600003",
//     "cityName": "MEK",
//     "countrySubentity": "SA",
//     "countryIdCode": "SA"
//   }

const createClientInvoiceQR = async (baseAPiUrl, organizationNo) => {
  const { result } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: FETCH_EXSYS_QR_INVOICE_DATA,
    requestMethod: "GET",
  });

  const { data: invoiceData } = result || {};

  if (!isObjectHasData(invoiceData)) {
    createCmdMessage({
      type: "info",
      message: "skipping generating invoice QR because of empty invoice",
      data: invoiceData,
    });
    await delayProcess(loopTimeoutMS);
    await createClientInvoiceQR(organizationNo);
    return;
  }

  const {
    privateCertPath,
    csidData: { decodedToken: eInvoiceCertificate },
  } = await readCertsOrganizationsData(organizationNo);

  const { invoiceHash, qrBase64 } = await createInvoiceQRAndCertificateInfo({
    invoiceData,
    eInvoiceCertificate,
    privateCertPath,
  });

  const bodyData = {
    trx_pk,
    qrBase64,
    invoiceHash,
  };

  const { result: postResult, error } = await createFetchRequest({
    baseAPiUrl,
    resourceNameUrl: POST_INVOICE_DATA_QR_RESULT_TO_EXSYS,
    bodyData,
  });

  const { status } = postResult || {};
  const isPostedToExsys = status === "success";

  await writeResultFile({
    folderName: "qr_data",
    data: {
      exsysInvoiceData: invoiceData,
      isPostedToExsys,
      dataSentToExsys: bodyData,
    },
  });

  if (!isPostedToExsys) {
    createCmdMessage({
      type: "error",
      message: "some error happened when posting QR data to exsys",
      data: error,
    });
  }

  await delayProcess(loopTimeoutMS);
  await createClientInvoiceQR(organizationNo);
};
