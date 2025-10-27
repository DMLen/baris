const fs = require('fs').promises;
const readline = require('readline');
const phash = require('sharp-phash');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function hexToBinary(hex) {
  return hex.split('').map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join('');
}

async function main() {
  try {
    const imgPath = await question('Enter image path: ');
    rl.close();

    const buffer = await fs.readFile(imgPath.trim());
    const perceptualHash = await phash(buffer); // returns hex representation
    console.log('Perceptual Hash (hex):', perceptualHash);

    const binaryStr = hexToBinary(perceptualHash.replace(/^0x/, ''));
    console.log('Perceptual Hash (binary):', binaryStr);
  } catch (err) {
    rl.close();
    console.error('Error:', err.message || err);
    process.exitCode = 1;
  }
}

main();