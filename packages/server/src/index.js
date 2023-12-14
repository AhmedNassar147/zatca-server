/*
 *
 * server: `zatca-server`.
 *
 */
import { writeFile } from "fs/promises";

// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
import {
  createCmdMessage,
  findRootYarnWorkSpaces,
  getCurrentDate,
} from "@zatca-server/helpers";
import { CLI_CONFIG, API_VALUES } from "./constants.mjs";
import stopTheProcessIfCertificateNotFound from "./helpers/stopTheProcessIfCertificateNotFound.mjs";
import generateSignedXMLString from "./helpers/generateSignedXMLString.mjs";
import issueCertificate from "./api-helpers/issueCertificate.mjs";
import sendZatcaInvoice from "./api-helpers/sendZatcaInvoice.mjs";

const { POST_INITIAL_INVOICES } = API_VALUES;
const { sandbox } = CLI_CONFIG;

const invoiceData = {
  invoiceSerialNo: "I12345",
  uuid: "6974dbe7-09b4-47c3-b373-b288c6a2370d",
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
    vatNumber: "300056985100003", // REQUIRED HERE,
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

const printResults = async (signedInvoiceString, data) => {
  const root = await findRootYarnWorkSpaces();

  await writeFile(`${root}/results/signedInvoiceXml.xml`, signedInvoiceString);

  await writeFile(`${root}/results/values.json`, JSON.stringify(data, null, 2));
};

// fir config csr
// title=1000 standard
// title=0100 simplified
// title=1100 both

(async () => {
  await stopTheProcessIfCertificateNotFound(false);

  const { errors } = await issueCertificate(false);

  if (errors) {
    createCmdMessage({ type: "error", message: "CSID ERRORS", data: errors });
    process.kill(process.pid);
  }

  const { dateString, time } = getCurrentDate(true);

  const { signedInvoiceString, invoiceHash, encodedInvoiceXml } =
    await generateSignedXMLString({
      ...invoiceData,
      issueDate: dateString,
      issueTime: time,
    });

  const complianceInvoiceData = await sendZatcaInvoice({
    resourceNameUrl: POST_INITIAL_INVOICES[sandbox],
    useProductionCsid: false,
    invoiceHash,
    uuid: invoiceData.uuid,
    invoice: encodedInvoiceXml,
  });

  const {
    response: { status },
  } = complianceInvoiceData;

  if (status !== 200) {
    await printResults(signedInvoiceString, { complianceInvoiceData });
    return;
  }

  const { errors: _, ...productionCsidData } = await issueCertificate(true);

  await printResults(signedInvoiceString, {
    complianceInvoiceData,
    productionCsidData,
  });

  // const reportData = await reportInvoice({
  //   isSimplified: true,
  //   ...finalInvoiceData,
  // });

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
