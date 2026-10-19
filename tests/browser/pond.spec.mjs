import {test,expect} from '@playwright/test';
import * as THREE from 'three';
import {newGame,SAVE_KEY,POND,AQUACULTURE,action} from '../../public/game.js';
const NOW=Date.parse('2026-10-19T15:00:00Z');
const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
async function prepare(page,view='classic') {
  await page.clock.install({time:new Date(NOW)});
  const s=newGame(NOW);s.coins=2000;s.xp=80;
  await page.addInitScript(([key,s])=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));},[SAVE_KEY,s]);
  await page.goto(view==='classic'?'/?view=classic':'/');
}
for(const view of ['classic','3d'])test(`lago em ${view}: compra real, peixes, gaiolas, coleta, venda e persistência`,async({page})=>{
  test.setTimeout(60000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await prepare(page,view);
  await page.locator('#open-shop').click();await page.locator('[data-shop-tab="pond"]').click();await page.locator('[data-buy-pond]').click();
  expect((await saved(page)).coins).toBe(2000-POND.cost);
  await page.locator('[data-buy-aquatic="fish"]').click();await page.locator('[data-buy-aquatic="shrimp"]').click();
  expect((await saved(page)).coins).toBe(2000-POND.cost-AQUACULTURE.fish.cost-AQUACULTURE.shrimp.cost);
  await page.locator('#close-modal').click();
  if(view==='3d'){await expect(page.locator('#farm-canvas')).toHaveAttribute('data-pond-owned','true');await expect(page.locator('#farm-canvas')).toHaveAttribute('data-shrimp-cages','1');}
  await page.locator('[data-building="pond"]').focus();await page.keyboard.press('Enter');
  await expect(page.locator('#modal-title')).toHaveText('Seu lago');
  await expect(page.locator('[data-collect-aquatic="0"]')).toBeDisabled();
  await page.clock.fastForward(90000);await expect(page.locator('[data-collect-aquatic="1"]')).toBeEnabled();
  await page.locator('[data-collect-aquatic="0"]').click();await page.locator('[data-collect-aquatic="1"]').click();
  const collected=await saved(page);expect(collected.products.fish).toBe(1);expect(collected.products.shrimp).toBe(1);expect(collected.water.amount).toBe(30);
  await expect(page.locator('[data-collect-aquatic="1"]')).toBeDisabled();
  await page.locator('#close-modal').click();await page.locator('#open-storage').click();
  await page.locator('[data-sell="fish"]').click();await page.locator('[data-sell="shrimp"]').click();
  const sold=await saved(page);expect(sold.products.fish).toBe(0);expect(sold.products.shrimp).toBe(0);expect(sold.coins).toBe(collected.coins+24+38+25);
  await page.reload();expect((await saved(page)).pond).toEqual(collected.pond);expect((await saved(page)).coins).toBe(sold.coins);expect(errors).toEqual([]);
});
test('lago bloqueado por nível; ração esgota, coleta não repete e volta a produzir ao alimentar',async({page})=>{
  await page.clock.install({time:new Date(NOW)});await page.goto('/?view=classic');await page.locator('#open-pond').click();await expect(page.locator('[data-buy-pond]')).toBeDisabled();await expect(page.locator('.pond-offer')).toContainText('nível 2');
  let s=newGame(NOW);s.coins=1000;s.xp=80;s.feed.aquatic=1;s=action(s,'buyPond',{},NOW).state;s=action(s,'buyAquatic',{aquatic:'fish'},NOW).state;
  await page.evaluate(([key,s])=>localStorage.setItem(key,JSON.stringify(s)),[SAVE_KEY,s]);await page.reload();await page.clock.fastForward(10*60000);await page.locator('#open-pond').click();
  await expect(page.locator('.pond-status')).toContainText('Sem ração');await page.locator('[data-collect-aquatic="0"]').click();expect((await saved(page)).products.fish).toBe(4);
  await expect(page.locator('[data-collect-aquatic="0"]')).toBeDisabled();await page.locator('[data-feed-aquatic="0"]').click();await page.clock.fastForward(60000);await page.locator('[data-collect-aquatic="0"]').click();expect((await saved(page)).products.fish).toBe(5);
});
for(const view of ['classic','3d'])test(`lago e cartões cabem no celular em ${view}; compras e coleta mantêm botões acessíveis`,async({page})=>{
  test.setTimeout(60000);await page.setViewportSize({width:390,height:844});await prepare(page,view);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('#open-pond').click();await page.locator('[data-buy-pond]').click();await page.locator('[data-buy-aquatic="fish"]').click();await page.locator('[data-buy-aquatic="shrimp"]').click();
  await page.clock.fastForward(90000);await page.locator('[data-collect-aquatic="1"]').click();expect((await saved(page)).products.shrimp).toBe(1);
  expect(await page.locator('#modal').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.locator('#close-modal').click();await page.locator('#open-bag').click();await page.locator('[data-seed="carrot"]').click();await expect(page.locator('[data-seed="carrot"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('#zoom-in').click();await expect(page.locator('#zoom-out')).toBeEnabled();await page.locator('#zoom-out').click();
});
test('fazenda ampliada: caminha pelas quatro margens do lago sem entrar na água',async({page})=>{
  test.setTimeout(90000);await page.goto('/');const canvas=page.locator('#farm-canvas');await expect(canvas).toHaveAttribute('data-player-x',/.+/);
  const samples=[];
  // Chão livre nas quatro margens; a margem leste não usa o alvo clicável do telhado da casa.
  for(const [x,z] of [[-22.2,-10],[-15,-15.8],[-7.8,-13],[-18,-3.5]]) {
    const data=await canvas.evaluate(el=>({...el.dataset})),rect=await canvas.boundingBox(),halfW=Number(data.viewHalfWidth),halfH=Number(data.viewHalfHeight);
    const camera=new THREE.OrthographicCamera(-halfW,halfW,halfH,-halfH,.1,140),focus=new THREE.Vector3(Number(data.cameraFocusX),0,Number(data.cameraFocusZ));
    camera.position.copy(focus).add(new THREE.Vector3(24,32,34));camera.lookAt(focus);camera.updateMatrixWorld();
    const point=new THREE.Vector3(x,0,z).project(camera);await page.mouse.click(rect.x+(point.x+1)*rect.width/2,rect.y+(1-point.y)*rect.height/2);
    await expect.poll(async()=>{
      const p=await canvas.evaluate(el=>({x:Number(el.dataset.playerX),z:Number(el.dataset.playerZ)}));samples.push(p);
      return Math.hypot(p.x-x,p.z-z);
    },{timeout:25000,intervals:[100,150,200]}).toBeLessThan(.3);
  }
  expect(samples.some(p=>p.x<-17)).toBe(true);
  for(const p of samples)expect((p.x+15)**2/46.93+(p.z+10)**2/27.56).toBeGreaterThanOrEqual(.995);
});
