import {test,expect} from '@playwright/test';
import * as THREE from 'three';
import {newGame,SAVE_KEY,POND,AQUACULTURE,action} from '../../public/game.js';
const NOW=Date.parse('2026-10-19T15:00:00Z');
const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
async function prepare(page,view='classic'){
 await page.clock.install({time:new Date(NOW)});const s=newGame(NOW);s.coins=2000;s.xp=80;s.feed.aquatic=1;
 await page.addInitScript(([key,s])=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));},[SAVE_KEY,s]);await page.goto(view==='classic'?'/?view=classic':'/');
}
for(const view of ['classic','3d'])test(`viveiros em ${view}: escolhe espécie no espaço clicado, coleta, vende e persiste`,async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await prepare(page,view);
 await page.locator('#open-pond').click();await page.locator('[data-buy-pond]').click();await expect(page.locator('[data-choose-pond-slot]')).toHaveCount(16);await page.locator('#close-modal').click();
 await page.locator('[data-pond-cell="10"]').click();await expect(page.locator('.pond-selection')).toContainText('viveiro 11');await page.locator('[data-buy-aquatic="fish"]').click();
 expect((await saved(page)).pond.stock[0].slot).toBe(10);await expect(page.locator('[data-pond-cell="10"]')).toHaveAttribute('aria-label',/peixes/);await page.locator('[data-choose-pond-slot="15"]').click();await page.locator('[data-buy-aquatic="shrimp"]').click();
 const bought=await saved(page);expect(bought.pond.stock.map(a=>[a.slot,a.type])).toEqual([[10,'fish'],[15,'shrimp']]);expect(bought.coins).toBe(2000-POND.cost-AQUACULTURE.fish.cost-AQUACULTURE.shrimp.cost);
 await expect(page.locator('[data-collect-aquatic="1"]')).toBeDisabled();await page.clock.fastForward(90000);await page.locator('[data-collect-aquatic="1"]').click();await expect(page.locator('[data-collect-aquatic="1"]')).toBeDisabled();
 await page.locator('[data-choose-pond-slot="10"]').click();await page.locator('[data-collect-aquatic="0"]').click();const collected=await saved(page);expect(collected.products.fish).toBe(1);expect(collected.products.shrimp).toBe(1);expect(collected.water.amount).toBe(30);
 await page.locator('#close-modal').click();await page.locator('#open-storage').click();await page.locator('[data-sell="fish"]').click();await page.locator('[data-sell="shrimp"]').click();const sold=await saved(page);expect(sold.coins).toBe(collected.coins+24+38+25);
 await page.reload();expect((await saved(page)).pond).toEqual(collected.pond);expect((await saved(page)).coins).toBe(sold.coins);expect(errors).toEqual([]);
});
test('viveiros no celular: seleção, bloqueio por nível, compras e alimentação após esgotar ração',async({page})=>{
 await page.setViewportSize({width:390,height:844});await prepare(page);await page.locator('#open-pond').click();await page.locator('[data-buy-pond]').click();await page.locator('[data-choose-pond-slot="8"]').click();await page.locator('[data-buy-aquatic="fish"]').click();await page.clock.fastForward(10*60000);
 await expect(page.locator('.pond-status')).toContainText('Sem ração');await page.locator('[data-collect-aquatic="0"]').click();expect((await saved(page)).products.fish).toBe(4);await page.locator('[data-feed-aquatic="0"]').click();await page.clock.fastForward(60000);await page.locator('[data-collect-aquatic="0"]').click();expect((await saved(page)).products.fish).toBe(5);
 expect(await page.locator('#modal').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.locator('#close-modal').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('lago novo continua exigindo nível 2',async({page})=>{
 await page.goto('/?view=classic');await page.locator('#open-pond').click();await expect(page.locator('[data-buy-pond]')).toBeDisabled();await expect(page.locator('.pond-offer')).toContainText('nível 2');
});
test('caminha pelas quatro margens do lago quadrado sem entrar na água',async({page})=>{
 test.setTimeout(120000);await page.goto('/');const canvas=page.locator('#farm-canvas');await expect(canvas).toHaveAttribute('data-player-x',/.+/);const samples=[];
 for(const [x,z]of[[-22.55,-10],[-16,-16.6],[-8.9,-12.8],[-20.4,-3.4]]){
  const data=await canvas.evaluate(el=>({...el.dataset})),rect=await canvas.boundingBox(),halfW=Number(data.viewHalfWidth),halfH=Number(data.viewHalfHeight);
  const camera=new THREE.OrthographicCamera(-halfW,halfW,halfH,-halfH,.1,140),focus=new THREE.Vector3(Number(data.cameraFocusX),0,Number(data.cameraFocusZ));camera.position.copy(focus).add(new THREE.Vector3(24,32,34));camera.lookAt(focus);camera.updateMatrixWorld();const point=new THREE.Vector3(x,0,z).project(camera);
  await page.mouse.click(rect.x+(point.x+1)*rect.width/2,rect.y+(1-point.y)*rect.height/2);await expect(page.locator('#modal')).toBeHidden();
  await expect.poll(async()=>{const p=await canvas.evaluate(el=>({x:Number(el.dataset.playerX),z:Number(el.dataset.playerZ)}));samples.push(p);return Math.hypot(p.x-x,p.z-z);},{timeout:30000,intervals:[100,200]}).toBeLessThan(.3);
 }
 for(const p of samples)expect(Math.abs(p.x-POND.x)>=POND.size/2+.1||Math.abs(p.z-POND.z)>=POND.size/2+.1).toBe(true);
});
