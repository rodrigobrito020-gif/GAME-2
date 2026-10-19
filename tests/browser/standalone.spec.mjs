import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
test('HTML independente joga, salva e não faz requisições externas',async({page})=>{
  execFileSync(process.execPath,['build.mjs'],{cwd:fileURLToPath(new URL('../../',import.meta.url))});
  const errors=[], network=[];
  page.on('pageerror',e=>errors.push(e.message));
  // file:// é bloqueado pela política do Chromium deste ambiente. Testa o mesmo
  // arquivo completo por HTTP, sem fornecer nenhum arquivo auxiliar.
  const html=await readFile(new URL('../../dist/JOGAR.html',import.meta.url),'utf8');
  await page.route('**/standalone.html',route=>route.fulfill({contentType:'text/html',body:html}));
  page.on('request',req=>{if(/^https?:/.test(req.url())&&!req.url().endsWith('/standalone.html')) network.push(req.url());});
  await page.goto('/standalone.html');
  await expect(page.locator('#coins')).toHaveText('160');
  await page.locator('[data-plot="0"]').click(); await page.locator('#open-storage').click(); await page.locator('[data-sell-all]').click(); await page.locator('#close-modal').click();
  await expect(page.locator('#coins')).toHaveText('229');
  await page.reload(); await expect(page.locator('#coins')).toHaveText('229');
  expect(errors).toEqual([]); expect(network).toEqual([]);
});
