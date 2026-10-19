import { test, expect } from '@playwright/test';
const key='game2-sitio-aurora-v1';
const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
test.beforeEach(async({page})=>{ await page.clock.install({time:new Date('2026-10-19T15:00:00Z')}); await page.goto('/?view=classic'); });
test('fazenda inicial, ciclo de plantio, água, colheita e venda reais',async({page})=>{
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await expect(page.locator('#coins')).toHaveText('160');
  await page.locator('[data-plot="0"]').click();
  await expect(page.locator('#storage-count')).toHaveText('1');
  await page.locator('[data-seed="carrot"]').click(); await page.locator('[data-plot="2"]').click();
  expect((await saved(page)).seeds.carrot).toBe(5);
  await page.locator('[data-tool="water"]').click(); await page.locator('[data-plot="2"]').click();
  expect((await saved(page)).plots[2].watered).toBe(true);
  await page.clock.runFor(23_000);
  await page.locator('[data-tool="harvest"]').click(); await page.locator('[data-plot="2"]').click();
  await expect(page.locator('#storage-count')).toHaveText('2');
  await page.locator('#open-storage').click(); await page.locator('[data-sell-all]').click();
  expect((await saved(page)).coins).toBe(160+15+25+34+25); expect((await saved(page)).quests).toHaveLength(3);
  await expect(page.locator('[data-sell-all]')).toBeDisabled(); expect(errors).toEqual([]);
});
test('loja compra, bloqueia cultivos por nível e fecha por Escape',async({page})=>{
  await page.locator('#open-shop').click(); await page.locator('[data-buy="carrot"]').click();
  expect((await saved(page)).coins).toBe(152); expect((await saved(page)).seeds.carrot).toBe(7);
  await expect(page.locator('[data-buy="strawberry"]')).toBeDisabled(); await page.keyboard.press('Escape'); await expect(page.locator('#modal')).not.toBeVisible();
});
test('expansão abre o canteiro e persiste no reload',async({page})=>{
  await page.locator('[data-plot="3"]').click(); await page.locator('[data-expand]').click();
  await expect(page.locator('#plot-count')).toHaveText('10 canteiros'); await expect(page.locator('#coins')).toHaveText('60');
  await page.reload(); await expect(page.locator('#plot-count')).toHaveText('10 canteiros');
  await page.locator('[data-plot="7"]').click(); await expect(page.locator('[data-expand]')).toBeDisabled();
});
test('progresso offline: reload após avançar relógio preserva plantação e permite colher',async({page})=>{
  await page.locator('[data-seed="carrot"]').click(); await page.locator('[data-plot="2"]').click(); await page.locator('[data-tool="water"]').click(); await page.locator('[data-plot="2"]').click(); const before=await saved(page);
  await page.clock.fastForward(40_000); await page.reload();
  expect((await saved(page)).seeds).toEqual(before.seeds); await expect(page.locator('[data-plot="2"]')).toHaveClass(/ready/);
  await page.locator('[data-plot="2"]').click(); expect((await saved(page)).harvest.carrot).toBe(1);
});
test('teclado seleciona ferramentas e aciona canteiros com Enter',async({page})=>{
  await page.keyboard.press('2'); await expect(page.locator('[data-tool="plant"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-plot="2"]').focus(); await page.keyboard.press('Enter'); expect((await saved(page)).stats.planted).toBe(1);
  await page.keyboard.press('3'); await page.keyboard.press('Enter'); expect((await saved(page)).plots[2].watered).toBe(true);
});
test('save corrompido é preservado em backup e avisa o jogador',async({page})=>{
  await page.evaluate(key=>localStorage.setItem(key,'{quebrado'),key); await page.reload();
  await expect(page.locator('#toast')).toContainText('ilegível'); expect(await page.evaluate(key=>localStorage.getItem(key+'-backup'),key)).toBe('{quebrado'); expect((await saved(page)).version).toBe(1);
});
test('nível 2 libera morangos depois de colher, sem recompra de desbloqueio',async({page})=>{
  for(const i of [2,6,8,9,10]) await page.locator(`[data-plot="${i}"]`).click();
  await page.locator('[data-tool="water"]').click(); for(const i of [2,6,8,9,10]) await page.locator(`[data-plot="${i}"]`).click();
  await page.clock.runFor(31_000); await page.locator('[data-tool="harvest"]').click(); for(const i of [0,2,6,8,9,10]) await page.locator(`[data-plot="${i}"]`).click();
  await expect(page.locator('#level')).toHaveText('2'); await expect(page.locator('[data-seed="strawberry"]')).toBeEnabled();
  await page.locator('#open-shop').click(); await expect(page.locator('[data-buy="strawberry"]')).toBeEnabled();
});
test('interface móvel cabe na tela e permite comprar, plantar e abrir armazém',async({page})=>{
  await page.setViewportSize({width:390,height:844}); await page.reload();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('#open-shop').click(); await page.locator('[data-buy="wheat"]').click(); await page.locator('#close-modal').click();
  await page.locator('[data-seed="wheat"]').click(); await page.locator('[data-plot="2"]').click(); expect((await saved(page)).plots[2].crop).toBe('wheat');
  await page.locator('#open-storage').click(); await expect(page.locator('#modal-title')).toHaveText('Seu armazém');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('zoom funciona e o tutorial fecha retornando o foco',async({page})=>{
  const initial=await page.locator('#farm').getAttribute('viewBox'); await page.locator('#zoom-in').click(); expect(await page.locator('#farm').getAttribute('viewBox')).not.toBe(initial);
  await page.locator('#zoom-out').click(); await expect(page.locator('#zoom-out')).toBeDisabled();
  await page.locator('#help').click(); await expect(page.locator('.help-steps article')).toHaveCount(4); await page.locator('[data-help-close]').click(); await expect(page.locator('#help')).toBeFocused();
});
