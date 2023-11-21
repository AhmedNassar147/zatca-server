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
  readJsonFile,
  readAndEncodeCertToBase64,
  findRootYarnWorkSpaces,
} from "@zatca-server/helpers";
import { SERVER_PORT, CERTS_FILE_NAMES, CSID_FILE_PATH } from "./constants.mjs";
import stopTheProcessIfCertificateNotFound from "./helpers/stopTheProcessIfCertificateNotFound.mjs";
import fetchZatcaCompliance from "./api-helpers/fetchZatcaCompliance.mjs";
import createInvoiceXml from "./helpers/createInvoiceXml.mjs";
import generateSignedXMLString from "./helpers/generateSignedXMLString.mjs";

const { taxPayerPath } = CERTS_FILE_NAMES;

const invoiceData = {
  invoiceSerialNo: "I12345",
  uuid: randomUUID(),
  issueDate: "2023-11-22",
  issueTime: "10:05:08",
  transactionTypeCode: "0200000",
  invoiceTypeCode: "388",
  cancelledInvoiceNo: "",
  paymentMeansCode: 10,
  // invoiceNote: "some notes",
  // invoiceNoteLang: "AR",
  invoiceCounterNo: 1,
  previousInvoiceHash:
    "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==",
  totalDiscountAmount: "0.00",
  discountReasonCode: "95",
  discountReason: "Discount",
  totalTaxAmount: "1.5",
  totalTaxPercent: "15.00",
  totalWithoutTax: "10.00",
  totalWithTax: "11.50",
  products: [
    {
      id: "1",
      totalWithoutTax: "10.00",
      taxAmount: "1.50",
      taxCategory: "S",
      taxPercent: "15.00",
      quantity: 1,
      totalWithTax: "11.50",
      productName: "phone",
      price: "10.00",
      unitCode: "PCE",
      discount: 0,
      discountReasonCode: "95",
      discountReason: "Discount",
    },
  ],
  supplier: {
    streetName: "ahmed",
    additionalStreetName: "ahmed",
    buildingNumber: "111",
    plotIdentification: "sas",
    citySubdivisionName: "ahmed",
    cityName: "ahmed",
    postalZone: "11",
    countrySubentity: "SSA",
    countryIdCode: "SA",
    vatName: "ahmed",
    crnNo: "1222",
    vatNumber: "1122522", // REQUIRED HERE,
  },
  customer: {
    streetName: "ahmed",
    additionalStreetName: "ahmed",
    buildingNumber: "111",
    plotIdentification: "sas",
    citySubdivisionName: "ahmed",
    cityName: "ahmed",
    postalZone: "11",
    countrySubentity: "SSA",
    countryIdCode: "SA",
    vatName: "ahmed",
    crnNo: "5522",
    // vatNumber: "1122522" IF FOUND,
  },
};

(async () => {
  await stopTheProcessIfCertificateNotFound(false);

  // don't remove cert headers
  // const encodedPayerTaxCert = await readAndEncodeCertToBase64(taxPayerPath);
  // const errors = await fetchZatcaCompliance(encodedPayerTaxCert);

  // if (errors) {
  //   console.log("CSID ERRORS", errors);
  //   process.kill(process.pid);
  // }

  const result = await readJsonFile(CSID_FILE_PATH, true);

  console.log("result", result);
  const { decodedToken } = result;

  const invoiceXml = createInvoiceXml(invoiceData);

  const { signedInvoiceString, ...signedInvoiceValues } =
    await generateSignedXMLString(invoiceXml, decodedToken);

  const root = await findRootYarnWorkSpaces();

  await writeFile(
    `${root}/results/values.json`,
    JSON.stringify(signedInvoiceValues, null, 2)
  );
  await writeFile(
    `${root}/results/withoutFixSignedInvoiceXml.xml`,
    signedInvoiceString
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
