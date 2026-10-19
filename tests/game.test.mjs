import test from 'node:test';
import assert from 'node:assert/strict';
import { CROPS, QUESTS, WATER_CAPACITY, WATER_REFILL_MS, waterStatus, newGame, action, decodeSave, plotStatus, plotCare, animalProduction, ANIMALS, progress, growthRemaining, expansionPrice, levelInfo } from '../public/game.js';
const NOW=1_800_000_000_000;
test('novo sítio começa com nove canteiros, sementes e uma colheita pronta',()=>{
  const s=newGame(NOW); assert.equal(s.plots.filter(p=>p.unlocked).length,9); assert.equal(plotStatus(s.plots[0],NOW),'ready'); assert.equal(s.coins,160); assert.equal(s.seeds.carrot,6); assert.equal(s.plots.length,16);
});
test('plantar consome exatamente uma semente e não altera o estado anterior',()=>{
  const s=newGame(NOW), before=structuredClone(s), r=action(s,'plant',{index:2,crop:'carrot'},NOW);
  assert.equal(r.ok,true); assert.deepEqual(s,before); assert.equal(r.state.seeds.carrot,5); assert.equal(r.state.plots[2].readyAt,NOW+30_000); assert.equal(r.state.coins,175);
});
test('rejeita canteiro ocupado, bloqueado, inexistente e cultivo sem sementes',()=>{
  const s=newGame(NOW);
  for(const index of [0,3,99,-1]) assert.equal(action(s,'plant',{index,crop:'carrot'},NOW).ok,false);
  s.seeds.carrot=0; assert.equal(action(s,'plant',{index:2,crop:'carrot'},NOW).ok,false);
});
test('colher exige maturidade; guarda produto, libera a terra e concede XP',()=>{
  let s=newGame(NOW); assert.equal(action(s,'harvest',{index:1},NOW).ok,false);
  const r=action(s,'harvest',{index:0},NOW); s=r.state;
  assert.equal(s.harvest.turnip,1); assert.equal(s.xp,5); assert.equal(s.plots[0].crop,null); assert.equal(s.coins,185);
  assert.equal(action(s,'harvest',{index:0},NOW).ok,false);
});
test('regar adianta 25% do ciclo uma única vez sem criar colheita automaticamente',()=>{
  let s=action(newGame(NOW),'plant',{index:2,crop:'carrot'},NOW).state;
  const r=action(s,'water',{index:2},NOW+1000); s=r.state;
  assert.equal(s.plots[2].readyAt,NOW+23_500); assert.equal(s.harvest.carrot,0); assert.equal(action(s,'water',{index:2},NOW+2000).ok,false);
  assert.equal(plotStatus(s.plots[2],NOW+23_499),'growing'); assert.equal(plotStatus(s.plots[2],NOW+23_500),'ready');
});
test('vender paga o preço correto, dá a recompensa só uma vez e não vende sementes',()=>{
  let s=action(newGame(NOW),'harvest',{index:0},NOW).state;
  const seeds=structuredClone(s.seeds), r=action(s,'sell',{crop:'turnip'},NOW); s=r.state;
  assert.equal(r.earned,15); assert.equal(s.coins,225); assert.equal(s.harvest.turnip,0); assert.deepEqual(s.seeds,seeds);
  assert.equal(action(s,'sell',{crop:'carrot'},NOW).ok,false);
});
test('vender tudo preserva as sementes e não duplica renda em cliques repetidos',()=>{
  let s=newGame(NOW); s.harvest.carrot=3; s.harvest.wheat=2;
  const r=action(s,'sellAll',{},NOW); assert.equal(r.earned,3*19+2*29); assert.equal(r.state.stats.sold,5); assert.equal(action(r.state,'sellAll',{},NOW).ok,false);
});
test('loja respeita preço, estoque, nível e quantidade válida',()=>{
  const s=newGame(NOW), bought=action(s,'buy',{crop:'carrot',qty:3},NOW);
  assert.equal(bought.state.coins,136); assert.equal(bought.state.seeds.carrot,9);
  for(const qty of [-1,0,1.5,100,NaN]) assert.equal(action(s,'buy',{crop:'carrot',qty},NOW).ok,false);
  assert.equal(action(s,'buy',{crop:'pumpkin'},NOW).ok,false);
  s.coins=0; assert.equal(action(s,'buy',{crop:'carrot'},NOW).ok,false);
});
test('expansão debita moedas, libera somente o canteiro escolhido e aumenta preço',()=>{
  const s=newGame(NOW), r=action(s,'expand',{index:3},NOW);
  assert.equal(expansionPrice(s),100); assert.equal(r.state.coins,60); assert.equal(r.state.plots[3].unlocked,true); assert.equal(r.state.plots[7].unlocked,false); assert.equal(expansionPrice(r.state),175);
  assert.equal(action(r.state,'expand',{index:7},NOW).ok,false); assert.equal(action(r.state,'expand',{index:3},NOW).ok,false);
});
test('objetivos recompensam cada conquista exatamente uma vez',()=>{
  let s=newGame(NOW);
  for(const index of [2,6]) s=action(s,'plant',{index,crop:'carrot'},NOW).state;
  assert.equal(s.coins,175); assert.deepEqual(s.quests,['plant']);
  s=action(s,'harvest',{index:0},NOW).state;
  s=action(s,'sellAll',{},NOW).state;
  assert.equal(s.quests.length,QUESTS.length); assert.equal(s.coins,240);
});
test('save recarrega os mesmos itens e calcula crescimento offline por timestamps',()=>{
  let s=action(newGame(NOW),'plant',{index:2,crop:'carrot'},NOW).state;
  s=action(s,'water',{index:2},NOW).state;
  const loaded=decodeSave(JSON.stringify(s),NOW+3600_000);
  assert.deepEqual(loaded.seeds,s.seeds); assert.equal(loaded.coins,s.coins); assert.equal(plotStatus(loaded.plots[2],NOW+3600_000),'ready'); assert.equal(loaded.harvest.carrot,0);
});
test('saves inválidos são rejeitados sem lançar erro',()=>{
  for(const raw of ['{','null','[]','{}','undefined']) assert.equal(decodeSave(raw,NOW),null);
  const mutate=[s=>s.coins=-1,s=>s.xp=Infinity,s=>s.plots.pop(),s=>s.seeds.carrot=1.2,s=>s.plots[2].crop='banana',s=>s.plots[0].readyAt=0,s=>s.quests=['plant','plant']];
  for(const change of mutate) { const s=newGame(NOW); change(s); assert.equal(decodeSave(JSON.stringify(s),NOW),null); }
});
test('níveis têm limiares crescentes e desbloqueiam novos cultivos',()=>{
  assert.deepEqual(levelInfo(0),{level:1,current:0,required:30}); assert.equal(levelInfo(29).level,1); assert.equal(levelInfo(30).level,2); assert.equal(levelInfo(80).level,3);
  const s=newGame(NOW); s.xp=30; assert.equal(action(s,'buy',{crop:'strawberry'},NOW).ok,true); assert.equal(action(s,'buy',{crop:'corn'},NOW).ok,false);
});
test('crescimento nunca retorna valores fora de zero a um',()=>{
  const p=newGame(NOW).plots[1]; assert.equal(progress(p,NOW-1e6),0); assert.equal(progress(p,NOW+1e6),1); assert.equal(progress(newGame(NOW).plots[2],NOW),0);
});
test('identificadores e índices inválidos não modificam protótipos ou a economia',()=>{
  const s=newGame(NOW);
  for(const index of ['__proto__','constructor',NaN,Infinity,1.2]) assert.equal(action(s,'expand',{index},NOW).ok,false);
  for(const crop of ['__proto__','constructor','banana']) assert.equal(action(s,'buy',{crop},NOW).ok,false);
  assert.equal(Array.prototype.unlocked,undefined); assert.equal(s.coins,160);
});
test('um ciclo completo de todos os cultivos gera renda e mantém ownership',()=>{
  for(const [id,c] of Object.entries(CROPS)) {
    let s=newGame(NOW); s.coins=1000; s.xp=1000; s.seeds[id]=0; s.quests=QUESTS.map(q=>q.id);
    s=action(s,'buy',{crop:id},NOW).state;
    s=action(s,'plant',{index:2,crop:id},NOW).state;
    s=action(s,'water',{index:2},NOW).state;
    const readyAt=s.plots[2].readyAt;
    assert.equal(action(s,'harvest',{index:2},readyAt-1).ok,false);
    s=action(s,'harvest',{index:2},readyAt).state;
    s=action(s,'sell',{crop:id},NOW+c.duration).state;
    assert.equal(s.coins,1000-c.cost+c.sell); assert.equal(s.harvest[id],0); assert.equal(s.seeds[id],0);
  }
});

test('guia: duas plantas iniciais de nabo e migração de saves antigos',()=>{
  const s=newGame(NOW); assert.equal(s.plots.filter(p=>p.crop==='turnip').length,2);
  const old=structuredClone(s); for(const k of ['turnip','tomato','watermelon']){delete old.seeds[k];delete old.harvest[k];}delete old.supplies;delete old.animals;delete old.products;delete old.farmName;
  const loaded=decodeSave(JSON.stringify(old),NOW);assert(loaded);assert.equal(loaded.seeds.tomato,0);assert.equal(loaded.supplies.fertilizer,3);assert.deepEqual(loaded.animals,[]);assert.equal(loaded.coins,s.coins);
});
test('mato, pragas e seca reduzem saúde; ferramentas restauram saúde sem XP repetido',()=>{
  let s=action(newGame(NOW),'plant',{index:2,crop:'carrot'},NOW).state;
  assert.equal(plotCare(s.plots[2],NOW+1).health,90);
  s=action(s,'water',{index:2},NOW).state;
  assert.equal(plotCare(s.plots[2],NOW+1).health,100);
  assert.deepEqual(plotCare(s.plots[2],NOW+20_000),{weeds:true,pests:true,dry:false,health:40});
  s=action(s,'weed',{index:2},NOW+20_000).state; assert.equal(s.xp,1);
  assert.equal(action(s,'weed',{index:2},NOW+20_000).ok,false);
  s=action(s,'spray',{index:2},NOW+20_000).state;
  s=action(s,'water',{index:2},NOW+20_000).state;
  assert.equal(plotCare(s.plots[2],NOW+20_000).health,100);assert.equal(s.xp,2);
  s=action(s,'harvest',{index:2},NOW+31_000).state;assert.equal(s.harvest.carrot,2);
});
test('adubo consome uma unidade, adianta tempo e não repete aplicação',()=>{
  let s=action(newGame(NOW),'plant',{index:2,crop:'carrot'},NOW).state;
  s=action(s,'water',{index:2},NOW).state;
  s=action(s,'fertilize',{index:2},NOW+1000).state;
  assert.equal(s.supplies.fertilizer,2);assert.equal(s.plots[2].readyAt,NOW+16_500);
  assert.equal(action(s,'fertilize',{index:2},NOW+1000).ok,false);
  const r=action(s,'buyFertilizer',{},NOW+1000);assert.equal(r.state.supplies.fertilizer,3);assert.equal(r.state.coins,s.coins-15);
  s.supplies.fertilizer=0;assert.equal(action(s,'fertilize',{index:6},NOW).ok,false);
});
test('animais: compra, limite de nível, ração, produção offline e coleta única',()=>{
  let s=newGame(NOW);assert.equal(action(s,'buyAnimal',{animal:'cow'},NOW).ok,false);
  s=action(s,'buyAnimal',{animal:'chicken'},NOW).state;assert.equal(s.coins,100);assert.equal(s.animals.length,1);
  assert.equal(action(s,'collectAnimal',{animalIndex:0},NOW+59_999).ok,false);
  assert.equal(animalProduction(s.animals[0],NOW+61_000).amount,1);
  s=action(s,'collectAnimal',{animalIndex:0},NOW+61_000).state;assert.equal(s.products.egg,1);
  assert.equal(action(s,'collectAnimal',{animalIndex:0},NOW+61_000).ok,false);
  const p=animalProduction(s.animals[0],NOW+900_000);assert.equal(p.amount,3);assert.equal(p.hungry,true);
  s=action(s,'feedAnimal',{animalIndex:0},NOW+900_000).state;
  assert.equal(s.coins,95);assert.equal(animalProduction(s.animals[0],NOW+900_000).amount,3);
  s=action(s,'collectAnimal',{animalIndex:0},NOW+900_000).state;assert.equal(s.products.egg,4);
  assert.equal(animalProduction(s.animals[0],NOW+959_999).amount,0);assert.equal(animalProduction(s.animals[0],NOW+960_000).amount,1);
  const loaded=decodeSave(JSON.stringify(s),NOW+960_000);assert.deepEqual(loaded.animals,s.animals);assert.deepEqual(loaded.products,s.products);
  s=action(s,'sellAll',{},NOW+960_000).state;assert.equal(s.products.egg,0);assert.equal(s.coins,95+4*16+25);
});
test('vaca produz leite; alimentação antes de acabar preserva o ciclo; cercado comporta seis',()=>{
  let s=newGame(NOW);s.xp=100;s.coins=10000;
  s=action(s,'buyAnimal',{animal:'cow'},NOW).state;
  s=action(s,'feedAnimal',{animalIndex:0},NOW+30_000).state;
  assert.equal(s.animals[0].readyAt,NOW+ANIMALS.cow.duration);
  s=action(s,'collectAnimal',{animalIndex:0},NOW+120_000).state;assert.equal(s.products.milk,1);
  for(let i=0;i<5;i++)s=action(s,'buyAnimal',{animal:'chicken'},NOW).state;
  assert.equal(action(s,'buyAnimal',{animal:'chicken'},NOW).ok,false);
  assert.equal(action(s,'feedAnimal',{animalIndex:-1},NOW).ok,false);
});
test('nome da fazenda validado e persistido sem alterar a economia',()=>{
  const s=newGame(NOW);assert.equal(action(s,'rename',{name:'a'},NOW).ok,false);
  const r=action(s,'rename',{name:' Sítio do evento '},NOW);assert.equal(r.state.farmName,'Sítio do evento');assert.equal(r.state.coins,s.coins);assert.equal(decodeSave(JSON.stringify(r.state),NOW).farmName,'Sítio do evento');
});

test('sem rega nenhum cultivo cresce ou gera colheita, mesmo após dias offline',()=>{
 for(const id of Object.keys(CROPS)) {
  let s=newGame(NOW);s.xp=1000;s.seeds[id]=2;s=action(s,'plant',{index:2,crop:id},NOW).state;
  for(const elapsed of [0,1000,CROPS[id].duration,86400_000]) {
   assert.equal(plotStatus(s.plots[2],NOW+elapsed),'dry');assert.equal(progress(s.plots[2],NOW+elapsed),0);
   assert.equal(growthRemaining(s.plots[2],NOW+elapsed),CROPS[id].duration);
   assert.equal(action(s,'harvest',{index:2},NOW+elapsed).ok,false);
  }
  s=decodeSave(JSON.stringify(s),NOW+86400_000);assert.equal(plotStatus(s.plots[2],NOW+86400_000),'dry');assert.equal(s.harvest[id],0);
 }
});
test('regar depois de uma longa espera inicia o ciclo; o tempo seco não acumula',()=>{
 let s=action(newGame(NOW),'plant',{index:2,crop:'carrot'},NOW).state;
 const resumed=NOW+86400_000;s=action(s,'water',{index:2},resumed).state;
 assert.equal(s.plots[2].growthStartedAt,resumed);assert.equal(progress(s.plots[2],resumed),0);assert.equal(growthRemaining(s.plots[2],resumed),22500);
 assert.equal(action(s,'harvest',{index:2},resumed).ok,false);
 assert.equal(plotStatus(s.plots[2],resumed+22499),'growing');s=action(s,'harvest',{index:2},resumed+22500).state;assert.equal(s.harvest.carrot,1);
});
test('adubo não substitui água nem é consumido em planta seca; save antigo não burla a rega',()=>{
 let s=action(newGame(NOW),'plant',{index:2,crop:'carrot'},NOW).state;
 assert.equal(action(s,'fertilize',{index:2},NOW+86400_000).ok,false);assert.equal(s.supplies.fertilizer,3);
 delete s.plots[2].growthStartedAt;
 s=decodeSave(JSON.stringify(s),NOW+86400_000);assert.equal(plotStatus(s.plots[2],NOW+86400_000),'dry');assert.equal(action(s,'harvest',{index:2},NOW+86400_000).ok,false);
 s=action(s,'water',{index:2},NOW+86400_000).state;assert.equal(plotStatus(s.plots[2],NOW+86400_000),'growing');
});


test('regador começa com 30 águas; as duas plantas iniciais não gastam a reserva',()=>{
 const s=newGame(NOW);assert.equal(WATER_CAPACITY,30);assert.equal(WATER_REFILL_MS,120000);
 assert.deepEqual(waterStatus(s,NOW),{amount:30,nextAt:null,remaining:0});
 assert.deepEqual(waterStatus(s,NOW+86400000),{amount:30,nextAt:null,remaining:0});
});
test('rega gasta uma água; regas inválidas e outras ações não gastam nem reiniciam recarga',()=>{
 let s=action(newGame(NOW),'plant',{index:2,crop:'carrot'},NOW).state;
 s=action(s,'water',{index:2},NOW).state;assert.deepEqual(s.water,{amount:29,nextAt:NOW+120000});
 const invalid=action(s,'water',{index:2},NOW+30000);assert.equal(invalid.ok,false);assert.deepEqual(invalid.state,s);
 s=action(s,'buy',{crop:'carrot'},NOW+30000).state;assert.deepEqual(s.water,{amount:29,nextAt:NOW+120000});
 s=action(s,'plant',{index:6,crop:'carrot'},NOW+30000).state;s=action(s,'water',{index:6},NOW+30000).state;
 assert.deepEqual(s.water,{amount:28,nextAt:NOW+120000});
 const before=structuredClone(s);assert.deepEqual(waterStatus(s,NOW+119999),{amount:28,nextAt:NOW+120000,remaining:1});assert.deepEqual(s,before);
 assert.deepEqual(waterStatus(s,NOW+120000),{amount:29,nextAt:NOW+240000,remaining:120000});
 assert.deepEqual(waterStatus(s,NOW+240000),{amount:30,nextAt:null,remaining:0});
});
test('sem água não rega nem inicia crescimento; a primeira carga libera exatamente em dois minutos',()=>{
 let s=action(newGame(NOW),'plant',{index:2,crop:'carrot'},NOW).state;
 s.water={amount:0,nextAt:NOW+120000};const before=structuredClone(s);
 for(const t of [NOW,NOW+60000,NOW+119999]){const r=action(s,'water',{index:2},t);assert.equal(r.ok,false);assert.match(r.message,/Sem água/);assert.deepEqual(r.state,before);}
 s=action(s,'water',{index:2},NOW+120000).state;
 assert.deepEqual(s.water,{amount:0,nextAt:NOW+240000});assert.equal(s.plots[2].watered,true);assert.equal(s.plots[2].growthStartedAt,NOW+120000);
});
test('recarga offline preserva fração de tempo e para em 30, sem acumular bônus na reserva cheia',()=>{
 const s=newGame(NOW);s.water={amount:2,nextAt:NOW+120000};
 const loaded=decodeSave(JSON.stringify(s),NOW+5*60000);
 assert.deepEqual(loaded.water,{amount:4,nextAt:NOW+360000});assert.equal(waterStatus(loaded,NOW+300000).remaining,60000);
 const full=decodeSave(JSON.stringify(s),NOW+86400000);assert.deepEqual(full.water,{amount:30,nextAt:null});
 let planted=action(full,'plant',{index:2,crop:'carrot'},NOW+86400000).state;planted=action(planted,'water',{index:2},NOW+86400000).state;
 assert.deepEqual(planted.water,{amount:29,nextAt:NOW+86400000+120000});
});
test('reabrir não reinicia a recarga e saves anteriores ganham 30 águas preservando os itens',()=>{
 const s=newGame(NOW);s.water={amount:0,nextAt:NOW+120000};
 const first=decodeSave(JSON.stringify(s),NOW+70000),second=decodeSave(JSON.stringify(first),NOW+110000);
 assert.deepEqual(second.water,s.water);assert.equal(waterStatus(second,NOW+110000).remaining,10000);
 const old=structuredClone(s);delete old.water;old.coins=777;old.seeds.carrot=17;
 const migrated=decodeSave(JSON.stringify(old),NOW+70000);assert.deepEqual(migrated.water,{amount:30,nextAt:null});assert.equal(migrated.coins,777);assert.deepEqual(migrated.seeds,old.seeds);assert.deepEqual(migrated.plots,old.plots);
});
test('saves rejeitam quantidades e horários de água inválidos',()=>{
 for(const water of [null,{amount:-1,nextAt:NOW},{amount:31,nextAt:null},{amount:1.5,nextAt:NOW},{amount:0,nextAt:null},{amount:0,nextAt:'120000'},{amount:30,nextAt:NOW}]){
  const s=newGame(NOW);s.water=water;assert.equal(decodeSave(JSON.stringify(s),NOW),null);
 }
});

test('fazendeiro e fazendeira persistem sem mudar itens, progresso ou reserva de água',()=>{
 const s=newGame(NOW);s.coins=777;s.seeds.carrot=18;s.water={amount:12,nextAt:NOW+120000};
 const changed=action(s,'rename',{name:'Fazenda da Aurora',farmer:'female'},NOW).state;
 assert.equal(changed.farmer,'female');assert.equal(changed.farmName,'Fazenda da Aurora');assert.deepEqual(changed.water,s.water);assert.deepEqual(changed.seeds,s.seeds);assert.equal(changed.coins,777);assert.deepEqual(changed.plots,s.plots);
 const loaded=decodeSave(JSON.stringify(changed),NOW+1000);assert.equal(loaded.farmer,'female');assert.deepEqual(loaded.water,s.water);
 assert.equal(action(loaded,'rename',{name:loaded.farmName,farmer:'male'},NOW+1000).state.farmer,'male');
 const old=structuredClone(s);delete old.farmer;assert.equal(decodeSave(JSON.stringify(old),NOW).farmer,'male');
});
test('aparência inválida não altera o personagem nem os itens',()=>{
 const s=newGame(NOW);assert.equal(action(s,'rename',{name:'Teste',farmer:'unknown'},NOW).ok,false);assert.equal(s.farmer,'male');
 s.farmer='unknown';assert.equal(decodeSave(JSON.stringify(s),NOW),null);
});
