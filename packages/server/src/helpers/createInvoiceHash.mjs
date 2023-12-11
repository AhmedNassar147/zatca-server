/*
 *
 * Helper: `createInvoiceHash`.
 *
 */
import { createHash } from "crypto";
import { XmlCanonicalizer } from "xmldsigjs";
import xmldom from "xmldom";
import XMLDocument from "./xmlParser.mjs";
// import { writeFileSync } from "fs";

const getPureInvoiceString = (invoiceXml) => {
  const invoiceCopy = new XMLDocument(invoiceXml.toString());

  invoiceCopy.delete("Invoice/ext:UBLExtensions");
  invoiceCopy.delete("Invoice/cac:Signature");
  invoiceCopy.delete("Invoice/cac:AdditionalDocumentReference", {
    "cbc:ID": "QR",
  });

  const invoiceXmlDom = new xmldom.DOMParser().parseFromString(
    invoiceCopy.toString()
  );

  const canonicalizer = new XmlCanonicalizer(false, false);
  const canonicalizedXmlStr = canonicalizer.Canonicalize(invoiceXmlDom);

  return canonicalizedXmlStr;
};

const createInvoiceHash = (invoiceXml) => {
  // A dumb workaround for whatever reason ZATCA XML devs decided to include those trailing spaces and a newlines. (without it the hash is incorrect)
  const pureInvoiceString = getPureInvoiceString(invoiceXml);

  // writeFileSync("", pureInvoiceString);
  // .replace("<cbc:ProfileID>", "\n    <cbc:ProfileID>")
  // .replace(
  //   "<cac:AccountingSupplierParty>",
  //   "\n    \n    <cac:AccountingSupplierParty>"
  // );

  return createHash("sha256").update(pureInvoiceString).digest("base64");
};

export default createInvoiceHash;
