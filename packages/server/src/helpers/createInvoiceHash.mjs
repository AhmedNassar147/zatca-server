/*
 *
 * Helper: `createInvoiceHash`.
 *
 */
import { createHash } from "crypto";
import { XmlCanonicalizer } from "xmldsigjs";
import xmldom from "xmldom";
import XMLDocument from "./xmlParser.mjs";

const getPureInvoiceString = (invoiceXml) => {
  const invoice_copy = new XMLDocument(invoiceXml.toString(false));
  invoice_copy.delete("Invoice/ext:UBLExtensions");
  invoice_copy.delete("Invoice/cac:Signature");
  invoice_copy.delete("Invoice/cac:AdditionalDocumentReference", {
    "cbc:ID": "QR",
  });

  const invoice_xml_dom = new xmldom.DOMParser().parseFromString(
    invoice_copy.toString(false)
  );

  const canonicalizer = new XmlCanonicalizer(false, false);
  const canonicalizedXmlStr = canonicalizer.Canonicalize(invoice_xml_dom);

  return canonicalizedXmlStr;
};

const createInvoiceHash = (invoiceXml) => {
  // A dumb workaround for whatever reason ZATCA XML devs decided to include those trailing spaces and a newlines. (without it the hash is incorrect)
  const pureInvoiceString = getPureInvoiceString(invoiceXml)
    .replace("<cbc:ProfileID>", "\n    <cbc:ProfileID>")
    .replace(
      "<cac:AccountingSupplierParty>",
      "\n    \n    <cac:AccountingSupplierParty>"
    );

  return createHash("sha256").update(pureInvoiceString).digest("base64");
};

export default createInvoiceHash;
