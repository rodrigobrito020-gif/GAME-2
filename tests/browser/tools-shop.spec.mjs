import {test,expect} from '@playwright/test';
import {SAVE_KEY} from '../../public/game.js';
const saved=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),SAVE_KEY);
for(const view of ['classic','3d'])test(`ferramentas em ${view}: barra reduzida, compras reais, bloqueio por atalho e persistência`,async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(view==='classic'?'/?view=classic':'/');
 await expect(page.locator('[data-tool]')).toHaveCount(5);await expect(page.locator('[data-tool="plant"],[data-tool="harvest"]')).toHaveCount(0);await expect(page.locator('#water-amount')).toHaveText('30');await expect(page.locator('#fertilizer-count')).toHaveText('0');
 for(const id of ['weed','spray','fertilize'])await expect(page.locator(`[data-tool="${id}"]`)).toHaveAttribute('data-locked','true');
 const before=await saved(page);await page.keyboard.press('3');await expect(page.locator('[data-shop-tab="tools"]')).toHaveAttribute('aria-selected','true');await expect(page.locator('[data-tool="smart"]')).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-buy-tool="weed"]').click();await expect(page.locator('[data-buy-tool="weed"]')).toBeDisabled();await page.locator('[data-buy-tool="spray"]').click();await page.locator('[data-buy-fertilizer]').click();
 const bought=await saved(page);expect(bought.coins).toBe(5);expect(bought.seeds).toEqual(before.seeds);expect(bought.water).toEqual(before.water);expect(bought.tools).toEqual({weed:true,spray:true,fertilize:true});expect(bought.supplies.fertilizer).toBe(1);
 await page.locator('#close-modal').click();await page.keyboard.press('3');await expect(page.locator('[data-tool="weed"]')).toHaveAttribute('aria-pressed','true');await page.keyboard.press('1');
 await page.reload();for(const id of ['weed','spray','fertilize'])await expect(page.locator(`[data-tool="${id}"]`)).toHaveAttribute('data-locked','false');expect((await saved(page)).coins).toBe(5);expect(errors).toEqual([]);
});
