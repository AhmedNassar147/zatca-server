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
} from "@zatca-server/helpers";
import {
  ZATCA_SANDBOX_TYPES,
  ZATCA_SANDBOX_TYPES_KEYS,
  SERVER_CONFIG,
} from "./constants.mjs";
import stopTheProcessIfCertificateNotFound from "./helpers/stopTheProcessIfCertificateNotFound.mjs";
import issueCertificate from "./api-helpers/issueCertificate.mjs";
import certifyZatcaUser from "./api-helpers/certifyZatcaUser.mjs";
import sendZatcaInvoice from "./api-helpers/sendZatcaInvoice.mjs";
const { dataBaseServerPort } = SERVER_CONFIG;
// 100 - 15%
// dep + cred => no discount

// for config csr
// title=1000 standard
// title=0100 simplified
// title=1100 both

(async () => {
  await stopTheProcessIfCertificateNotFound(false);

  // --exsys-base-url --sandbox=developer|simulation
  const { exsysBaseUrl, sandbox: _sandbox } = await collectProcessOptions();

  const sandbox = _sandbox || ZATCA_SANDBOX_TYPES.developer;

  if (!ZATCA_SANDBOX_TYPES_KEYS.includes(sandbox)) {
    createCmdMessage({
      type: "error",
      message: `sandbox should be one of ${ZATCA_SANDBOX_TYPES_KEYS.join(",")}`,
    });
    process.kill(process.pid);
  }

  // const BASE_API_IP_ADDRESS = exsysBaseUrl || "http://localhost";
  // const API_URL_PORT = dataBaseServerPort || 9090;
  // const EXSYS_BASE_URL = `${BASE_API_IP_ADDRESS}:${API_URL_PORT}/ords/exsys_api`;

  const { errors } = await issueCertificate(sandbox, false);

  if (errors) {
    createCmdMessage({ type: "error", message: "CSID ERRORS", data: errors });
    process.kill(process.pid);
  }

  const results = await certifyZatcaUser(sandbox);

  const root = await findRootYarnWorkSpaces();
  await writeFile(`${root}/results/res.json`, JSON.stringify(results, null, 2));

  // const {
  //   response: { status },
  // } = complianceInvoiceData;

  // const { errors: _, ...productionCsidData } = await issueCertificate(
  //   sandbox,
  //   true
  // );

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
