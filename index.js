require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

async function startAternosServer() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });
    await page.goto('https://aternos.org/accounts/', { waitUntil: 'networkidle2' });
    await page.type('#user', process.env.USERNAME);
    await page.type('#password', process.env.PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2' });

    const startButton = '#start';
    await page.waitForSelector(startButton);
    const isDisabled = await page.$eval(startButton, btn => btn.disabled);
    if (!isDisabled) await page.click(startButton);

    await browser.close();
    return 'Server start initiated.';
  } catch (err) {
    await browser.close();
    throw new Error('Failed to start server');
  }
}

async function checkServerStatus() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://aternos.org/go/', { waitUntil: 'networkidle2' });
    await page.goto('https://aternos.org/accounts/', { waitUntil: 'networkidle2' });
    await page.type('#user', process.env.USERNAME);
    await page.type('#password', process.env.PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.goto('https://aternos.org/server/', { waitUntil: 'networkidle2' });

    const statusText = await page.$eval('#statuslabel-label', el => el.textContent.trim());

    await browser.close();
    return `Server status: ${statusText}`;
  } catch (err) {
    await browser.close();
    throw new Error('Failed to check server status');
  }
}

app.get('/', (req, res) => res.send('Aternos Control Running'));
app.get('/start', async (req, res) => {
  try {
    const msg = await startAternosServer();
    res.send(msg);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
app.get('/status', async (req, res) => {
  try {
    const msg = await checkServerStatus();
    res.send(msg);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));