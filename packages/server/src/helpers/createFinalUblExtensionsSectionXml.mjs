/*
 *
 * Helper: `createFinalUblExtensionsSectionXml`.
 *
 */
import { createHash } from "crypto";

const createFinalUblExtensionsSectionXml = ({
  signTimestamp,
  certificateHash,
  certificateIssuer,
  certificateSerialNumber,
  invoiceHash,
  digitalSignature,
  cleanedCertificate,
}) => {
  const defaultUBLExtensionsSignedPropertiesForSigningXml = `<xades:SignedProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Id="xadesSignedProperties">
		<xades:SignedSignatureProperties>
			<xades:SigningTime>${signTimestamp}</xades:SigningTime>
			<xades:SigningCertificate>
				<xades:Cert>
					<xades:CertDigest>
						<ds:DigestMethod xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
						<ds:DigestValue xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${certificateHash}</ds:DigestValue>
					</xades:CertDigest>
					<xades:IssuerSerial>
						<ds:X509IssuerName xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${certificateIssuer}</ds:X509IssuerName>
						<ds:X509SerialNumber xmlns:ds="http://www.w3.org/2000/09/xmldsig#">${certificateSerialNumber}</ds:X509SerialNumber>
					</xades:IssuerSerial>
				</xades:Cert>
			</xades:SigningCertificate>
		</xades:SignedSignatureProperties>
</xades:SignedProperties>`;

  const signedPropertiesBytes = Buffer.from(
    defaultUBLExtensionsSignedPropertiesForSigningXml
  );
  let signedPropertiesHash = createHash("sha256")
    .update(signedPropertiesBytes)
    .digest("hex");

  signedPropertiesHash = Buffer.from(signedPropertiesHash).toString("base64");

  const ublSignatureSignedPropertiesXmlString = `<xades:SignedProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Id="xadesSignedProperties">
	<xades:SignedSignatureProperties>
			<xades:SigningTime>${signTimestamp}</xades:SigningTime>
			<xades:SigningCertificate>
					<xades:Cert>
							<xades:CertDigest>
									<ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"></ds:DigestMethod>
									<ds:DigestValue>${certificateHash}</ds:DigestValue>
							</xades:CertDigest>
							<xades:IssuerSerial>
									<ds:X509IssuerName>${certificateIssuer}</ds:X509IssuerName>
									<ds:X509SerialNumber>${certificateSerialNumber}</ds:X509SerialNumber>
							</xades:IssuerSerial>
					</xades:Cert>
			</xades:SigningCertificate>
	</xades:SignedSignatureProperties>
</xades:SignedProperties>`;

  const mainTemplate = `<ext:UBLExtension>
		<ext:ExtensionURI>urn:oasis:names:specification:ubl:dsig:enveloped:xades</ext:ExtensionURI>
		<ext:ExtensionContent>
			<sig:UBLDocumentSignatures xmlns:sac="urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2" xmlns:sbc="urn:oasis:names:specification:ubl:schema:xsd:SignatureBasicComponents-2" xmlns:sig="urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2">
				<sac:SignatureInformation>
					<cbc:ID>urn:oasis:names:specification:ubl:signature:1</cbc:ID>
					<sbc:ReferencedSignatureID>urn:oasis:names:specification:ubl:signature:Invoice</sbc:ReferencedSignatureID>
					<ds:Signature Id="signature" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
						<ds:SignedInfo>
							<ds:CanonicalizationMethod Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
							<ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256"/>
							<ds:Reference Id="invoiceSignedData" URI="">
								<ds:Transforms>
									<ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116">
										<ds:XPath>not(//ancestor-or-self::ext:UBLExtensions)</ds:XPath>
									</ds:Transform>
									<ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116">
										<ds:XPath>not(//ancestor-or-self::cac:Signature)</ds:XPath>
									</ds:Transform>
									<ds:Transform Algorithm="http://www.w3.org/TR/1999/REC-xpath-19991116">
										<ds:XPath>not(//ancestor-or-self::cac:AdditionalDocumentReference[cbc:ID='QR'])</ds:XPath>
									</ds:Transform>
									<ds:Transform Algorithm="http://www.w3.org/2006/12/xml-c14n11"/>
								</ds:Transforms>
								<ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
								<ds:DigestValue>${invoiceHash}</ds:DigestValue>
							</ds:Reference>
							<ds:Reference Type="http://www.w3.org/2000/09/xmldsig#SignatureProperties" URI="#xadesSignedProperties">
								<ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
								<ds:DigestValue>${signedPropertiesHash}</ds:DigestValue>
							</ds:Reference>
						</ds:SignedInfo>
						<ds:SignatureValue>${digitalSignature}</ds:SignatureValue>
						<ds:KeyInfo>
							<ds:X509Data>
								<ds:X509Certificate>${cleanedCertificate}</ds:X509Certificate>
							</ds:X509Data>
						</ds:KeyInfo>
						<ds:Object>
							<xades:QualifyingProperties Target="signature" xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">
								${ublSignatureSignedPropertiesXmlString}
							</xades:QualifyingProperties>
						</ds:Object>
					</ds:Signature>
				</sac:SignatureInformation>
			</sig:UBLDocumentSignatures>
		</ext:ExtensionContent>
	</ext:UBLExtension>`;

  return mainTemplate;
};

export default createFinalUblExtensionsSectionXml;
