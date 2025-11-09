import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

let TOTP_SECRET = process.env.TOTP_SECRET;

// If no secret exists, generate one
if (!TOTP_SECRET) {
  console.log('🔑 No TOTP_SECRET found. Generating a new secret...');
  TOTP_SECRET = speakeasy.generateSecret({
    length: 32,
    name: 'MineBlocks Site',
    issuer: 'MineBlocks',
  }).base32;
  
  console.log('\n📝 Add this to your .env.local file:');
  console.log(`TOTP_SECRET=${TOTP_SECRET}`);
  console.log('\n⚠️  IMPORTANT: Save this secret! You\'ll need it for production deployment.');
}

// Generate QR code data
const serviceName = 'MineBlocks Site';
const accountName = 'Team Access';

const otpauthUrl = speakeasy.otpauthURL({
  secret: TOTP_SECRET!,
  label: `${serviceName}:${accountName}`,
  issuer: serviceName,
  encoding: 'base32',
});

// Generate QR code image
const outputPath = path.join(process.cwd(), 'qr-code.png');

QRCode.toFile(outputPath, otpauthUrl, {
  errorCorrectionLevel: 'M',
  type: 'png',
  width: 300,
  margin: 2,
}, (err) => {
  if (err) {
    console.error('❌ Error generating QR code:', err);
    process.exit(1);
  }
  
  console.log('\n✅ QR code generated successfully!');
  console.log(`📁 Saved to: ${outputPath}`);
  console.log('\n📱 Share this QR code with your team members.');
  console.log('   They can scan it with Google Authenticator or any TOTP app.');
  if (TOTP_SECRET) {
    console.log('\n🔐 Secret (for reference):', TOTP_SECRET);
  }
});
