import { CROPS, plotStatus, progress } from './game.js';

export const icons = {
  hand: '<path d="m13 21-5-5c-2-2 0-4 2-2l2 1V5a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-6a2 2 0 0 1 4 0v7-4a2 2 0 0 1 4 0v9c0 6-3 10-8 10-3 0-5-2-7-6Z"/>',
  sprout: '<path d="M16 28V14M16 19C4 21 3 9 4 7c8-1 13 4 12 12Zm0-5C15 5 22 3 29 3c0 9-6 13-13 11Z"/>',
  water: '<path d="M4 14h15v13H4zM19 17l5-5 4 3-6 9h-3M7 13V8c0-7 10-7 10 0v5M27 18l3 3m-5 0 3 4"/>',
  basket: '<path d="m4 15 3 13h19l3-13ZM2 15h29M9 15l7-12 7 12M12 19v5m8-5v5"/>',
  shop: '<path d="M5 14v15h22V14M2 13 6 3h20l4 10M2 13c0 5 7 5 7 0 0 5 7 5 7 0 0 5 7 5 7 0 0 5 7 5 7 0M13 29V19h8v10"/>',
  crate: '<path d="M3 9h26v20H3ZM1 4h30v6H1ZM7 14h18M7 24h18M12 17h8"/>',
  coin: '<circle cx="16" cy="16" r="13"/><path d="M20 10h-6c-5 0-5 6 0 6h4c5 0 5 6 0 6h-6m4-15v18"/>',
  lock: '<rect x="7" y="14" width="19" height="15" rx="3"/><path d="M11 14V8a6 6 0 0 1 12 0v6m-7 6v4"/>',
  arrow: '<path d="M9 25 25 9M9 9h16v16"/>'
};
export function icon(name, cls = '') { return `<svg class="icon ${cls}" viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.sprout}</svg>`; }

export function cropArt(id) {
  if (id === 'carrot') return '<path d="M30 26C15 17 11 40 10 55c14-6 34-19 20-29Z" fill="#f7933c" stroke="#de712b" stroke-width="1.5"/><path d="m30 25-1-16m4 15L44 9m-12 13L21 12" stroke="#538944" stroke-width="7" stroke-linecap="round"/><path d="m18 33 6 3m-10 5 6 3" stroke="#d56a2a" stroke-width="2"/>';
  if (id === 'wheat') return '<path d="m19 57 15-43m-7 23L18 20m13 5 17-11" stroke="#c49830" stroke-width="3" stroke-linecap="round"/><g fill="#e8be59"><ellipse cx="31" cy="15" rx="4" ry="8" transform="rotate(-15 31 15)"/><ellipse cx="21" cy="25" rx="4" ry="8" transform="rotate(-35 21 25)"/><ellipse cx="40" cy="23" rx="4" ry="8" transform="rotate(50 40 23)"/><ellipse cx="19" cy="37" rx="4" ry="8" transform="rotate(-35 19 37)"/><ellipse cx="35" cy="34" rx="4" ry="8" transform="rotate(50 35 34)"/></g>';
  if (id === 'strawberry') return '<path d="M10 29C7 8 54 8 51 29 47 44 35 57 30 57S14 44 10 29Z" fill="#ec6874" stroke="#cf4d5f" stroke-width="1.5"/><path d="m30 22-16-8 15 1 6-10 2 11 14-3-11 12-10-6-8 6Z" fill="#619451"/><g fill="#ffe6a5"><ellipse cx="19" cy="30" rx="1.5" ry="2"/><ellipse cx="32" cy="32" rx="1.5" ry="2"/><ellipse cx="43" cy="30" rx="1.5" ry="2"/><ellipse cx="25" cy="41" rx="1.5" ry="2"/><ellipse cx="36" cy="43" rx="1.5" ry="2"/><ellipse cx="30" cy="50" rx="1.5" ry="2"/></g>';
  if (id === 'corn') return '<path d="M22 45C9 11 25 1 35 9c9 8 5 24 1 35Z" fill="#f4cd5d" stroke="#d6ad3e" stroke-width="1.5"/><path d="m25 12 5 34m-1-36 5 33M19 20h19m-19 7h19m-17 7h15" fill="none" stroke="#d8ab33" stroke-width="2"/><path d="M31 58C9 56 6 28 11 26c18 10 23 21 20 32Z" fill="#679b58"/><path d="M31 58c-6-18 8-30 22-35-2 18-7 34-22 35Z" fill="#84b56d"/>';
  return '<path d="m30 15 2-9 6 1-3 10" fill="#5b7f42"/><ellipse cx="31" cy="36" rx="25" ry="20" fill="#e88e42" stroke="#cf7634" stroke-width="1.5"/><ellipse cx="31" cy="36" rx="14" ry="20" fill="#f1a04b" stroke="#d47c32" stroke-width="1.5"/><ellipse cx="31" cy="36" rx="5" ry="20" fill="#f6b45f"/>';
}
export function cropIcon(id, cls = '') { return `<svg class="crop-icon ${cls}" viewBox="0 0 64 64" aria-hidden="true">${cropArt(id)}</svg>`; }
function tree(x,y,s=1,variant=0) { return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="8" rx="35" ry="15" fill="#386b43" opacity=".15"/><path d="M-6 4v-55h12V4l-6 3Z" fill="#8d7050"/><path d="m0-23-14-17m14 9 13-18" stroke="#8d7050" stroke-width="5"/><circle cy="-65" r="34" fill="${variant?'#7da355':'#78a16a'}"/><circle cx="-24" cy="-54" r="25" fill="#91b77b"/><circle cx="20" cy="-54" r="29" fill="#73985c"/><circle cx="-2" cy="-80" r="25" fill="#a0bf86"/>${variant?'<g fill="#df8060"><circle cx="-23" cy="-60" r="4"/><circle cx="13" cy="-80" r="4"/><circle cx="24" cy="-46" r="4"/></g>':''}</g>`; }
function fence(x,y,n=4,flip=1) { return `<g transform="translate(${x} ${y}) scale(${flip} 1)"><path d="M0 0 ${n*38} ${n*19}m${-n*38} ${-n*19+16} ${n*38} ${n*19}" stroke="#f5e5bb" stroke-width="6"/>${Array.from({length:n+1},(_,i)=>`<path d="M${i*38} ${i*19+28}v-40l4-5 4 5v40" fill="#f9edcb" stroke="#e8d8aa" stroke-width="2"/>`).join('')}</g>`; }
function house() { return `<g transform="translate(285 271)"><ellipse cx="50" cy="38" rx="130" ry="45" fill="#456b36" opacity=".12"/><path d="m-70-56 96 49v88l-96-48Z" fill="#eee2bd"/><path d="m26-7 93-49v88L26 81Z" fill="#dccfa7"/><path d="m-70-56 96-80 93 80-93 49Z" fill="#f1debb"/><path d="m-94-48 115-98 120 79-22 11-93-63-96 79Z" fill="#c66d50"/><path d="m21-146 120 79-9-22-112-78-114 99v20Z" fill="#df9271"/><path d="m-75-63 95-83 109 72" fill="none" stroke="#e7a582" stroke-width="3"/><path d="m58-117 19 11v-48l-19-10Z" fill="#b8a99a"/><path d="m58-164 19 10 16-8-19-10Z" fill="#d9cdb8"/><path d="m26-7v88M-70-56l96 49 93-49" fill="none" stroke="#b99f76" stroke-width="6"/><path d="M-35-8-6 6v49l-29-14Z" fill="#9b7959"/><path d="m-30-4 19 10v43l-19-10Z" fill="#ae8c68"/><circle cx="-15" cy="27" r="2" fill="#e4ce9b"/><path d="m50 4 24-13v27L50 31Zm39-21 17-10v26L89 9Z" fill="#91bfc0" stroke="#faf1d3" stroke-width="5"/><path d="M62-1v24m-12-6 24-13m23-25V5" stroke="#faf1d3" stroke-width="3"/><path d="m-18 70 39 19-43 22-38-20Z" fill="#cab18a"/><path d="m-54-59 27-32 26 32-26 14Z" fill="#789ca3" stroke="#f4e5c4" stroke-width="5"/><path d="M-27-86v37m-19-12 38 2" stroke="#f4e5c4" stroke-width="3"/><g fill="#81a05d"><ellipse cx="64" cy="30" rx="20" ry="8"/><ellipse cx="99" cy="10" rx="17" ry="7"/></g><g fill="#f0b07c"><circle cx="57" cy="27" r="4"/><circle cx="67" cy="23" r="4"/><circle cx="99" cy="7" r="4"/></g></g>`; }
function barn() { return `<g transform="translate(1080 344)"><ellipse cy="25" rx="105" ry="34" fill="#477643" opacity=".14"/><path d="m-69-65 69 35v86l-69-36Z" fill="#b86551"/><path d="m0-30 76-40v86L0 56Z" fill="#d38064"/><path d="m-69-65 69-65 76 60-76 40Z" fill="#e29876"/><path d="m-83-59 80-85 96 67-17 7-76-54-69 59Z" fill="#607e7a"/><path d="m-83-59v-14l79-89 97 70v15l-96-67Z" fill="#83a19a"/><path d="m12 14 52-27v61L12 75Z" fill="#eab99a"/><path d="m14 18 48 29m0-54L14 73M38 2v59" stroke="#f9e7c7" stroke-width="5"/><path d="m-52-35 29 15v28l-29-15Z" fill="#6d969c" stroke="#f5d5ae" stroke-width="4"/><path d="m21-57 16-25 17 8v17l-33 17Z" fill="#c0d2b0" stroke="#f5d5ae" stroke-width="4"/></g>`; }

export function landscape() {
  let details='';
  for(let i=0;i<100;i++) {
    const x=150+(i*163%1110), y=260+(i*71%430);
    if((x<450||x>1030)&&y<600) details+=`<path d="m${x} ${y} -3-6m3 6 4-4" stroke="#83a566" stroke-width="2" opacity=".7"/>`;
  }
  return `<defs><linearGradient id="grass" x2=".8" y2="1"><stop stop-color="#bbd8a0"/><stop offset="1" stop-color="#94bf80"/></linearGradient><linearGradient id="earth" x2="0" y2="1"><stop stop-color="#b28b61"/><stop offset="1" stop-color="#91704d"/></linearGradient><filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="15" stdDeviation="15" flood-color="#527c52" flood-opacity=".13"/></filter></defs>
  <g class="cloud" fill="#fff" opacity=".65"><ellipse cx="200" cy="100" rx="65" ry="18"/><ellipse cx="187" cy="87" rx="31" ry="25"/><ellipse cx="225" cy="95" rx="27" ry="17"/></g><g class="cloud cloud-two" fill="#fff" opacity=".55"><ellipse cx="1180" cy="130" rx="77" ry="19"/><ellipse cx="1160" cy="114" rx="33" ry="28"/><ellipse cx="1200" cy="119" rx="36" ry="24"/></g>
  <ellipse cx="700" cy="715" rx="470" ry="49" fill="#75a47b" opacity=".09"/>
  <g filter="url(#soft-shadow)"><path d="M112 367 680 71l617 321v28L729 767 112 406Z" fill="#c3b385"/><path d="m112 367 617 336 568-311v28L729 767 112 406Z" fill="#a3af77"/><path d="m112 367 568-296 617 321-568 339Z" fill="url(#grass)"/></g>
  <path d="m180 391 130-70 149 78 122-63 22 16-130 84-165-81-90 51Z" fill="#d6cf9d"/><path d="m478 423 28-16 214 115 309-163 33 16-342 187Z" fill="#d7cf9d"/>
  ${details}${fence(607,121,5)}${fence(624,121,7,-1)}${tree(544,194,.9)}${tree(850,239,1.1,1)}${tree(930,245,.8,1)}${house()}${barn()}
  <g transform="translate(399 500)"><path d="m-99-10 79-38 97 45-81 41Z" fill="#d1d4a1"/><path d="m-88-10 69-30L66-3-4 29Z" fill="#8cbfc1"/><path d="M-65-9c29 14 62 18 97 3m-64-14 31 14m-20 12 24 1" fill="none" stroke="#bce0d5" stroke-width="3"/><ellipse cx="20" cy="-2" rx="11" ry="5" fill="#72996a"/><ellipse cx="-41" cy="-12" rx="9" ry="4" fill="#72996a"/></g>
  <g transform="translate(1020 516)"><path d="m-20-13 31 15v34l-31-16Z" fill="#b89865"/><path d="m11 2 26-14v34L11 36Z" fill="#967744"/><path d="m-20-13 26-14 31 15L11 2Z" fill="#d4bc88"/><path d="m-16-2 23 11m-23 2 23 11m8-12 18-10m-18 21 18-10" stroke="#79673f" stroke-width="2"/></g>
  ${tree(228,447,.85)}${tree(1132,460,1.05)}${tree(1182,478,.7)}${tree(995,607,.7,1)}${tree(448,652,.85,1)}${fence(317,518,3)}${fence(1054,520,3,-1)}
  <g fill="#faf2bf"><circle cx="476" cy="238" r="4"/><circle cx="483" cy="234" r="4"/><circle cx="1080" cy="482" r="4"/><circle cx="1092" cy="484" r="4"/></g>
  <g transform="translate(477 349)"><ellipse cy="9" rx="14" ry="7" fill="#53754c" opacity=".16"/><path d="M-6-5v12m12-12v12" stroke="#6e7966" stroke-width="5"/><path d="M-9-19h18L6-1H-6Z" fill="#e4a575"/><circle cy="-28" r="9" fill="#f0c5a0"/><path d="M-13-33h26m-20 0v-7H7v7" fill="#dfc383" stroke="#dfc383" stroke-width="4" stroke-linecap="round"/></g>`;
}
export function plotMarkup(state, now) {
  return state.plots.map((p,i)=>{
    const row=Math.floor(i/4), col=i%4, x=700+(col-row)*83, y=330+(row+col)*44, status=plotStatus(p,now);
    const grown=progress(p,now), ready=status==='ready';
    const label=status==='locked'?`Terreno ${i+1}, expandir`:status==='empty'?`Canteiro ${i+1}, vazio`: `${CROPS[p.crop].name}, ${ready?'pronta para colher':Math.ceil(Math.max(0,p.readyAt-now)/1000)+' segundos restantes'}`;
    let plants='';
    if(p.crop) {
      for(const [dx,dy] of [[-35,-5],[0,-23],[35,-5],[0,15]]) {
        const scale=ready?'.8':grown>.4?'.55':'.32';
        const picture=(ready||grown>.45)?cropArt(p.crop):'<path d="M30 54V33m0 7C12 44 10 25 12 24c13-2 21 5 18 16Zm0-7c-2-16 10-21 22-20 0 15-10 22-22 20Z" fill="#76a454" stroke="#588446" stroke-width="2"/>';
        plants+=`<g transform="translate(${dx-32*Number(scale)} ${dy-49*Number(scale)}) scale(${scale})">${picture}</g>`;
      }
    }
    const soil=status==='locked'?'#a7c18a':p.watered?'#96764f':'#ae8860';
    return `<g class="plot ${status} ${p.watered?'watered':''}" role="button" tabindex="0" data-plot="${i}" aria-label="${label}" transform="translate(${x} ${y})"><title>${label}</title><path class="tile-edge" d="m-75 0 75 40 75-40v10L0 51-75 10Z" fill="${status==='locked'?'#8fa774':'#806747'}"/><path class="tile-top" d="m-75 0 75-40L75 0 0 40Z" fill="${soil}" stroke="${status==='locked'?'#c3d7a8':'#c7a775'}" stroke-width="3" ${status==='locked'?'stroke-dasharray="7 6"':''}/>${status==='locked'?'<g opacity=".7" stroke="#60854f" stroke-width="3" stroke-linecap="round"><path d="M-7 2h14M0-5V9"/></g>':`<g stroke="${p.watered?'#7d6244':'#96724e'}" stroke-width="3" opacity=".7"><path d="m-53 0 53 28m-35-38 53 28m-35-38 53 28m-35-38 53 28"/></g>${plants}${p.watered&&!ready?'<path d="M51-4c-8 11-7 15 0 15s8-4 0-15Z" fill="#91d1d6" stroke="#e5f5e8" stroke-width="1.5"/>':''}`}${ready?'<g class="ready-float" transform="translate(0 -57)"><rect x="-18" y="-18" width="36" height="27" rx="12" fill="#fff9de" stroke="#d4b65f" stroke-width="1.5"/><path d="m-6-5 4 4 9-10" fill="none" stroke="#628b4c" stroke-width="3" stroke-linecap="round"/></g>':''}</g>`;
  }).join('');
}
