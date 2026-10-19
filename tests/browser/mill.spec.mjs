import {test,expect} from '@playwright/test';
import {newGame,SAVE_KEY} from '../../public/game.js';
const NOW=Date.parse('2026-10-19T15:00:00Z');
const saved=p=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
async function setup(page,view='classic',ingredients={}) {
 await page.clock.install({time:new Date(NOW)});await page.clock.pauseAt(new Date(NOW+1000));const s=newGame(NOW);s.coins=1200;s.xp=80;Object.assign(s.harvest,ingredients);
 await page.addInitScript(([key,s])=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));},[SAVE_KEY,s]);await page.goto(view==='classic'?'/?view=classic':'/');
}
test('soja colhida vira ração no moinho, termina offline e alimenta peixes sem gastar moedas',async({page})=>{
 await setup(page,'classic',{wheat:1});await page.locator('#open-mill').click();await expect(page.locator('[data-craft-feed="aquatic"]')).toBeDisabled();await page.locator('#close-modal').click();
 await page.locator('[data-seed="soybean"]').click();for(const i of [2,6])await page.locator(`[data-plot="${i}"]`).click();await page.locator('[data-tool="water"]').click();for(const i of [2,6])await page.locator(`[data-plot="${i}"]`).click();
 await page.clock.fastForward(46000);await page.locator('[data-tool="harvest"]').click();for(const i of [2,6])await page.locator(`[data-plot="${i}"]`).click();expect((await saved(page)).harvest.soybean).toBe(2);
 await page.locator('#open-mill').click();const before=await saved(page);await page.locator('[data-craft-feed="aquatic"]').click();const making=await saved(page);expect(making.harvest.soybean).toBe(0);expect(making.harvest.wheat).toBe(0);expect(making.seeds).toEqual(before.seeds);expect(making.coins).toBe(before.coins);
 await expect(page.locator('[data-collect-feed]')).toBeDisabled();await page.clock.fastForward(24000);await page.reload();await page.locator('#open-mill').click();await expect(page.locator('[data-collect-feed]')).toBeDisabled();await page.clock.fastForward(1000);await page.locator('[data-collect-feed]').click();expect((await saved(page)).feed.aquatic).toBe(3);await expect(page.locator('[data-collect-feed]')).toHaveCount(0);
 await page.locator('#close-modal').click();await page.locator('#open-pond').click();await page.locator('[data-buy-pond]').click();await page.locator('[data-buy-aquatic="fish"]').click();await page.clock.fastForward(300000);await expect(page.locator('.pond-status')).toContainText('Sem ração');const coins=(await saved(page)).coins;
 await page.locator('[data-feed-aquatic="0"]').click();expect((await saved(page)).coins).toBe(coins);expect((await saved(page)).feed.aquatic).toBe(2);await page.locator('[data-collect-aquatic="0"]').click();expect((await saved(page)).products.fish).toBe(4);await expect(page.locator('[data-collect-aquatic="0"]')).toBeDisabled();
});
test('ovelha aparece no aprisco, consome ração de alfafa e produz lã com coleta e venda',async({page})=>{
 test.setTimeout(60000);await setup(page,'3d',{alfalfa:2,wheat:1});await page.locator('#open-shop').click();await page.locator('[data-shop-tab="animals"]').click();await page.locator('[data-buy-animal="sheep"]').click();await page.locator('#close-modal').click();await expect(page.locator('[data-enclosure="sheep"]')).toHaveCount(1);
 await page.locator('[data-building="mill"]').focus();await page.keyboard.press('Enter');await page.locator('[data-craft-feed="livestock"]').click();await page.clock.fastForward(20000);await page.locator('[data-collect-feed]').click();expect((await saved(page)).feed.livestock).toBe(3);await page.locator('#close-modal').click();
 await page.clock.fastForward(400000);await page.locator('[data-animal="0"]').focus();await page.keyboard.press('Enter');await page.locator('[data-feed]').click();expect((await saved(page)).feed.livestock).toBe(2);await page.locator('[data-collect-animal]').click();expect((await saved(page)).products.wool).toBe(4);
 await page.locator('#close-modal').click();await page.locator('#open-storage').click();const coins=(await saved(page)).coins;await page.locator('[data-sell="wool"]').click();expect((await saved(page)).coins).toBe(coins+32+25);await page.reload();expect((await saved(page)).products.wool).toBe(3);expect((await saved(page)).animals[0].type).toBe('sheep');
});
test('moinho e ilustrações funcionam no celular sem recursos externos',async({page})=>{
 const external=[];page.on('request',r=>{if(r.url().startsWith('http')&&!r.isNavigationRequest())external.push(r.url());});await page.setViewportSize({width:390,height:844});await setup(page,'classic',{wheat:2,soybean:1});
 const images=await page.evaluate(async()=>Promise.all([document.querySelector('[data-seed="soybean"] image'),document.querySelector('[data-tool="water"] image')].map(async el=>{const img=new Image();img.src=el.getAttribute('href');await img.decode();return img.naturalWidth;})));expect(images.every(n=>n>=1000)).toBe(true);expect(external).toEqual([]);
 await page.locator('#open-mill').click();await page.locator('[data-craft-feed="poultry"]').click();await page.clock.fastForward(20000);await page.locator('[data-collect-feed]').click();expect((await saved(page)).feed.poultry).toBe(3);expect(await page.locator('#modal').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.locator('#close-modal').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
