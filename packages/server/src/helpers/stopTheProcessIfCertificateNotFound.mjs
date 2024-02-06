/*
 *
 * Helper: `stopTheProcessIfCertificateNotFound`.
 *
 */
import { createCmdMessage } from "@zatca-server/helpers";
import checkIfCertificatesExists from "./checkIfCertificatesExists.mjs";

const stopTheProcessIfCertificateNotFound = async () => {
  createCmdMessage({
    type: "info",
    message: "checking certificates ...",
  });

  const errors = await checkIfCertificatesExists();

  if (!errors.length) {
    createCmdMessage({
      type: "success",
      message: "certificates checked ☺",
    });

    return;
  }

  errors.forEach((error) =>
    createCmdMessage({
      type: "error",
      message: error,
    })
  );

  process.kill(process.pid);
  process.exit(process.exitCode);
};

export default stopTheProcessIfCertificateNotFound;
