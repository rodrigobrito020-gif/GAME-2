import { test,expect } from '@playwright/test';

test('cenário e solo carregam no HTML completo sem imagens externas',async({page})=>{
  const external=[];page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.isNavigationRequest())external.push(r.url());});
  await page.goto('/?view=classic');
  const sizes=await page.evaluate(async()=>{
    const images=[document.querySelector('#farm-paint'),document.querySelector('#soil-paint')];
    return Promise.all(images.map(async el=>{const img=new Image();img.src=el.getAttribute('href');await img.decode();return [img.naturalWidth,img.naturalHeight];}));
  });
  expect(sizes).toEqual([[1639,960],[384,384]]);expect(external).toEqual([]);
  await expect(page.locator('#plots .soil-surface')).toHaveCount(9);
});

test('água e folhagem mudam visualmente; preferência de movimento reduzido mantém estáticas',async({page})=>{
  await page.goto('/?view=classic');await page.evaluate(async()=>{const image=new Image();image.src=document.querySelector('#farm-paint').getAttribute('href');await image.decode();});
  const farm=page.locator('#farm');
  async function region(x,y,w,h){return farm.evaluate((svg,[x,y,w,h])=>{const m=svg.getScreenCTM();return{x:m.a*x+m.e,y:m.d*y+m.f,width:m.a*w,height:m.d*h};},[x,y,w,h]);}
  const clips=[await region(55,145,230,55),await region(1085,135,140,45)];
  const before=await Promise.all(clips.map(clip=>page.screenshot({clip})));
  await page.waitForTimeout(1200);
  const after=await Promise.all(clips.map(clip=>page.screenshot({clip})));
  expect(before[0].equals(after[0])).toBe(false);expect(before[1].equals(after[1])).toBe(false);
  await page.emulateMedia({reducedMotion:'reduce'});
  const still=await Promise.all(clips.map(clip=>page.screenshot({clip})));
  await page.waitForTimeout(1100);
  const stillAfter=await Promise.all(clips.map(clip=>page.screenshot({clip})));
  expect(still[0].equals(stillAfter[0])).toBe(true);expect(still[1].equals(stillAfter[1])).toBe(true);
});
