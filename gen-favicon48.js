const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 128 116" width="48" height="48" fill="none">
  <g fill="#3B82F6">
    <rect x="10" y="54" width="100" height="14" rx="7" />
    <path d="M 44 54 V 16 Q 60 8 76 16 V 54 Z" />
    <path d="M 36 54 V 28 A 22 28 0 0 0 16 54 Z" />
    <path d="M 84 54 V 28 A 22 28 0 0 1 104 54 Z" />
  </g>
  <g stroke="#10B981" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M 34 76 H 86 A 10 10 0 0 1 96 86 V 88 A 10 10 0 0 1 86 98 H 70 A 10 10 0 0 0 50 98 H 34 A 10 10 0 0 1 24 88 V 86 A 10 10 0 0 1 34 76 Z" />
    <path d="M 12 82 V 92 M 108 82 V 92" />
  </g>
</svg>`;

const resvg = new Resvg(svg, { background: 'white' });
const pngBuffer = resvg.render().asPng();

// 1. Save to assets folder
fs.writeFileSync(path.join(__dirname, 'assets', 'favicon-48.png'), pngBuffer);
console.log('assets/favicon-48.png:', pngBuffer.length, 'bytes');

// 2. Save to Expo web cache path
const cachePath = path.join(__dirname, '.expo', 'web', 'cache', 'production', 'images', 'favicon',
    'favicon-a4e030697a7571b3e95d31860e4da55d2f98e5e861e2b55e414f45a8556828ba-contain-transparent');

if (fs.existsSync(cachePath)) {
    fs.writeFileSync(path.join(cachePath, 'favicon-48.png'), pngBuffer);
    console.log('Cache favicon-48.png updated!');
} else {
    fs.mkdirSync(cachePath, { recursive: true });
    fs.writeFileSync(path.join(cachePath, 'favicon-48.png'), pngBuffer);
    console.log('Cache dir created and favicon-48.png written!');
}
