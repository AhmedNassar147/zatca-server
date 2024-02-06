/*
 *
 * server: `zatca-server`.
 *
 */

// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
import { collectProcessOptions, createCmdMessage } from "@zatca-server/helpers";
import { ZATCA_SANDBOX_TYPES, ZATCA_SANDBOX_TYPES_KEYS } from "./constants.mjs";
import stopTheProcessIfCertificateNotFound from "./helpers/stopTheProcessIfCertificateNotFound.mjs";
import {
  initInitialCnfFiles,
  createClientInvoiceQR,
  issueCertificate,
  sendZatcaInitialInvoices,
  checkIfClientZatcaCertified,
  reportInvoicePoll,
} from "./api-helpers/index.mjs";

(async () => {
  // --exsys-base-url --sandbox=developer|simulation|production --port=9090 --force-initiating-cnf --use-invoice-qr-api
  const {
    exsysBaseUrl,
    sandbox: _sandbox,
    port,
    useInvoiceQrApi,
    forceInitiatingCnf,
    sendInitialInvoices,
    useLogger,
  } = await collectProcessOptions();

  const sandbox = _sandbox || ZATCA_SANDBOX_TYPES.developer;

  if (!ZATCA_SANDBOX_TYPES_KEYS.includes(sandbox)) {
    createCmdMessage({
      type: "error",
      message: `sandbox should be one of ${ZATCA_SANDBOX_TYPES_KEYS.join(",")}`,
    });
    process.kill(process.pid);
  }

  const BASE_API_IP_ADDRESS = exsysBaseUrl || "http://localhost";
  const API_URL_PORT = port || 9090;
  const EXSYS_BASE_URL = `${BASE_API_IP_ADDRESS}:${API_URL_PORT}/ords/exsys_api`;

  await initInitialCnfFiles(EXSYS_BASE_URL, forceInitiatingCnf);
  await stopTheProcessIfCertificateNotFound();

  const { isCertified, shouldIssueInitialCsid } =
    await checkIfClientZatcaCertified(EXSYS_BASE_URL, sandbox);

  if (shouldIssueInitialCsid) {
    const { errors } = await issueCertificate(EXSYS_BASE_URL, sandbox);
    if (errors) {
      process.exit(process.exitCode);
    }
  }

  if (useInvoiceQrApi) {
    (async () => await createClientInvoiceQR(EXSYS_BASE_URL))();
  }

  if (sendInitialInvoices && !isCertified) {
    await sendZatcaInitialInvoices(EXSYS_BASE_URL, sandbox, useLogger);
  }

  if (!isCertified) {
    const { errors } = await issueCertificate(EXSYS_BASE_URL, sandbox, true);

    if (errors) {
      process.exit(process.exitCode);
    }
  }

  await reportInvoicePoll(EXSYS_BASE_URL, sandbox);

  return;

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
