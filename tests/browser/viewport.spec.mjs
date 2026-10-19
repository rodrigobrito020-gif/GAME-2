import {test,expect} from '@playwright/test';
const key='game2-sitio-aurora-v1';
const saved=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
for(const [width,height] of [[1440,900],[390,844],[844,390]])test(`fazenda ocupa ${width}x${height}, sem rolagem; recursos no alto à direita e sementes contextuais`,async({page})=>{
 await page.setViewportSize({width,height});await page.goto('/?view=classic');
 await expect(page.locator('#seed-section')).toBeHidden();
 const layout=await page.evaluate(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};return {stage:box('.farm-stage'),coins:box('.coins'),water:box('#water-reserve'),scroll:document.documentElement.scrollHeight>innerHeight||document.documentElement.scrollWidth>innerWidth};});
 expect(layout.stage).toMatchObject({x:0,y:0,width,height});expect(layout.scroll).toBe(false);expect(layout.water.right).toBeGreaterThan(width-25);expect(layout.coins.x).toBeGreaterThan(width*.45);expect(layout.water.y).toBeLessThan(25);expect(layout.coins.y).toBe(layout.water.y);
 const before=await saved(page);await page.locator('[data-plot="2"]').click();await expect(page.locator('#seed-title')).toContainText('canteiro 3');await expect(page.locator('[data-seed="carrot"]')).toBeVisible();await page.keyboard.press('Escape');expect((await saved(page)).seeds).toEqual(before.seeds);expect((await saved(page)).plots[2].crop).toBe(null);
 await page.locator('[data-plot="6"]').click();await page.locator('[data-seed="wheat"]').click();await expect(page.locator('#seed-section')).toBeHidden();const planted=await saved(page);expect(planted.plots[6].crop).toBe('wheat');expect(planted.plots[2].crop).toBe(null);expect(planted.seeds.wheat).toBe(before.seeds.wheat-1);
 expect(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('arraste esquerdo sobre a plantação move só a câmera, mantém posição e não vira clique; depois permite plantar',async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?performance=1');const canvas=page.locator('#farm-canvas');await expect(canvas).toHaveAttribute('data-player-x',/.+/);
 const read=()=>canvas.evaluate(c=>({x:Number(c.dataset.cameraFocusX),z:Number(c.dataset.cameraFocusZ),px:Number(c.dataset.playerX),pz:Number(c.dataset.playerZ)}));
 await expect.poll(()=>canvas.evaluate(c=>Number(c.dataset.drawCalls)),{timeout:15000}).toBeLessThan(140);
 await page.evaluate(()=>window.originalPlotNodes=[...document.querySelectorAll('[data-plot]')]);
 const before=await saved(page),position=await read(),r=await page.locator('[data-plot="0"] polygon').boundingBox();
 await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width/2+150,r.y+r.height/2+60,{steps:6});await page.mouse.up();
 expect(await page.evaluate(()=>window.originalPlotNodes.every(node=>node===document.querySelector(`[data-plot="${node.dataset.plot}"]`)))).toBe(true);
 const after=await read();expect(Math.hypot(after.x-position.x,after.z-position.z)).toBeGreaterThan(1);expect(after.px).toBe(position.px);expect(after.pz).toBe(position.pz);await expect(canvas).toHaveAttribute('data-pending','0');await expect(page.locator('#seed-section')).toBeHidden();await expect(page.locator('#modal')).toBeHidden();
 expect((await saved(page)).seeds).toEqual(before.seeds);expect((await saved(page)).harvest).toEqual(before.harvest);expect((await saved(page)).coins).toBe(before.coins);
 await page.waitForTimeout(750);const settled=await read();expect(settled.x).toBe(after.x);expect(settled.z).toBe(after.z);
 // O botão direito não desloca a câmera.
 await page.mouse.move(700,400);await page.mouse.down({button:'right'});await page.mouse.move(780,430,{steps:4});await page.mouse.up({button:'right'});expect((await read()).x).toBe(after.x);
 await page.locator('[data-plot="2"]').click();await expect(page.locator('#seed-section')).toBeVisible();await page.locator('[data-seed="carrot"]').click();await expect(canvas).toHaveAttribute('data-last-action','plant',{timeout:20000});await expect(canvas).toHaveAttribute('data-action-phase','idle',{timeout:10000});expect((await saved(page)).plots[2].crop).toBe('carrot');expect((await saved(page)).seeds.carrot).toBe(before.seeds.carrot-1);expect(errors).toEqual([]);
});
test('o seletor bloqueia atalhos do mapa, permite teclado e a loja continua acessível',async({page})=>{
 await page.goto('/?view=classic');await page.locator('[data-plot="2"]').focus();await page.keyboard.press('Enter');await page.keyboard.press('3');await expect(page.locator('[data-tool="smart"]')).toHaveAttribute('aria-pressed','true');await page.locator('[data-seed="carrot"]').focus();await page.keyboard.press('Enter');expect((await saved(page)).plots[2].crop).toBe('carrot');
 await page.locator('[data-plot="6"]').click();await page.locator('#seed-shop').click();await expect(page.locator('#seed-section')).toBeHidden();await expect(page.locator('#modal-title')).toHaveText('Loja da fazenda');await page.locator('[data-buy="carrot"]').click();expect((await saved(page)).seeds.carrot).toBe(6);await page.keyboard.press('Escape');await page.locator('[data-plot="6"]').click();await expect(page.locator('#seed-title')).toContainText('canteiro 7');
});
