import 'dotenv/config';
import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import assert from 'node:assert/strict';
import { createHmac, randomBytes } from 'node:crypto';
if (process.env.DATABASE_URL !== 'file:./rebuild-validation.db') throw new Error('Only the dedicated disposable local database is allowed.');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:3100';
if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base)) throw new Error('Local server required.');
const db = new PrismaClient();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const a = await browser.newPage(); const b = await browser.newPage();
const suffix = Date.now(); const email = `actor-${suffix}@example.test`; const password = randomBytes(18).toString('base64url');
const errors = []; for (const page of [a,b]) page.on('pageerror', e => errors.push(e.message));
function totp(secret) {
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits='';
  for(const c of secret) bits += alphabet.indexOf(c).toString(2).padStart(5,'0');
  const key=Buffer.from((bits.match(/.{8}/g)||[]).map(b=>parseInt(b,2))); const counter=Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));
  const h=createHmac('sha1',key).update(counter).digest(); const offset=h[19]&15; return ((h.readUInt32BE(offset)&0x7fffffff)%1000000).toString().padStart(6,'0');
}
async function register(page, address) {
  await page.goto(`${base}/register`); await page.locator('[name=name]').fill('Local QA Actor'); await page.locator('[name=email]').fill(address); await page.locator('[name=password]').fill(password); await page.getByRole('button',{name:'Create account',exact:true}).click(); await page.waitForURL('**/profile', {timeout:60000});
}
try {
  await register(a,email); console.log('PASS signup and actor profile redirect');
  await a.locator('input[type=file]').first().setInputFiles('public/world/preview.png');
  await a.getByRole('img',{name:'Your uploaded headshot',exact:true}).waitFor();
  await a.reload(); await a.getByRole('img',{name:'Your uploaded headshot',exact:true}).waitFor(); console.log('PASS local headshot upload and persisted profile reference');
  const user = await db.user.findUniqueOrThrow({where:{email}});
  await a.goto(`${base}/verify?token=${user.verifyToken}`);
  assert.ok((await db.user.findUniqueOrThrow({where:{email}})).emailVerified); console.log('PASS verification token flow (local token, no email delivery claim)');
  await a.goto(`${base}/find/import`); await a.locator('[name=title]').fill(`Private QA role ${suffix}`); await a.locator('textarea[name=description]').fill('Local test role. No external application or contact.'); await a.getByRole('button',{name:'Save to my tracker',exact:true}).click(); await a.waitForURL('**/opportunities/**',{timeout:60000});
  const privateUrl=a.url(); await a.goto(`${base}/tracker`); await a.getByText(`Private QA role ${suffix}`,{exact:true}).waitFor(); console.log('PASS private import and tracker');
  await register(b,`other-${suffix}@example.test`); await b.goto(privateUrl); await b.getByText(/not found|couldn.t find/i).first().waitFor(); console.log('PASS cross-user private opportunity boundary');
  await a.goto(`${base}/dashboard`); assert.ok(!a.url().endsWith('/dashboard') || (await a.textContent('body')).match(/not authorized|access denied|forbidden/i)); console.log('PASS staff boundary');
  await a.goto(`${base}/settings`); await a.getByRole('button',{name:'Enable 2FA',exact:true}).click(); const key = await a.locator('code').first().textContent(); await a.locator('[name=code]').fill(totp(key)); await a.getByRole('button',{name:'Confirm',exact:true}).click(); await a.getByText('Save your recovery codes',{exact:true}).waitFor();
  const recovery = await a.locator('ul.font-mono li').first().textContent(); await a.getByRole('button',{name:'Sign out',exact:true}).click(); await a.waitForURL(base + '/');
  await a.goto(`${base}/login`); await a.locator('[name=email]').fill(email); await a.locator('[name=password]').fill(password); await a.getByRole('button',{name:'Sign in',exact:true}).click(); await a.locator('[name=code]').waitFor();
  // React resets successful action form fields; refill if necessary.
  await a.locator('[name=email]').fill(email); await a.locator('[name=password]').fill(password); await a.locator('[name=code]').fill(recovery.trim()); await a.getByRole('button',{name:'Verify & sign in',exact:true}).click(); await a.waitForURL('**/discover',{timeout:60000}); console.log('PASS MFA enrollment and recovery-code login');
  const resetPage = await browser.newPage();
  await resetPage.goto(`${base}/forgot-password`); await resetPage.locator('[name=email]').fill(email); await resetPage.getByRole('button',{name:'Send reset link',exact:true}).click();
  await resetPage.getByText(/If an account exists for that email/).waitFor();
  const resetUser=await db.user.findUniqueOrThrow({where:{email}}); assert.ok(resetUser.resetToken);
  await resetPage.goto(`${base}/reset-password?token=${resetUser.resetToken}`); await resetPage.locator('[name=password]').fill(password+'-new'); await resetPage.getByRole('button',{name:'Set new password',exact:true}).click(); await resetPage.getByText('Your password has been reset. You can sign in with your new password.',{exact:true}).waitFor();
  assert.equal((await db.user.findUniqueOrThrow({where:{email}})).resetToken,null); console.log('PASS password reset and token consumption (local, no email delivery claim)');
  assert.deepEqual(errors,[]);
} finally { await browser.close(); await db.$disconnect(); }
