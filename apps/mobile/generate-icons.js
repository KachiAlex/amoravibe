#!/usr/bin/env node
/**
 * Generate mobile app icons from source image
 * Creates PNG icons in the required sizes for Android and favicon
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceImage = path.join(__dirname, '../../apps/web/public/amoravibe.jpg');
const assetsDir = path.join(__dirname, 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const icons = [
  {
    name: 'icon.png',
    size: 1024,
    description: 'Main app icon (1024x1024)'
  },
  {
    name: 'adaptive-icon.png',
    size: 1080,
    description: 'Android adaptive icon foreground (1080x1080)'
  },
  {
    name: 'splash-icon.png',
    size: 1024,
    description: 'Splash screen icon (1024x1024)'
  },
  {
    name: 'favicon.png',
    size: 192,
    description: 'Web favicon (192x192)'
  }
];

console.log('🎨 Generating mobile app icons from amoravibe.jpg...\n');

async function generateIcons() {
  try {
    for (const icon of icons) {
      const outputPath = path.join(assetsDir, icon.name);

      console.log(`Generating ${icon.description}...`);
      
      // Use PNG format with transparency support
      await sharp(sourceImage)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 } // White background for logo
        })
        .png({ quality: 90 })
        .toFile(outputPath);

      console.log(`✅ Created: ${icon.name}\n`);
    }

    console.log('🎉 All icons generated successfully!');
    console.log('\nIcons created in apps/mobile/assets/');
    console.log('Ready to build APK!');

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();
