const puppeteer = require('/home/ubuntu/.openclaw/workspace/luce-healing/memes/node_modules/puppeteer');
const path = require('path');

const MEMES_DIR = '/home/ubuntu/.openclaw/workspace/jewelry-site/memes';
const OUTPUT_DIR = '/home/ubuntu/.openclaw/workspace/jewelry-site/public/memes-gallery';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080 });
  const htmlPath = path.join(MEMES_DIR, 'chakra-crystal-pairings-meme.html');
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });

  const el = await page.$('.meme');
  const outPath = path.join(OUTPUT_DIR, 'chakra-crystal-pairings-meme.png');
  await el.screenshot({ path: outPath });
  console.log('✓ Rendered: chakra-crystal-pairings-meme.png');

  await page.close();
  await browser.close();
})();
