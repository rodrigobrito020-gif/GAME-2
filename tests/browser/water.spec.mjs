import {test,expect} from '@playwright/test';
import {newGame,action,SAVE_KEY} from '../../public/game.js';
const NOW=Date.parse('2026-10-19T15:00:00Z');
const saved=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE_KEY);
function fixture(amount=0){let s=action(newGame(NOW),'plant',{index:2,crop:'carrot'},NOW).state;s=action(s,'plant',{index:6,crop:'carrot'},NOW).state;s.water={amount,nextAt:NOW+120000};return s;}
async function start(page,state,view='classic'){
 await page.clock.install({time:new Date(NOW)});
 await page.addInitScript(([key,s])=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(s));},[SAVE_KEY,state]);
 await page.goto(view==='classic'?'/?view=classic':'/');
}
test('reserva de água no topo: bloqueio vazio, recarga de dois minutos e reload sem reiniciar',async({page})=>{
 await start(page,fixture());await expect(page.locator('#water-amount')).toHaveText('0');await expect(page.locator('#water-count')).toHaveText('0');await expect(page.locator('#water-refill')).toContainText('+1 em');
 const nextAt=(await saved(page)).water.nextAt;
 await page.locator('[data-tool="water"]').click();await page.locator('[data-plot="2"]').click();await expect(page.locator('#toast')).toContainText('Sem água');expect((await saved(page)).plots[2].watered).toBe(false);
 await page.clock.fastForward(60000);await page.reload();await expect(page.locator('#water-amount')).toHaveText('0');expect((await saved(page)).water.nextAt).toBe(nextAt);
 await page.clock.fastForward(60000);await expect(page.locator('#water-amount')).toHaveText('1');await expect(page.locator('#water-count')).toHaveText('1');
 await page.locator('[data-tool="water"]').click();await page.locator('[data-plot="2"]').click();await expect(page.locator('#water-amount')).toHaveText('0');expect((await saved(page)).plots[2].watered).toBe(true);expect((await saved(page)).water.nextAt).toBe(nextAt+120000);
 await page.clock.fastForward(3600000);await page.reload();await expect(page.locator('#water-amount')).toHaveText('30');await expect(page.locator('#water-refill')).toHaveText('Reserva cheia');expect((await saved(page)).water.nextAt).toBe(null);
});
test('save antigo recebe 30 águas; moedas e água ficam visíveis no topo do celular',async({page})=>{
 const old=newGame(NOW);delete old.water;old.coins=54321;old.seeds.carrot=15;
 await page.setViewportSize({width:390,height:844});await start(page,old);
 await expect(page.locator('#water-amount')).toHaveText('30');await expect(page.locator('#water-refill')).toHaveText('Reserva cheia');await expect(page.locator('#coins')).toHaveText('54.321');expect((await saved(page)).seeds.carrot).toBe(15);
 const positions=await page.evaluate(()=>{const coins=document.querySelector('.coins').getBoundingClientRect(),water=document.querySelector('#water-reserve').getBoundingClientRect(),hud=document.querySelector('.farm-hud').getBoundingClientRect();return {coins:{left:coins.left,right:coins.right,top:coins.top},water:{left:water.left,right:water.right,top:water.top},right:hud.right,overflow:document.documentElement.scrollWidth>innerWidth};});
 expect(positions.water.top).toBe(positions.coins.top);expect(positions.water.left).toBeGreaterThanOrEqual(positions.coins.right);expect(positions.water.right).toBeLessThanOrEqual(positions.right+1);expect(positions.overflow).toBe(false);
});
test('3D consome água no movimento e revalida a reserva entre duas regas enfileiradas',async({page})=>{
 test.setTimeout(60000);await start(page,fixture(1),'3d');const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.locator('[data-tool="water"]').click();await page.locator('[data-plot="2"]').click();await page.locator('[data-plot="6"]').click();
 expect((await saved(page)).water.amount).toBe(1);expect((await saved(page)).plots[2].watered).toBe(false);
 await expect(page.locator('#farm-canvas')).toHaveAttribute('data-completed','2',{timeout:25000});await expect(page.locator('#farm-canvas')).toHaveAttribute('data-action-phase','idle');
 const s=await saved(page);expect(s.water.amount).toBe(0);expect(s.plots[2].watered).toBe(true);expect(s.plots[6].watered).toBe(false);await expect(page.locator('#water-amount')).toHaveText('0');
 await page.clock.fastForward(120000);await expect(page.locator('#water-amount')).toHaveText('1');
 await page.locator('[data-plot="6"]').click();await expect(page.locator('#farm-canvas')).toHaveAttribute('data-completed','3',{timeout:20000});await expect(page.locator('#water-amount')).toHaveText('0');expect((await saved(page)).plots[6].watered).toBe(true);expect(errors).toEqual([]);
});
