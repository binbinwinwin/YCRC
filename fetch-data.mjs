/**
 * 一次性資料抓取腳本
 * 用 Puppeteer（真 Chrome）從 travel.taipei 抓景點和分類資料
 * 存到 public/api/ 供 Angular 靜態讀取，完全不需要 proxy
 *
 * 執行：node fetch-data.mjs
 */
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { writeFileSync, mkdirSync } from 'fs';

// Stealth 插件：隱藏 headless Chrome 特徵，繞過 Cloudflare bot 偵測
puppeteerExtra.use(StealthPlugin());

const BASE = 'https://www.travel.taipei/open-api/zh-tw';
const OUTPUT = './public/api';

mkdirSync(OUTPUT, { recursive: true });

/** 用 page.goto + request interception 強制送 Accept: application/json */
async function fetchJson(browser, url) {
  const page = await browser.newPage();
  try {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      req.continue({
        headers: { ...req.headers(), Accept: 'application/json' },
      });
    });
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const text = await response.text();
    return JSON.parse(text);
  } finally {
    await page.close();
  }
}

const browser = await puppeteerExtra.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ],
});

try {
  // ── 分類 ─────────────────────────────────────────────────
  console.log('抓分類...');
  const catRaw = await fetchJson(browser, `${BASE}/Miscellaneous/Categories?type=Attractions`);
  const categories = Array.isArray(catRaw) ? catRaw : (catRaw?.data ?? []);
  writeFileSync(`${OUTPUT}/categories.json`, JSON.stringify(categories));
  console.log(`✔ categories.json（${categories.length} 筆）`);

  // ── 景點：先抓第一頁拿 total ──────────────────────────────
  console.log('抓景點第 1 頁...');
  const firstPage = await fetchJson(browser, `${BASE}/Attractions/All?page=1`);
  const total = firstPage.total ?? 0;
  const pageSize = 30;
  const totalPages = Math.ceil(total / pageSize);
  console.log(`  共 ${total} 筆，${totalPages} 頁`);

  const allAttractions = [...(firstPage.data ?? [])];

  // ── 抓剩餘頁數 ───────────────────────────────────────────
  for (let p = 2; p <= totalPages; p++) {
    console.log(`抓景點第 ${p}/${totalPages} 頁...`);
    const res = await fetchJson(browser, `${BASE}/Attractions/All?page=${p}`);
    allAttractions.push(...(res.data ?? []));
  }

  writeFileSync(`${OUTPUT}/attractions.json`, JSON.stringify(allAttractions));
  console.log(`✔ attractions.json（${allAttractions.length} 筆）`);

} finally {
  await browser.close();
}

console.log('\n完成！資料已存至 public/api/');
