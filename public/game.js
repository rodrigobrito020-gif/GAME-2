export const SAVE_KEY = 'game2-sitio-aurora-v1';
export const CROPS = Object.freeze({
  turnip: { name: 'Nabo', plural: 'Nabos', color: '#d9e9b6', cost: 5, sell: 15, duration: 30_000, xp: 5, level: 1 },
  carrot: { name: 'Cenoura', plural: 'Cenouras', color: '#f18a33', cost: 8, sell: 19, duration: 30_000, xp: 5, level: 1 },
  wheat: { name: 'Trigo', plural: 'Trigo', color: '#eab844', cost: 13, sell: 29, duration: 60_000, xp: 8, level: 1 },
  strawberry: { name: 'Morango', plural: 'Morangos', color: '#e85d6b', cost: 24, sell: 56, duration: 120_000, xp: 14, level: 2 },
  corn: { name: 'Milho', plural: 'Milho', color: '#ecc740', cost: 40, sell: 95, duration: 180_000, xp: 23, level: 3 },
  pumpkin: { name: 'Abóbora', plural: 'Abóboras', color: '#db7834', cost: 65, sell: 160, duration: 300_000, xp: 35, level: 4 },
  tomato: { name: 'Tomate', plural: 'Tomates', color: '#e35b38', cost: 20, sell: 48, duration: 90_000, xp: 11, level: 2 },
  watermelon: { name: 'Melancia', plural: 'Melancias', color: '#6fa33d', cost: 85, sell: 215, duration: 360_000, xp: 43, level: 5 },
  soybean: { name:'Soja', plural:'Soja', color:'#86ab42', cost:11, sell:24, duration:60_000, xp:7, level:1 },
  alfalfa: { name:'Alfafa', plural:'Alfafa', color:'#4a9d52', cost:9, sell:20, duration:45_000, xp:6, level:1 }
});
// Os primeiros 16 índices mantêm suas posições para preservar os saves antigos.
const plotLayout=Array.from({length:16},(_,i)=>({x:-7.1+i%4*2.55,z:-.35+Math.floor(i/4)*2.55}));
for(let row=0;row<6;row++)for(let col=0;col<9;col++)if(col<5||row>=4)plotLayout.push({x:-19.85+col*2.55,z:-.35+row*2.55});
export const PLOT_LAYOUT=Object.freeze(plotLayout.map(Object.freeze));
const emptyPlot=()=>({unlocked:false,crop:null,plantedAt:0,readyAt:0,watered:false});
export const QUESTS = [
  { id: 'plant', title: 'Uma semente, um começo', detail: 'Plante em um canteiro vazio.', reward: 15 },
  { id: 'harvest', title: 'Direto da terra', detail: 'Faça sua primeira colheita.', reward: 25 },
  { id: 'sell', title: 'Frutos do seu trabalho', detail: 'Venda uma colheita no armazém.', reward: 25 }
];
export const FERTILIZER_PRICE = 15;
export const TOOL_SHOP = Object.freeze({weed:{name:'Enxada',icon:'weed',cost:60,detail:'Retire o mato dos canteiros. Compra permanente.'},spray:{name:'Dedetizador',icon:'spray',cost:80,detail:'Elimine as pragas. Compra permanente.'},fertilize:{name:'Adubo rápido',icon:'fertilizer',cost:FERTILIZER_PRICE,detail:'Uma aplicação adianta 20% do crescimento após a rega.'}});
export function ownsTool(state,id){return !Object.hasOwn(TOOL_SHOP,id)||!!state.tools?.[id];}
export const WATER_CAPACITY = 30;
export const WATER_REFILL_MS = 120_000;
// A full tank does not bank recharge time. Only the first missing charge
// starts the clock; spending another charge preserves the current countdown.
export function waterStatus(state, now = Date.now()) {
  const water = state.water ?? { amount: WATER_CAPACITY, nextAt: null };
  if (water.amount === WATER_CAPACITY) return { amount: WATER_CAPACITY, nextAt: null, remaining: 0 };
  const recovered = now < water.nextAt ? 0 : Math.floor((now - water.nextAt) / WATER_REFILL_MS) + 1;
  const amount = Math.min(WATER_CAPACITY, water.amount + recovered);
  const nextAt = amount === WATER_CAPACITY ? null : water.nextAt + recovered * WATER_REFILL_MS;
  return { amount, nextAt, remaining: nextAt === null ? 0 : Math.max(0, nextAt - now) };
}
export const PRODUCTS = Object.freeze({ egg: { name:'Ovo', plural:'Ovos', sell:16 }, milk: { name:'Leite', plural:'Leite', sell:40 }, wool: { name:'Lã', plural:'Lã', sell:32 }, fish: { name:'Peixe', plural:'Peixes', sell:24 }, shrimp: { name:'Camarão', plural:'Camarões', sell:38 } });
export const ANIMALS = Object.freeze({ chicken: { name:'Galinha', cost:60, feed:'poultry', duration:60_000, product:'egg', xp:5, level:1 }, cow: { name:'Vaca', cost:180, feed:'livestock', duration:120_000, product:'milk', xp:10, level:2 }, sheep:{ name:'Ovelha', cost:120, feed:'livestock', duration:90_000, product:'wool', xp:8, level:2 } });
export const POND = Object.freeze({cost:240,level:2,slots:16,columns:4,x:-16,z:-10,size:12,cellSize:2.24,spacing:2.55});
export function pondCellPosition(index){return{x:POND.x+(index%POND.columns-1.5)*POND.spacing,z:POND.z+(Math.floor(index/POND.columns)-1.5)*POND.spacing};}
export const AQUACULTURE = Object.freeze({ fish: { name:'Criação de peixes', cost:60, feed:'aquatic', duration:60_000, product:'fish', xp:6, level:2 }, shrimp: { name:'Criação de camarões', cost:120, feed:'aquatic', duration:90_000, product:'shrimp', xp:9, level:3 } });
export const FEEDS=Object.freeze({poultry:{name:'Ração de aves',detail:'Galinhas'},livestock:{name:'Ração de ruminantes',detail:'Vacas e ovelhas'},aquatic:{name:'Ração aquática',detail:'Peixes e camarões'}});
export const FEED_RECIPES=Object.freeze({
 poultry:{name:'Aves · trigo e soja',feed:'poultry',ingredients:{wheat:2,soybean:1},yield:3,duration:20_000},
 poultryCorn:{name:'Aves · milho e soja',feed:'poultry',ingredients:{corn:2,soybean:1},yield:4,duration:25_000},
 livestock:{name:'Ruminantes · alfafa e trigo',feed:'livestock',ingredients:{alfalfa:2,wheat:1},yield:3,duration:20_000},
 aquatic:{name:'Aquática · soja e trigo',feed:'aquatic',ingredients:{soybean:2,wheat:1},yield:3,duration:25_000}
});
const emptyFeed=()=>({poultry:0,livestock:0,aquatic:0});
const emptyProducts=()=>Object.fromEntries(Object.keys(PRODUCTS).map(id=>[id,0]));
const ids = Object.keys(CROPS);
const number = (value, max = 1e9) => Number.isFinite(value) && value >= 0 && value <= max;
export const levelInfo = xp => {
  let level = 1, spent = 0, required = 30;
  while (xp >= spent + required && level < 100) { spent += required; level++; required = 30 + (level - 1) * 20; }
  return { level, current: xp - spent, required };
};
export function newGame(now = Date.now()) {
  const plots = PLOT_LAYOUT.map((_,i)=>({...emptyPlot(),unlocked:i<16&&Math.floor(i/4)<3&&i%4<3}));
  Object.assign(plots[0], { crop: 'turnip', plantedAt: now - 30_000, growthStartedAt: now - 30_000, readyAt: now, watered: true, weeded: true, sprayed: false });
  Object.assign(plots[1], { crop: 'turnip', plantedAt: now - 8000, growthStartedAt: now - 8000, readyAt: now + 22_000, watered: true });
  return { version: 1, coins: 160, xp: 0, farmName: 'Minha fazenda', farmer: 'male', water: { amount: WATER_CAPACITY, nextAt: null }, supplies: { fertilizer: 0 }, tools:{weed:false,spray:false,fertilize:false}, feed:emptyFeed(), mill:{job:null}, animals:[], pond:{owned:false,stock:[]}, products:emptyProducts(), seeds: { turnip: 6, carrot: 6, wheat: 3, strawberry: 0, corn: 0, pumpkin: 0, tomato: 0, watermelon: 0, soybean:3,alfalfa:3 }, harvest: Object.fromEntries(ids.map(k => [k, 0])), plots, quests: [], stats: { planted: 0, harvested: 0, sold: 0 }, updatedAt: now };
}
export function decodeSave(raw, now = Date.now()) {
  try {
    const s = JSON.parse(raw);
    if (!s || s.version !== 1 || !number(s.coins) || !Number.isInteger(s.coins) || !number(s.xp, 1e7) || !Number.isInteger(s.xp)) return null;
    if (!s.seeds || !s.harvest || !s.stats || !Array.isArray(s.plots) || ![16,PLOT_LAYOUT.length].includes(s.plots.length) || !Array.isArray(s.quests)) return null;
    if(s.plots.length===16)s.plots.push(...Array.from({length:PLOT_LAYOUT.length-16},emptyPlot));
    // Novos cultivos não apagam os saves já existentes.
    for (const id of ['turnip','tomato','watermelon','soybean','alfalfa']) { s.seeds[id] ??= 0; s.harvest[id] ??= 0; }
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
    if(s.tools!==undefined&&(!s.tools||typeof s.tools!=='object'||Array.isArray(s.tools)||Object.keys(TOOL_SHOP).some(id=>typeof s.tools[id]!=='boolean')))return null;
    if (s.farmName !== undefined && (typeof s.farmName !== 'string' || s.farmName.length > 30)) return null;
    if (s.farmer !== undefined && !['male','female'].includes(s.farmer)) return null;
    if (s.water !== undefined) {
      if (!s.water || !Number.isInteger(s.water.amount) || !number(s.water.amount, WATER_CAPACITY)) return null;
      if (s.water.amount === WATER_CAPACITY ? s.water.nextAt !== null : !number(s.water.nextAt, 9e15)) return null;
    }
    const { amount, nextAt } = waterStatus(s, now);
    const animals=s.animals||[], products=s.products||emptyProducts(), pond=s.pond===undefined?{owned:false,stock:[]}:s.pond;
    if(!Array.isArray(animals)||animals.length>6)return null;
    for(const a of animals)if(!a||!Object.hasOwn(ANIMALS,a.type)||!number(a.readyAt,9e15)||!number(a.fedUntil,9e15)||!Number.isInteger(a.pending)||!number(a.pending,1e6))return null;
    // Saves anteriores mantêm seus produtos e recebem os novos estoques vazios.
    for(const k of ['fish','shrimp','wool'])if(products[k]===undefined)products[k]=0;
    for(const k of Object.keys(PRODUCTS))if(!Number.isInteger(products[k])||!number(products[k],1e6))return null;
    if(!pond||typeof pond.owned!=='boolean'||!Array.isArray(pond.stock)||pond.stock.length>POND.slots||(!pond.owned&&pond.stock.length))return null;
    for(const a of pond.stock)if(!a||!Object.hasOwn(AQUACULTURE,a.type)||!number(a.readyAt,9e15)||!number(a.fedUntil,9e15)||!Number.isInteger(a.pending)||!number(a.pending,1e6))return null;
    const usedSlots=new Set();for(const a of pond.stock){if(a.slot!==undefined){if(!Number.isInteger(a.slot)||a.slot<0||a.slot>=POND.slots||usedSlots.has(a.slot))return null;usedSlots.add(a.slot);}}
    for(const a of pond.stock)if(a.slot===undefined){a.slot=Array.from({length:POND.slots},(_,i)=>i).find(i=>!usedSlots.has(i));usedSlots.add(a.slot);}
    const feed=s.feed===undefined?emptyFeed():s.feed,mill=s.mill===undefined?{job:null}:s.mill;
    if(!feed||Object.keys(FEEDS).some(k=>!Number.isInteger(feed[k])||!number(feed[k],1e6))||!mill||!Object.hasOwn(mill,'job'))return null;
    if(mill.job!==null){const j=mill.job;if(!j||!Object.hasOwn(FEED_RECIPES,j.recipe)||!Number.isInteger(j.batches)||j.batches<1||j.batches>10||!number(j.startedAt,9e15)||!number(j.readyAt,9e15)||j.readyAt!==j.startedAt+FEED_RECIPES[j.recipe].duration*j.batches)return null;}
    return { ...s, tools:s.tools??{weed:false,spray:false,fertilize:(s.supplies?.fertilizer??3)>0},feed,mill,farmer: s.farmer || 'male', water: { amount, nextAt }, farmName: s.farmName || 'Minha fazenda', supplies: s.supplies || { fertilizer: 3 }, animals,pond,products,updatedAt: now };
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
  return productionStatus(animal,ANIMALS[animal.type],now);
}
export function aquaticProduction(stock,now=Date.now()) {
  return productionStatus(stock,AQUACULTURE[stock.type],now);
}
function productionStatus(animal,def,now) {
  const until=Math.min(now,animal.fedUntil);
  const cycles=until>=animal.readyAt?Math.floor((until-animal.readyAt)/def.duration)+1:0;
  return { cycles, amount:animal.pending+cycles, hungry:now>=animal.fedUntil, remaining:Math.max(0,animal.readyAt+cycles*def.duration-until) };
}
export function action(state, type, payload = {}, now = Date.now()) {
  const fail = message => ({ ok: false, message, state });
  const next = structuredClone(state);
  const water = waterStatus(state, now);
  next.water = { amount: water.amount, nextAt: water.nextAt };
  const crop = Object.hasOwn(CROPS, payload.crop) ? CROPS[payload.crop] : null;
  const plot = Number.isInteger(payload.index) && payload.index >= 0 && payload.index < next.plots.length ? next.plots[payload.index] : null;
  let message = '', earned = 0;
  if(type==='craftFeed') {
    const recipe=Object.hasOwn(FEED_RECIPES,payload.recipe)?FEED_RECIPES[payload.recipe]:null,batches=payload.batches??1;
    if(!recipe||!Number.isInteger(batches)||batches<1||batches>10)return fail('Escolha uma receita e de 1 a 10 lotes.');
    if(next.mill?.job)return fail('Recolha a produção do moinho antes de iniciar outra receita.');
    for(const [id,qty]of Object.entries(recipe.ingredients))if(!Number.isInteger(next.harvest[id])||next.harvest[id]<qty*batches)return fail(`Faltam ingredientes: ${CROPS[id].name}. Use a produção colhida, não as sementes.`);
    next.feed={...emptyFeed(),...next.feed};if(next.feed[recipe.feed]+recipe.yield*batches>1e6)return fail('Seu depósito de ração está cheio.');
    for(const [id,qty]of Object.entries(recipe.ingredients))next.harvest[id]-=qty*batches;
    next.mill={job:{recipe:payload.recipe,batches,startedAt:now,readyAt:now+recipe.duration*batches}};
    message='Moinho trabalhando! Os ingredientes foram separados para produzir a ração.';
  } else if(type==='collectFeed') {
    const job=next.mill?.job;if(!job)return fail('O moinho não tem ração para recolher.');
    if(now<job.readyAt)return fail('Aguarde o moinho terminar o preparo.');
    const recipe=FEED_RECIPES[job.recipe],amount=recipe.yield*job.batches;
    next.feed={...emptyFeed(),...next.feed};next.feed[recipe.feed]+=amount;next.mill.job=null;
    message=`+${amount} sacos de ${FEEDS[recipe.feed].name.toLowerCase()} no depósito.`;
  } else if(type==='buyPond') {
    if(next.pond?.owned)return fail('O lago já faz parte da sua fazenda.');
    if(levelInfo(next.xp).level<POND.level)return fail(`Lago disponível no nível ${POND.level}.`);
    if(next.coins<POND.cost)return fail(`Você precisa de ${POND.cost} moedas para comprar o lago.`);
    next.coins-=POND.cost;next.pond={owned:true,stock:[]};
    message='Lago comprado! Escolha um dos 16 viveiros e coloque peixes ou camarões.';
  } else if(type==='buyAquatic') {
    const def=Object.hasOwn(AQUACULTURE,payload.aquatic)?AQUACULTURE[payload.aquatic]:null;
    if(!def)return fail('Escolha peixes ou uma gaiola de camarões.');
    if(!next.pond?.owned)return fail('Compre o lago antes de começar sua criação.');
    if(levelInfo(next.xp).level<def.level)return fail(`Disponível no nível ${def.level}.`);
    const slot=payload.slotIndex===undefined?Array.from({length:POND.slots},(_,i)=>i).find(i=>!next.pond.stock.some(a=>a.slot===i)):payload.slotIndex;
    if(!Number.isInteger(slot)||slot<0||slot>=POND.slots)return fail('Escolha um viveiro livre do lago.');
    if(next.pond.stock.some(a=>a.slot===slot))return fail('Esse viveiro já está ocupado.');
    if(next.coins<def.cost)return fail('Você precisa de mais moedas.');
    next.coins-=def.cost;next.pond.stock.push({slot,type:payload.aquatic,readyAt:now+def.duration,fedUntil:now+4*def.duration,pending:0});
    message=`${def.name} no lago! Ração para 4 ciclos incluída.`;
  } else if(type==='feedAquatic'||type==='collectAquatic') {
    const a=Number.isInteger(payload.stockIndex)?next.pond?.stock?.[payload.stockIndex]:null;
    if(!next.pond?.owned||!a)return fail('Escolha uma criação do seu lago.');
    const def=AQUACULTURE[a.type],production=aquaticProduction(a,now);
    if(type==='collectAquatic') {
      if(!production.amount)return fail('Ainda não há produção para coletar.');
      next.products={...emptyProducts(),...next.products};next.products[def.product]+=production.amount;
      a.pending=0;a.readyAt+=production.cycles*def.duration;next.xp+=production.amount*def.xp;
      message=`+${production.amount} ${PRODUCTS[def.product].plural.toLowerCase()} no armazém.`;
    } else {
      if(a.fedUntil-now>=def.duration*4)return fail('Essa criação já tem ração suficiente.');
      if(!(next.feed?.[def.feed]>0))return fail('Sem ração aquática. Prepare soja e trigo no moinho.');
      next.feed[def.feed]--;a.pending=production.amount;
      a.readyAt=now+production.remaining;a.fedUntil=Math.max(now,a.fedUntil)+def.duration*4;
      message=`${def.name} alimentada. A produção continua!`;
    }
  } else if (type === 'buyAnimal') {
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
      next.products={...emptyProducts(),...next.products};next.products[def.product]+=production.amount;
      a.pending=0;a.readyAt+=production.cycles*def.duration;next.xp+=production.amount*def.xp;
      message=`+${production.amount} ${(production.amount===1?PRODUCTS[def.product].name:PRODUCTS[def.product].plural).toLowerCase()} no armazém.`;
    } else {
      if(a.fedUntil-now>=def.duration*4)return fail('Esse animal já tem comida suficiente.');
      if(!(next.feed?.[def.feed]>0))return fail(`Sem ${FEEDS[def.feed].name.toLowerCase()}. Prepare os ingredientes no moinho.`);
      next.feed[def.feed]--;a.pending=production.amount;
      a.readyAt=now+production.remaining;a.fedUntil=Math.max(now,a.fedUntil)+def.duration*4;
      message=`${def.name} alimentada. A produção continua!`;
    }
  } else if (type === 'rename') {
    if (typeof payload.name !== 'string' || payload.name.trim().length < 2 || payload.name.trim().length > 30) return fail('Use um nome de 2 a 30 caracteres.');
    if (payload.farmer !== undefined && !['male','female'].includes(payload.farmer)) return fail('Escolha fazendeiro ou fazendeira.');
    next.farmName = payload.name.trim();next.farmer=payload.farmer ?? next.farmer ?? 'male'; message = `Fazenda e personagem atualizados: ${next.farmName} · ${next.farmer==='female'?'Fazendeira':'Fazendeiro'}.`;
  } else if(type==='buyTool') {
    const id=payload.tool,def=Object.hasOwn(TOOL_SHOP,id)&&id!=='fertilize'?TOOL_SHOP[id]:null;
    if(!def)return fail('Escolha uma ferramenta da loja.');
    if(ownsTool(next,id))return fail('Você já tem essa ferramenta.');
    if(next.coins<def.cost)return fail('Você precisa de mais moedas para comprar essa ferramenta.');
    next.tools={weed:false,spray:false,fertilize:false,...next.tools,[id]:true};next.coins-=def.cost;message=`${def.name} comprada! Ferramenta liberada na barra.`;
  } else if (type === 'buyFertilizer') {
    if (next.coins < FERTILIZER_PRICE) return fail('Você precisa de mais moedas para comprar adubo.');
    next.supplies ||= { fertilizer: 0 };if(next.supplies.fertilizer>=1e6)return fail('Sua bolsa de adubo está cheia.');next.tools={weed:false,spray:false,...next.tools,fertilize:true}; next.supplies.fertilizer++; next.coins -= FERTILIZER_PRICE;
    message = '+1 adubo na sua bolsa.';
  } else if (type === 'weed' || type === 'spray') {
    if(!ownsTool(next,type))return fail(`Compre ${TOOL_SHOP[type].name.toLowerCase()} em Loja → Ferramentas.`);
    if (!plot || !plot.crop) return fail('Escolha um canteiro plantado.');
    const care = plotCare(plot, now), weed = type === 'weed';
    if (!(weed ? care.weeds : care.pests)) return fail(weed ? 'Esse canteiro está livre de ervas daninhas.' : 'Esse canteiro está livre de pragas.');
    plot[weed ? 'weeded' : 'sprayed'] = true; next.xp++;
    message = (weed ? 'Ervas daninhas removidas.' : 'Pragas eliminadas.') + ' +1 XP';
  } else if (type === 'fertilize') {
    if(!ownsTool(next,'fertilize'))return fail('Compre adubo em Loja → Ferramentas.');
    if (plot?.crop && !plot.watered) return fail('A plantação está seca. Regue antes de adubar.');
    if (!plot || plotStatus(plot, now) !== 'growing') return fail('Use adubo em uma plantação que ainda está crescendo.');
    if (plot.fertilized) return fail('Essa plantação já recebeu adubo.');
    next.supplies ||= { fertilizer: 0 };
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
    if (!next.water.amount) return fail(`Sem água no regador. Você recebe +1 água em ${Math.ceil(water.remaining / 1000)}s.`);
    next.water.amount--;
    next.water.nextAt ??= now + WATER_REFILL_MS;
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
      const collection=Object.hasOwn(PRODUCTS,id)?(next.products={...emptyProducts(),...next.products}):next.harvest;
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
