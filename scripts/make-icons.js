const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(process.cwd(), 'public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

function makeSvg(size, maskable) {
  const radius = maskable ? 0 : Math.round(size * 0.2);
  const fontSize = Math.round(size * 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#2563eb"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="white">💊</text>
</svg>`;
}

async function main() {
  const configs = [
    { size: 192, name: 'icon-192.png', maskable: false },
    { size: 512, name: 'icon-512.png', maskable: false },
    { size: 512, name: 'icon-512-maskable.png', maskable: true },
    { size: 180, name: 'apple-touch-icon.png', maskable: false },
    { size: 32, name: 'favicon-32.png', maskable: false },
  ];

  for (const config of configs) {
    const svgBuffer = Buffer.from(makeSvg(config.size, config.maskable), 'utf8');
    const outPath = path.join(iconsDir, config.name);
    await sharp(svgBuffer).resize(config.size, config.size).png().toFile(outPath);
    console.log('Created:', config.name, '(' + config.size + 'x' + config.size + ')');
  }
  console.log('\nAll PWA icons created in public/icons/');
}

main().catch(console.error);
