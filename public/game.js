export const SAVE_KEY = 'game2-sitio-aurora-v1';
export const CROPS = Object.freeze({
  turnip: { name: 'Nabo', plural: 'Nabos', color: '#d9e9b6', cost: 5, sell: 15, duration: 30_000, xp: 5, level: 1 },
  carrot: { name: 'Cenoura', plural: 'Cenouras', color: '#f18a33', cost: 8, sell: 19, duration: 30_000, xp: 5, level: 1 },
  wheat: { name: 'Trigo', plural: 'Trigo', color: '#eab844', cost: 13, sell: 29, duration: 60_000, xp: 8, level: 1 },
  strawberry: { name: 'Morango', plural: 'Morangos', color: '#e85d6b', cost: 24, sell: 56, duration: 120_000, xp: 14, level: 2 },
  corn: { name: 'Milho', plural: 'Milho', color: '#ecc740', cost: 40, sell: 95, duration: 180_000, xp: 23, level: 3 },
  pumpkin: { name: 'Abóbora', plural: 'Abóboras', color: '#db7834', cost: 65, sell: 160, duration: 300_000, xp: 35, level: 4 },
  tomato: { name: 'Tomate', plural: 'Tomates', color: '#e35b38', cost: 20, sell: 48, duration: 90_000, xp: 11, level: 2 },
  watermelon: { name: 'Melancia', plural: 'Melancias', color: '#6fa33d', cost: 85, sell: 215, duration: 360_000, xp: 43, level: 5 }
});
export const QUESTS = [
  { id: 'plant', title: 'Uma semente, um começo', detail: 'Plante em um canteiro vazio.', reward: 15 },
  { id: 'harvest', title: 'Direto da terra', detail: 'Faça sua primeira colheita.', reward: 25 },
  { id: 'sell', title: 'Frutos do seu trabalho', detail: 'Venda uma colheita no armazém.', reward: 25 }
];
export const FERTILIZER_PRICE = 15;
export const PRODUCTS = Object.freeze({ egg: { name:'Ovo', plural:'Ovos', sell:16 }, milk: { name:'Leite', plural:'Leite', sell:40 } });
export const ANIMALS = Object.freeze({ chicken: { name:'Galinha', cost:60, feedCost:5, duration:60_000, product:'egg', xp:5, level:1 }, cow: { name:'Vaca', cost:180, feedCost:12, duration:120_000, product:'milk', xp:10, level:2 } });
const ids = Object.keys(CROPS);
const number = (value, max = 1e9) => Number.isFinite(value) && value >= 0 && value <= max;
export const levelInfo = xp => {
  let level = 1, spent = 0, required = 30;
  while (xp >= spent + required && level < 100) { spent += required; level++; required = 30 + (level - 1) * 20; }
  return { level, current: xp - spent, required };
};
export function newGame(now = Date.now()) {
  const plots = Array.from({ length: 16 }, (_, i) => ({ unlocked: Math.floor(i / 4) < 3 && i % 4 < 3, crop: null, plantedAt: 0, readyAt: 0, watered: false }));
  Object.assign(plots[0], { crop: 'turnip', plantedAt: now - 30_000, growthStartedAt: now - 30_000, readyAt: now, watered: true, weeded: true, sprayed: false });
  Object.assign(plots[1], { crop: 'turnip', plantedAt: now - 8000, growthStartedAt: now - 8000, readyAt: now + 22_000, watered: true });
  return { version: 1, coins: 160, xp: 0, farmName: 'Minha fazenda', supplies: { fertilizer: 3 }, animals:[], products:{egg:0,milk:0}, seeds: { turnip: 6, carrot: 6, wheat: 3, strawberry: 0, corn: 0, pumpkin: 0, tomato: 0, watermelon: 0 }, harvest: Object.fromEntries(ids.map(k => [k, 0])), plots, quests: [], stats: { planted: 0, harvested: 0, sold: 0 }, updatedAt: now };
}
export function decodeSave(raw, now = Date.now()) {
  try {
    const s = JSON.parse(raw);
    if (!s || s.version !== 1 || !number(s.coins) || !Number.isInteger(s.coins) || !number(s.xp, 1e7) || !Number.isInteger(s.xp)) return null;
    if (!s.seeds || !s.harvest || !s.stats || !Array.isArray(s.plots) || s.plots.length !== 16 || !Array.isArray(s.quests)) return null;
    // Novos cultivos não apagam os saves já existentes.
    for (const id of ['turnip','tomato','watermelon']) { s.seeds[id] ??= 0; s.harvest[id] ??= 0; }
    for (const collection of [s.seeds, s.harvest]) for (const id of ids) if (!Number.isInteger(collection[id]) || !number(collection[id], 1e6)) return null;
    for (const p of s.plots) {
      if (!p || typeof p.unlocked !== 'boolean' || typeof p.watered !== 'boolean' || (p.crop !== null && !ids.includes(p.crop))) return null;
      if (!number(p.plantedAt, 9e15) || !number(p.readyAt, 9e15) || p.readyAt < p.plantedAt || (!p.unlocked && p.crop)) return null;
      for (const flag of ['weeded','sprayed','fertilized']) if (p[flag] !== undefined && typeof p[flag] !== 'boolean') return null;
      if (p.growthStartedAt != null && (!number(p.growthStartedAt,9e15) || p.growthStartedAt>p.readyAt)) return null;
    }
    for (const key of ['planted', 'harvested', 'sold']) if (!Number.isInteger(s.stats[key]) || !number(s.stats[key])) return null;
    if (s.quests.some(q => !QUESTS.some(known => known.id === q)) || new Set(s.quests).size !== s.quests.length) return null;
    if (s.supplies && (!Number.isInteger(s.supplies.fertilizer) || !number(s.supplies.fertilizer, 1e6))) return null;
    if (s.farmName !== undefined && (typeof s.farmName !== 'string' || s.farmName.length > 30)) return null;
    const animals=s.animals||[], products=s.products||{egg:0,milk:0};
    if(!Array.isArray(animals)||animals.length>6)return null;
    for(const a of animals)if(!a||!Object.hasOwn(ANIMALS,a.type)||!number(a.readyAt,9e15)||!number(a.fedUntil,9e15)||!Number.isInteger(a.pending)||!number(a.pending,1e6))return null;
    for(const k of Object.keys(PRODUCTS))if(!Number.isInteger(products[k])||!number(products[k],1e6))return null;
    return { ...s, farmName: s.farmName || 'Minha fazenda', supplies: s.supplies || { fertilizer: 3 }, animals,products,updatedAt: now };
  } catch { return null; }
}
export function plotStatus(plot, now = Date.now()) {
  if (!plot.unlocked) return 'locked';
  if (!plot.crop) return 'empty';
  if (!plot.watered) return 'dry';
  return plot.readyAt <= now ? 'ready' : 'growing';
}
export function progress(plot, now = Date.now()) {
  if (!plot.crop || !plot.watered) return 0;
  const start=plot.growthStartedAt ?? plot.plantedAt;
  return Math.min(1, Math.max(0, (now - start) / Math.max(1, plot.readyAt - start)));
}
export function growthRemaining(plot,now=Date.now()) {
  if (!plot?.crop) return 0;
  if (!plot.watered) return CROPS[plot.crop].duration * (plot.fertilized ? .8 : 1);
  return Math.max(0,plot.readyAt-now);
}
export function plotCare(plot, now = Date.now()) {
  if (!plot?.crop) return { weeds: false, pests: false, dry: false, health: 100 };
  const age = plot.watered ? now - (plot.growthStartedAt ?? plot.plantedAt) : 0, duration = CROPS[plot.crop].duration;
  const weeds = !plot.weeded && age >= duration * .35, pests = !plot.sprayed && age >= duration * .65, dry = !plot.watered;
  return { weeds, pests, dry, health: 100 - (weeds ? 25 : 0) - (pests ? 35 : 0) - (dry ? 10 : 0) };
}
export function expansionPrice(state) { return 100 + Math.max(0, state.plots.filter(p => p.unlocked).length - 9) * 75; }
export function animalProduction(animal, now=Date.now()) {
  const def=ANIMALS[animal.type], until=Math.min(now,animal.fedUntil);
  const cycles=until>=animal.readyAt?Math.floor((until-animal.readyAt)/def.duration)+1:0;
  return { cycles, amount:animal.pending+cycles, hungry:now>=animal.fedUntil, remaining:Math.max(0,animal.readyAt+cycles*def.duration-until) };
}
export function action(state, type, payload = {}, now = Date.now()) {
  const fail = message => ({ ok: false, message, state });
  const next = structuredClone(state);
  const crop = Object.hasOwn(CROPS, payload.crop) ? CROPS[payload.crop] : null;
  const plot = Number.isInteger(payload.index) && payload.index >= 0 && payload.index < next.plots.length ? next.plots[payload.index] : null;
  let message = '', earned = 0;
  if (type === 'buyAnimal') {
    const def=Object.hasOwn(ANIMALS,payload.animal)?ANIMALS[payload.animal]:null;
    if(!def)return fail('Escolha um animal da loja.');
    if(levelInfo(next.xp).level<def.level)return fail(`Disponível no nível ${def.level}.`);
    next.animals||=[];
    if(next.animals.length>=6)return fail('Seu cercado está cheio: máximo de 6 animais.');
    if(next.coins<def.cost)return fail('Você precisa de mais moedas.');
    next.coins-=def.cost;next.animals.push({type:payload.animal,readyAt:now+def.duration,fedUntil:now+4*def.duration,pending:0});
    message=`${def.name} no cercado! A primeira ração está incluída.`;
  } else if(type==='feedAnimal'||type==='collectAnimal') {
    const a=Number.isInteger(payload.animalIndex)?next.animals?.[payload.animalIndex]:null;
    if(!a)return fail('Esse animal não está no seu cercado.');
    const def=ANIMALS[a.type], production=animalProduction(a,now);
    if(type==='collectAnimal') {
      if(!production.amount)return fail('Ainda não há produtos para coletar.');
      next.products||={egg:0,milk:0};next.products[def.product]+=production.amount;
      a.pending=0;a.readyAt+=production.cycles*def.duration;next.xp+=production.amount*def.xp;
      message=`+${production.amount} ${(production.amount===1?PRODUCTS[def.product].name:PRODUCTS[def.product].plural).toLowerCase()} no armazém.`;
    } else {
      if(a.fedUntil-now>=def.duration*4)return fail('Esse animal já tem comida suficiente.');
      if(next.coins<def.feedCost)return fail('Você precisa de mais moedas para comprar ração.');
      next.coins-=def.feedCost;a.pending=production.amount;
      a.readyAt=now+production.remaining;a.fedUntil=Math.max(now,a.fedUntil)+def.duration*4;
      message=`${def.name} alimentada. A produção continua!`;
    }
  } else if (type === 'rename') {
    if (typeof payload.name !== 'string' || payload.name.trim().length < 2 || payload.name.trim().length > 30) return fail('Use um nome de 2 a 30 caracteres.');
    next.farmName = payload.name.trim(); message = 'Sua fazenda ganhou um nome!';
  } else if (type === 'buyFertilizer') {
    if (next.coins < FERTILIZER_PRICE) return fail('Você precisa de mais moedas para comprar adubo.');
    next.supplies ||= { fertilizer: 3 }; next.supplies.fertilizer++; next.coins -= FERTILIZER_PRICE;
    message = '+1 adubo na sua bolsa.';
  } else if (type === 'weed' || type === 'spray') {
    if (!plot || !plot.crop) return fail('Escolha um canteiro plantado.');
    const care = plotCare(plot, now), weed = type === 'weed';
    if (!(weed ? care.weeds : care.pests)) return fail(weed ? 'Esse canteiro está livre de ervas daninhas.' : 'Esse canteiro está livre de pragas.');
    plot[weed ? 'weeded' : 'sprayed'] = true; next.xp++;
    message = (weed ? 'Ervas daninhas removidas.' : 'Pragas eliminadas.') + ' +1 XP';
  } else if (type === 'fertilize') {
    if (plot?.crop && !plot.watered) return fail('A plantação está seca. Regue antes de adubar.');
    if (!plot || plotStatus(plot, now) !== 'growing') return fail('Use adubo em uma plantação que ainda está crescendo.');
    if (plot.fertilized) return fail('Essa plantação já recebeu adubo.');
    next.supplies ||= { fertilizer: 3 };
    if (next.supplies.fertilizer < 1) return fail('Seu adubo acabou. Compre mais na loja.');
    next.supplies.fertilizer--; plot.fertilized = true;
    plot.readyAt = Math.max(now, plot.readyAt - CROPS[plot.crop].duration * .2);
    message = 'Adubado! O crescimento foi adiantado em 20% do ciclo.';
  } else if (type === 'buy') {
    const qty = payload.qty ?? 1;
    if (!crop || !Number.isInteger(qty) || qty < 1 || qty > 99) return fail('Escolha uma quantidade válida.');
    if (levelInfo(next.xp).level < crop.level) return fail(`Disponível no nível ${crop.level}.`);
    if (next.coins < crop.cost * qty) return fail('Você precisa de mais moedas. Venda uma colheita!');
    next.coins -= crop.cost * qty; next.seeds[payload.crop] += qty;
    message = `${qty} ${qty === 1 ? 'semente' : 'sementes'} de ${crop.name.toLowerCase()} na sua bolsa.`;
  } else if (type === 'plant') {
    if (!plot || plotStatus(plot, now) !== 'empty') return fail('Escolha um canteiro vazio.');
    if (!crop || levelInfo(next.xp).level < crop.level) return fail('Esse cultivo ainda não foi desbloqueado.');
    if (next.seeds[payload.crop] < 1) return fail('Suas sementes acabaram. Visite a loja de sementes.');
    next.seeds[payload.crop]--;
    Object.assign(plot, { crop: payload.crop, plantedAt: now, growthStartedAt: null, readyAt: now + crop.duration, watered: false, weeded: false, sprayed: false, fertilized: false });
    next.stats.planted++;
    message = `${crop.name} plantada! Regue para iniciar o crescimento.`;
  } else if (type === 'water') {
    if (!plot || !['dry','growing'].includes(plotStatus(plot, now))) return fail('Regue uma plantação que ainda está crescendo.');
    if (plot.watered) return fail('Essa plantação já foi regada.');
    const remaining=growthRemaining(plot,now);
    plot.watered = true; plot.growthStartedAt=now;
    plot.readyAt = now + Math.max(1,remaining - CROPS[plot.crop].duration * .25);
    message = 'Plantação regada! O crescimento começou.';
  } else if (type === 'harvest') {
    if (plot?.crop && !plot.watered) return fail('A plantação está seca e não cresceu. Regue para continuar.');
    if (!plot || plotStatus(plot, now) !== 'ready') return fail('Aguarde a plantação ficar pronta para colher.');
    const picked = CROPS[plot.crop], yieldCount = plot.weeded && plot.sprayed ? 2 : 1;
    next.harvest[plot.crop] += yieldCount; next.xp += picked.xp; next.stats.harvested++;
    message = `+${yieldCount} ${picked.name.toLowerCase()} no armazém · +${picked.xp} XP${yieldCount > 1 ? ' · Bônus de cuidado!' : ''}`;
    Object.assign(plot, { crop: null, plantedAt: 0, growthStartedAt: null, readyAt: 0, watered: false, weeded: false, sprayed: false, fertilized: false });
  } else if (type === 'sell' || type === 'sellAll') {
    const goods={...CROPS,...PRODUCTS};
    if (type === 'sell' && !Object.hasOwn(goods,payload.crop)) return fail('Escolha uma colheita para vender.');
    const selected = type === 'sellAll' ? Object.keys(goods) : [payload.crop];
    for (const id of selected) {
      const collection=Object.hasOwn(PRODUCTS,id)?(next.products||={egg:0,milk:0}):next.harvest;
      const qty = type === 'sellAll' ? collection[id] : (payload.qty ?? 1);
      if (!Number.isInteger(qty) || qty < 0 || qty > collection[id]) return fail('Essa quantidade não está no armazém.');
      earned += qty * goods[id].sell; collection[id] -= qty; next.stats.sold += qty;
    }
    if (!earned) return fail('Seu armazém ainda não tem colheitas para vender.');
    next.coins += earned; message = `Colheita vendida! +${earned} moedas.`;
  } else if (type === 'expand') {
    if (!plot || plot.unlocked) return fail('Escolha um terreno ainda fechado.');
    const price = expansionPrice(next);
    if (next.coins < price) return fail(`Você precisa de ${price} moedas para esse terreno.`);
    next.coins -= price; plot.unlocked = true; message = 'Mais espaço para fazer seu sítio florescer!';
  } else return fail('Ação desconhecida.');
  const rewards = [];
  for (const quest of QUESTS) {
    const completed = { plant: next.stats.planted, harvest: next.stats.harvested, sell: next.stats.sold }[quest.id] > 0;
    if (completed && !next.quests.includes(quest.id)) { next.quests.push(quest.id); next.coins += quest.reward; rewards.push(quest); }
  }
  next.updatedAt = now;
  return { ok: true, state: next, message, rewards, earned, levelUp: levelInfo(next.xp).level > levelInfo(state.xp).level };
}
