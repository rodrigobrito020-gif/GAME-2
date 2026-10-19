import {test,expect} from '@playwright/test';
import * as THREE from 'three';
import {newGame,action,SAVE_KEY} from '../../public/game.js';
test.setTimeout(60000);
const saved=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE_KEY);
const position=p=>p.locator('#farm-canvas').evaluate(c=>({x:Number(c.dataset.playerX),z:Number(c.dataset.playerZ)}));
test('escolhe fazendeira, move por WASD e por clique no chão; aparência e itens persistem',async({page})=>{
 test.setTimeout(90000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');const before=await saved(page);
 await page.locator('#edit-farm').click();await expect(page.locator('.farmer-choices label')).toHaveCount(2);const still=await position(page);await page.keyboard.press('w');expect(await position(page)).toEqual(still);
 await page.locator('input[name="farmer"][value="female"]').check();await page.locator('#rename-form button').click();await expect(page.locator('#farm-canvas')).toHaveAttribute('data-farmer-style','female');await expect(page.locator('#farmer-avatar')).toHaveText('👩🏻‍🌾');
 const after=await saved(page);expect(after.seeds).toEqual(before.seeds);expect(after.coins).toBe(before.coins);expect(after.water).toEqual(before.water);
 const initial=await position(page);await page.keyboard.down('a');await page.waitForTimeout(600);await page.keyboard.up('a');await expect(page.locator('#farm-canvas')).toHaveAttribute('data-action-phase','idle');const walked=await position(page);expect(Math.hypot(walked.x-initial.x,walked.z-initial.z)).toBeGreaterThan(.3);
 // Clique num trecho livre do caminho principal, usando a projeção atual.
 const farm=page.locator('#farm'),rect=await farm.boundingBox(),d=await page.locator('#farm-canvas').evaluate(c=>({...c.dataset}));const camera=new THREE.OrthographicCamera(-Number(d.viewHalfWidth),Number(d.viewHalfWidth),Number(d.viewHalfHeight),-Number(d.viewHalfHeight),.1,140),focus=new THREE.Vector3(Number(d.cameraFocusX),0,Number(d.cameraFocusZ));camera.position.copy(focus).add(new THREE.Vector3(24,32,34));camera.lookAt(focus);camera.updateMatrixWorld();const point=new THREE.Vector3(2.4,0,11).project(camera);await page.mouse.click(rect.x+(point.x+1)*rect.width/2,rect.y+(1-point.y)*rect.height/2);await expect.poll(async()=>{const p=await position(page);return Math.hypot(p.x-walked.x,p.z-walked.z);},{timeout:20000}).toBeGreaterThan(1);await expect(page.locator('#farm-canvas')).toHaveAttribute('data-action-phase','idle',{timeout:20000});
 await page.reload();await expect(page.locator('#farm-canvas')).toHaveAttribute('data-farmer-style','female');expect((await saved(page)).seeds).toEqual(before.seeds);expect(errors).toEqual([]);
});
test('andar cancela uma rega pendente sem gastar água; personagem chega ao canteiro depois de ser movido',async({page})=>{
 const now=Date.now(),s=action(newGame(now),'plant',{index:2,crop:'carrot'},now).state;
 await page.addInitScript(([k,s])=>{if(!localStorage.getItem(k))localStorage.setItem(k,JSON.stringify(s));},[SAVE_KEY,s]);await page.goto('/');await page.locator('[data-tool="water"]').click();await page.locator('[data-plot="2"]').click();
 await expect(page.locator('#farm-canvas')).toHaveAttribute('data-action-phase','walking');await page.keyboard.down('a');await page.waitForTimeout(200);await page.keyboard.up('a');await expect(page.locator('#farm-canvas')).toHaveAttribute('data-action-phase','idle');await expect(page.locator('#farm-canvas')).toHaveAttribute('data-pending','0');expect((await saved(page)).water.amount).toBe(30);expect((await saved(page)).plots[2].watered).toBe(false);
 await page.locator('[data-plot="2"]').click();await expect(page.locator('#water-amount')).toHaveText('29',{timeout:20000});expect((await saved(page)).plots[2].watered).toBe(true);
});
for(const view of ['3d','classic'])test(`expansão destacada e botão dedicado liberam o terreno correto em ${view}`,async({page})=>{
 await page.goto(view==='classic'?'/?view=classic':'/');await expect(page.locator('.plot.locked')).toHaveCount(45);await expect(page.locator('#expansion-cost')).toHaveText('100');
 if(view==='3d'){await expect(page.locator('.expansion-plaque')).toHaveCount(1);await expect(page.locator('[data-plot="3"] .expansion-plaque')).toContainText('100 moedas');await expect(page.locator('[data-plot="3"]')).toHaveAttribute('aria-label',/100 moedas/);}
 else await expect(page.locator('[data-plot="3"]')).toContainText('EXPANDIR');
 await page.locator('#open-expand').click();await expect(page.locator('.expansion-price')).toContainText('100');await page.locator('[data-expand]').click();await expect(page.locator('#plot-count')).toHaveText('10 canteiros');await expect(page.locator('.plot.locked')).toHaveCount(44);expect((await saved(page)).plots[3].unlocked).toBe(true);await expect(page.locator('#expansion-cost')).toHaveText('175');
 await page.locator('#open-expand').click();await expect(page.locator('[data-expand]')).toBeDisabled();
});
