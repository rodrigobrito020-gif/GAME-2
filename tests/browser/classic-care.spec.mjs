import {test,expect} from '@playwright/test';
const key='game2-sitio-aurora-v1';
const saved=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
test.beforeEach(async({page})=>{await page.clock.install({time:new Date('2026-10-19T15:00:00Z')});await page.goto('/?view=classic');});
test('capinar e dedetizar melhoram saúde e dobram produto; não repetem recompensa',async({page})=>{
  await page.locator('[data-seed="carrot"]').click();await page.locator('[data-plot="2"]').click();await page.locator('[data-tool="water"]').click();await page.locator('[data-plot="2"]').click();await page.clock.fastForward(21_000);
  await page.locator('[data-plot="2"]').hover();await expect(page.locator('.health-track span')).toHaveText('40/100');
  await page.locator('[data-tool="weed"]').click();await page.locator('[data-plot="2"]').click();
  await page.locator('[data-tool="spray"]').click();await page.locator('[data-plot="2"]').click();
  expect((await saved(page)).xp).toBe(2);
  await page.locator('[data-plot="2"]').click();expect((await saved(page)).xp).toBe(2);
  await page.locator('[data-tool="water"]').click();await page.locator('[data-plot="2"]').click();
  await page.locator('[data-plot="2"]').hover();await expect(page.locator('.health-track span')).toHaveText('100/100');
  await page.clock.fastForward(2500);await page.locator('[data-tool="harvest"]').click();await page.locator('[data-plot="2"]').click();
  expect((await saved(page)).harvest.carrot).toBe(2);
});
test('adubo usa estoque e tempo correto, compra repõe e recarga preserva',async({page})=>{
  await page.locator('[data-plot="2"]').click();await page.locator('[data-tool="water"]').click();await page.locator('[data-plot="2"]').click();await page.locator('[data-tool="fertilize"]').click();await page.locator('[data-plot="2"]').click();
  await expect(page.locator('#fertilizer-count')).toHaveText('2');
  const s=await saved(page);expect(s.plots[2].readyAt-s.plots[2].growthStartedAt).toBe(16_500);
  await page.locator('#open-shop').click();await page.locator('[data-shop-tab="tools"]').click();await page.locator('[data-buy-fertilizer]').click();await page.locator('#close-modal').click();
  await expect(page.locator('#fertilizer-count')).toHaveText('3');await page.reload();expect((await saved(page)).plots[2].fertilized).toBe(true);
});
test('compra galinha, produz ovos, pausa sem comida, coleta e vende sem duplicar',async({page})=>{
  await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));s.feed.poultry=1;localStorage.setItem(key,JSON.stringify(s));},key);await page.reload();
  await page.locator('[data-building="animals"]').click();await page.locator('[data-buy-animal="chicken"]').click();await page.locator('#close-modal').click();
  await expect(page.locator('[data-animal]')).toHaveCount(1);expect((await saved(page)).coins).toBe(100);
  await page.clock.fastForward(61_000);await page.locator('[data-animal="0"]').click();await page.locator('[data-collect-animal]').click();await expect(page.locator('[data-collect-animal]')).toBeDisabled();
  expect((await saved(page)).products.egg).toBe(1);await page.locator('#close-modal').click();
  await page.clock.fastForward(600_000);await page.locator('[data-animal="0"]').click();await expect(page.locator('.animal-detail')).toContainText('produção pausada');await page.locator('[data-collect-animal]').click();
  expect((await saved(page)).products.egg).toBe(4);await page.locator('[data-feed]').click();await page.locator('#close-modal').click();
  expect((await saved(page)).coins).toBe(100);await page.reload();await expect(page.locator('[data-animal]')).toHaveCount(1);
  await page.locator('#open-storage').click();await page.locator('[data-sell="egg"]').click();expect((await saved(page)).products.egg).toBe(3);
  await page.locator('[data-sell-all]').click();expect((await saved(page)).products.egg).toBe(0);expect((await saved(page)).coins).toBe(100+64+25);
});
test('nome personalizado persiste, missões abrem e bolsa pode fechar e abrir',async({page})=>{
  await page.locator('#edit-farm').click();await page.locator('#farm-name-input').fill('Fazenda do evento');await page.locator('#rename-form button').click();await expect(page.locator('#farm-name')).toHaveText('Fazenda do evento');
  await page.reload();await expect(page.locator('#farm-name')).toHaveText('Fazenda do evento');await page.locator('#open-goals').click();await expect(page.locator('#quests .quest')).toHaveCount(3);await page.keyboard.press('Escape');
  await page.locator('#close-bag').click();await expect(page.locator('#seed-section')).toBeHidden();await page.locator('#open-bag').click();await expect(page.locator('#seed-section')).toBeVisible();
});

test('planta seca não cresce, nem após recarga; só começa ao regar e adubo não burla',async({page})=>{
 await page.locator('[data-seed="carrot"]').click();await page.locator('[data-plot="2"]').click();
 await page.clock.fastForward(86400_000);await page.reload();
 await expect(page.locator('[data-plot="2"]')).toHaveClass(/dry/);
 await page.locator('[data-plot="2"]').hover();await expect(page.locator('#plot-tooltip')).toContainText('Crescimento pausado');
 await page.locator('[data-tool="harvest"]').click();await page.locator('[data-plot="2"]').click();expect((await saved(page)).harvest.carrot).toBe(0);
 await page.locator('[data-tool="fertilize"]').click();await page.locator('[data-plot="2"]').click();expect((await saved(page)).supplies.fertilizer).toBe(3);
 await page.locator('[data-tool="water"]').click();await page.locator('[data-plot="2"]').click();await expect(page.locator('[data-plot="2"]')).toHaveClass(/growing/);
 await page.clock.fastForward(23_000);await expect(page.locator('[data-plot="2"]')).toHaveClass(/ready/);
 await page.locator('[data-tool="harvest"]').click();await page.locator('[data-plot="2"]').click();expect((await saved(page)).harvest.carrot).toBe(1);
});
