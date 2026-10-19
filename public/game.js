export const SAVE_KEY = 'game2-sitio-aurora-v1';
export const CROPS = Object.freeze({
  carrot: { name: 'Cenoura', plural: 'Cenouras', color: '#f18a33', cost: 8, sell: 19, duration: 30_000, xp: 5, level: 1 },
  wheat: { name: 'Trigo', plural: 'Trigo', color: '#eab844', cost: 13, sell: 29, duration: 60_000, xp: 8, level: 1 },
  strawberry: { name: 'Morango', plural: 'Morangos', color: '#e85d6b', cost: 24, sell: 56, duration: 120_000, xp: 14, level: 2 },
  corn: { name: 'Milho', plural: 'Milho', color: '#ecc740', cost: 40, sell: 95, duration: 180_000, xp: 23, level: 3 },
  pumpkin: { name: 'Abóbora', plural: 'Abóboras', color: '#db7834', cost: 65, sell: 160, duration: 300_000, xp: 35, level: 4 }
});
export const QUESTS = [
  { id: 'plant', title: 'Uma semente, um começo', detail: 'Plante em um canteiro vazio.', reward: 15 },
  { id: 'harvest', title: 'Direto da terra', detail: 'Faça sua primeira colheita.', reward: 25 },
  { id: 'sell', title: 'Frutos do seu trabalho', detail: 'Venda uma colheita no armazém.', reward: 25 }
];
const ids = Object.keys(CROPS);
const number = (value, max = 1e9) => Number.isFinite(value) && value >= 0 && value <= max;
export const levelInfo = xp => {
  let level = 1, spent = 0, required = 30;
  while (xp >= spent + required && level < 100) { spent += required; level++; required = 30 + (level - 1) * 20; }
  return { level, current: xp - spent, required };
};
export function newGame(now = Date.now()) {
  const plots = Array.from({ length: 16 }, (_, i) => ({ unlocked: Math.floor(i / 4) < 3 && i % 4 < 3, crop: null, plantedAt: 0, readyAt: 0, watered: false }));
  Object.assign(plots[0], { crop: 'carrot', plantedAt: now - 30_000, readyAt: now });
  Object.assign(plots[1], { crop: 'wheat', plantedAt: now - 35_000, readyAt: now + 25_000 });
  Object.assign(plots[4], { crop: 'carrot', plantedAt: now - 8000, readyAt: now + 22_000 });
  return { version: 1, coins: 160, xp: 0, seeds: { carrot: 6, wheat: 3, strawberry: 0, corn: 0, pumpkin: 0 }, harvest: Object.fromEntries(ids.map(k => [k, 0])), plots, quests: [], stats: { planted: 0, harvested: 0, sold: 0 }, updatedAt: now };
}
export function decodeSave(raw, now = Date.now()) {
  try {
    const s = JSON.parse(raw);
    if (!s || s.version !== 1 || !number(s.coins) || !Number.isInteger(s.coins) || !number(s.xp, 1e7) || !Number.isInteger(s.xp)) return null;
    if (!s.seeds || !s.harvest || !s.stats || !Array.isArray(s.plots) || s.plots.length !== 16 || !Array.isArray(s.quests)) return null;
    for (const collection of [s.seeds, s.harvest]) for (const id of ids) if (!Number.isInteger(collection[id]) || !number(collection[id], 1e6)) return null;
    for (const p of s.plots) {
      if (!p || typeof p.unlocked !== 'boolean' || typeof p.watered !== 'boolean' || (p.crop !== null && !ids.includes(p.crop))) return null;
      if (!number(p.plantedAt, 9e15) || !number(p.readyAt, 9e15) || p.readyAt < p.plantedAt || (!p.unlocked && p.crop)) return null;
    }
    for (const key of ['planted', 'harvested', 'sold']) if (!Number.isInteger(s.stats[key]) || !number(s.stats[key])) return null;
    if (s.quests.some(q => !QUESTS.some(known => known.id === q)) || new Set(s.quests).size !== s.quests.length) return null;
    return { ...s, updatedAt: now };
  } catch { return null; }
}
export function plotStatus(plot, now = Date.now()) {
  if (!plot.unlocked) return 'locked';
  if (!plot.crop) return 'empty';
  return plot.readyAt <= now ? 'ready' : 'growing';
}
export function progress(plot, now = Date.now()) {
  if (!plot.crop) return 0;
  return Math.min(1, Math.max(0, (now - plot.plantedAt) / Math.max(1, plot.readyAt - plot.plantedAt)));
}
export function expansionPrice(state) { return 100 + Math.max(0, state.plots.filter(p => p.unlocked).length - 9) * 75; }
export function action(state, type, payload = {}, now = Date.now()) {
  const fail = message => ({ ok: false, message, state });
  const next = structuredClone(state);
  const crop = Object.hasOwn(CROPS, payload.crop) ? CROPS[payload.crop] : null;
  const plot = Number.isInteger(payload.index) && payload.index >= 0 && payload.index < next.plots.length ? next.plots[payload.index] : null;
  let message = '', earned = 0;
  if (type === 'buy') {
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
    Object.assign(plot, { crop: payload.crop, plantedAt: now, readyAt: now + crop.duration, watered: false });
    next.stats.planted++;
    message = `${crop.name} plantada! Regue para crescer 25% mais rápido.`;
  } else if (type === 'water') {
    if (!plot || plotStatus(plot, now) !== 'growing') return fail('Regue uma plantação que ainda está crescendo.');
    if (plot.watered) return fail('Essa plantação já foi regada.');
    plot.watered = true; plot.readyAt = Math.max(now, plot.readyAt - CROPS[plot.crop].duration * .25);
    message = 'Um pouco de carinho. Crescimento adiantado!';
  } else if (type === 'harvest') {
    if (!plot || plotStatus(plot, now) !== 'ready') return fail('Aguarde a plantação ficar pronta para colher.');
    const picked = CROPS[plot.crop]; next.harvest[plot.crop]++; next.xp += picked.xp; next.stats.harvested++;
    message = `+1 ${picked.name.toLowerCase()} no armazém · +${picked.xp} XP`;
    Object.assign(plot, { crop: null, plantedAt: 0, readyAt: 0, watered: false });
  } else if (type === 'sell' || type === 'sellAll') {
    if (type === 'sell' && !crop) return fail('Escolha uma colheita para vender.');
    const selected = type === 'sellAll' ? ids : [payload.crop];
    for (const id of selected) {
      const qty = type === 'sellAll' ? next.harvest[id] : (payload.qty ?? 1);
      if (!Number.isInteger(qty) || qty < 0 || qty > next.harvest[id]) return fail('Essa quantidade não está no armazém.');
      earned += qty * CROPS[id].sell; next.harvest[id] -= qty; next.stats.sold += qty;
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
