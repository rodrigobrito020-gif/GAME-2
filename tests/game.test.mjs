import test from 'node:test';
import assert from 'node:assert/strict';
import { CROPS, QUESTS, newGame, action, decodeSave, plotStatus, progress, expansionPrice, levelInfo } from '../public/game.js';
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
  assert.equal(s.harvest.carrot,1); assert.equal(s.xp,5); assert.equal(s.plots[0].crop,null); assert.equal(s.coins,185);
  assert.equal(action(s,'harvest',{index:0},NOW).ok,false);
});
test('regar adianta 25% do ciclo uma única vez sem criar colheita automaticamente',()=>{
  let s=action(newGame(NOW),'plant',{index:2,crop:'carrot'},NOW).state;
  const r=action(s,'water',{index:2},NOW+1000); s=r.state;
  assert.equal(s.plots[2].readyAt,NOW+22_500); assert.equal(s.harvest.carrot,0); assert.equal(action(s,'water',{index:2},NOW+2000).ok,false);
  assert.equal(plotStatus(s.plots[2],NOW+22_499),'growing'); assert.equal(plotStatus(s.plots[2],NOW+22_500),'ready');
});
test('vender paga o preço correto, dá a recompensa só uma vez e não vende sementes',()=>{
  let s=action(newGame(NOW),'harvest',{index:0},NOW).state;
  const seeds=structuredClone(s.seeds), r=action(s,'sell',{crop:'carrot'},NOW); s=r.state;
  assert.equal(r.earned,19); assert.equal(s.coins,229); assert.equal(s.harvest.carrot,0); assert.deepEqual(s.seeds,seeds);
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
  assert.equal(s.quests.length,QUESTS.length); assert.equal(s.coins,244);
});
test('save recarrega os mesmos itens e calcula crescimento offline por timestamps',()=>{
  const s=action(newGame(NOW),'plant',{index:2,crop:'carrot'},NOW).state;
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
    assert.equal(action(s,'harvest',{index:2},NOW+c.duration-1).ok,false);
    s=action(s,'harvest',{index:2},NOW+c.duration).state;
    s=action(s,'sell',{crop:id},NOW+c.duration).state;
    assert.equal(s.coins,1000-c.cost+c.sell); assert.equal(s.harvest[id],0); assert.equal(s.seeds[id],0);
  }
});
