import { CROPS, ANIMALS, POND, animalProduction, aquaticProduction, expansionPrice, plotStatus, plotCare, progress, growthRemaining } from './game.js';

export const icons = {
  pond: '<path d="M3 21c0-6 6-11 13-11s15 5 15 11-8 9-15 9S3 27 3 21Z"/><path d="m9 20 7-4 7 4-7 4Zm14 0 4-4v8Zm-14-7V3m-4 8V6m5 18 3 1m8 0 3-1"/>',
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
  if(id==='fish')return '<path d="M10 32C19 13 42 15 51 29l10-9v24l-10-9C40 49 20 50 10 32Z" fill="#2eadd7" stroke="#1479ae" stroke-width="2"/><path d="m27 21 9-10 5 12m-14 20 8 9 5-12" fill="#ffc64a"/><circle cx="20" cy="29" r="3" fill="#123f60"/><path d="M29 26q-5 8 0 15" fill="none" stroke="#bceaff" stroke-width="3" stroke-linecap="round"/>';
  if(id==='shrimp')return '<path d="M42 13C19 6 7 20 12 37c5 16 24 21 39 11l-7-8c-9 6-19 3-21-5-2-10 7-15 16-11Z" fill="#fa9563" stroke="#c9663a" stroke-width="2"/><path d="m49 45 12-8-3 16-13-3m-28-30 10 5m-14 5 10 2m-7 9 10-3m-2 11 8-7m5 12 2-10" fill="none" stroke="#c9663a" stroke-width="2"/><path d="M37 17Q51 1 61 10M37 19Q56 9 62 19" fill="none" stroke="#ce6e39" stroke-width="2" stroke-linecap="round"/><circle cx="36" cy="15" r="2.5" fill="#603721"/>';
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
export function landscape() {
  const grass=[];
  for(let i=0;i<40;i++) {
    const x=70+(i*151)%1240, y=340+(i*73)%420;
    if(x>165&&x<775&&y<724)continue;
    grass.push(`<g transform="translate(${x} ${y})"><g class="wind-grass" style="animation-delay:-${i%7}s"><path d="M0 5Q-10-11-12-18M0 5Q-1-17 3-25M0 5Q9-14 13-16" fill="none" stroke="${['#699437','#8cb440','#a1c54b'][i%3]}" stroke-width="2.1" stroke-linecap="round"/><path d="M0 5Q-3-10-7-13M0 5Q6-7 9-8" fill="none" stroke="#bed66c" stroke-width="1.2"/></g></g>`);
  }
  return `<defs>
    <image id="soil-paint" href="./assets/soil-painted.webp" width="160" height="160" preserveAspectRatio="none" transform="matrix(.5 .25 -.5 .25 0 -40)"/>
    <linearGradient id="soil" x2="0.8" y2="1"><stop stop-color="#ad8450"/><stop offset=".48" stop-color="#85603c"/><stop offset="1" stop-color="#68482e"/></linearGradient>
    <linearGradient id="wet-soil" x2=".8" y2="1"><stop stop-color="#7b5836"/><stop offset=".55" stop-color="#5e402b"/><stop offset="1" stop-color="#453124"/></linearGradient>
    <filter id="earth-texture" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".24 .3" numOctaves="3" stitchTiles="stitch" result="grain"/><feColorMatrix in="grain" type="saturate" values="0"/><feBlend in="SourceGraphic" mode="soft-light"/></filter>
    <clipPath id="pond-water-mask"><path d="M23 102Q81 84 140 90T271 107Q298 111 319 141L293 198Q269 238 208 244L95 224Q47 206 23 170Z"/></clipPath>
    <clipPath id="orchard-leaves-mask"><path d="M913 0H1400V214Q1310 216 1278 173Q1240 162 1196 195Q1087 164 1024 183Q997 120 933 117Z"/></clipPath>
    <filter id="pond-distortion" filterUnits="userSpaceOnUse" x="0" y="62" width="350" height="200"><feTurbulence type="fractalNoise" baseFrequency=".025 .075" numOctaves="2" seed="8" result="ripple"/><feDisplacementMap in="SourceGraphic" in2="ripple" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>
  </defs>
  <image id="farm-paint" class="painted-landscape" href="./assets/farm-painted.webp" x="0" y="0" width="1400" height="820" preserveAspectRatio="none"/>
  <g class="environment-effects" pointer-events="none" aria-hidden="true">
    <g clip-path="url(#pond-water-mask)"><use class="lake-surface" href="#farm-paint" filter="url(#pond-distortion)"/></g>
    <g clip-path="url(#orchard-leaves-mask)"><use class="orchard-wind" href="#farm-paint"/></g>
    <g class="lake-glints" fill="none" stroke="#e2fff4" stroke-width="1.8" opacity=".65">
      <ellipse class="water-ring" cx="172" cy="140" rx="9" ry="3"/><ellipse class="water-ring water-ring-two" cx="80" cy="188" rx="9" ry="3"/>
      <path class="water-line" d="M95 119q17 4 33 0m43 68q14 4 27 0m-82-17q13 3 25 0"/>
    </g>
    ${grass.join('')}
    <g class="butterfly" transform="translate(899 647)"><ellipse cx="-4" cy="-1" rx="5" ry="8" fill="#e4bb61"/><ellipse cx="5" cy="-1" rx="5" ry="8" fill="#efce80"/><path d="M0-3v9" stroke="#856b3b" stroke-width="1.5"/></g>
  </g>
  <g class="building painted-hotspot" role="button" tabindex="0" data-building="house" aria-label="Sua casa, mudar nome da fazenda"><rect x="557" y="5" width="378" height="270" rx="16" fill="transparent" pointer-events="all"/></g>`;
}

export function plotMarkup(state, now) {
  return state.plots.map((p,i)=>{
    const row=Math.floor(i/4),col=i%4,x=475+(col-row)*83,y=414+(row+col)*44,status=plotStatus(p,now);
    const grown=progress(p,now),ready=status==='ready',care=plotCare(p,now),locked=status==='locked';
    const label=locked?`Terreno ${i+1}, expandir`:status==='empty'?`Canteiro ${i+1}, vazio`:`${CROPS[p.crop].name}, ${ready?'pronta para colher':status==='dry'?'seca, crescimento pausado; regue para crescer':Math.ceil(growthRemaining(p,now)/1000)+' segundos restantes'}`;
    const shape='M-70-5Q-78-1-72 5L-5 39Q1 44 8 39L72 5Q80 0 72-5L7-39Q0-43-8-38Z';
    let plants='',details='';
    if(p.crop)for(const [dx,dy]of[[-35,-5],[0,-23],[35,-5],[0,15]]){
      const scale=ready?.8:grown>.4?.55:.32;
      const picture=(ready||grown>.45)?cropArt(p.crop):'<path d="M30 54V33m0 7C12 44 10 25 12 24c13-2 21 5 18 16Zm0-7c-2-16 10-21 22-20 0 15-10 22-22 20Z" fill="#6d9f39" stroke="#41752b" stroke-width="2"/>';
      plants+=`<g transform="translate(${dx-32*scale} ${dy-49*scale}) scale(${scale})">${picture}</g>`;
    }
    if(!locked){
      for(let j=0;j<28;j++){
        const dx=((j*41+i*7)%132)-66,dy=((j*29+i*11)%66)-33;
        if(Math.abs(dx)/75+Math.abs(dy)/40<.9)details+=`<ellipse cx="${dx}" cy="${dy}" rx="${1+j%3*.65}" ry="${.7+j%2*.5}" fill="${['#c2a06d','#56402a','#a78958','#795539'][j%4]}" opacity=".7"/>`;
      }

    }
    const marker=ready?'<g class="ready-float" transform="translate(0 -57)"><rect x="-17" y="-18" width="34" height="27" rx="12" fill="#fff9de" stroke="#bca45d" stroke-width="1.5"/><path d="m-6-5 4 4 9-10" fill="none" stroke="#628b4c" stroke-width="3" stroke-linecap="round"/></g>':status==='dry'?'<g class="dry-marker" transform="translate(0 -47)"><circle cy="-4" r="12" fill="#fff0d0" stroke="#c69a51" stroke-width="1.4"/><path d="M0-12C-13 2-6 8 0 8S13 2 0-12Z" fill="#7fbcc6"/><path d="M0-7v7m0 3v1" stroke="#fff9de" stroke-width="1.5"/></g>':'';
    return `<g class="plot ${status} ${p.watered?'watered':''}" role="button" tabindex="0" data-plot="${i}" aria-label="${label}" transform="translate(${x} ${y})"><title>${label}</title><defs><clipPath id="bed-${i}"><path d="${shape}"/></clipPath></defs>
    ${locked?`<path class="tile-top" d="${shape}" fill="#ddbe50" fill-opacity=".35" stroke="#ffe58a" stroke-width="3" stroke-dasharray="8 4"/><rect x="-39" y="-15" width="78" height="32" rx="6" fill="#fff2b9" stroke="#b58935"/><text x="0" y="-2" text-anchor="middle" fill="#785021" font-size="10" font-weight="bold">+ EXPANDIR</text><text x="0" y="11" text-anchor="middle" fill="#785021" font-size="9">${expansionPrice(state)} moedas</text>`:`<path class="tile-edge" d="${shape}" transform="translate(0 5)" fill="#403522" opacity=".7"/><path class="tile-top" d="${shape}" fill="${p.watered?'url(#wet-soil)':'url(#soil)'}" stroke="#8f7046" stroke-width="1.2"/><g clip-path="url(#bed-${i})"><use href="#soil-paint" class="soil-surface ${p.watered?'wet':''}"/>${details}</g>${plants}
    ${care.weeds?'<path d="M-41 22q-18-22-12-21 15 3 13 20-1-29 6-28 9 13-5 28 16-23 21-16 0 12-23 17Z" fill="#679039" stroke="#3f6c26" stroke-width="1.2"/>':''}
    ${care.pests?'<g transform="translate(40 -18)"><ellipse cx="-7" cy="-5" rx="8" ry="5" fill="#d6e6dc" stroke="#66856e"/><ellipse cx="7" cy="-5" rx="8" ry="5" fill="#d6e6dc" stroke="#66856e"/><ellipse cy="1" rx="5" ry="9" fill="#d88453" stroke="#59402a" stroke-width="2"/></g>':''}${marker}`}</g>`;
  }).join('');
}

export function animalArt(type) {
  if(type==='chicken')return '<ellipse cx="31" cy="42" rx="24" ry="17" fill="#fffbe5" stroke="#c5b780" stroke-width="2"/><path d="m10 36-8-15 14 8" fill="#f4f0d5" stroke="#c5b780" stroke-width="2"/><circle cx="47" cy="25" r="12" fill="#fffbe5" stroke="#c5b780" stroke-width="2"/><path d="M41 15q-4-12 3-12 5 0 5 9 4-10 9-6 5 7-6 13" fill="#d65c3c"/><path d="m57 23 9 5-10 5" fill="#ebba4d"/><circle cx="50" cy="23" r="2" fill="#5e4b2e"/><path d="m24 56-2 8m16-7 3 8" stroke="#b88934" stroke-width="3"/><path d="M24 37q18-7 17 8-3 12-17-8" fill="#eee6bd"/>';
  return '<path d="M11 41V65m15-19v20m24-20 2 21m12-28 2 24" stroke="#6c6151" stroke-width="6"/><ellipse cx="35" cy="32" rx="32" ry="21" fill="#fff9e5" stroke="#aaa086" stroke-width="2"/><path d="M13 15q22-8 17 11-6 18-21 8m30-21q17 1 17 15-15 10-16-15" fill="#625b50"/><path d="M57 18 64 4l6 16m-5-9 12-7 9 24-12 23-18-5Z" fill="#fff5dd" stroke="#a69a7b" stroke-width="2"/><ellipse cx="67" cy="40" rx="14" ry="9" fill="#e9bbab"/><circle cx="65" cy="25" r="2" fill="#534832"/><path d="m58 10-6-9m22 7 4-9" stroke="#b69f70" stroke-width="4" stroke-linecap="round"/>';
}
export function animalIcon(type) {return `<svg class="animal-icon" viewBox="-5 -10 100 90" aria-hidden="true">${animalArt(type)}</svg>`;}
export function pondMarkup(state,now=Date.now()) {
  const pond=state.pond||{owned:false,stock:[]},ready=pond.stock.reduce((n,a)=>n+aquaticProduction(a,now).amount,0);
  const fish=pond.stock.some(a=>a.type==='fish')?'<g transform="translate(110 145) scale(.6)"><g class="pond-fish">'+cropArt('fish')+'</g></g>':'';
  const cages=pond.stock.filter(a=>a.type==='shrimp').map((a,i)=>`<g transform="translate(${190+i*29} ${166+i*5})"><rect width="26" height="20" rx="3" fill="#86b8c3" stroke="#496d79" stroke-width="2"/><path d="M7 0v20m7-20v20m7-20v20M0 7h26M0 14h26" stroke="#e4f5f4"/><circle r="4" fill="#ffc94b"/></g>`).join('');
  return `${fish}${cages}<g role="button" tabindex="0" data-building="pond" class="building pond-sign" aria-label="${pond.owned?'Cuidar do lago':'Comprar lago'}" transform="translate(165 255)"><rect x="-90" y="-20" width="180" height="43" rx="8" fill="#f0faff" stroke="#3899c7" stroke-width="3"/><text text-anchor="middle" y="-2" font-family="Arial" font-weight="bold" font-size="14" fill="#24577b">${pond.owned?'SEU LAGO':'LAGO À VENDA'}</text><text text-anchor="middle" y="15" font-family="Arial" font-size="11" fill="#376e87">${pond.owned?ready?ready+' produtos prontos':'Peixes e camarões':POND.cost+' moedas · Nível '+POND.level}</text></g>`;
}
export function animalMarkup(state,now=Date.now()) {
  const animals=state.animals||[];
  if(!animals.length)return '<g role="button" tabindex="0" data-building="animals" class="building" aria-label="Cercado vazio, comprar animais" transform="translate(1090 438)"><path d="M0 0v63" stroke="#986f35" stroke-width="7"/><rect x="-82" y="-20" width="164" height="47" rx="5" fill="#efcf8c" stroke="#a0783c" stroke-width="3"/><text text-anchor="middle" y="0" fill="#8b682d" font-size="13" font-family="Arial">Compre animais</text><text text-anchor="middle" y="17" fill="#a18142" font-size="10" font-family="Arial">na loja da fazenda</text></g>';
  return animals.map((a,i)=>{const p=animalProduction(a,now),x=1000+(i%3)*105,y=405+Math.floor(i/3)*93;return `<g class="animal" role="button" tabindex="0" data-animal="${i}" aria-label="${ANIMALS[a.type].name}, ${p.amount?'produtos prontos':p.hungry?'com fome':'produzindo'}" transform="translate(${x} ${y})"><ellipse cx="34" cy="60" rx="40" ry="16" fill="#608923" opacity=".2"/>${animalArt(a.type)}${p.amount?'<g transform="translate(47 -23)"><circle r="14" fill="#fff4c0" stroke="#b0a052" stroke-width="2"/><path d="m-6 0 4 5 9-11" fill="none" stroke="#7a9b34" stroke-width="3"/></g>':p.hungry?'<text x="35" y="-7" text-anchor="middle" font-size="20" fill="#a16f31">!</text>':''}<rect class="animal-hitbox" x="-7" y="-40" width="95" height="117" fill="transparent" pointer-events="all"/></g>`;}).join('');
}
