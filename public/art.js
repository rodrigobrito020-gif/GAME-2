import { CROPS, ANIMALS, animalProduction, plotStatus, plotCare, progress } from './game.js';

export const icons = {
  hand: '<path d="m13 21-5-5c-2-2 0-4 2-2l2 1V5a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-6a2 2 0 0 1 4 0v7-4a2 2 0 0 1 4 0v9c0 6-3 10-8 10-3 0-5-2-7-6Z"/>',
  sprout: '<path d="M16 28V14M16 19C4 21 3 9 4 7c8-1 13 4 12 12Zm0-5C15 5 22 3 29 3c0 9-6 13-13 11Z"/>',
  water: '<path d="M4 14h15v13H4zM19 17l5-5 4 3-6 9h-3M7 13V8c0-7 10-7 10 0v5M27 18l3 3m-5 0 3 4"/>',
  basket: '<path d="m4 15 3 13h19l3-13ZM2 15h29M9 15l7-12 7 12M12 19v5m8-5v5"/>',
  shop: '<path d="M5 14v15h22V14M2 13 6 3h20l4 10M2 13c0 5 7 5 7 0 0 5 7 5 7 0 0 5 7 5 7 0 0 5 7 5 7 0M13 29V19h8v10"/>',
  crate: '<path d="M3 9h26v20H3ZM1 4h30v6H1ZM7 14h18M7 24h18M12 17h8"/>',
  coin: '<circle cx="16" cy="16" r="13"/><path d="M20 10h-6c-5 0-5 6 0 6h4c5 0 5 6 0 6h-6m4-15v18"/>',
  lock: '<rect x="7" y="14" width="19" height="15" rx="3"/><path d="M11 14V8a6 6 0 0 1 12 0v6m-7 6v4"/>',
  arrow: '<path d="M9 25 25 9M9 9h16v16"/>',
  weed: '<path d="m7 29 16-22m-9 10-9-4 4-8 15 5m-9 13-9-1m13-7 7 3M3 30h28"/>',
  spray: '<path d="M9 16h15v14H9Zm3 0V9h9v7M13 9V4h13m-6 0v5m7 1 3 2m-2-5h3m-5 7 2 2"/>',
  fertilizer: '<path d="m10 4 14 1-3 6 7 17c-7 4-18 4-24-1l8-16Zm1 7h11"/><path d="M16 25v-8m0 4c-7 0-8-6-7-6 5-1 7 2 7 6m0-2c0-6 4-8 8-7 0 4-4 7-8 7"/>'
};
export function icon(name, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.sprout}</svg>`; }

export function cropArt(id) {
  if(id==='egg')return '<path d="M12 40C12 24 24 7 32 7s22 17 22 33c0 25-42 25-42 0Z" fill="#fff1c6" stroke="#c7b184" stroke-width="2"/><path d="M23 23q-8 15-3 21" fill="none" stroke="#fffdf1" stroke-width="5" stroke-linecap="round"/>';
  if(id==='milk')return '<path d="M21 9h22v9l9 9v31H12V27l9-9Z" fill="#eeeccc" stroke="#b8bda4" stroke-width="2"/><path d="M21 5h22v7H21Z" fill="#8fbcc4"/><path d="M13 30h38v18H13Z" fill="#91bdc4"/><text x="32" y="42" text-anchor="middle" font-size="9" fill="white">LEITE</text>';

  if (id === 'turnip') return '<path d="M13 24c-2-17 39-19 39 0 0 15-12 25-21 33C21 49 13 36 13 24Z" fill="#f2f1ca" stroke="#a9b883" stroke-width="2"/><path d="M16 23q14 7 33 0" fill="none" stroke="#d9d8ac" stroke-width="2"/><path d="m29 20-5-13m8 11 7-16m-7 17 15-8" stroke="#6d9a36" stroke-width="6" stroke-linecap="round"/>';
  if (id === 'tomato') return '<path d="M8 30c0-16 41-22 47-2 10 29-48 35-47 2Z" fill="#e94b30" stroke="#bd4226" stroke-width="2"/><path d="m30 17-11-9 14 3 8-7-2 12 13 6-16-1-11 8Z" fill="#568b30"/><path d="M18 29q-6 10 0 16" fill="none" stroke="#ff9471" stroke-width="4" stroke-linecap="round"/>';
  if (id === 'watermelon') return '<ellipse cx="32" cy="34" rx="27" ry="23" fill="#76ad3d" stroke="#45802d" stroke-width="2"/><path d="M16 16q-10 22 1 37m8-41q-8 22 0 45m13-45q8 22 0 45m11-39q9 20 0 32" fill="none" stroke="#3e812f" stroke-width="5"/>';
  if (id === 'carrot') return '<path d="M30 26C15 17 11 40 10 55c14-6 34-19 20-29Z" fill="#f7933c" stroke="#de712b" stroke-width="1.5"/><path d="m30 25-1-16m4 15L44 9m-12 13L21 12" stroke="#538944" stroke-width="7" stroke-linecap="round"/><path d="m18 33 6 3m-10 5 6 3" stroke="#d56a2a" stroke-width="2"/>';
  if (id === 'wheat') return '<path d="m19 57 15-43m-7 23L18 20m13 5 17-11" stroke="#c49830" stroke-width="3" stroke-linecap="round"/><g fill="#e8be59"><ellipse cx="31" cy="15" rx="4" ry="8" transform="rotate(-15 31 15)"/><ellipse cx="21" cy="25" rx="4" ry="8" transform="rotate(-35 21 25)"/><ellipse cx="40" cy="23" rx="4" ry="8" transform="rotate(50 40 23)"/><ellipse cx="19" cy="37" rx="4" ry="8" transform="rotate(-35 19 37)"/><ellipse cx="35" cy="34" rx="4" ry="8" transform="rotate(50 35 34)"/></g>';
  if (id === 'strawberry') return '<path d="M10 29C7 8 54 8 51 29 47 44 35 57 30 57S14 44 10 29Z" fill="#ec6874" stroke="#cf4d5f" stroke-width="1.5"/><path d="m30 22-16-8 15 1 6-10 2 11 14-3-11 12-10-6-8 6Z" fill="#619451"/><g fill="#ffe6a5"><ellipse cx="19" cy="30" rx="1.5" ry="2"/><ellipse cx="32" cy="32" rx="1.5" ry="2"/><ellipse cx="43" cy="30" rx="1.5" ry="2"/><ellipse cx="25" cy="41" rx="1.5" ry="2"/><ellipse cx="36" cy="43" rx="1.5" ry="2"/><ellipse cx="30" cy="50" rx="1.5" ry="2"/></g>';
  if (id === 'corn') return '<path d="M22 45C9 11 25 1 35 9c9 8 5 24 1 35Z" fill="#f4cd5d" stroke="#d6ad3e" stroke-width="1.5"/><path d="m25 12 5 34m-1-36 5 33M19 20h19m-19 7h19m-17 7h15" fill="none" stroke="#d8ab33" stroke-width="2"/><path d="M31 58C9 56 6 28 11 26c18 10 23 21 20 32Z" fill="#679b58"/><path d="M31 58c-6-18 8-30 22-35-2 18-7 34-22 35Z" fill="#84b56d"/>';
  return '<path d="m30 15 2-9 6 1-3 10" fill="#5b7f42"/><ellipse cx="31" cy="36" rx="25" ry="20" fill="#e88e42" stroke="#cf7634" stroke-width="1.5"/><ellipse cx="31" cy="36" rx="14" ry="20" fill="#f1a04b" stroke="#d47c32" stroke-width="1.5"/><ellipse cx="31" cy="36" rx="5" ry="20" fill="#f6b45f"/>';
}
export function cropIcon(id, cls = '') { return `<svg class="crop-icon ${cls}" viewBox="0 0 64 64" aria-hidden="true">${cropArt(id)}</svg>`; }
function tree(x,y,s=1,variant=0) { return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="8" rx="35" ry="15" fill="#386b43" opacity=".15"/><path d="M-6 4v-55h12V4l-6 3Z" fill="#8d7050"/><path d="m0-23-14-17m14 9 13-18" stroke="#8d7050" stroke-width="5"/><circle cy="-65" r="34" fill="${variant?'#7da355':'#68a73e'}"/><circle cx="-24" cy="-54" r="25" fill="#8ec550"/><circle cx="20" cy="-54" r="29" fill="#538e32"/><circle cx="-2" cy="-80" r="25" fill="#a6d560"/>${variant?'<g fill="#df8060"><circle cx="-23" cy="-60" r="4"/><circle cx="13" cy="-80" r="4"/><circle cx="24" cy="-46" r="4"/></g>':''}</g>`; }
function fence(x,y,n=4,flip=1) { return `<g transform="translate(${x} ${y}) scale(${flip} 1)"><path d="M0 0 ${n*38} ${n*19}m${-n*38} ${-n*19+16} ${n*38} ${n*19}" stroke="#c7a176" stroke-width="6"/>${Array.from({length:n+1},(_,i)=>`<path d="M${i*38} ${i*19+28}v-40l4-5 4 5v40" fill="#ceac7e" stroke="#9c7d52" stroke-width="2"/>`).join('')}</g>`; }
function house() { return `<g transform="translate(680 275)"><ellipse cx="50" cy="38" rx="130" ry="45" fill="#456b36" opacity=".12"/><path d="m-70-56 96 49v88l-96-48Z" fill="#fbfaf0"/><path d="m26-7 93-49v88L26 81Z" fill="#e5dfcd"/><path d="m-70-56 96-80 93 80-93 49Z" fill="#f1debb"/><path d="m-94-48 115-98 120 79-22 11-93-63-96 79Z" fill="#bb4b27"/><path d="m21-146 120 79-9-22-112-78-114 99v20Z" fill="#e8843c"/><path d="m-75-63 95-83 109 72" fill="none" stroke="#f3a75c" stroke-width="3"/><path d="m58-117 19 11v-48l-19-10Z" fill="#b8a99a"/><path d="m58-164 19 10 16-8-19-10Z" fill="#d9cdb8"/><path d="m26-7v88M-70-56l96 49 93-49" fill="none" stroke="#b99f76" stroke-width="6"/><path d="M-35-8-6 6v49l-29-14Z" fill="#9b7959"/><path d="m-30-4 19 10v43l-19-10Z" fill="#ae8c68"/><circle cx="-15" cy="27" r="2" fill="#e4ce9b"/><path d="m50 4 24-13v27L50 31Zm39-21 17-10v26L89 9Z" fill="#91bfc0" stroke="#faf1d3" stroke-width="5"/><path d="M62-1v24m-12-6 24-13m23-25V5" stroke="#faf1d3" stroke-width="3"/><path d="m-18 70 39 19-43 22-38-20Z" fill="#cab18a"/><path d="m-54-59 27-32 26 32-26 14Z" fill="#789ca3" stroke="#f4e5c4" stroke-width="5"/><path d="M-27-86v37m-19-12 38 2" stroke="#f4e5c4" stroke-width="3"/><g fill="#81a05d"><ellipse cx="64" cy="30" rx="20" ry="8"/><ellipse cx="99" cy="10" rx="17" ry="7"/></g><g fill="#f0b07c"><circle cx="57" cy="27" r="4"/><circle cx="67" cy="23" r="4"/><circle cx="99" cy="7" r="4"/></g></g>`; }
function barn() { return `<g transform="translate(1240 225)"><ellipse cy="25" rx="105" ry="34" fill="#477643" opacity=".14"/><path d="m-69-65 69 35v86l-69-36Z" fill="#ad4535"/><path d="m0-30 76-40v86L0 56Z" fill="#d96745"/><path d="m-69-65 69-65 76 60-76 40Z" fill="#e29876"/><path d="m-83-59 80-85 96 67-17 7-76-54-69 59Z" fill="#458c76"/><path d="m-83-59v-14l79-89 97 70v15l-96-67Z" fill="#71b39a"/><path d="m12 14 52-27v61L12 75Z" fill="#eab99a"/><path d="m14 18 48 29m0-54L14 73M38 2v59" stroke="#f9e7c7" stroke-width="5"/><path d="m-52-35 29 15v28l-29-15Z" fill="#6d969c" stroke="#f5d5ae" stroke-width="4"/><path d="m21-57 16-25 17 8v17l-33 17Z" fill="#c0d2b0" stroke="#f5d5ae" stroke-width="4"/></g>`; }

export function landscape() {
  const ground=[];
  for(let i=0;i<155;i++) {
    const x=(i*197)%1400,y=270+(i*83)%500;
    if(x<430||x>1070||y>690)ground.push(`<path d="m${x} ${y}-4-7m4 7 4-6" stroke="#74aa32" stroke-width="2" opacity=".65"/>`);
  }
  return `<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#ace2f1"/><stop offset="1" stop-color="#e3f5dd"/></linearGradient><linearGradient id="grass" x2="0" y2="1"><stop stop-color="#99ce55"/><stop offset="1" stop-color="#83b941"/></linearGradient><linearGradient id="soil" x2="0" y2="1"><stop stop-color="#ad7544"/><stop offset="1" stop-color="#82512d"/></linearGradient><filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#3d631b" flood-opacity=".2"/></filter></defs>
  <path d="M0 0H1400V820H0Z" fill="url(#sky)"/>
  <circle cx="1165" cy="102" r="44" fill="#fff3a1"/><circle cx="1165" cy="102" r="32" fill="#ffe777"/>
  <g class="cloud" fill="white" opacity=".8"><ellipse cx="430" cy="72" rx="76" ry="21"/><ellipse cx="402" cy="59" rx="30" ry="25"/><ellipse cx="450" cy="54" rx="38" ry="30"/></g>
  <g class="cloud cloud-two" fill="white" opacity=".7"><ellipse cx="946" cy="74" rx="69" ry="18"/><ellipse cx="940" cy="57" rx="34" ry="27"/></g>
  <path d="M0 203Q140 120 288 206 445 102 650 195 853 115 1030 181 1225 110 1400 173V820H0Z" fill="#77b444"/>
  <path d="M0 245Q190 176 370 238 574 162 760 232 1000 157 1160 223 1310 190 1400 222V820H0Z" fill="url(#grass)"/>
  <path d="M-20 507Q140 545 265 419T437 371" stroke="#dfbc78" stroke-width="63" fill="none"/><path d="M-20 504Q140 542 265 416T437 368" stroke="#ead29b" stroke-width="52" fill="none"/>
  <path d="M355 410Q412 440 428 513T602 673Q668 729 873 760" stroke="#e1c184" stroke-width="46" fill="none"/>
  ${ground.join('')}
  <g opacity=".7">${tree(13,312,.85)}${tree(91,297,.75)}${tree(612,230,.95)}${tree(707,240,.75)}${tree(1004,245,.65)}</g>
  ${fence(620,215,12,-1)}${fence(790,230,12)}
  <g class="building" role="button" tabindex="0" data-building="house" aria-label="Sua casa, mudar nome da fazenda">${house()}</g>
  <g class="building" role="button" tabindex="0" data-building="barn" aria-label="Celeiro, abrir armazém">${barn()}</g>
  ${tree(1350,300,.95,1)}${tree(1370,590,.75,1)}<path d="M955 331 1325 399 1349 611 952 538Z" fill="#a6cf48" stroke="#8db239" stroke-width="4"/>${fence(950,330,10)}${fence(951,538,10)}
  <g transform="translate(160 175)"><ellipse cy="0" rx="224" ry="87" fill="#7dbd50"/><ellipse cy="-9" rx="210" ry="78" fill="#57c6d4" stroke="#b8d37c" stroke-width="7"/><path d="M-100-28q75 22 164-8m-65 57 60 3" stroke="#b9f2e5" stroke-width="4" fill="none"/><g fill="#7eae61"><ellipse cx="72" cy="-28" rx="19" ry="9"/><ellipse cx="-75" cy="20" rx="18" ry="9"/></g></g>
  <g transform="translate(407 286)"><ellipse cy="34" rx="70" ry="28" fill="#5b8a27" opacity=".2"/><path d="m-60-9 63-43 62 47v61H-60Z" fill="#fff4d7" stroke="#bcb28f" stroke-width="3"/><path d="m-69-6 72-65 72 66-13 5L3-51-58 0Z" fill="#d87a47" stroke="#ae5636" stroke-width="3"/><path d="M-25 40v-20q28-39 53 0v20Z" fill="#6a5938"/><path d="M-3-55h25m-20-4v8m17-8v8" fill="none" stroke="#fff0c6" stroke-width="5" stroke-linecap="round"/><ellipse cx="-4" cy="59" rx="27" ry="8" fill="#8d7647"/><path d="M-26 54h42l6 10H-30Z" fill="#7d714c"/></g>
  <g transform="translate(1055 574)"><path d="m-35-17 35 19v45l-35-20Z" fill="#bd8f4a" stroke="#7a5527" stroke-width="2"/><path d="m0 2 39-23v45L0 47Z" fill="#986d32" stroke="#7a5527" stroke-width="2"/><path d="m-35-17 39-23 35 19L0 2Z" fill="#ddb56b" stroke="#7a5527" stroke-width="2"/><path d="m-27-10 22 12m-22 6 22 12m-22 6 22 12m12-32 27-15m-27 29 27-15m-27 29 27-15" stroke="#80602f" stroke-width="3"/></g>
  <g transform="translate(508 325)"><ellipse cy="25" rx="23" ry="10" fill="#547e24" opacity=".22"/><path d="M0-46v71m-38-65 76 7" stroke="#986931" stroke-width="7" stroke-linecap="round"/><path d="m-25-38 50 4-9 32h-35Z" fill="#4675ad" stroke="#31598b" stroke-width="2"/><path d="m-17-4-6 22m33-22 7 24" stroke="#4770a0" stroke-width="11"/><circle cy="-56" r="17" fill="#e5bd76" stroke="#b48d4c" stroke-width="2"/><path d="M-27-66h55m-45-2 7-17 21 1 8 17" fill="#ecc65a" stroke="#bc9440" stroke-width="3" stroke-linejoin="round"/><circle cx="-5" cy="-57" r="2" fill="#77542a"/><circle cx="7" cy="-56" r="2" fill="#77542a"/><path d="m-6-48 13 1" stroke="#a77947" stroke-width="2"/></g>
  ${tree(66,697,.85,1)}${tree(1342,748,.7,1)}
  <g fill="#eede91" stroke="#c3b571" stroke-width="1"><ellipse cx="1141" cy="614" rx="16" ry="9"/><ellipse cx="1177" cy="625" rx="21" ry="12"/><ellipse cx="367" cy="663" rx="15" ry="8"/></g>
  <g fill="#fff2b1"><circle cx="404" cy="676" r="5"/><circle cx="416" cy="683" r="5"/><circle cx="1030" cy="694" r="5"/><circle cx="1043" cy="701" r="5"/></g>
  ${fence(27,692,6)}${fence(1369,722,5,-1)}`;
}

export function plotMarkup(state, now) {
  return state.plots.map((p,i)=>{
    const row=Math.floor(i/4), col=i%4, x=475+(col-row)*83, y=414+(row+col)*44, status=plotStatus(p,now);
    const grown=progress(p,now), ready=status==='ready', care=plotCare(p,now);
    const label=status==='locked'?`Terreno ${i+1}, expandir`:status==='empty'?`Canteiro ${i+1}, vazio`: `${CROPS[p.crop].name}, ${ready?'pronta para colher':Math.ceil(Math.max(0,p.readyAt-now)/1000)+' segundos restantes'}`;
    let plants='';
    if(p.crop) {
      for(const [dx,dy] of [[-35,-5],[0,-23],[35,-5],[0,15]]) {
        const scale=ready?'.8':grown>.4?'.55':'.32';
        const picture=(ready||grown>.45)?cropArt(p.crop):'<path d="M30 54V33m0 7C12 44 10 25 12 24c13-2 21 5 18 16Zm0-7c-2-16 10-21 22-20 0 15-10 22-22 20Z" fill="#76a454" stroke="#588446" stroke-width="2"/>';
        plants+=`<g transform="translate(${dx-32*Number(scale)} ${dy-49*Number(scale)}) scale(${scale})">${picture}</g>`;
      }
    }
    const soil=status==='locked'?'#9cc95c':p.watered?'#795033':'url(#soil)';
    return `<g class="plot ${status} ${p.watered?'watered':''}" role="button" tabindex="0" data-plot="${i}" aria-label="${label}" transform="translate(${x} ${y})"><title>${label}</title><path class="tile-edge" d="m-75 0 75 40 75-40v10L0 51-75 10Z" fill="${status==='locked'?'#8fa774':'#806747'}"/><path class="tile-top" d="m-75 0 75-40L75 0 0 40Z" fill="${soil}" stroke="${status==='locked'?'#c3d7a8':'#c7a775'}" stroke-width="3" ${status==='locked'?'stroke-dasharray="7 6"':''}/>${status==='locked'?'<g opacity=".7" stroke="#60854f" stroke-width="3" stroke-linecap="round"><path d="M-7 2h14M0-5V9"/></g>':`<g stroke="${p.watered?'#7d6244':'#96724e'}" stroke-width="3" opacity=".7"><path d="m-53 0 53 28m-35-38 53 28m-35-38 53 28m-35-38 53 28"/></g>${plants}${care.weeds?'<g fill="#5f9632" stroke="#3b7122" stroke-width="1.5"><path d="M-41 22q-18-22-12-21 15 3 13 20-1-29 6-28 9 13-5 28 16-23 21-16 0 12-23 17Z"/></g>':''}${care.pests?'<g transform="translate(40 -18)"><ellipse cx="-7" cy="-5" rx="8" ry="5" fill="#dfedea" stroke="#658c8e"/><ellipse cx="7" cy="-5" rx="8" ry="5" fill="#dfedea" stroke="#658c8e"/><ellipse cy="1" rx="5" ry="9" fill="#e8794f" stroke="#643d25" stroke-width="2"/><path d="M-5 2h10m-9 5h8" stroke="#643d25" stroke-width="2"/></g>':''}${p.watered&&!ready?'<path d="M51-4c-8 11-7 15 0 15s8-4 0-15Z" fill="#91d1d6" stroke="#e5f5e8" stroke-width="1.5"/>':''}`}${ready?'<g class="ready-float" transform="translate(0 -57)"><rect x="-18" y="-18" width="36" height="27" rx="12" fill="#fff9de" stroke="#d4b65f" stroke-width="1.5"/><path d="m-6-5 4 4 9-10" fill="none" stroke="#628b4c" stroke-width="3" stroke-linecap="round"/></g>':''}</g>`;
  }).join('');
}

export function animalArt(type) {
  if(type==='chicken')return '<ellipse cx="31" cy="42" rx="24" ry="17" fill="#fffbe5" stroke="#c5b780" stroke-width="2"/><path d="m10 36-8-15 14 8" fill="#f4f0d5" stroke="#c5b780" stroke-width="2"/><circle cx="47" cy="25" r="12" fill="#fffbe5" stroke="#c5b780" stroke-width="2"/><path d="M41 15q-4-12 3-12 5 0 5 9 4-10 9-6 5 7-6 13" fill="#d65c3c"/><path d="m57 23 9 5-10 5" fill="#ebba4d"/><circle cx="50" cy="23" r="2" fill="#5e4b2e"/><path d="m24 56-2 8m16-7 3 8" stroke="#b88934" stroke-width="3"/><path d="M24 37q18-7 17 8-3 12-17-8" fill="#eee6bd"/>';
  return '<path d="M11 41V65m15-19v20m24-20 2 21m12-28 2 24" stroke="#6c6151" stroke-width="6"/><ellipse cx="35" cy="32" rx="32" ry="21" fill="#fff9e5" stroke="#aaa086" stroke-width="2"/><path d="M13 15q22-8 17 11-6 18-21 8m30-21q17 1 17 15-15 10-16-15" fill="#625b50"/><path d="M57 18 64 4l6 16m-5-9 12-7 9 24-12 23-18-5Z" fill="#fff5dd" stroke="#a69a7b" stroke-width="2"/><ellipse cx="67" cy="40" rx="14" ry="9" fill="#e9bbab"/><circle cx="65" cy="25" r="2" fill="#534832"/><path d="m58 10-6-9m22 7 4-9" stroke="#b69f70" stroke-width="4" stroke-linecap="round"/>';
}
export function animalIcon(type) {return `<svg class="animal-icon" viewBox="-5 -10 100 90" aria-hidden="true">${animalArt(type)}</svg>`;}
export function animalMarkup(state,now=Date.now()) {
  const animals=state.animals||[];
  if(!animals.length)return '<g role="button" tabindex="0" data-building="animals" class="building" aria-label="Cercado vazio, comprar animais" transform="translate(1090 438)"><path d="M0 0v63" stroke="#986f35" stroke-width="7"/><rect x="-82" y="-20" width="164" height="47" rx="5" fill="#efcf8c" stroke="#a0783c" stroke-width="3"/><text text-anchor="middle" y="0" fill="#8b682d" font-size="13" font-family="Arial">Compre animais</text><text text-anchor="middle" y="17" fill="#a18142" font-size="10" font-family="Arial">na loja da fazenda</text></g>';
  return animals.map((a,i)=>{const p=animalProduction(a,now),x=1000+(i%3)*105,y=405+Math.floor(i/3)*93;return `<g class="animal" role="button" tabindex="0" data-animal="${i}" aria-label="${ANIMALS[a.type].name}, ${p.amount?'produtos prontos':p.hungry?'com fome':'produzindo'}" transform="translate(${x} ${y})"><ellipse cx="34" cy="60" rx="40" ry="16" fill="#608923" opacity=".2"/>${animalArt(a.type)}${p.amount?'<g transform="translate(47 -23)"><circle r="14" fill="#fff4c0" stroke="#b0a052" stroke-width="2"/><path d="m-6 0 4 5 9-11" fill="none" stroke="#7a9b34" stroke-width="3"/></g>':p.hungry?'<text x="35" y="-7" text-anchor="middle" font-size="20" fill="#a16f31">!</text>':''}<rect class="animal-hitbox" x="-7" y="-40" width="95" height="117" fill="transparent" pointer-events="all"/></g>`;}).join('');
}
