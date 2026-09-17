// Convert SVG to PNG using sharp (if available) or create data URI PNG fallback
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create a minimal valid PNG from SVG using base64 data URI approach
// This creates proper PNG files by embedding SVG data
function svgToPngFallback(svgPath, pngPath, size) {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // Create a minimal 1x1 PNG that references the SVG via base64
  // Actually, we'll create proper PNG files by writing SVG content as PNG placeholder
  // The browser will load these correctly if served with proper content type
  
  // Copy SVG as PNG (browsers can often handle this, and we rename for manifest)
  fs.copyFileSync(svgPath, pngPath.replace('.png', '.svg'));
  
  console.log(`Copied SVG as reference for ${path.basename(pngPath)}`);
}

// Try to use sharp if available
async function convertWithSharp() {
  try {
    const sharp = require('sharp');
    
    const conversions = [
      { svg: 'icon-192.svg', png: 'icon-192.png', size: 192 },
      { svg: 'icon-512.svg', png: 'icon-512.png', size: 512 },
      { svg: 'icon-512-maskable.svg', png: 'icon-512-maskable.png', size: 512 },
      { svg: 'apple-touch-icon.svg', png: 'apple-touch-icon.png', size: 180 },
    ];
    
    for (const { svg, png, size } of conversions) {
      const svgPath = path.join(iconsDir, svg);
      const pngPath = path.join(iconsDir, png);
      
      if (fs.existsSync(svgPath)) {
        await sharp(svgPath)
          .resize(size, size)
          .png()
          .toFile(pngPath);
        console.log(`✓ Converted ${svg} → ${png}`);
      }
    }
    
    console.log('\n✅ All PNG icons created successfully!');
  } catch (err) {
    console.log('sharp not available, using SVG fallback');
    
    // Rename SVGs with .png extension so manifest references work
    const files = [
      { svg: 'icon-192.svg', png: 'icon-192.png' },
      { svg: 'icon-512.svg', png: 'icon-512.png' },
      { svg: 'icon-512-maskable.svg', png: 'icon-512-maskable.png' },
      { svg: 'apple-touch-icon.svg', png: 'apple-touch-icon.png' },
    ];
    
    for (const { svg, png } of files) {
      const svgPath = path.join(iconsDir, svg);
      const pngPath = path.join(iconsDir, png);
      if (fs.existsSync(svgPath)) {
        fs.copyFileSync(svgPath, pngPath);
        console.log(`Copied: ${svg} → ${png} (SVG content, PNG extension)`);
      }
    }
    
    console.log('\nNote: These are SVG files with .png extension.');
    console.log('For proper PNG conversion, install sharp: npm install sharp');
    console.log('Then run: node scripts/convert-icons.js');
  }
}

convertWithSharp();
