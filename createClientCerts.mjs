import { promisify } from "util";
import { exec } from "child_process";
import { stat } from "fs/promises";
import chalk from "chalk";

const execPromise = promisify(exec);

const certsFolderName = "certs";
const privateCertPath = `${certsFolderName}/privateKey.pem`;
const publicCertPath = `${certsFolderName}/publicKey.pem`;
const taxPayerPath = `${certsFolderName}/taxpayer.csr`;

const checkPathExists = async (filePath) =>
  stat(filePath)
    .then(() => filePath)
    .catch(() => false);

const executeCommandIfFileNotExsist = async (filePath, cmd) => {
  const isFileFound = await checkPathExists(filePath);

  if (!isFileFound) {
    await execPromise(cmd);
  }
};

(async () => {
  await executeCommandIfFileNotExsist(
    certsFolderName,
    `mkdir ${certsFolderName}`
  );

  try {
    await executeCommandIfFileNotExsist(
      privateCertPath,
      `openssl ecparam -name secp256k1 -genkey -noout -out ${privateCertPath}`
    );

    await executeCommandIfFileNotExsist(
      publicCertPath,
      `openssl ec -in ${privateCertPath} -pubout -out ${publicCertPath}`
    );

    await executeCommandIfFileNotExsist(
      taxPayerPath,
      `openssl req -new -sha256 -key ${privateCertPath} -extensions v3_req -config configuration.cnf -out ${taxPayerPath}`
    );
  } catch (error) {
    const { message } = error || {};

    if ((message || "").includes("openssl")) {
      console.log(
        chalk.red(
          `Please install ${chalk.bold.white("openssl")} via ${chalk.bold.white(
            "https://thesecmaster.com/procedure-to-install-openssl-on-the-windows-platform"
          )}`
        )
      );
      process.kill(process.pid);
    }
  }
})();
