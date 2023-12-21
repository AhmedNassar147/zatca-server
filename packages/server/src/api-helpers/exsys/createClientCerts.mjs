/*
 *
 * Helper: `createClientCerts`.
 *
 */
import { promisify } from "util";
import { exec } from "child_process";
import { checkPathExists, createCmdMessage } from "@zatca-server/helpers";
import { writeFile } from "fs/promises";
import chalk from "chalk";

const execPromise = promisify(exec);

const executeCommandIfFileNotExsist = async (
  filePath,
  cmd,
  isWindowsPlatform
) => {
  const isFileFound = await checkPathExists(filePath);

  if (!isFileFound) {
    const shellOptions = isWindowsPlatform
      ? {
          shell: "powershell.exe",
        }
      : undefined;
    const { stdout } = await execPromise(cmd, shellOptions);

    if (stdout) {
      await writeFile(filePath, stdout);
    }
  }
};

const createClientCerts = async (folderPath) => {
  const isWindowsPlatform = ["win32", "win64"].includes(process.platform);

  const privateCertPath = `${folderPath}/privateKey.pem`;
  const publicCertPath = `${folderPath}/publicKey.pem`;
  const taxPayerPath = `${folderPath}/taxpayer.csr`;
  const configFilePath = `${folderPath}/config.cnf`;

  try {
    await executeCommandIfFileNotExsist(
      privateCertPath,
      `openssl ecparam -name secp256k1 -genkey -noout`,
      isWindowsPlatform
    );

    await executeCommandIfFileNotExsist(
      publicCertPath,
      `openssl ec -in ${privateCertPath} -pubout`,
      isWindowsPlatform
    );

    await executeCommandIfFileNotExsist(
      taxPayerPath,
      `openssl req -new -sha256 -key ${privateCertPath} -extensions v3_req -config ${configFilePath}`,
      isWindowsPlatform
    );
  } catch (error) {
    console.log("error", error);
    const { message } = error || {};

    if ((message || "").includes("openssl")) {
      const finalMessage = `Please install ${chalk.bold.white(
        "openssl"
      )} via ${chalk.bold.white(
        "https://thesecmaster.com/procedure-to-install-openssl-on-the-windows-platform"
      )}`;

      createCmdMessage({ type: "error", message: finalMessage });
      process.kill(process.pid);
    }
  }
};

export default createClientCerts;
