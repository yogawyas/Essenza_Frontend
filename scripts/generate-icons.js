const sharp = require('sharp');
const path = require('path');

const source = path.resolve(__dirname, '../assets/icon/Icon_Essenza.png');

const sizes = [
  { folder: 'mipmap-mdpi',    size: 48  },
  { folder: 'mipmap-hdpi',    size: 72  },
  { folder: 'mipmap-xhdpi',   size: 96  },
  { folder: 'mipmap-xxhdpi',  size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function generate() {
  for (const { folder, size } of sizes) {
    const dest = path.resolve(
      __dirname,
      `../android/app/src/main/res/${folder}/ic_launcher.png`
    );
    const destRound = path.resolve(
      __dirname,
      `../android/app/src/main/res/${folder}/ic_launcher_round.png`
    );

    await sharp(source).resize(size, size).toFile(dest);
    await sharp(source).resize(size, size).toFile(destRound);

    console.log(`✓ ${folder}: ${size}x${size}`);
  }
  console.log('\nDone! All icons generated.');
}

generate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
