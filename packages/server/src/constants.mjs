/*
 *
 * Constants: 'zatca-server'.
 *
 */
import {
  readJsonFile,
  collectProcessOptions,
  findRootYarnWorkSpaces,
} from "@zatca-server/helpers";

const rootYarnWorkSpacePath = await findRootYarnWorkSpaces();

const configFilePath = `${rootYarnWorkSpacePath}/config.json`;

// --dev, --certificate-path="" , ---ignore-cert, ---production, --exsys-base-url
export const CLI_CONFIG = await collectProcessOptions();
export const SERVER_CONFIG = await readJsonFile(configFilePath, true);

export const FILES_ENCODING_LIMIT = "60mb";

export const SERVER_PORT = 5050;
export const RETRY_TIMES = 1;
export const RETRY_DELAY = 10000;
export const EXSYS_POLLS_TIMEOUT = 10000;
const { exsysBaseUrl } = CLI_CONFIG;
const { dataBaseServerPort } = SERVER_CONFIG;

export const BASE_API_IP_ADDRESS = exsysBaseUrl || "http://localhost";

const API_URL_PORT = dataBaseServerPort || 9090;

export const EXSYS_BASE_URL = `${BASE_API_IP_ADDRESS}:${API_URL_PORT}/ords/exsys_api`;

export const BASE_RESULT_FOLDER_BATH = BASE_API_IP_ADDRESS.replace(
  "http://",
  ""
).replace(/\//g, "");

export const API_IDS_NAMES = {
  POST_ZATCA_COMPLIANCE: "POST_ZATCA_COMPLIANCE",
  POST_ZATCA_COMPLIANCE_INVOICES: "POST_ZATCA_COMPLIANCE_INVOICES",
  POST_ZATCA_CHECK_COMPLIANCE_INVOICES: "POST_ZATCA_CHECK_COMPLIANCE_INVOICES",
  POST_ZATCA_FINAL_CSID: "POST_ZATCA_FINAL_CSID",
};

export const API_VALUES = {
  [API_IDS_NAMES.POST_ZATCA_COMPLIANCE]: "compliance",
  [API_IDS_NAMES.POST_ZATCA_COMPLIANCE_INVOICES]: "compliance/invoices",
  [API_IDS_NAMES.POST_ZATCA_CHECK_COMPLIANCE_INVOICES]: "precompliance/invoice",
  // https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/production/csids
  [API_IDS_NAMES.POST_ZATCA_FINAL_CSID]: "production/csids",
};

export const API_BASE_URLS = {
  ZATCA_DEVELOPMENT:
    "https://gw-apic-gov.gazt.gov.sa/e-invoicing/developer-portal",
  ZATCA_PRODUCTION: "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation",
};

export const HTTP_STATUS_CODE = {
  200: "success",
  201: "success",
  400: "error, invalid data",
  401: "error, invalid access token",
  403: "error, the request is missing required params or the user does not have access to this service",
  404: "error, the request not found",
};

export const BASE_API_HEADERS = {
  Accept: "*/*",
  "content-type": "application/json",
};

export const CERTS_FILE_NAMES = {
  certsFolderName: "certs",
  privateCertPath: "certs/privateKey.pem",
  publicCertPath: "certs/publicKey.pem",
  taxPayerPath: "certs/taxpayer.csr",
};

export const CSID_FILE_PATH = `${rootYarnWorkSpacePath}/certs/csid.json`;

export const ZATCA_INVOICE_TRANSACTION_TYPE_CODES = {
  CREDIT_INVOICE_NOTE: "381",
  DEBIT_INVOICE_NOTE: "383",
  PAYMENT_INVOICE: "386",
  TAX_INVOICE: "388",
};

export const ZATCA_INVOICE_TYPE_CODE = {
  STANDARD: "0100000",
  SIMPLIFIED: "0200000",
};

// 11.2.5 Payment means type code
export const ZATCA_PAYMENT_METHODS = {
  CASH: "10",
  CREDIT: "30",
  BANK_ACCOUNT: "42",
  BANK_CARD: "48",
};
