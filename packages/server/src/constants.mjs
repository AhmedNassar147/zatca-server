/*
 *
 * Constants: 'zatca-server'.
 *
 */
import { readJsonFile, findRootYarnWorkSpaces } from "@zatca-server/helpers";

const rootYarnWorkSpacePath = await findRootYarnWorkSpaces();

const configFilePath = `${rootYarnWorkSpacePath}/config.json`;

export const SERVER_CONFIG = await readJsonFile(configFilePath, true);

export const FILES_ENCODING_LIMIT = "60mb";

export const SERVER_PORT = 5050;
export const RETRY_TIMES = 1;
export const RETRY_DELAY = 10000;
export const EXSYS_POLLS_TIMEOUT = 10000;

export const ZATCA_SANDBOX_TYPES = {
  developer: "developer",
  simulation: "simulation",
};

export const ZATCA_SANDBOX_TYPES_KEYS = Object.keys(ZATCA_SANDBOX_TYPES);

export const API_IDS_NAMES = {
  POST_ZATCA_COMPLIANCE_CSID: "POST_ZATCA_COMPLIANCE_CSID",
  POST_INITIAL_INVOICES: "POST_INITIAL_INVOICES",
  FETCH_FINAL_CSID: "FETCH_FINAL_CSID",
  REPORT_ACTUAL_SIMPLIFIED_INVOICE: "REPORT_ACTUAL_SIMPLIFIED_INVOICE",
  REPORT_ACTUAL_STANDARD_INVOICE: "REPORT_ACTUAL_STANDARD_INVOICE",
  FETCH_INITIAL_CONFIG_SUPPLIERS: "FETCH_INITIAL_CONFIG_SUPPLIERS",
};

export const API_VALUES = {
  [API_IDS_NAMES.POST_ZATCA_COMPLIANCE_CSID]: "compliance",
  [API_IDS_NAMES.FETCH_FINAL_CSID]: {
    [ZATCA_SANDBOX_TYPES.developer]: "production/csids",
    [ZATCA_SANDBOX_TYPES.simulation]: "core/csids",
  },
  [API_IDS_NAMES.POST_INITIAL_INVOICES]: {
    [ZATCA_SANDBOX_TYPES.developer]: "compliance/invoices",
    [ZATCA_SANDBOX_TYPES.simulation]: "precompliance/invoice",
  },
  [API_IDS_NAMES.REPORT_ACTUAL_SIMPLIFIED_INVOICE]: "invoices/reporting/single",
  [API_IDS_NAMES.REPORT_ACTUAL_STANDARD_INVOICE]: "invoices/clearance/single",
  [API_IDS_NAMES.FETCH_INITIAL_CONFIG_SUPPLIERS]: "ex_zatca/zatca_config_file",
};

export const API_BASE_URLS = {
  ZATCA_DEV_PORTAL:
    "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal",
  ZATCA_SIMULATION: "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation",
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
  cnfFilePath: "certs/config.cnf",
};

export const ZATCA_INVOICE_TRANSACTION_TYPE_CODES = {
  CREDIT_NOTE: "381",
  DEBIT_NOTE: "383",
  PAYMENT_Transaction: "386",
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
  ATM: "48",
};
