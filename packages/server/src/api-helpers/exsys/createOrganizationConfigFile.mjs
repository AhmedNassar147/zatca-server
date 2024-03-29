/*
 *
 * Helper: `createOrganizationConfigFile`.
 *
 */
import { writeFile } from "fs/promises";
import { createRootFolder } from "@zatca-server/helpers";
import createClientCerts from "./createClientCerts.mjs";

const createOrganizationConfigFile = async ({
  email,
  countryIdCode,
  vatName,
  organizationNo,
  genralOrganizationName,
  organizationUnitName,
  vatNumber,
  registeredAddress,
  businessCategory,
  invoiceKind,
  serialNumber,
}) => {
  const configString = `oid_section = OIDs
[ OIDs ]
certificateTemplateName= 1.3.6.1.4.1.311.20.2
[ req ]
default_bits        = 2048
emailAddress        = ${email}
req_extensions          = v3_req
x509_extensions         = v3_ca
prompt = no
default_md = sha256
req_extensions = req_ext
distinguished_name = dn


[ dn ]
C=${countryIdCode}
OU=${organizationUnitName}
O=${vatName}
CN=${genralOrganizationName || vatName}



[ v3_req ]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment

[req_ext]
certificateTemplateName = ASN1:PRINTABLESTRING:PREZATCA-Code-Signing
subjectAltName = dirName:alt_names


[alt_names]
SN=${serialNumber}
UID=${vatNumber}
title=${invoiceKind}
registeredAddress=${registeredAddress}
businessCategory=${businessCategory}
`;

  const folderPath = await createRootFolder(`certs/${organizationNo}`);

  await writeFile(`${folderPath}/config.cnf`, configString);
  await createClientCerts(folderPath);
};

export default createOrganizationConfigFile;
