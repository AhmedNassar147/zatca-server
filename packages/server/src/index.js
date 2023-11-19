/*
 *
 * server: `zatca-server`.
 *
 */
import { readAndEncodeCertToBase64 } from "@zatca-server/helpers";

// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
import {
  restartProcess,
  RESTART_SERVER_MS,
  createCmdMessage,
  readJsonFile,
} from "@zatca-server/helpers";
import { SERVER_PORT, CERTS_FILE_NAMES, CSID_FILE_PATH } from "./constants.mjs";
import stopTheProcessIfCertificateNotFound from "./helpers/stopTheProcessIfCertificateNotFound.mjs";
import fetchZatcaCompliance from "./api-helpers/fetchZatcaCompliance.mjs";

const { taxPayerPath } = CERTS_FILE_NAMES;

(async () => {
  await stopTheProcessIfCertificateNotFound(false);

  const encodedPayerTaxCert = await readAndEncodeCertToBase64(taxPayerPath);
  const errors = await fetchZatcaCompliance(encodedPayerTaxCert);

  if (errors) {
    console.log("CSID ERRORS", errors);
    process.kill(process.pid);
  }

  const result = await readJsonFile(CSID_FILE_PATH, true);

  console.log("result", result);

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
