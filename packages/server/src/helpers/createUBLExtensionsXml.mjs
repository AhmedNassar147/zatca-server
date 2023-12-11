/*
 *
 * Helper: `createUBLExtensionsXml`.
 *
 */
const createUBLExtensionsXml = ({
  signTimestamp,
  certificateHash,
  certificateIssuer,
  certificateSerialNumber,
}) => {
  const defaultUBLExtensionsXml = `<xades:SignedProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Id="xadesSignedProperties">
  <xades:SignedSignatureProperties>
    <xades:SigningTime>${signTimestamp}</xades:SigningTime>
    <xades:SigningCertificate>
      <xades:Cert>
        <xades:CertDigest>
          <ds:DigestMethod
            xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
            <ds:DigestValue xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
              ${certificateHash}
            </ds:DigestValue>
          </xades:CertDigest>
          <xades:IssuerSerial>
            <ds:X509IssuerName xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
              ${certificateIssuer}
            </ds:X509IssuerName>
            <ds:X509SerialNumber xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
              ${certificateSerialNumber}
            </ds:X509SerialNumber>
          </xades:IssuerSerial>
        </xades:Cert>
      </xades:SigningCertificate>
    </xades:SignedSignatureProperties>
  </xades:SignedProperties>`;

  // don't change the spaces
  const ublExtensionsAfterSigningXml = `  <xades:SignedProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Id="xadesSignedProperties">
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

  return {
    defaultUBLExtensionsXml,
    ublExtensionsAfterSigningXml,
  };
};

export default createUBLExtensionsXml;
