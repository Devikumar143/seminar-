const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate a cryptographically secure random token for QR code
 */
function generateRegistrationToken() {
  return 'SEM-PASS-' + crypto.randomBytes(16).toString('hex').toUpperCase();
}

/**
 * Generate a unique registration ID formatted like REG-2026-XXXXX
 */
let regCounter = 1000;
function generateRegistrationId() {
  regCounter++;
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `REG-2026-${regCounter}-${hex}`;
}

/**
 * Generate a unique certificate ID formatted like CERT-2026-XXXXX
 */
let certCounter = 1000;
function generateCertificateId() {
  certCounter++;
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CERT-2026-${certCounter}-${hex}`;
}

/**
 * Generate QR Code as Base64 Data URL
 * @param {string} text Content to encode in QR
 */
async function generateQRCodeDataURL(text) {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 300,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}

/**
 * Generate QR Code as SVG string
 */
async function generateQRCodeSVG(text) {
  try {
    return await QRCode.toString(text, {
      type: 'svg',
      margin: 2,
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    throw err;
  }
}

module.exports = {
  generateRegistrationToken,
  generateRegistrationId,
  generateCertificateId,
  generateQRCodeDataURL,
  generateQRCodeSVG,
};
