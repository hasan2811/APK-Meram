const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Install resvg-js if not present
try {
    require('@resvg/resvg-js');
} catch (e) {
    execSync('npm install @resvg/resvg-js --no-save', { stdio: 'inherit' });
}

const { Resvg } = require('@resvg/resvg-js');

const assetsDir = path.join(__dirname, '..', 'Meram APK', 'assets');

// Base SVG - full icon (helm + goggles), viewBox 120x108 to fit both
const baseSVG = (width, height, padding = 10) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-padding} ${-padding} ${120 + padding * 2} ${108 + padding * 2}" width="${width}" height="${height}" fill="none">
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

const monoSVG = (width, height, padding = 10) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-padding} ${-padding} ${120 + padding * 2} ${108 + padding * 2}" width="${width}" height="${height}" fill="none">
  <g fill="#333333">
    <rect x="10" y="54" width="100" height="14" rx="7" />
    <path d="M 44 54 V 16 Q 60 8 76 16 V 54 Z" />
    <path d="M 36 54 V 28 A 22 28 0 0 0 16 54 Z" />
    <path d="M 84 54 V 28 A 22 28 0 0 1 104 54 Z" />
  </g>
  <g stroke="#333333" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M 34 76 H 86 A 10 10 0 0 1 96 86 V 88 A 10 10 0 0 1 86 98 H 70 A 10 10 0 0 0 50 98 H 34 A 10 10 0 0 1 24 88 V 86 A 10 10 0 0 1 34 76 Z" />
    <path d="M 12 82 V 92 M 108 82 V 92" />
  </g>
</svg>`;

function renderSVGtoPNG(svgString, outputPath, bgColor = 'white') {
    const resvg = new Resvg(svgString, {
        background: bgColor,
        fitTo: { mode: 'original' },
    });
    const png = resvg.render();
    const pngBuffer = png.asPng();
    fs.writeFileSync(outputPath, pngBuffer);
    console.log(`✅ Generated: ${path.basename(outputPath)} (${pngBuffer.length} bytes)`);
}

// 1. icon.png - 1024x1024, white bg
renderSVGtoPNG(baseSVG(1024, 1024, 60), path.join(assetsDir, 'icon.png'), 'white');

// 2. splash-icon.png - 1024x1024 (Expo scales it), white bg
renderSVGtoPNG(baseSVG(1024, 1024, 60), path.join(assetsDir, 'splash-icon.png'), 'white');

// 3. android-icon-foreground.png - 1024x1024, transparent
renderSVGtoPNG(baseSVG(1024, 1024, 100), path.join(assetsDir, 'android-icon-foreground.png'), 'transparent');

// 4. android-icon-monochrome.png - 1024x1024, white bg
renderSVGtoPNG(monoSVG(1024, 1024, 60), path.join(assetsDir, 'android-icon-monochrome.png'), 'white');

// 5. favicon.png - 256x256, white bg
renderSVGtoPNG(baseSVG(256, 256, 15), path.join(assetsDir, 'favicon.png'), 'white');

// 6. android-icon-background.png - solid white 1024x1024
const whiteSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="white"/></svg>`;
renderSVGtoPNG(whiteSVG, path.join(assetsDir, 'android-icon-background.png'), 'white');

console.log('\n🎉 All assets generated successfully!');
