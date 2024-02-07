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
  production: "production",
};

export const ZATCA_INVOICE_TYPE_CODE = {
  STANDARD: "0100000",
  SIMPLIFIED: "0200000",
};

export const ZATCA_SANDBOX_TYPES_KEYS = Object.keys(ZATCA_SANDBOX_TYPES);

export const API_IDS_NAMES = {
  FETCH_INITIAL_CONFIG_SUPPLIERS: "FETCH_INITIAL_CONFIG_SUPPLIERS",
  FETCH_ZATCA_INITIAL_CSID: "FETCH_ZATCA_INITIAL_CSID",
  FETCH_INVOICE_DATA_FOR_INITIAL_COMPLIANCE:
    "FETCH_INVOICE_DATA_FOR_INITIAL_COMPLIANCE",
  FETCH_ZATCA_PRODUCTION_CSID: "FETCH_ZATCA_PRODUCTION_CSID",
  POST_ZATCA_INITIAL_INVOICES: "POST_ZATCA_INITIAL_INVOICES",
  POST_ZATCA_FINIAL_INVOICES: "POST_ZATCA_FINIAL_INVOICES",

  CHECK_IS_CURRENT_CLIENT_CERTIFIED: "CHECK_IS_CURRENT_CLIENT_CERTIFIED",
  POST_IF_CLIENT_CERTIFIED: "POST_IF_CLIENT_CERTIFIED",

  FETCH_EXSYS_QR_INVOICE_DATA: "FETCH_EXSYS_QR_INVOICE_DATA",
  POST_INVOICE_DATA_QR_RESULT_TO_EXSYS: "POST_INVOICE_DATA_QR_RESULT_TO_EXSYS",

  FETCH_INVOICE_DATA: "FETCH_INVOICE_DATA",
  POST_REPORTED_INVOICE_DATA_TO_EXSYS: "POST_REPORTED_INVOICE_DATA_TO_EXSYS",
};

export const API_BASE_URLS = {
  ZATCA_BASE_URL: "https://gw-fatoora.zatca.gov.sa/e-invoicing",
};

export const API_VALUES = {
  [API_IDS_NAMES.FETCH_ZATCA_INITIAL_CSID]: {
    // https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/compliance
    [ZATCA_SANDBOX_TYPES.developer]: "developer-portal/compliance",
    // https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/compliance
    [ZATCA_SANDBOX_TYPES.simulation]: "simulation/compliance",
    // https://gw-fatoora.zatca.gov.sa/e-invoicing/core/compliance
    [ZATCA_SANDBOX_TYPES.production]: "core/compliance",
  },
  // https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/compliance/invoices
  [API_IDS_NAMES.POST_ZATCA_INITIAL_INVOICES]: {
    // https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/compliance/invoices
    [ZATCA_SANDBOX_TYPES.developer]: "developer-portal/compliance/invoices",
    // https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/compliance/invoices
    [ZATCA_SANDBOX_TYPES.simulation]: "simulation/compliance/invoices",
    // https://gw-fatoora.zatca.gov.sa/e-invoicing/core/compliance/invoices
    [ZATCA_SANDBOX_TYPES.production]: "core/compliance/invoices",
  },
  [API_IDS_NAMES.FETCH_ZATCA_PRODUCTION_CSID]: {
    // https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/production/csids
    [ZATCA_SANDBOX_TYPES.developer]: "developer-portal/production/csids",
    // https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/core/csids
    [ZATCA_SANDBOX_TYPES.simulation]: "simulation/core/csids",
    // https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/production/csids
    [ZATCA_SANDBOX_TYPES.production]: "simulation/production/csids",
  },
  [API_IDS_NAMES.POST_ZATCA_FINIAL_INVOICES]: {
    [ZATCA_SANDBOX_TYPES.developer]: {
      // https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/invoices/reporting/single
      [ZATCA_INVOICE_TYPE_CODE.SIMPLIFIED]:
        "developer-portal/invoices/reporting/single",
      // https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal/core/invoices/clearance/single
      [ZATCA_INVOICE_TYPE_CODE.STANDARD]:
        "developer-portal/invoices/clearance/single",
    },
    [ZATCA_SANDBOX_TYPES.simulation]: {
      // https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/invoices/reporting/single
      [ZATCA_INVOICE_TYPE_CODE.SIMPLIFIED]:
        "simulation/invoices/reporting/single",
      // https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation/invoices/clearance/single
      [ZATCA_INVOICE_TYPE_CODE.STANDARD]:
        "simulation/invoices/clearance/single",
    },
    [ZATCA_SANDBOX_TYPES.production]: {
      // https://gw-fatoora.zatca.gov.sa/e-invoicing/core/invoices/reporting/single
      [ZATCA_INVOICE_TYPE_CODE.SIMPLIFIED]: "core/invoices/reporting/single",
      // https://gw-fatoora.zatca.gov.sa/e-invoicing/core/invoices/clearance/single
      [ZATCA_INVOICE_TYPE_CODE.STANDARD]: "core/invoices/clearance/single",
    },
  },

  // ----------------------------- exsys --------------------------------------------------------

  // http://149.102.140.8:9090/ords/exsys_api/ex_zatca/zatca_config_file
  [API_IDS_NAMES.FETCH_INITIAL_CONFIG_SUPPLIERS]: "ex_zatca/zatca_config_file",
  // http://149.102.140.8:9090/ords/exsys_api/ex_zatca/get_initial_invoice_compliance
  [API_IDS_NAMES.FETCH_INVOICE_DATA_FOR_INITIAL_COMPLIANCE]:
    "ex_zatca/get_initial_invoice_compliance",
  // http://149.102.140.8:9090/ords/exsys_api/ex_zatca/is_zatca_certified?authorization=111111
  [API_IDS_NAMES.CHECK_IS_CURRENT_CLIENT_CERTIFIED]:
    "ex_zatca/is_zatca_certified",
  // http://149.102.140.8:9090/ords/exsys_api/ex_zatca/zatca_certified_dml
  [API_IDS_NAMES.POST_IF_CLIENT_CERTIFIED]: "ex_zatca/zatca_certified_dml",
  // http://149.102.140.8:9090/ords/exsys_api/ex_zatca/zatca_invoice_not_send
  [API_IDS_NAMES.FETCH_INVOICE_DATA]: "ex_zatca/zatca_invoice_not_send",
  // http://149.102.140.8:9090/ords/exsys_api/ex_zatca/zatca_invoice_response_dml
  [API_IDS_NAMES.POST_REPORTED_INVOICE_DATA_TO_EXSYS]:
    "ex_zatca/zatca_invoice_response_dml",
  // http://149.102.140.8:9090/ords/exsys_api/ex_zatca/zatca_invoice_create_qr
  [API_IDS_NAMES.FETCH_EXSYS_QR_INVOICE_DATA]:
    "ex_zatca/zatca_invoice_create_qr",
  // http://149.102.140.8:9090/ords/exsys_api/ex_zatca/zatca_invoice_qr_dml
  [API_IDS_NAMES.POST_INVOICE_DATA_QR_RESULT_TO_EXSYS]:
    "ex_zatca/zatca_invoice_qr_dml",
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

export const ZATCA_INVOICE_TRANSACTION_TYPE_CODES = {
  CREDIT_NOTE: "381",
  DEBIT_NOTE: "383",
  PAYMENT_Transaction: "386",
  TAX_INVOICE: "388",
};

// 11.2.5 Payment means type code
export const ZATCA_PAYMENT_METHODS = {
  CASH: "10",
  CREDIT: "30",
  BANK_ACCOUNT: "42",
  ATM: "48",
};
