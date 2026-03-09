const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const out = path.join(__dirname, 'puppeteer-screenshot.png');
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    const args = msg.args();
    Promise.all(args.map(a => a.jsonValue().catch(() => a.toString()))).then(values => {
      console.log('PAGE LOG:', msg.type(), ...values);
    });
  });

  page.on('pageerror', (err) => console.error('PAGE ERROR:', err.stack || err.toString()));

  await page.goto('http://localhost:8000/', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.setViewport({ width: 1400, height: 900 });
  const sheets = await page.evaluate(() => Array.from(document.styleSheets).map(s => s.href || '[inline]'));
  console.log('Stylesheets:', sheets);
  const comp = await page.evaluate(() => {
    const s = window.getComputedStyle(document.body);
    return { background: s.backgroundImage || s.background, font: s.fontFamily };
  });
  console.log('Computed body styles:', comp);
  await page.screenshot({ path: out, fullPage: true });
  console.log('Screenshot saved to', out);

  // capture outerHTML for body for quick inspection
  const bodyHTML = await page.evaluate(() => document.body.outerHTML);
  fs.writeFileSync(path.join(__dirname, 'puppeteer-body.html'), bodyHTML);
  console.log('Saved body HTML to puppeteer-body.html');

  await browser.close();
})();
