// A deterministic new-player route, using only public rules and real purchases.
import assert from 'node:assert/strict';
import {newGame,action,decodeSave,waterStatus,levelInfo,orderDetails} from '../public/game.js';
const start=Date.parse('2026-10-19T15:00:00Z');let now=start,state=newGame(start);const milestones=[];
function doAction(type,payload={}){now+=2000;const r=action(state,type,payload,now);assert.ok(r.ok,`${type}: ${r.message}`);state=r.state;return r;}
function checkpoint(name){state=decodeSave(JSON.stringify(state),now);assert.ok(state);milestones.push({name,seconds:(now-start)/1000,level:levelInfo(state.xp).level,coins:state.coins,water:waterStatus(state,now).amount,orders:state.orders.completed});}
doAction('buyTool',{tool:'weed'});doAction('buyTool',{tool:'spray'});checkpoint('Duas ferramentas, sem alterar sementes ou reserva de água');
now+=30000;for(const index of[0,1]){if(action(state,'weed',{index},now).ok)doAction('weed',{index});if(action(state,'spray',{index},now).ok)doAction('spray',{index});doAction('harvest',{index});}
for(let round=0;round<5;round++){
 const crop=round===0?'carrot':round===1?'wheat':round===2?'soybean':round===3?'alfalfa':'carrot';
 const indices=[0,1,2,4,5,6];
 for(const index of indices){if(!state.seeds[crop])doAction('buy',{crop});doAction('plant',{crop,index});doAction('water',{index});}
 now+=60000;
 for(const index of indices){doAction('weed',{index});doAction('spray',{index});doAction('harvest',{index});}
 for(const order of [...state.orders.active])if(orderDetails(state,order).ready)doAction('deliverOrder',{serial:order.serial});
 doAction('sellAll');checkpoint(`Colheita ${round+1}, vendas e encomendas`);
 if(round===0){doAction('expand',{index:3});doAction('buyAnimal',{animal:'chicken'});checkpoint('Primeira expansão e galinha');}
 if(round===2){doAction('buyPond');doAction('buyAquatic',{aquatic:'fish',slotIndex:0});checkpoint('Lago e primeiro viveiro');}
}
assert.ok(state.pond.owned);assert.ok(state.animals.length===1);assert.ok(state.orders.completed>=3);assert.ok(waterStatus(state,now).amount>0);assert.ok(state.coins>0);
console.log(JSON.stringify({route:'Compras, seis canteiros por ciclo, cuidados, encomendas e vendas; relógio simulado, sem injetar moedas/XP/estoque.',milestones},null,2));
