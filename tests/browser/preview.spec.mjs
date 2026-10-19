import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('todas as entradas contêm a mesma versão autocontida',async()=>{
  const [root,publicEntry,bundle]=await Promise.all(['index.html','public/index.html','dist/JOGAR.html'].map(p=>readFile(new URL('../../'+p,import.meta.url),'utf8')));
  expect(root).toBe(bundle); expect(publicEntry).toBe(bundle);
  expect(root).not.toMatch(/<script[^>]+src=/);
  expect(root).not.toMatch(/<link[^>]+rel="stylesheet"/);
  expect(root).toContain('<style>');
});

for(const width of [980,390]) {
  test(`prévia isolada com ${width}px carrega visual e permite jogar sem CSS/JS externos`,async({page})=>{
    const html=await readFile(new URL('../../index.html',import.meta.url),'utf8');
    const errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(r.url().startsWith('http')&&!r.url().endsWith('/preview-host.html')) requests.push(r.url());});
    await page.route('**/preview-host.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><body style="margin:0"><iframe title="Prévia" sandbox="allow-scripts" style="border:0;width:100vw;height:100vh"></iframe></body></html>'}));
    await page.setViewportSize({width,height:950});
    await page.goto('/preview-host.html');
    await page.locator('iframe').evaluate((el,html)=>{el.srcdoc=html;},html);
    const preview=page.frameLocator('iframe');
    await expect(preview.locator('#farm [data-plot]')).toHaveCount(16);
    await expect(preview.locator('.layout')).toHaveCSS('display',width===390?'flex':'grid');
    await expect(preview.locator('.farm-stage')).toHaveCSS('position','relative');
    await expect(preview.locator('#save-status')).toContainText('Salvamento indisponível');
    await preview.locator('[data-plot="0"]').click();
    await preview.locator('#open-storage').click();
    await preview.locator('[data-sell-all]').click();
    await expect(preview.locator('.gold-pill')).toContainText('229');
    await preview.locator('#close-modal').click();
    await expect(preview.locator('#coins')).toHaveText('229');
    expect(errors).toEqual([]); expect(requests).toEqual([]);
    expect(await preview.locator('html').evaluate(el=>el.scrollWidth<=innerWidth)).toBe(true);
  });
}
