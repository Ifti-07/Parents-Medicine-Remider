const fs = require('fs');
const path = require('path');

// Generate SVG icons for the medicine reminder app
// Eye drop / medical theme with clean design

function createIconSVG(size, maskable = false) {
  const padding = maskable ? size * 0.12 : size * 0.08;
  const innerSize = size - (padding * 2);
  const cx = size / 2;
  const cy = size / 2;
  
  // Colors
  const bg = '#2563eb'; // blue-600
  const dropColor = '#ffffff';
  const dropShadow = '#93c5fd'; // blue-300
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.22}" fill="${bg}"/>
  
  <!-- Eye drop bottle body -->
  <g transform="translate(${cx}, ${cy})">
    <!-- Bottle body -->
    <ellipse cx="0" cy="${innerSize * 0.08}" rx="${innerSize * 0.22}" ry="${innerSize * 0.3}" fill="white" opacity="0.95"/>
    
    <!-- Bottle cap/nozzle -->
    <rect x="${-innerSize * 0.1}" y="${-innerSize * 0.42}" width="${innerSize * 0.2}" height="${innerSize * 0.18}" rx="${innerSize * 0.04}" fill="white" opacity="0.9"/>
    
    <!-- Nozzle tip -->
    <circle cx="0" cy="${-innerSize * 0.42}" r="${innerSize * 0.045}" fill="${dropShadow}"/>
    
    <!-- Drop falling -->
    <ellipse cx="${innerSize * 0.0}" cy="${innerSize * 0.46}" 
      rx="${innerSize * 0.08}" ry="${innerSize * 0.11}" 
      fill="${dropColor}" opacity="0.9"/>
    <polygon 
      points="${innerSize * -0.08},${innerSize * 0.4} ${innerSize * 0.08},${innerSize * 0.4} 0,${innerSize * 0.28}" 
      fill="${dropColor}" opacity="0.9"/>
  </g>
</svg>`;
  
  return svg;
}

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Save SVG icons (will be used as-is since we can't run canvas without native deps)
const sizes = [192, 512];
for (const size of sizes) {
  const svg = createIconSVG(size, false);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), svg);
  console.log(`Created icon-${size}.svg`);
}

// Maskable
const svgMaskable = createIconSVG(512, true);
fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.svg'), svgMaskable);
console.log('Created icon-512-maskable.svg');

// Also create apple touch icon
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), createIconSVG(180, false));
console.log('Created apple-touch-icon.svg');

console.log('\nSVG icons created in public/icons/');
console.log('NOTE: For production PNG icons, convert these SVGs using:');
console.log('  npx svgexport public/icons/icon-192.svg public/icons/icon-192.png 192:192');
console.log('  npx svgexport public/icons/icon-512.svg public/icons/icon-512.png 512:512');
console.log('Or use any online SVG to PNG converter.');
