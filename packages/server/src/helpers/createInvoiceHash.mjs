/*
 *
 * Helper: `createInvoiceHash`.
 *
 */
import { createHash } from "crypto";
import { XmlCanonicalizer } from "xmldsigjs";
import xmldom from "xmldom";
import { writeFile } from "fs/promises";
import XMLDocument from "./xmlParser.mjs";

const getPureInvoiceString = async (invoiceXml) => {
  const invoiceCopy = new XMLDocument(invoiceXml.toString());

  invoiceCopy.delete("Invoice/ext:UBLExtensions");
  invoiceCopy.delete("Invoice/cbc:UBLVersionID");
  invoiceCopy.delete("Invoice/cac:Signature");
  invoiceCopy.delete("Invoice/cac:AdditionalDocumentReference", {
    "cbc:ID": "QR",
  });

  await writeFile(`results/getPureInvoiceString.xml`, invoiceCopy.toString());

  const invoiceXmlDom = new xmldom.DOMParser().parseFromString(
    invoiceCopy.toString()
  );

  const canonicalizer = new XmlCanonicalizer(false, false);
  const canonicalizedXmlStr = canonicalizer.Canonicalize(invoiceXmlDom);

  return canonicalizedXmlStr;
};

const createInvoiceHash = async (invoiceXml) => {
  // A dumb workaround for whatever reason ZATCA XML devs decided to include those trailing spaces and a newlines. (without it the hash is incorrect)
  let pureInvoiceString = await getPureInvoiceString(invoiceXml);

  pureInvoiceString = pureInvoiceString.replace(
    "<cbc:ProfileID>",
    "\n    <cbc:ProfileID>"
  );
  pureInvoiceString = pureInvoiceString.replace(
    "<cac:AccountingSupplierParty>",
    "\n    \n    <cac:AccountingSupplierParty>"
  );

  return createHash("sha256").update(pureInvoiceString).digest("base64");
};

export default createInvoiceHash;
