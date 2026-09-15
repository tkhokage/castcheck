import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.PREVIEW_URL || 'http://127.0.0.1:3100';
await mkdir('artifacts/landing', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.on('pageerror', e => errors.push(e.message));
try {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByRole('heading', { level: 1 }).waitFor();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'artifacts/landing/desktop.png' });
  assert.equal(await page.locator('canvas').count(), 1);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; const el = document.getElementById('actor-journey'); window.scrollTo(0, el.offsetTop + el.offsetHeight - innerHeight); });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'artifacts/landing/arrival.png' });
  await page.getByRole('button', { name: 'Pause scene motion' }).click();
  await page.getByRole('button', { name: 'Enable scene motion' }).waitFor();
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  mobile.on('pageerror', e => errors.push(e.message));
  await mobile.goto(base, { waitUntil: 'networkidle' });
  await mobile.screenshot({ path: 'artifacts/landing/mobile.png', fullPage: true });
  assert.equal(await mobile.locator('canvas').count(), 0);
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Mobile must not overflow horizontally');
  await mobile.getByRole('link', { name: 'Find your next role', exact: true }).click();
  await mobile.waitForURL('**/discover');
  assert.deepEqual(errors, []);
  console.log('PASS desktop 3D, arrival, pause, reduced motion, mobile width and discovery navigation');
} finally { await browser.close(); }
