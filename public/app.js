import { SAVE_KEY, CROPS, QUESTS, newGame, decodeSave, levelInfo, plotStatus, progress, expansionPrice, action } from './game.js';
import { icon, cropIcon, landscape, plotMarkup } from './art.js';

const $ = selector => document.querySelector(selector);
const format = n => new Intl.NumberFormat('pt-BR').format(n);
const time = ms => { const s=Math.max(0,Math.ceil(ms/1000)); return s<60?`${s}s`:`${Math.floor(s/60)}min${s%60?` ${s%60}s`:''}`; };
let state, saveAvailable=true, recovered=false;
try { const raw=localStorage.getItem(SAVE_KEY); state=raw?decodeSave(raw):newGame(); if(!state) { localStorage.setItem(SAVE_KEY+'-backup',raw); state=newGame(); recovered=true; } }
catch { state=newGame(); saveAvailable=false; }
let tool='smart', selectedCrop='carrot', modalType=null, expansionIndex=null, toastTimer, zoom=1, lastSignature='', returnFocus=null;
const farm=$('#farm');
farm.innerHTML=landscape()+'<g id="plots"></g>';
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));

function toast(message, error=false) {
  const el=$('#toast'); el.textContent=message; el.className=`toast visible ${error?'error':''}`;
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('visible'),4800);
}
function persist() {
  try { localStorage.setItem(SAVE_KEY,JSON.stringify(state)); saveAvailable=true; }
  catch { saveAvailable=false; }
  $('#save-status').textContent=saveAvailable?'✓ Progresso salvo neste navegador':'! Salvamento indisponível: mantenha esta aba aberta';
  $('#save-status').classList.toggle('save-warning',!saveAvailable);
}
function run(type,payload={}) {
  const result=action(state,type,payload);
  if(!result.ok) { toast(result.message,true); return false; }
  state=result.state; persist(); render();
  let message=result.message;
  if(result.rewards.length) message+=` Objetivo concluído: +${result.rewards.reduce((n,q)=>n+q.reward,0)} moedas!`;
  if(result.levelUp) message+=` Olá, nível ${levelInfo(state.xp).level}! Novos cultivos esperam por você.`;
  toast(message); return true;
}
function selectTool(next) {
  tool=next;
  document.querySelectorAll('[data-tool]').forEach(el=>{ el.classList.toggle('active',el.dataset.tool===tool); el.setAttribute('aria-pressed',String(el.dataset.tool===tool)); });
  $('#map-hint').textContent={smart:'Clique para plantar ou colher. Sem pressa.',plant:`Plante ${CROPS[selectedCrop].name.toLowerCase()} em um canteiro vazio`,water:'Clique em uma plantação para regar',harvest:'Clique nas plantações com ✓ para colher'}[tool];
  farm.dataset.activeTool=tool;
}
function renderPlots(force=false) {
  const now=Date.now();
  const signature=JSON.stringify(state.plots.map(p=>[p.unlocked,p.crop,p.watered,plotStatus(p,now),Math.floor(progress(p,now)*2)]));
  if(force||signature!==lastSignature) {
    const focus=document.activeElement?.dataset.plot;
    $('#plots').innerHTML=plotMarkup(state,now); lastSignature=signature;
    if(focus!==undefined) farm.querySelector(`[data-plot="${focus}"]`)?.focus({preventScroll:true});
  }
  state.plots.forEach((p,i)=>{
    if(p.crop) { const ready=plotStatus(p,now)==='ready', label=`Canteiro ${i+1}, ${CROPS[p.crop].name}, ${ready?'pronta para colher':time(p.readyAt-now)+' restantes'}`; const node=farm.querySelector(`[data-plot="${i}"]`); node.setAttribute('aria-label',label); node.querySelector('title').textContent=label; }
  });
  const ready=state.plots.filter(p=>plotStatus(p,now)==='ready').length;
  $('#ready-count').innerHTML=ready?`<span>✦</span> ${ready} ${ready===1?'colheita pronta':'colheitas prontas'}`:'<span>☘</span> Tudo no seu tempo';
  $('#ready-count').classList.toggle('is-ready',ready>0);
}
function render() {
  const level=levelInfo(state.xp);
  $('#coins').textContent=format(state.coins); $('#level').textContent=level.level;
  $('#xp-fill').style.width=`${Math.min(100,level.current/level.required*100)}%`; $('#xp-label').textContent=`${level.current} / ${level.required} XP`;
  $('#plot-count').textContent=`${state.plots.filter(p=>p.unlocked).length} canteiros`;
  $('#storage-count').textContent=Object.values(state.harvest).reduce((a,b)=>a+b,0);
  $('#quest-count').textContent=`${state.quests.length}/3`;
  $('#quests').innerHTML=QUESTS.map((q,i)=>`<div class="quest ${state.quests.includes(q.id)?'done':''}"><span class="quest-check">${state.quests.includes(q.id)?'✓':i+1}</span><div><b>${q.title}</b><p>${q.detail}</p><small>${state.quests.includes(q.id)?'Concluído':`● +${q.reward} moedas`}</small></div></div>`).join('');
  $('#seed-tray').innerHTML=Object.entries(CROPS).map(([id,c])=>{
    const locked=level.level<c.level;
    return `<button class="seed-card ${selectedCrop===id?'selected':''} ${locked?'locked':''}" data-seed="${id}" aria-pressed="${selectedCrop===id}" ${locked?'disabled':''}><span class="seed-art">${cropIcon(id)}</span><span class="seed-info"><b>${c.name}</b><small>${locked?`Nível ${c.level}`:`${time(c.duration)} · ${c.xp} XP`}</small></span><span class="seed-stock">${locked?icon('lock'):state.seeds[id]}</span>${selectedCrop===id?'<span class="selected-dot">✓</span>':''}</button>`;
  }).join('');
  renderPlots(true);
  if(modalType) renderModal();
}
function plotClick(index) {
  const p=state.plots[index], status=plotStatus(p);
  if(status==='locked') { expansionIndex=index; openModal('expand'); return; }
  if(tool==='water') { run('water',{index}); return; }
  if(tool==='harvest'||(tool==='smart'&&status==='ready')) { run('harvest',{index}); return; }
  if((tool==='plant'||tool==='smart')&&status==='empty') { if(!state.seeds[selectedCrop]) { openModal('shop'); toast('Compre sementes para continuar plantando.'); } else run('plant',{index,crop:selectedCrop}); return; }
  if(status==='growing') toast(`${CROPS[p.crop].name}: ${time(p.readyAt-Date.now())} para colher.${p.watered?' Já recebeu água.':' Experimente a ferramenta Regar!'}`);
  else toast('Use Cuidar ou Colher para recolher essa plantação.');
}
farm.addEventListener('click',e=>{ const el=e.target.closest('[data-plot]'); if(el) plotClick(Number(el.dataset.plot)); });
farm.addEventListener('keydown',e=>{ const el=e.target.closest('[data-plot]'); if(el&&(e.key==='Enter'||e.key===' ')) {e.preventDefault();plotClick(Number(el.dataset.plot));} });
document.querySelectorAll('[data-tool]').forEach(el=>el.addEventListener('click',()=>selectTool(el.dataset.tool)));
$('#seed-tray').addEventListener('click',e=>{ const el=e.target.closest('[data-seed]'); if(el&&!el.disabled) {selectedCrop=el.dataset.seed;selectTool('plant');render();} });

function openModal(type) { returnFocus=document.activeElement; modalType=type; renderModal(); $('#modal').showModal(); }
function closeModal() { $('#modal').close(); modalType=null; returnFocus?.focus({preventScroll:true}); }
function renderModal() {
  const titles={shop:['SEMEAR É ACREDITAR','Loja de sementes'],storage:['DA TERRA PARA A SUA MESA','Seu armazém'],help:['BEM-VINDO AO SÍTIO AURORA','Um pouquinho a cada dia'],expand:['ESPAÇO PARA NOVOS COMEÇOS','Expanda seu sítio']};
  $('#modal-eyebrow').textContent=titles[modalType][0]; $('#modal-title').textContent=titles[modalType][1];
  if(modalType==='shop') {
    $('#modal-body').innerHTML=`<div class="modal-summary"><p>Sementes pequenas. Possibilidades enormes.</p><span class="gold-pill">● ${format(state.coins)} moedas</span></div><div class="shop-grid">${Object.entries(CROPS).map(([id,c])=>{
      const locked=levelInfo(state.xp).level<c.level;
      return `<article class="shop-card ${locked?'locked':''}"><div class="shop-crop">${cropIcon(id)}<span>${locked?`Nível ${c.level}`:time(c.duration)}</span></div><h3>${c.name}</h3><p>Colheita: <b>● ${c.sell}</b> <span>· ${c.xp} XP</span></p><small>Na sua bolsa: ${state.seeds[id]}</small><button data-buy="${id}" ${locked||state.coins<c.cost?'disabled':''}>${locked?icon('lock'):'+'} ${locked?`Nível ${c.level}`:`Comprar · ${c.cost}`}</button></article>`;
    }).join('')}</div><p class="modal-footnote">Cada semente ocupa um canteiro e rende uma colheita. Novos cultivos são liberados ao subir de nível.</p>`;
  } else if(modalType==='storage') {
    const total=Object.entries(CROPS).reduce((n,[id,c])=>n+state.harvest[id]*c.sell,0);
    $('#modal-body').innerHTML=`<div class="modal-summary"><p>Sua colheita espera aqui, fresquinha.</p><span class="gold-pill">● ${format(state.coins)} moedas</span></div><div class="storage-grid">${Object.entries(CROPS).map(([id,c])=>`<article class="storage-card ${state.harvest[id]?'':'empty'}">${cropIcon(id)}<div><h3>${c.plural}</h3><p>${state.harvest[id]} no armazém · ● ${c.sell} cada</p></div><button data-sell="${id}" ${state.harvest[id]?'':'disabled'}>Vender 1</button></article>`).join('')}</div><div class="sell-footer"><div><small>VALOR DE TODA A COLHEITA</small><b>● ${format(total)} moedas</b></div><button class="primary-button" data-sell-all ${total?'':'disabled'}>Vender tudo ${icon('coin')}</button></div><p class="modal-footnote">As sementes ficam na sua bolsa. Só a produção colhida é vendida.</p>`;
  } else if(modalType==='expand') {
    const price=expansionPrice(state);
    $('#modal-body').innerHTML=`<div class="expansion-art">${icon('sprout')}</div><p class="expansion-description">Mais um canteiro, mais histórias para plantar.<br>Este terreno será seu para cultivar o que quiser.</p><div class="expansion-price"><span>Novo canteiro</span><b>● ${price} moedas</b></div><button class="primary-button full" data-expand ${state.coins<price?'disabled':''}>${state.coins<price?'Junte mais moedas para expandir':'Preparar novo terreno'}</button><p class="modal-footnote">Você tem ${format(state.coins)} moedas. Cada expansão seguinte custa um pouco mais.</p>`;
  } else {
    $('#modal-body').innerHTML=`<div class="help-steps"><article>${icon('sprout')}<div><h3>1. Escolha e plante</h3><p>Selecione uma semente na bolsa e clique em um canteiro vazio. Mais sementes esperam na loja.</p></div></article><article>${icon('water')}<div><h3>2. Cuide e deixe crescer</h3><p>Use Regar em uma plantação para adiantar 25% do tempo, uma vez por cultivo. Ao clicar nela, você vê quanto falta.</p></div></article><article>${icon('basket')}<div><h3>3. Colha bons frutos</h3><p>O símbolo ✓ avisa quando está pronta. Clique com Cuidar ou Colher para guardar a produção e ganhar experiência.</p></div></article><article>${icon('crate')}<div><h3>4. Venda e faça crescer</h3><p>Abra o armazém para vender sua colheita. Use as moedas para comprar sementes e abrir novos canteiros marcados com +.</p></div></article></div><div class="help-note">Atalhos: <b>1</b> Cuidar · <b>2</b> Plantar · <b>3</b> Regar · <b>4</b> Colher · <b>Esc</b> Fechar janela<br>Seu progresso fica neste navegador e neste endereço. O crescimento continua enquanto você está fora.</div><button data-help-close class="primary-button full">Vamos cultivar ${icon('sprout')}</button>`;
  }
}
$('#modal-body').addEventListener('click',e=>{
  const buy=e.target.closest('[data-buy]'); if(buy&&!buy.disabled) {run('buy',{crop:buy.dataset.buy});return;}
  const sell=e.target.closest('[data-sell]'); if(sell&&!sell.disabled) {run('sell',{crop:sell.dataset.sell});return;}
  if(e.target.closest('[data-sell-all]')&&!e.target.closest('button').disabled) {run('sellAll');return;}
  if(e.target.closest('[data-expand]')&&!e.target.closest('button').disabled) {if(run('expand',{index:expansionIndex})) closeModal();return;}
  if(e.target.closest('[data-help-close]')) closeModal();
});
$('#open-shop').addEventListener('click',()=>openModal('shop'));
$('#open-storage').addEventListener('click',()=>openModal('storage'));
$('#help').addEventListener('click',()=>openModal('help'));
$('#close-modal').addEventListener('click',closeModal);
$('#modal').addEventListener('cancel',e=>{e.preventDefault();closeModal();});
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')) { const r=$('#modal').getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) closeModal();}});
document.addEventListener('keydown',e=>{
  if(modalType||e.ctrlKey||e.altKey||e.metaKey||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
  const shortcuts={1:'smart',2:'plant',3:'water',4:'harvest'};
  if(shortcuts[e.key]) selectTool(shortcuts[e.key]);
});
function zoomMap(delta) { zoom=Math.max(1,Math.min(1.6,zoom+delta)); const w=1400/zoom,h=820/zoom; farm.setAttribute('viewBox',`${700-w/2} ${440-h/2} ${w} ${h}`); $('#zoom-out').disabled=zoom<=1; $('#zoom-in').disabled=zoom>=1.59; }
$('#zoom-in').addEventListener('click',()=>zoomMap(.2)); $('#zoom-out').addEventListener('click',()=>zoomMap(-.2)); $('#zoom-out').disabled=true;
window.addEventListener('storage',e=>{ if(e.key===SAVE_KEY&&e.newValue) { const incoming=decodeSave(e.newValue); if(incoming) { state=incoming; render(); toast('Seu sítio foi atualizado por outra aba.'); } } });
window.addEventListener('pageshow',()=>renderPlots());
render(); persist();
setInterval(()=>{ if(!document.hidden) renderPlots(); },1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden) renderPlots();});
if(recovered) toast('O progresso anterior estava ilegível. Guardamos uma cópia e iniciamos um novo sítio.',true);
