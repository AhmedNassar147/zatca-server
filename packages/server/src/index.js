/*
 *
 * server: `zatca-server`.
 *
 */
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";

// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
import {
  // restartProcess,
  // RESTART_SERVER_MS,
  createCmdMessage,
  // readJsonFile,
  readAndEncodeCertToBase64,
  findRootYarnWorkSpaces,
} from "@zatca-server/helpers";
import { SERVER_PORT, CERTS_FILE_NAMES } from "./constants.mjs";
import stopTheProcessIfCertificateNotFound from "./helpers/stopTheProcessIfCertificateNotFound.mjs";
import fetchZatcaComplianceCertificate from "./api-helpers/fetchZatcaComplianceCertificate.mjs";
import createZatcaComplianceInvoicesRequest from "./api-helpers/createZatcaComplianceInvoicesRequest.mjs";
import generateSignedXMLString from "./helpers/generateSignedXMLString.mjs";

const { taxPayerPath } = CERTS_FILE_NAMES;

const invoiceData = {
  invoiceSerialNo: "I12345",
  uuid: "",
  issueDate: "2023-11-29",
  issueTime: "13:28:08",
  transactionTypeCode: "0200000",
  invoiceTypeCode: "388",
  invoiceNoteLang: "ar",
  invoiceNote: "ABC",
  invoiceCounterNo: 10,
  // cancelledInvoiceNo: "",
  // paymentMeansCode: "10",
  // paymentInstructionNote,
  previousInvoiceHash:
    "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==",
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
  supplier: {
    crnNo: "00000000",
    streetName: "إسم الشارع",
    additionalStreetName: "إسم الشارع الإضافي",
    buildingNumber: "4444",
    plotIdentification: "الرقم الإضافي",
    citySubdivisionName: "الحي",
    cityName: "المدينة",
    postalZone: "55555",
    countrySubentity: "المديرية",
    countryIdCode: "SA",
    vatName: "pilatusalarabia",
    vatNumber: "310056781100003", // REQUIRED HERE,
  },
  // customer: {
  //   streetName: "ahmed",
  //   additionalStreetName: "ahmed",
  //   buildingNumber: "111",
  //   plotIdentification: "sas",
  //   citySubdivisionName: "ahmed",
  //   cityName: "ahmed",
  //   postalZone: "11",
  //   countrySubentity: "SSA",
  //   countryIdCode: "SA",
  //   vatName: "ahmed",
  //   crnNo: "5522",
  //   // vatNumber: "1122522" IF FOUND,
  // },
};

(async () => {
  await stopTheProcessIfCertificateNotFound(false);

  // don't remove cert headers
  const encodedPayerTaxCert = await readAndEncodeCertToBase64(taxPayerPath);
  const errors = await fetchZatcaComplianceCertificate(encodedPayerTaxCert);

  if (errors) {
    createCmdMessage({ type: "error", message: "CSID ERRORS", data: errors });
    process.kill(process.pid);
  }

  const uuid = randomUUID();

  const { signedInvoiceString, invoiceHash } = await generateSignedXMLString({
    ...invoiceData,
    uuid,
  });

  const complianceInvoiceData = await createZatcaComplianceInvoicesRequest({
    invoiceHash,
    uuid,
    invoice: signedInvoiceString,
  });

  const root = await findRootYarnWorkSpaces();

  await writeFile(
    `${root}/results/withoutFixSignedInvoiceXml.xml`,
    signedInvoiceString
  );

  await writeFile(
    `${root}/results/values.json`,
    JSON.stringify(
      {
        invoiceHash,
        complianceInvoiceData,
      },
      null,
      2
    )
  );

  // const app = express();
  // app.use(cors());
  // app.use(bodyParser.urlencoded({ extended: true }));
  // app.use(bodyParser.json({ limit: FILES_ENCODING_LIMIT }));
  // app.use(bodyParser.text());
  // app.use(bodyParser.raw({ limit: FILES_ENCODING_LIMIT }));

  // const res = app.listen(SERVER_PORT, () =>
  //   createCmdMessage({
  //     type: "success",
  //     message: `app is running on http://localhost:${SERVER_PORT}`,
  //   })
  // );

  // res.on("error", () => {
  //   res.close(() => {
  //     process.kill(process.pid);
  //     createCmdMessage({
  //       type: "info",
  //       message: `restarting server after ${RESTART_SERVER_MS / 1000} seconds`,
  //     });
  //     restartProcess();
  //   });
  // });
})();
