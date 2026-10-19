import {test,expect} from '@playwright/test';
import {newGame,SAVE_KEY} from '../../public/game.js';
const saved=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE_KEY);
test('encomendas reais após o tutorial: colher, entregar uma vez e persistir pedido substituto',async({page})=>{
 await page.clock.install({time:new Date('2026-10-19T15:00:00Z')});await page.goto('/?view=classic');
 await page.locator('#open-goals').click();await expect(page.locator('[data-order]')).toHaveCount(3);await expect(page.locator('[data-deliver-order="0"]')).toBeDisabled();await page.locator('#close-modal').click();
 await page.locator('[data-plot="0"]').click();await page.clock.fastForward(31000);await page.locator('[data-plot="1"]').click();expect((await saved(page)).harvest.turnip).toBe(2);
 await page.locator('#order-prompt').click();await expect(page.locator('[data-deliver-order="0"]')).toBeEnabled();const before=await saved(page);await page.locator('[data-deliver-order="0"]').click();
 const after=await saved(page);expect(after.harvest.turnip).toBe(0);expect(after.coins).toBe(before.coins+38);expect(after.xp).toBe(before.xp+6);expect(after.orders.completed).toBe(1);await expect(page.locator('[data-deliver-order="0"]')).toHaveCount(0);await expect(page.locator('.delivery-receipt')).toContainText('+38 moedas');await expect(page.locator('[data-order]')).toHaveCount(3);
 await page.reload();expect((await saved(page)).orders).toEqual(after.orders);expect((await saved(page)).seeds).toEqual(before.seeds);await expect(page.locator('#quest-count')).toHaveText('1 entregue');
});
test('sementes não contam como encomenda; estoque do armazém também pode ser usado no moinho ou vendido',async({page})=>{
 const s=newGame();s.harvest.wheat=2;s.harvest.soybean=1;
 await page.addInitScript(([k,s])=>localStorage.setItem(k,JSON.stringify(s)),[SAVE_KEY,s]);await page.goto('/?view=classic');await page.locator('#open-goals').click();await expect(page.locator('[data-deliver-order="2"]')).toBeEnabled();await expect(page.locator('[data-deliver-order="0"]')).toBeDisabled();await page.locator('#close-modal').click();
 await page.locator('#open-mill').click();await page.locator('[data-craft-feed="poultry"]').click();await page.locator('#close-modal').click();await page.locator('#open-goals').click();await expect(page.locator('[data-deliver-order="2"]')).toBeDisabled();expect((await saved(page)).orders.completed).toBe(0);
});
test('mobile: encomendas legíveis, rolagem só no diálogo e HUD sem sobrepor o cartão',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/?view=classic');
 const boxes=await page.evaluate(()=>{const r=s=>{const b=document.querySelector(s).getBoundingClientRect();return{top:b.top,bottom:b.bottom};};return{nav:r('.topnav'),prompt:r('#order-prompt')};});expect(boxes.prompt.top).toBeGreaterThanOrEqual(boxes.nav.bottom);
 await page.locator('#order-prompt').click();await expect(page.locator('[data-order]')).toHaveCount(3);await page.locator('[data-order="2"]').scrollIntoViewIfNeeded();await expect(page.locator('[data-order="2"]')).toBeInViewport();expect(await page.locator('#modal').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('3D: fila mostra intenção e cancelamento preserva recursos; ação concluída exibe produto e XP',async({page})=>{
 test.setTimeout(90000);const now=Date.now(),s=newGame(now);for(const i of [2,16])s.plots[i]={...s.plots[i],unlocked:true,crop:'carrot',plantedAt:now,readyAt:now+30000,watered:false};
 await page.addInitScript(([k,s])=>{localStorage.setItem(k,JSON.stringify(s));document.addEventListener('click',e=>{if(e.target.closest('#cancel-queue'))window.beforeCancel=JSON.parse(localStorage.getItem(k));},{capture:true});},[SAVE_KEY,s]);await page.goto('/');const c=page.locator('#farm-canvas');
 await page.locator('[data-tool="water"]').click();await page.locator('[data-plot="16"]').click();await page.locator('[data-plot="2"]').click();await expect(page.locator('#task-queue')).toBeVisible();await expect(page.locator('#queue-items')).toContainText('Regar');await expect(c).toHaveAttribute('data-pending','2');
 await page.locator('#cancel-queue').click({timeout:5000});await expect(page.locator('#task-queue')).toBeHidden();await expect(c).toHaveAttribute('data-pending','0');const after=await saved(page);const beforeCancel=await page.evaluate(()=>window.beforeCancel);expect(after).toEqual(beforeCancel);expect(after.seeds).toEqual(s.seeds);expect(after.plots[2].watered).toBe(false);
 await page.locator('[data-tool="smart"]').click();await page.locator('[data-plot="0"]').click();await expect(c).toHaveAttribute('data-last-action','harvest',{timeout:25000});await expect(page.locator('.action-effect')).toContainText('+5 XP');await expect(page.locator('.action-effect .crop-icon')).toHaveCount(1);await expect.poll(()=>saved(page).then(s=>s.harvest.turnip)).toBe(1);
});
test('sons são opcionais, geram áudio após clique e conservam a preferência',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const Audio=window.AudioContext;if(!Audio)return;window.soundsStarted=0;window.AudioContext=class extends Audio{createOscillator(...args){window.soundsStarted++;return super.createOscillator(...args);}};});
 await page.goto('/?view=classic');await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','false');await page.locator('#sound-toggle').click();await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','true');await page.locator('[data-plot="0"]').click();expect(await page.evaluate(()=>window.soundsStarted)).toBeGreaterThan(0);await page.reload();await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','true');await page.locator('#sound-toggle').click();await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','false');expect(errors).toEqual([]);
});
test('3D: expansão e estágios permanecem sincronizados com o relógio e a exigência de água',async({page})=>{
 test.setTimeout(90000);const now=Date.parse('2026-10-19T15:00:00Z');await page.clock.install({time:new Date(now)});const s=newGame(now);s.plots[2]={...s.plots[2],crop:'carrot',plantedAt:now,readyAt:now+30000};
 await page.addInitScript(([k,s])=>{if(!localStorage.getItem(k))localStorage.setItem(k,JSON.stringify(s));},[SAVE_KEY,s]);await page.goto('/');const c=page.locator('#farm-canvas');await expect(page.locator('[data-plot="2"]')).toHaveAttribute('data-stage','seed');await expect(page.locator('.expansion-plaque')).toHaveCount(1);
 await page.clock.fastForward(86400000);await expect(page.locator('[data-plot="2"]')).toHaveAttribute('data-stage','seed');await page.locator('[data-tool="water"]').click();await page.locator('[data-plot="2"]').click();await expect(c).toHaveAttribute('data-last-action','water',{timeout:30000});expect((await saved(page)).water.amount).toBe(29);await expect(page.locator('[data-plot="2"]')).toHaveAttribute('data-stage','sprout');
 await page.clock.fastForward(10000);await expect(page.locator('[data-plot="2"]')).toHaveAttribute('data-stage','growing');await page.clock.fastForward(20000);await expect(page.locator('[data-plot="2"]')).toHaveAttribute('data-stage','ready');
 await page.locator('#open-expand').click();await page.locator('[data-expand]').click();await expect(page.locator('[data-plot="3"]')).toHaveAttribute('data-stage','empty');await expect(page.locator('[data-plot="7"]')).toHaveAttribute('data-stage','locked');await expect(page.locator('.expansion-plaque')).toHaveCount(1);await page.reload();await expect(page.locator('[data-plot="3"]')).toHaveAttribute('data-stage','empty');
});
