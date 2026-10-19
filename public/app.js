import { createFarm3D } from './farm3d.js';
import { SAVE_KEY, CROPS, PRODUCTS, ANIMALS, POND, AQUACULTURE, aquaticProduction, animalProduction, QUESTS, FERTILIZER_PRICE, WATER_CAPACITY, waterStatus, newGame, decodeSave, levelInfo, plotStatus, plotCare, progress, growthRemaining, expansionPrice, action } from './game.js';
import { icon, cropIcon, animalIcon, animalMarkup, pondMarkup, landscape, plotMarkup } from './art.js';

const $ = selector => document.querySelector(selector);
const format = n => new Intl.NumberFormat('pt-BR').format(n);
const time = ms => { const s=Math.max(0,Math.ceil(ms/1000)); return s<60?`${s}s`:`${Math.floor(s/60)}min${s%60?` ${s%60}s`:''}`; };
let state, saveAvailable=true, recovered=false;
try { const raw=localStorage.getItem(SAVE_KEY); state=raw?decodeSave(raw):newGame(); if(!state) { localStorage.setItem(SAVE_KEY+'-backup',raw); state=newGame(); recovered=true; } }
catch { state=newGame(); saveAvailable=false; }
let tool='smart', selectedCrop='turnip', modalType=null, expansionIndex=null, toastTimer, zoom=1, lastSignature='', returnFocus=null, shopTab='seeds', animalIndex=null;
const farm=$('#farm');
farm.innerHTML='<g id="plots"></g><g id="animals"></g><g id="buildings"></g><g id="pond"></g>';
const farm3d=(document.documentElement.dataset.view==='classic'||new URLSearchParams(location.search).get('view')==='classic')?null:createFarm3D(farm,{onStatus:message=>$('#map-hint').textContent=message,onError:message=>toast(message,true)});
if(!farm3d){farm.innerHTML=landscape()+'<g id="plots"></g><g id="animals"></g><g id="pond"></g>';if(new URLSearchParams(location.search).get('view')!=='classic')setTimeout(()=>toast('3D indisponível neste navegador. A fazenda abriu no modo 2D.',true),300);}
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));

function toast(message, error=false) {
  const el=$('#toast'); el.textContent=message; el.className=`toast visible ${error?'error':''}`;
  if (!error) $('#activity-text').textContent=message;
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
  if(type==='rename')message=saveAvailable?`Alterações salvas: ${state.farmName} · ${state.farmer==='female'?'Fazendeira':'Fazendeiro'}.`:`Alterações aplicadas nesta aba: ${state.farmName}. O navegador está bloqueando o salvamento ao reabrir.`;
  if(result.rewards.length) message+=` Objetivo concluído: +${result.rewards.reduce((n,q)=>n+q.reward,0)} moedas!`;
  if(result.levelUp) message+=` Olá, nível ${levelInfo(state.xp).level}! Novos cultivos esperam por você.`;
  toast(message); return true;
}
function selectTool(next) {
  tool=next; farm3d?.selectTool(next);
  document.querySelectorAll('[data-tool]').forEach(el=>{ el.classList.toggle('active',el.dataset.tool===tool); el.setAttribute('aria-pressed',String(el.dataset.tool===tool)); });
  $('#map-hint').textContent={smart:'WASD ou clique no chão para andar. Escolha um canteiro para cuidar.',plant:`Plante ${CROPS[selectedCrop].name.toLowerCase()} em um canteiro vazio`,water:'Regue as plantas secas para iniciar o crescimento',harvest:'Clique nas plantações com ✓ para colher',weed:'Retire as ervas daninhas dos canteiros',spray:'Elimine as pragas da plantação',fertilize:'Use um adubo para adiantar 20% do tempo de crescimento'}[tool];
  farm.dataset.activeTool=tool;
}
function renderWater(now=Date.now()) {
  const water=waterStatus(state,now), seconds=Math.ceil(water.remaining/1000);
  const clock=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  $('#water-amount').textContent=water.amount;
  $('#water-count').textContent=water.amount;
  $('#water-refill').textContent=water.amount===WATER_CAPACITY?'Reserva cheia':`+1 em ${clock}`;
  $('#water-reserve').classList.toggle('empty',water.amount===0);
  const label=`${water.amount} de ${WATER_CAPACITY} águas. ${water.amount===WATER_CAPACITY?'Reserva cheia.':`Próxima água em ${time(water.remaining)}.`}`;
  $('#water-reserve').setAttribute('aria-label',label);
  $('[data-tool="water"]').title=label;
  $('[data-tool="water"]').classList.toggle('depleted',water.amount===0);
}
function renderPlots(force=false) {
  const now=Date.now();
  renderWater(now);
  const signature=JSON.stringify([state.plots.map(p=>[p.unlocked,p.crop,p.watered,p.fertilized,plotCare(p,now),plotStatus(p,now),Math.floor(progress(p,now)*2)]),(state.animals||[]).map(a=>[a.type,animalProduction(a,now).amount,animalProduction(a,now).hungry]),state.pond?.owned,(state.pond?.stock||[]).map(a=>[a.type,aquaticProduction(a,now).amount,aquaticProduction(a,now).hungry])]);
  if(force||signature!==lastSignature) {
    const focus=document.activeElement?.dataset.plot;
    if(farm3d) farm3d.update(state);
    else {$('#plots').innerHTML=plotMarkup(state,now);$('#animals').innerHTML=animalMarkup(state,now);$('#pond').innerHTML=pondMarkup(state,now);}
    lastSignature=signature;
    if(modalType==='animal')renderModal();
    if(focus!==undefined) farm.querySelector(`[data-plot="${focus}"]`)?.focus({preventScroll:true});
  }
  state.plots.forEach((p,i)=>{
    if(p.crop) { const status=plotStatus(p,now), label=`Canteiro ${i+1}, ${CROPS[p.crop].name}, ${status==='ready'?'pronta para colher':status==='dry'?'seca, crescimento pausado; regue para crescer':time(growthRemaining(p,now))+' restantes'}`; const node=farm.querySelector(`[data-plot="${i}"]`); node.setAttribute('aria-label',label); node.querySelector('title').textContent=label; }
  });
  const ready=state.plots.filter(p=>plotStatus(p,now)==='ready').length;
  $('#ready-count').innerHTML=ready?`<span>✦</span> ${ready} ${ready===1?'colheita pronta':'colheitas prontas'}`:'<span>☘</span> Tudo no seu tempo';
  $('#ready-count').classList.toggle('is-ready',ready>0);
  const pondReady=state.pond?.stock.reduce((n,a)=>n+aquaticProduction(a,now).amount,0)||0;
  $('#pond-count').textContent=pondReady||'+';
  $('#open-pond').title=state.pond?.owned?`${pondReady} produtos prontos no lago`:`Lago à venda: ${POND.cost} moedas · Nível ${POND.level}`;
  if(modalType==='pond')refreshPondStatus(now);
}
function render() {
  const level=levelInfo(state.xp);
  $('#coins').textContent=format(state.coins); $('#level').textContent=level.level;
  $('#xp-fill').style.width=`${Math.min(100,level.current/level.required*100)}%`; $('#xp-label').textContent=`${level.current} / ${level.required} XP`;
  $('#plot-count').textContent=`${state.plots.filter(p=>p.unlocked).length} canteiros`;
  $('#farm-name').textContent=state.farmName || 'Minha fazenda';
  $('#farmer-avatar').textContent=state.farmer==='female'?'👩🏻‍🌾':'👨🏻‍🌾';
  $('#farmer-title').textContent=state.farmer==='female'?'Fazendeira':'Fazendeiro';
  const canExpand=state.plots.some(p=>!p.unlocked);$('#open-expand').disabled=!canExpand;$('#expansion-cost').textContent=canExpand?expansionPrice(state):'✓';$('#open-expand').title=canExpand?`Novo canteiro: ${expansionPrice(state)} moedas`:'Todos os canteiros liberados';
  $('#fertilizer-count').textContent=state.supplies?.fertilizer ?? 3;
  $('#storage-count').textContent=[...Object.values(state.harvest),...Object.values(state.products||{})].reduce((a,b)=>a+b,0);
  $('#quest-count').textContent=`${state.quests.length}/3`;
  $('#seed-tray').innerHTML=Object.entries(CROPS).map(([id,c])=>{
    const locked=level.level<c.level;
    return `<button class="seed-card produce-card ${selectedCrop===id?'selected':''} ${locked?'locked':''}" data-produce="${id}" data-seed="${id}" aria-label="${c.name}, ${locked?`disponível no nível ${c.level}`:`${state.seeds[id]} sementes, ${time(c.duration)}, ${c.xp} XP`}" aria-pressed="${selectedCrop===id}" ${locked?'disabled':''}><span class="seed-art">${cropIcon(id)}</span><span class="seed-info"><b>${c.name}</b><small>${locked?`Nível ${c.level}`:`${time(c.duration)} · ${c.xp} XP`}</small></span><span class="seed-stock" aria-hidden="true">${locked?icon('lock'):`×${state.seeds[id]}`}</span>${selectedCrop===id?'<span class="selected-dot" aria-hidden="true">✓</span>':''}</button>`;
  }).join('');
  renderPlots(true);
  if(modalType) renderModal();
}
function doPlotAction(type,index,payload={}) {
  if(!farm3d)return run(type,{index,...payload});
  const check=action(state,type,{index,...payload});
  if(!check.ok){toast(check.message,true);return false;}
  $('#plot-tooltip').classList.remove('visible');
  return farm3d.enqueue(type,index,()=>run(type,{index,...payload}));
}
function plotClick(index) {
  const p=state.plots[index], status=plotStatus(p);
  if(status==='locked') { expansionIndex=index; openModal('expand'); return; }
  if(tool==='water') { doPlotAction('water',index); return; }
  if(['weed','spray','fertilize'].includes(tool)) { doPlotAction(tool,index); return; }
  if(tool==='harvest'||(tool==='smart'&&status==='ready')) { doPlotAction('harvest',index); return; }
  if((tool==='plant'||tool==='smart')&&status==='empty') { if(!state.seeds[selectedCrop]) { openModal('shop'); toast('Compre sementes para continuar plantando.'); } else doPlotAction('plant',index,{crop:selectedCrop}); return; }
  if(status==='dry') {toast('Plantação seca: crescimento pausado. Selecione Regar e clique no canteiro.',true);return;}
  if(status==='growing') toast(`${CROPS[p.crop].name}: ${time(p.readyAt-Date.now())} para colher.${p.watered?' Já recebeu água.':' Experimente a ferramenta Regar!'}`);
  else toast('Use Cuidar ou Colher para recolher essa plantação.');
}
function activateMapTarget(target) {
  const animal=target.closest('[data-animal]');if(animal){animalIndex=Number(animal.dataset.animal);openModal('animal');return;}
  const building=target.closest('[data-building]');if(building){if(building.dataset.building==='house')openModal('rename');else if(building.dataset.building==='pond')openModal('pond');else if(building.dataset.building==='barn')openModal('storage');else{shopTab='animals';openModal('shop');}return;}
  const plot=target.closest('[data-plot]');if(plot)plotClick(Number(plot.dataset.plot));
}
farm.addEventListener('click',e=>{if(e.target.closest('[data-plot],[data-animal],[data-building]'))activateMapTarget(e.target);else farm3d?.moveTo(e.clientX,e.clientY);});
farm.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-plot],[data-animal],[data-building]')){e.preventDefault();activateMapTarget(e.target);}});
function showPlotInfo(index) {
  if(farm3d?.busy){$('#plot-tooltip').classList.remove('visible');return;}
  const p=state.plots[index], c=p.crop&&CROPS[p.crop], care=plotCare(p), tip=$('#plot-tooltip');
  const status=plotStatus(p);
  tip.replaceChildren();
  if (!c) tip.textContent=status==='locked'?`Novo canteiro · ${expansionPrice(state)} moedas`:'Canteiro vazio · selecione uma semente';
  else {
    const title=document.createElement('b');title.textContent=`Valor da saúde (${c.name})`;tip.append(title);
    const health=document.createElement('div');health.className='health-track';
    const fill=document.createElement('i');fill.style.width=care.health+'%';health.append(fill);
    const value=document.createElement('span');value.textContent=care.health+'/100';health.append(value);tip.append(health);
    const detail=document.createElement('small');detail.textContent=`${status==='ready'?'Pronta para colher':status==='dry'?'Crescimento pausado · regue para crescer':time(growthRemaining(p))+' para crescer'}${care.weeds?' · Mato':''}${care.pests?' · Pragas':''}`;tip.append(detail);
  }
  tip.classList.add('visible');
}
farm.addEventListener('pointerover',e=>{const p=e.target.closest('[data-plot]');if(p)showPlotInfo(Number(p.dataset.plot));});
farm.addEventListener('pointerleave',()=>$('#plot-tooltip').classList.remove('visible'));
farm.addEventListener('focusin',e=>{const p=e.target.closest('[data-plot]');if(p)showPlotInfo(Number(p.dataset.plot));});
farm.addEventListener('focusout',()=>$('#plot-tooltip').classList.remove('visible'));
document.querySelectorAll('[data-tool]').forEach(el=>el.addEventListener('click',()=>selectTool(el.dataset.tool)));
$('#seed-tray').addEventListener('click',e=>{ const el=e.target.closest('[data-seed]'); if(el&&!el.disabled) {selectedCrop=el.dataset.seed;selectTool('plant');render();} });

function openModal(type) {if(type==='rename')farm3d?.cancel(); returnFocus=document.activeElement; modalType=type; renderModal(); $('#modal').showModal(); }
function closeModal() { $('#modal').close(); modalType=null; returnFocus?.focus({preventScroll:true}); }
function aquaticStatus(a,now=Date.now()) {
  const p=aquaticProduction(a,now);
  return `${p.amount?`${p.amount} ${PRODUCTS[AQUACULTURE[a.type].product].plural.toLowerCase()} para coletar`:`Próximo produto: ${time(p.remaining)}${p.hungry?' após alimentar':''}`} · ${p.hungry?'Sem ração, produção pausada':`Ração por ${time(a.fedUntil-now)}`}`;
}
function refreshPondStatus(now) {
  document.querySelectorAll('[data-pond-stock]').forEach(el=>{
    const a=state.pond?.stock[Number(el.dataset.pondStock)];if(!a)return;
    el.querySelector('.pond-status').textContent=aquaticStatus(a,now);
    el.querySelector('[data-collect-aquatic]').disabled=!aquaticProduction(a,now).amount;
    el.querySelector('[data-feed-aquatic]').disabled=state.coins<AQUACULTURE[a.type].feedCost||a.fedUntil-now>=AQUACULTURE[a.type].duration*4;
  });
}
function pondShop() {
  const level=levelInfo(state.xp).level,owned=state.pond?.owned;
  if(!owned)return `<article class="pond-offer"><span class="pond-illustration" aria-hidden="true">${icon('pond')}</span><h3>Um lago para sua fazenda</h3><p>Crie peixes e instale até ${POND.cageLimit} gaiolas de camarões. O personagem pode passear por toda a margem.</p><button class="primary-button" data-buy-pond ${level<POND.level||state.coins<POND.cost?'disabled':''}>${level<POND.level?`Disponível no nível ${POND.level}`:`Comprar lago · ${POND.cost} moedas`}</button></article>`;
  return `<div class="shop-grid aquatic-shop">${Object.entries(AQUACULTURE).map(([id,d])=>{
    const count=state.pond.stock.filter(a=>a.type===id).length,limit=id==='fish'?POND.fishLimit:POND.cageLimit;
    return `<article class="shop-card produce-card" data-produce="${id}"><div class="shop-crop">${cropIcon(id)}<span>${time(d.duration)} / produto</span></div><h3>${d.name}</h3><p>Venda: <b>● ${PRODUCTS[d.product].sell}</b> · +${d.xp} XP</p><small>${count} / ${limit} ${id==='fish'?'criação':'gaiolas'} · Ração: ${d.feedCost} moedas</small><button data-buy-aquatic="${id}" ${level<d.level||count>=limit||state.coins<d.cost?'disabled':''}>${level<d.level?`Nível ${d.level}`:count>=limit?'Limite atingido':`Comprar · ${d.cost} moedas`}</button></article>`;
  }).join('')}</div><p class="modal-footnote">Cada compra inclui ração para 4 ciclos. Sem ração, a produção pausa; alimente para continuar. A produção coletada vai ao armazém.</p>`;
}
function renderModal() {
  const titles={shop:['TUDO PARA SUA PLANTAÇÃO','Loja da fazenda'],pond:['CRIAÇÃO NA ÁGUA','Seu lago'],storage:['SUA PRODUÇÃO','Seu armazém'],help:['COLHEITA FELIZ · GAME-2','Como jogar'],expand:['MAIS ESPAÇO PARA PLANTAR','Expanda sua fazenda'],goals:['RECOMPENSAS','Missões da fazenda'],rename:['DO SEU JEITO','Fazenda e personagem'],animal:['SEU CERCADO','Criação de animais']};
  $('#modal-eyebrow').textContent=titles[modalType][0]; $('#modal-title').textContent=titles[modalType][1];
  if(modalType==='shop') {
    $('#modal-body').innerHTML=`<div class="modal-summary"><p>Sementes pequenas. Possibilidades enormes.</p><span class="gold-pill">● ${format(state.coins)} moedas</span></div><div class="shop-grid">${Object.entries(CROPS).map(([id,c])=>{
      const locked=levelInfo(state.xp).level<c.level;
      return `<article class="shop-card produce-card ${locked?'locked':''}" data-produce="${id}"><div class="shop-crop">${cropIcon(id)}<span>${locked?`Nível ${c.level}`:time(c.duration)}</span></div><h3>${c.name}</h3><p>Colheita: <b>● ${c.sell}</b> <span>· ${c.xp} XP</span></p><small>Na sua bolsa: ${state.seeds[id]}</small><button data-buy="${id}" ${locked||state.coins<c.cost?'disabled':''}>${locked?icon('lock'):'+'} ${locked?`Nível ${c.level}`:`Comprar · ${c.cost}`}</button></article>`;
    }).join('')}</div><div class="supply-row">${icon('fertilizer')}<div><b>Adubo rápido</b><small>Adianta 20% do ciclo. Você tem ${state.supplies?.fertilizer ?? 3}.</small></div><button data-buy-fertilizer ${state.coins<FERTILIZER_PRICE?'disabled':''}>Comprar · ${FERTILIZER_PRICE} moedas</button></div><p class="modal-footnote">Novos cultivos são liberados ao subir de nível. Capine e dedetize o mesmo cultivo para ganhar um produto extra na colheita.</p>`;
    if(shopTab==='animals')$('#modal-body').innerHTML=`<div class="modal-summary"><p>Alimente seus animais e colete os produtos.</p><span class="gold-pill">● ${format(state.coins)} moedas</span></div><div class="shop-grid animal-shop">${Object.entries(ANIMALS).map(([id,a])=>`<article class="shop-card"><div class="shop-crop">${animalIcon(id)}</div><h3>${a.name}</h3><p>${PRODUCTS[a.product].plural} a cada ${time(a.duration)}</p><small>Ração: ${a.feedCost} moedas / 4 ciclos</small><button data-buy-animal="${id}" ${levelInfo(state.xp).level<a.level||state.coins<a.cost||(state.animals||[]).length>=6?'disabled':''}>${levelInfo(state.xp).level<a.level?'Nível '+a.level:'Comprar · '+a.cost}</button></article>`).join('')}</div><p class="modal-footnote">Máximo de 6 animais no cercado. Sem ração, a produção fica pausada. A primeira ração está incluída.</p>`;
    if(shopTab==='tools')$('#modal-body').innerHTML=`<div class="supply-row">${icon('fertilizer')}<div><b>Adubo rápido</b><small>Adianta 20% do ciclo. Você tem ${state.supplies?.fertilizer ?? 3}.</small></div><button data-buy-fertilizer ${state.coins<FERTILIZER_PRICE?'disabled':''}>Comprar · ${FERTILIZER_PRICE} moedas</button></div><p class="modal-footnote">Regador, enxada e dedetizador são ferramentas permanentes. O adubo é consumido a cada aplicação.</p>`;
    if(shopTab==='pond')$('#modal-body').innerHTML=`<div class="modal-summary"><p>Peixes e camarões, do seu lago ao armazém.</p><span class="gold-pill">● ${format(state.coins)} moedas</span></div>${pondShop()}${state.pond?.owned?'<button class="primary-button full" data-manage-pond>Cuidar do meu lago</button>':''}`;
    $('#modal-body').insertAdjacentHTML('afterbegin',`<div class="shop-tabs" role="tablist" aria-label="Categorias da loja">${[['seeds','Sementes'],['animals','Animais'],['pond','Lago'],['tools','Ferramentas']].map(([id,name])=>`<button role="tab" aria-selected="${shopTab===id}" data-shop-tab="${id}">${name}</button>`).join('')}</div>`);
  } else if(modalType==='pond') {
    $('#modal-body').innerHTML=`<div class="modal-summary"><p>${state.pond?.owned?'Alimente sua criação e colete a produção.':'Um novo espaço para sua fazenda crescer.'}</p><span class="gold-pill">● ${format(state.coins)} moedas</span></div>${state.pond?.stock.length?`<div class="pond-stock">${state.pond.stock.map((a,i)=>`<article class="pond-stock-card produce-card" data-produce="${a.type}" data-pond-stock="${i}">${cropIcon(a.type)}<div><h3>${AQUACULTURE[a.type].name}${a.type==='shrimp'?' '+state.pond.stock.slice(0,i+1).filter(s=>s.type==='shrimp').length:''}</h3><p class="pond-status"></p><div class="pond-buttons"><button data-feed-aquatic="${i}">Alimentar · ${AQUACULTURE[a.type].feedCost} moedas</button><button data-collect-aquatic="${i}">Coletar</button></div></div></article>`).join('')}</div>`:''}${pondShop()}`;
    refreshPondStatus(Date.now());
  } else if(modalType==='storage') {
    const stock={...state.harvest,...state.products}, goods={...CROPS,...PRODUCTS};
    const total=Object.entries(goods).reduce((n,[id,c])=>n+(stock[id]||0)*c.sell,0);
    $('#modal-body').innerHTML=`<div class="modal-summary"><p>Sua produção colhida fica guardada aqui.</p><span class="gold-pill">● ${format(state.coins)} moedas</span></div><div class="storage-grid">${Object.entries(goods).map(([id,c])=>`<article class="storage-card produce-card ${stock[id]?'':'empty'}" data-produce="${id}">${cropIcon(id)}<div><h3>${c.plural}</h3><p>${stock[id]||0} no armazém · ● ${c.sell} cada</p></div><button data-sell="${id}" ${stock[id]?'':'disabled'}>Vender 1</button></article>`).join('')}</div><div class="sell-footer"><div><small>VALOR DE TODA A PRODUÇÃO</small><b>● ${format(total)} moedas</b></div><button class="primary-button" data-sell-all ${total?'':'disabled'}>Vender tudo ${icon('coin')}</button></div><p class="modal-footnote">As sementes e os animais ficam na fazenda. Apenas produtos colhidos são vendidos aqui.</p>`;
  } else if(modalType==='animal') {
    const a=state.animals?.[animalIndex];if(!a){closeModal();return;}
    const def=ANIMALS[a.type],production=animalProduction(a);
    $('#modal-body').innerHTML=`<div class="animal-detail">${animalIcon(a.type)}<h3>${def.name}</h3><p>${production.hungry?'Sem ração · produção pausada':`Ração para mais ${time(a.fedUntil-Date.now())}`}</p><p>${production.amount?production.amount+' '+(production.amount===1?PRODUCTS[def.product].name:PRODUCTS[def.product].plural).toLowerCase()+(production.amount===1?' pronto':' prontos'):`Próximo produto: ${time(production.remaining)}${production.hungry?' após alimentar':''}`}</p><div class="animal-buttons"><button class="primary-button" data-feed ${state.coins<def.feedCost||a.fedUntil-Date.now()>=def.duration*4?'disabled':''}>Alimentar · ${def.feedCost} moedas</button><button class="primary-button" data-collect-animal ${production.amount?'':'disabled'}>Coletar produtos</button></div></div>`;
  } else if(modalType==='expand') {
    const price=expansionPrice(state);
    $('#modal-body').innerHTML=`<div class="expansion-art">${icon('sprout')}</div><p class="expansion-description">Mais um canteiro, mais histórias para plantar.<br>Este terreno será seu para cultivar o que quiser.</p><div class="expansion-price"><span>Novo canteiro</span><b>● ${price} moedas</b></div><button class="primary-button full" data-expand ${state.coins<price?'disabled':''}>${state.coins<price?'Junte mais moedas para expandir':'Preparar novo terreno'}</button><p class="modal-footnote">Você tem ${format(state.coins)} moedas. Cada expansão seguinte custa um pouco mais.</p>`;
  } else if(modalType==='goals') {
    $('#modal-body').innerHTML=`<p class="modal-summary">Complete os objetivos e receba as moedas automaticamente.</p><div id="quests">${QUESTS.map((q,i)=>`<div class="quest ${state.quests.includes(q.id)?'done':''}"><span class="quest-check">${state.quests.includes(q.id)?'✓':i+1}</span><div><b>${q.title}</b><p>${q.detail}</p><small>${state.quests.includes(q.id)?'Concluído':`● +${q.reward} moedas`}</small></div></div>`).join('')}</div>`;
  } else if(modalType==='rename') {
    $('#modal-body').innerHTML='<form id="rename-form" novalidate><p class="profile-instructions">Escolha o personagem e edite o nome. Depois, confirme no botão abaixo.</p><label for="farm-name-input">Nome da fazenda · 2 a 30 caracteres</label><input id="farm-name-input" name="farmName" minlength="2" maxlength="30" required autocomplete="off" aria-describedby="profile-error"><p id="profile-error" class="profile-error" role="alert" hidden></p><button class="primary-button full" type="button" id="apply-profile">✓ Aplicar nome e personagem</button></form>';
    $('#farm-name-input').value=state.farmName||'Minha fazenda';
    if(!saveAvailable)$('#rename-form').insertAdjacentHTML('afterbegin','<p class="profile-error" id="profile-save-warning">O navegador está bloqueando o salvamento. As mudanças ficam disponíveis nesta aba.</p>');
    $('#rename-form').insertAdjacentHTML('afterbegin',`<fieldset class="farmer-choices"><legend>Seu personagem</legend>${[['male','👨🏻‍🌾','Fazendeiro'],['female','👩🏻‍🌾','Fazendeira']].map(([id,emoji,name])=>`<label><input type="radio" name="farmer" value="${id}" ${(state.farmer||'male')===id?'checked':''}><span>${emoji}</span><b>${name}</b></label>`).join('')}</fieldset>`);
  } else {
    $('#modal-body').innerHTML=`<div class="help-steps"><article>${icon('sprout')}<div><h3>1. Escolha e plante</h3><p>Selecione uma semente na bolsa e clique em um canteiro vazio. Compre novas sementes na loja.</p></div></article><article>${icon('water')}<div><h3>2. Cuide da plantação</h3><p>Cada canteiro regado gasta 1 água. Você começa com 30 e recupera 1 a cada 2 minutos, até 30, inclusive fora do jogo. O contador no topo mostra a próxima recarga. A planta só cresce depois de regada. Sem água, o crescimento fica pausado, inclusive fora do jogo. Regar inicia o ciclo com 25% de bônus; Adubar pode adiantar mais 20% depois da rega. Ervas aparecem após 35% do tempo e pragas após 65%. Use Capinar e Dedetizar: fazer os dois dá um produto extra na colheita.</p></div></article><article>${icon('basket')}<div><h3>3. Colha e ganhe experiência</h3><p>O símbolo ✓ indica uma colheita pronta. Clique com Selecionar ou Colher para guardar a produção e ganhar XP. Novos níveis liberam cultivos.</p></div></article><article>${icon('crate')}<div><h3>4. Venda e expanda</h3><p>Venda sua produção no armazém. Use as moedas para comprar sementes, adubo e novos canteiros marcados com +.</p></div></article></div><div class="help-note">Clique no seu avatar no topo para escolher fazendeiro ou fazendeira. Use <b>WASD</b>, as setas ou clique no chão para andar em 3D; mover cancela tarefas pendentes. Os terrenos dourados e o botão <b>Expandir</b> liberam novos canteiros.<br>Atalhos: <b>1</b> Selecionar · <b>2</b> Plantar · <b>3</b> Regar · <b>4</b> Colher · <b>5</b> Capinar · <b>6</b> Dedetizar · <b>7</b> Adubar · <b>Esc</b> Fechar<br>Seu progresso é local. Plantações regadas continuam crescendo enquanto você está fora.</div><button data-help-close class="primary-button full">Começar a plantar ${icon('sprout')}</button>`;
  }
}
$('#modal-body').addEventListener('click',e=>{
  if(e.target.closest('#apply-profile')){saveProfile();return;}
  const tab=e.target.closest('[data-shop-tab]');if(tab){shopTab=tab.dataset.shopTab;renderModal();return;}
  if(e.target.closest('[data-manage-pond]')){modalType='pond';renderModal();return;}
  const pond=e.target.closest('[data-buy-pond]');if(pond&&!pond.disabled){run('buyPond');return;}
  const aquatic=e.target.closest('[data-buy-aquatic]');if(aquatic&&!aquatic.disabled){run('buyAquatic',{aquatic:aquatic.dataset.buyAquatic});return;}
  const feedAquatic=e.target.closest('[data-feed-aquatic]');if(feedAquatic&&!feedAquatic.disabled){run('feedAquatic',{stockIndex:Number(feedAquatic.dataset.feedAquatic)});return;}
  const collectAquatic=e.target.closest('[data-collect-aquatic]');if(collectAquatic&&!collectAquatic.disabled){run('collectAquatic',{stockIndex:Number(collectAquatic.dataset.collectAquatic)});return;}
  const buyAnimal=e.target.closest('[data-buy-animal]');if(buyAnimal&&!buyAnimal.disabled){run('buyAnimal',{animal:buyAnimal.dataset.buyAnimal});return;}
  const feed=e.target.closest('[data-feed]');if(feed&&!feed.disabled){run('feedAnimal',{animalIndex});return;}
  const collect=e.target.closest('[data-collect-animal]');if(collect&&!collect.disabled){run('collectAnimal',{animalIndex});return;}
  const fertilizer=e.target.closest('[data-buy-fertilizer]');if(fertilizer&&!fertilizer.disabled){run('buyFertilizer');return;}
  const buy=e.target.closest('[data-buy]'); if(buy&&!buy.disabled) {run('buy',{crop:buy.dataset.buy});return;}
  const sell=e.target.closest('[data-sell]'); if(sell&&!sell.disabled) {run('sell',{crop:sell.dataset.sell});return;}
  if(e.target.closest('[data-sell-all]')&&!e.target.closest('button').disabled) {run('sellAll');return;}
  if(e.target.closest('[data-expand]')&&!e.target.closest('button').disabled) {if(run('expand',{index:expansionIndex})) closeModal();return;}
  if(e.target.closest('[data-help-close]')) closeModal();
});
// The chat preview allows scripts but blocks native form submissions.
// Apply in the click/keyboard handler so customization works in that view too.
function saveProfile(){
  const name=$('#farm-name-input'),farmer=$('#rename-form input[name="farmer"]:checked');
  if(!name)return;
  if(run('rename',{name:name.value,farmer:farmer?.value}))closeModal();
  else {const error=$('#profile-error');error.textContent=$('#toast').textContent;error.hidden=false;name.setAttribute('aria-invalid','true');name.focus();}
}
$('#modal-body').addEventListener('submit',e=>{if(e.target.id==='rename-form'){e.preventDefault();saveProfile();}});
$('#modal-body').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.closest('#rename-form')){e.preventDefault();saveProfile();}});
$('#modal-body').addEventListener('input',e=>{if(e.target.id==='farm-name-input'){e.target.removeAttribute('aria-invalid');$('#profile-error').hidden=true;}});
$('#open-shop').addEventListener('click',()=>{shopTab='seeds';openModal('shop');});
$('#open-pond').addEventListener('click',()=>openModal('pond'));
$('#open-expand').addEventListener('click',()=>{expansionIndex=state.plots.findIndex(p=>!p.unlocked);if(expansionIndex>=0)openModal('expand');});
$('#open-storage').addEventListener('click',()=>openModal('storage'));
$('#help').addEventListener('click',()=>openModal('help'));
$('#open-goals').addEventListener('click',()=>openModal('goals'));
$('#edit-farm').addEventListener('click',()=>openModal('rename'));
$('#open-bag').addEventListener('click',()=>{const bag=$('#seed-section');bag.hidden=!bag.hidden;});
$('#close-bag').addEventListener('click',()=>$('#seed-section').hidden=true);
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.game-wrapper').requestFullscreen();}catch{toast('A tela cheia está indisponível nesta prévia. Abra o jogo em uma aba do navegador.',true);}});
$('#close-modal').addEventListener('click',closeModal);
$('#modal').addEventListener('cancel',e=>{e.preventDefault();closeModal();});
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')) { const r=$('#modal').getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) closeModal();}});
document.addEventListener('keydown',e=>{
  if(modalType||e.ctrlKey||e.altKey||e.metaKey||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
  const shortcuts={1:'smart',2:'plant',3:'water',4:'harvest',5:'weed',6:'spray',7:'fertilize'};
  if(shortcuts[e.key]) selectTool(shortcuts[e.key]);
});
function zoomMap(delta) { zoom=Math.max(1,Math.min(1.6,zoom+delta)); const w=1400/zoom,h=820/zoom; if(farm3d){farm3d.setZoom(zoom);farm.dataset.zoom=zoom;}else farm.setAttribute('viewBox',`${700-w/2} ${440-h/2} ${w} ${h}`); $('#zoom-out').disabled=zoom<=1; $('#zoom-in').disabled=zoom>=1.59; }
$('#zoom-in').addEventListener('click',()=>zoomMap(.2)); $('#zoom-out').addEventListener('click',()=>zoomMap(-.2)); $('#zoom-out').disabled=true;
farm.addEventListener('wheel',e=>{if(!farm3d)return;e.preventDefault();zoomMap(e.deltaY<0?.1:-.1);},{passive:false});
window.addEventListener('storage',e=>{ if(e.key===SAVE_KEY&&e.newValue) { const incoming=decodeSave(e.newValue); if(incoming) { farm3d?.cancel();state=incoming; render(); toast('Seu sítio foi atualizado por outra aba.'); } } });
window.addEventListener('pageshow',()=>renderPlots());
render(); persist();
setInterval(()=>{ if(!document.hidden) renderPlots(); },1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden) renderPlots();});
if(recovered) toast('O progresso anterior estava ilegível. Guardamos uma cópia e iniciamos um novo sítio.',true);
