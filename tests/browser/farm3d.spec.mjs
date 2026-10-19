import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test.use({hasTouch:true});
test.setTimeout(60000);
const key='game2-sitio-aurora-v1';
const saved=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
const canvas=p=>p.locator('#farm-canvas');
async function finish(page){await expect.poll(()=>canvas(page).evaluate(c=>c.dataset.actionPhase==='idle'&&c.dataset.pending==='0'),{timeout:25000}).toBe(true);}
async function perform(page,type,index,crop='turnip'){await page.locator(`[data-tool="${type}"]`).click();await page.locator(`[data-plot="${index}"]`).click();if(type==='plant')await page.locator(`[data-seed="${crop}"]`).click();await expect(canvas(page)).not.toHaveAttribute('data-pending','0');await finish(page);}
test('3D real: cesta, percurso e colheita somente no movimento, sem duplicar cliques',async({page})=>{
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.isNavigationRequest())requests.push(r.url());});
 await page.goto('/');await expect(canvas(page)).toHaveAttribute('data-renderer','three');await expect(page.locator('[data-plot]')).toHaveCount(54);
 await page.locator('[data-plot="0"]').dblclick();expect((await saved(page)).harvest.turnip).toBe(0);
 await expect(canvas(page)).toHaveAttribute('data-action-phase','walking');await expect(canvas(page)).toHaveAttribute('data-held-tool','harvest');
 await expect(canvas(page)).toHaveAttribute('data-action-phase','acting',{timeout:12000});await finish(page);
 expect((await saved(page)).harvest.turnip).toBe(1);await expect(canvas(page)).toHaveAttribute('data-completed','1');
 await page.locator('#open-storage').click();await page.locator('[data-sell-all]').click();await page.locator('#close-modal').click();await expect(page.locator('#coins')).toHaveText('225');
 await page.reload();await expect(page.locator('#coins')).toHaveText('225');expect(errors).toEqual([]);expect(requests).toEqual([]);
});
test('3D: semear, regador, crescimento offline, capina, pulverizador, adubo e colheita',async({page})=>{
 test.setTimeout(120000);await page.clock.install({time:new Date('2026-10-19T15:00:00Z')});await page.goto('/');
 await perform(page,'plant',2,'carrot');expect((await saved(page)).plots[2].crop).toBe('carrot');
 await page.clock.fastForward(86400_000);await page.reload();await expect(page.locator('[data-plot="2"]')).toHaveClass(/dry/);
 await page.locator('[data-tool="harvest"]').click();await page.locator('[data-plot="2"]').click();await expect(canvas(page)).toHaveAttribute('data-completed','0');expect((await saved(page)).harvest.carrot).toBe(0);
 await perform(page,'water',2);expect((await saved(page)).plots[2].watered).toBe(true);await expect(canvas(page)).toHaveAttribute('data-last-action','water');
 await perform(page,'fertilize',2);expect((await saved(page)).supplies.fertilizer).toBe(2);
 await page.clock.fastForward(21000);await perform(page,'weed',2);await perform(page,'spray',2);await perform(page,'harvest',2);expect((await saved(page)).harvest.carrot).toBe(2);
 await page.reload();expect((await saved(page)).harvest.carrot).toBe(2);
});
test('3D: fila de tarefas mantém ferramenta original e não repete recompensas',async({page})=>{
 await page.goto('/');await page.locator('[data-tool="plant"]').click();await page.locator('[data-plot="2"]').click();await page.locator('[data-seed="turnip"]').click();await page.locator('[data-plot="6"]').click();await page.locator('[data-seed="turnip"]').click();await page.locator('[data-tool="water"]').click();
 await finish(page);const s=await saved(page);expect(s.stats.planted).toBe(2);expect(s.seeds.turnip).toBe(4);expect(s.plots[2].watered).toBe(false);expect(s.plots[6].watered).toBe(false);await expect(canvas(page)).toHaveAttribute('data-completed','2');await expect(canvas(page)).toHaveAttribute('data-held-tool','water');
});
test('3D: zoom por botões e scroll mantém canteiros clicáveis e expansão',async({page})=>{
 await page.goto('/');await page.locator('#zoom-in').click();await expect(page.locator('#farm')).toHaveAttribute('data-zoom','1.2');
 await page.locator('[data-plot="3"]').click();await page.locator('[data-expand]').click();await expect(page.locator('#plot-count')).toHaveText('10 canteiros');
 await page.locator('#farm').dispatchEvent('wheel',{deltaY:100});await expect(page.locator('#farm')).toHaveAttribute('data-zoom',String(1.2-.1));
 await perform(page,'plant',3);expect((await saved(page)).plots[3].crop).toBe('turnip');
});
test('3D: criação de galinha, alimentação e coleta usam estado real',async({page})=>{
 await page.clock.install({time:new Date('2026-10-19T15:00:00Z')});await page.goto('/');await page.locator('#open-shop').click();await page.locator('[data-shop-tab="animals"]').click();await page.locator('[data-buy-animal="chicken"]').click();await page.locator('#close-modal').click();
 await page.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));s.feed.poultry=1;localStorage.setItem(k,JSON.stringify(s));},key);await page.reload();await page.clock.fastForward(250000);await page.locator('[data-animal="0"]').click();await expect(page.locator('.animal-detail')).toContainText('produção pausada');await page.locator('[data-collect-animal]').click();expect((await saved(page)).products.egg).toBe(4);await expect(page.locator('[data-collect-animal]')).toBeDisabled();await page.locator('[data-feed]').click();expect((await saved(page)).coins).toBe(100);
});
test('3D em celular: canteiro tocável, animação e interface sem exceder largura',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await expect(canvas(page)).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-plot="0"]').tap();await finish(page);expect((await saved(page)).harvest.turnip).toBe(1);
 await page.locator('#open-shop').click();await expect(page.locator('[data-buy="turnip"]')).toBeVisible();
});
test('3D autocontido em iframe isolado continua jogável sem arquivos auxiliares',async({page})=>{
 const html=await readFile(new URL('../../index.html',import.meta.url),'utf8');const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^http/.test(r.url())&&!r.url().endsWith('/3d-preview'))requests.push(r.url());});
 await page.route('**/3d-preview',r=>r.fulfill({contentType:'text/html',body:'<iframe sandbox="allow-scripts" title="Jogo" style="width:100%;height:950px;border:0"></iframe>'}));await page.goto('/3d-preview');await page.locator('iframe').evaluate((el,html)=>el.srcdoc=html,html);
 const f=page.frameLocator('iframe');await expect(f.locator('#farm-canvas')).toHaveAttribute('data-renderer','three');await expect(f.locator('#save-status')).toContainText('Salvamento indisponível');
 await f.locator('[data-plot="0"]').click();await expect(f.locator('#storage-count')).toHaveText('1',{timeout:15000});expect(errors).toEqual([]);expect(requests).toEqual([]);
});
test('sem WebGL: avisa e mantém fazenda 2D funcional sem perder save',async({page})=>{
 await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:get.call(this,type,...args);};});await page.goto('/');await expect(canvas(page)).toHaveCount(0);await expect(page.locator('#toast')).toContainText('3D indisponível');await page.locator('[data-plot="0"]').click();expect((await saved(page)).harvest.turnip).toBe(1);
});
