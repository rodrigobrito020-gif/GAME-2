import {test,expect} from '@playwright/test';
test.setTimeout(60000);
import{readFile}from'node:fs/promises';
const key='game2-sitio-aurora-v1';
const saved=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
for(const width of[1440,390])test(`nome e personagem são aplicados juntos e persistem com ${width}px`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height:1000});await page.goto('/');const before=await saved(page);
 await page.getByRole('button',{name:'Personalizar fazenda e personagem'}).click();await page.locator('.farmer-choices label').filter({hasText:'Fazendeira'}).click();
 await page.locator('#farm-name-input').fill('');await page.locator('#farm-name-input').pressSequentially('Fazenda da Ana',{delay:15});
 await page.getByRole('button',{name:'Aplicar nome e personagem'}).click();await expect(page.locator('#modal')).not.toBeVisible();await expect(page.locator('#farm-name')).toHaveText('Fazenda da Ana');await expect(page.locator('#farmer-title')).toHaveText('Fazendeira');await expect(page.locator('#farm-canvas')).toHaveAttribute('data-farmer-style','female');await expect(page.locator('#toast')).toContainText('Alterações salvas');
 const after=await saved(page);expect(after.seeds).toEqual(before.seeds);expect(after.water).toEqual(before.water);expect(after.coins).toBe(before.coins);expect(after.xp).toBe(before.xp);
 await page.reload();await expect(page.locator('#farm-name')).toHaveText('Fazenda da Ana');await expect(page.locator('#farm-canvas')).toHaveAttribute('data-farmer-style','female');expect(errors).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('nome inválido mostra erro dentro da janela e mantém a escolha até corrigir',async({page})=>{
 await page.goto('/?view=classic');await page.locator('#edit-farm').click();await page.locator('.farmer-choices label').filter({hasText:'Fazendeira'}).click();await page.locator('#farm-name-input').fill('A');await page.getByRole('button',{name:'Aplicar nome e personagem'}).click();
 await expect(page.locator('#modal')).toBeVisible();await expect(page.locator('#profile-error')).toContainText('2 a 30');await expect(page.locator('input[value="female"]')).toBeChecked();expect((await saved(page)).farmName).toBe('Minha fazenda');expect((await saved(page)).farmer).toBe('male');
 await page.locator('#farm-name-input').fill('Sítio Feliz');await expect(page.locator('#profile-error')).toBeHidden();await page.locator('#farm-name-input').press('Enter');await expect(page.locator('#modal')).not.toBeVisible();await expect(page.locator('#farm-name')).toHaveText('Sítio Feliz');expect((await saved(page)).farmer).toBe('female');
});
test('prévia isolada aplica nome e personagem e explica quando o navegador bloqueia persistência',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/form submission/i.test(m.text()))errors.push(m.text());});
 const html=await readFile(new URL('../../index.html',import.meta.url),'utf8');await page.route('**/profile-preview',r=>r.fulfill({contentType:'text/html',body:'<iframe title="Jogo" sandbox="allow-scripts" style="width:100%;height:950px;border:0"></iframe>'}));await page.goto('/profile-preview');await page.locator('iframe').evaluate((el,html)=>el.srcdoc=html,html);
 const f=page.frameLocator('iframe');await f.locator('#edit-farm').click();await expect(f.locator('#profile-save-warning')).toBeVisible();await f.locator('input[value="female"]').check();await f.locator('#farm-name-input').fill('Fazenda da Amizade');await f.getByRole('button',{name:'Aplicar nome e personagem'}).click();
 await expect(f.locator('#farm-name')).toHaveText('Fazenda da Amizade');await expect(f.locator('#farm-canvas')).toHaveAttribute('data-farmer-style','female');await expect(f.locator('#toast')).toContainText('navegador está bloqueando');
 await f.locator('#edit-farm').click();await f.locator('input[value="male"]').check();await f.locator('#farm-name-input').fill('Sítio do Evento');await f.locator('#farm-name-input').press('Enter');await expect(f.locator('#farm-name')).toHaveText('Sítio do Evento');await expect(f.locator('#farm-canvas')).toHaveAttribute('data-farmer-style','male');expect(errors).toEqual([]);
});
