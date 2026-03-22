const puppeteer = require('/home/ubuntu/.openclaw/workspace/luce-healing/memes/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

const MEMES_DIR = '/home/ubuntu/.openclaw/workspace/jewelry-site/memes';
const OUTPUT_DIR = '/home/ubuntu/.openclaw/workspace/jewelry-site/public/memes-gallery';

const memes = [
  { html: 'crystal-guide-amethyst.html', png: 'crystal-guide-amethyst.png' },
  { html: 'crystal-guide-rose-quartz.html', png: 'crystal-guide-rose-quartz.png' },
  { html: 'tips-manifesting.html', png: 'tips-manifesting.png' },
  { html: 'tips-choosing-crystal.html', png: 'tips-choosing-crystal.png' },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const meme of memes) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    const htmlPath = path.join(MEMES_DIR, meme.html);
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });

    // Clip just the 1080x1080 meme area
    const el = await page.$('.meme');
    const outPath = path.join(OUTPUT_DIR, meme.png);
    await el.screenshot({ path: outPath });
    console.log('✓ Rendered:', meme.png);
    await page.close();
  }

  await browser.close();
  console.log('All memes rendered!');
})();
