import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary Connection...\n');
console.log('Configuration:');
console.log('- Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('- API Key:', process.env.CLOUDINARY_API_KEY);
console.log('- API Secret:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'NOT SET');
console.log('\n');

// Test connection by getting account usage
cloudinary.api.usage()
  .then(result => {
    console.log('✅ SUCCESS! Cloudinary connection is working!\n');
    console.log('Account Details:');
    console.log('- Plan:', result.plan);
    console.log('- Cloud Name:', result.cloud_name);
    console.log('- Storage Used:', (result.storage.usage / 1024 / 1024).toFixed(2), 'MB');
    console.log('- Bandwidth Used:', (result.bandwidth.usage / 1024 / 1024).toFixed(2), 'MB');
    console.log('- Resources:', result.resources);
    console.log('\nYour Cloudinary credentials are valid! ✅');
  })
  .catch(error => {
    console.log('❌ ERROR! Cloudinary connection failed!\n');
    console.log('Error Message:', error.message);
    console.log('HTTP Code:', error.http_code);
    console.log('\nPossible issues:');
    console.log('1. Check your Cloud Name, API Key, and API Secret in .env file');
    console.log('2. Make sure your Cloudinary account is active');
    console.log('3. Verify credentials at: https://cloudinary.com/console');
  });
