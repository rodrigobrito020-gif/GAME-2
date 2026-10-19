import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CROPS, POND, plotStatus, progress, plotCare, animalProduction, expansionPrice } from './game.js';

// All models are made for GAME-2. No external models, textures or CDN requests.
export function createFarm3D(svg, { onStatus, onError }) {
  const host=svg.parentElement, canvas=document.createElement('canvas');
  canvas.id='farm-canvas'; canvas.setAttribute('aria-label','Fazenda em 3D com fazendeiro e ferramentas animadas');
  let renderer;
  try { renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'low-power'}); }
  catch { return null; }
  host.insertBefore(canvas,svg); host.classList.add('has-3d');svg.setAttribute('preserveAspectRatio','none'); svg.setAttribute('aria-label','Fazenda 3D. Selecione uma ferramenta e um canteiro. Tab e Enter também funcionam.');
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.25)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.setClearColor('#a9dbce');
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#a9dbce');
  scene.add(new THREE.HemisphereLight(0xfff8d4,0x849651,2.5));
  const sun=new THREE.DirectionalLight(0xfff0ce,3); sun.position.set(-12,28,13); sun.castShadow=true;
  Object.assign(sun.shadow.camera,{left:-36,right:36,top:36,bottom:-36,near:1,far:90});
  sun.shadow.mapSize.set(1024,1024); renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;sun.shadow.normalBias=.05; sun.shadow.bias=-.0002; scene.add(sun);
  const camera=new THREE.OrthographicCamera(-18,18,11,-11,.1,140),cameraFocus=new THREE.Vector3(); camera.position.set(24,32,34); camera.lookAt(cameraFocus);
  const materials=new Map(), geometries=new Set(), textures=[];
  const mat=(color,extra={})=>{const key=JSON.stringify([color,extra]);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.88,...extra}));return materials.get(key);};
  const mesh=(geometry,color,parent,x=0,y=0,z=0,extra={})=>{geometries.add(geometry);const m=new THREE.Mesh(geometry,mat(color,extra));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const box=(p,c,x,y,z,w,h,d)=>mesh(new THREE.BoxGeometry(w,h,d),c,p,x,y,z);
  const ball=(p,c,x,y,z,r,sx=1,sy=1,sz=1)=>{const m=mesh(new THREE.IcosahedronGeometry(r,1),c,p,x,y,z);m.scale.set(sx,sy,sz);return m;};
  const cylinder=(p,c,x,y,z,r1,r2,h,n=8)=>mesh(new THREE.CylinderGeometry(r1,r2,h,n),c,p,x,y,z);
  const group=(p,x=0,y=0,z=0)=>{const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g;};
  const bar=(p,c,a,b,r=.04)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);const m=cylinder(p,c,0,0,0,r,r,v.length());m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;};
  let seed=721;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function texture(kind){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=kind==='soil'?'#a96b3c':'#88b93d';ctx.fillRect(0,0,128,128);
    for(let i=0;i<900;i++){const x=random()*128,y=random()*128;ctx.fillStyle=kind==='soil'?(i%2?'#8e502e':'#c58b50'):(i%2?'#a6cd52':'#75a537');ctx.fillRect(x,y,1+random()*2,kind==='soil'?1:3);}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(kind==='soil'?2:18,kind==='soil'?2:18);textures.push(t);return t;}
  const ground=mesh(new THREE.PlaneGeometry(120,120),'#ffffff',scene,0,-.03,0,{map:texture('grass')});ground.rotation.x=-Math.PI/2;ground.castShadow=false;
  // A small rural farm framed by trees rather than a city.
  function path(x,z,w,d){box(scene,'#d9b16a',x,.018,z,w,.045,d);box(scene,'#edc986',x,.047,z,w-.25,.025,d-.2);}
  path(0,-2.7,44,2.3);path(2.4,2,2,28);path(-4.8,-5.3,1.6,5.5);path(12.7,4,1.8,23);path(17.8,8,10,1.6);
  for(let i=0;i<45;i++){const x=-15+random()*29,z=-3.55+random()*1.6;ball(scene,'#c39b66',x,.065,z,.06,2,.3,1);}
  const fenceColliders=[];
  function fence(x,z,length,axis='x') {const f=group(scene,x,0,z),n=Math.ceil(length/1.8);if(axis==='z')f.rotation.y=Math.PI/2;
    fenceColliders.push({x,z,halfX:axis==='x'?length/2+.15:.2,halfZ:axis==='z'?length/2+.15:.2});
    for(let j=0;j<=n;j++){const px=-length/2+j*length/n;box(f,'#a26931',px,.6,0,.15,1.2,.15);cylinder(f,'#eac879',px,1.24,0,.15,.12,.12,4);}
    for(const y of [.38,.85])box(f,'#d49a49',0,y,0,length+.1,.13,.09);
  }
  fence(0,-17.5,47);fence(-23.5,-.5,34,'z');fence(23.5,-.5,34,'z');fence(-11,16.5,25);fence(15,16.5,17);
  const trees=[];
  function tree(x,z,size=1,fruit=false){const t=group(scene,x,0,z);t.scale.setScalar(size);cylinder(t,'#83532b',0,1,0,.18,.24,2.1);bar(t,'#83532b',[0,1.2,0],[.6,2.2,0],.1);const leaves=group(t,0,1.95,0);
    ball(leaves,'#529c3a',0,.55,0,1.15);ball(leaves,'#7bbf45',-.58,.8,.15,.85);ball(leaves,'#92cb50',.38,1.05,.12,.72);
    if(fruit)for(const [ax,ay,az]of[[-.7,.65,.65],[.35,.4,.95],[.7,.9,.45],[-.3,1.2,.7]]){ball(leaves,'#dc573b',ax,ay,az,.14);}
    trees.push({leaves,phase:random()*6});return t;
  }
  for(let i=0;i<17;i++)tree(-27+i*3.3,-20-random()*4,.85+random()*.5,i%3===0);
  for(let i=0;i<9;i++){tree(-26-random()*2,-15+i*4,.8+random()*.45);tree(26+random()*2,-15+i*4,.8+random()*.4);}
  for(let i=0;i<5;i++)tree(5+i*2,-10, .65+i%2*.1,true);
  function bush(x,z,s=1){ball(scene,'#6aa93b',x,.35*s,z,.5*s,1.3,1,.9);ball(scene,'#93c54b',x-.4*s,.25*s,z+.1,.35*s);}
  for(const [x,z]of[[-8,-8],[-13,-8],[-12,-.5],[13,-8],[12,9],[-12,9],[1,-10],[14,3]])bush(x,z,1.2);
  function roof(p,w,d,h,y,color){const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,h);shape.lineTo(w/2,0);shape.closePath();const m=mesh(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),color,p,0,y,-d/2);return m;}
  function windowPane(p,x,y,z,w=.65,h=.8){box(p,'#775534',x,y,z,w+.17,h+.17,.1);box(p,'#95cfd2',x,y,z+.065,w,h,.05);box(p,'#fff2c5',x,y,z+.1,.055,h,.05);box(p,'#fff2c5',x,y,z+.1,w,.055,.05);}
  function house(){const h=group(scene,-5.2,0,-7.1);box(h,'#a48665',0,.13,0,5.4,.28,4.2);box(h,'#fff0bc',0,1.6,0,5,2.9,3.8);roof(h,5,3.8,1.5,3,'#ffe0a2');roof(h,5.7,4.5,1.7,2.95,'#b8572e');
    for(const x of[-2.4,2.4])box(h,'#895b30',x,1.5,1.96,.13,2.9,.13);box(h,'#ba8045',0,.9,1.95,1,1.75,.13);box(h,'#754f31',0,.9,2.04,.76,1.5,.05);ball(h,'#f2c45e',.27,.85,2.09,.055);windowPane(h,-1.5,1.7,1.98);windowPane(h,1.5,1.7,1.98);
    box(h,'#e6c28b',0,.2,2.55,1.65,.2,1);box(h,'#f1d5a2',0,.08,3.1,2,.15,.55);
    for(const x of[-1.5,1.5]){box(h,'#ad6739',x,1.11,2.1,.95,.2,.34);for(let j=0;j<5;j++){ball(h,j%2?'#f9d55a':'#e97979',x-.32+j*.16,1.32,2.15,.11);}}
    box(h,'#ac947c',1.5,4, -.6,.6,1.9,.65);box(h,'#8b7764',1.5,4.95,-.6,.78,.15,.8);
    for(let j=0;j<11;j++){bar(h,'#d37940',[-2.82+j*.56,3,2.25],[-.02+j*.02,4.66,0],.015);}
    box(h,'#8a5a33',0,2.85,2,5,.16,.14);
  }house();
  function barn(){const b=group(scene,9,0,-6.5);box(b,'#be5440',0,1.5,0,4.8,3,4);roof(b,5.4,4.7,1.8,2.95,'#804a32');box(b,'#fff0c4',0,1,2.04,2.2,2,.12);box(b,'#98603a',0,1,2.12,1.95,1.8,.06);
    for(const x of[-.48,.48]){bar(b,'#ffe6b0',[x-.4,.18,2.2],[x+.4,1.8,2.2],.05);bar(b,'#ffe6b0',[x+.4,.18,2.2],[x-.4,1.8,2.2],.05);}
    windowPane(b,0,3.5,1.1,.8,.65);for(const x of[-2.3,2.3])box(b,'#ffe0aa',x,1.5,2.05,.15,3,.14);
    const silo=group(scene,12.5,0,-7.5);cylinder(silo,'#b3beb0',0,1.9,0,1,1,3.8,12);mesh(new THREE.ConeGeometry(1.15,.9,12),'#778f89',silo,0,4.2,0);for(let y=.5;y<4;y+=.8){const ring=mesh(new THREE.TorusGeometry(1.01,.035,4,12),'#81948d',silo,0,y,0);ring.rotation.x=Math.PI/2;}
    for(let i=0;i<3;i++)box(scene,'#e5bb52',6+i*.9,.4,-3.6,.8,.7,.65);
  }barn();
  // Pond, stones, reeds and lily pads.
  const lake=group(scene,-13,0,-6);lake.scale.set(1.25,1,1.25);const shore=cylinder(lake,'#d4c685',0,.015,0,2.8,2.9,.08,24);shore.scale.z=.78;
  const water=cylinder(lake,'#4fb8c5',0,.065,0,2.5,2.5,.05,32);water.scale.z=.74;
  const rings=[];for(let i=0;i<4;i++){const r=mesh(new THREE.TorusGeometry(.5+i*.32,.012,3,48),'#b4e7dc',lake,-.6+i*.15,.1,.1);r.rotation.x=Math.PI/2;r.scale.y=.65;rings.push(r);}
  for(let i=0;i<11;i++){const a=i/11*Math.PI*2;ball(lake,'#b9b6a0',Math.cos(a)*2.8,.16,Math.sin(a)*2.15,.2+random()*.17,1.3,.7,1);}
  for(const [x,z]of[[-1,.7],[1,-.8]]){const pad=cylinder(lake,'#6eac53',x,.11,z,.35,.35,.02,10);ball(lake,'#f4b4ba',x,.16,z,.12,1,.5,1);pad.castShadow=false;}
  for(let i=0;i<7;i++)bar(lake,'#699647',[-1.4+i*.13,0,-1.7],[-1.5+i*.13,.5+random()*.25,-1.65],.025);
  // Right-hand animal paddock with a coop.
  fence(8.4,1,9);fence(12.9,4.3,6.6,'z');fence(8.4,7.6,9);path(8.5,4.3,7.9,5.7);
  const coop=group(scene,10.8,0,1.9);box(coop,'#e9c789',0,.9,0,1.7,1.4,1.35);roof(coop,2,1.7,.8,1.55,'#b56837');box(coop,'#62412b',0,.65,.71,.65,.9,.05);const ramp=box(coop,'#b88445',0,.21,1.15,.65,.1,1);ramp.rotation.x=-.25;
  const trough=group(scene,6.4,0,2);box(trough,'#a87742',0,.25,0,1.6,.45,.55);box(trough,'#eac96c',0,.48,0,1.4,.04,.38);
  // Separate cattle and horse paddocks, with gates wide enough to walk through.
  function paddock(z0,z1,gate=(z0+z1)/2){const x0=14,x1=22;fence(18,z0,8);fence(18,z1,8);fence(x1,(z0+z1)/2,z1-z0,'z');fence(x0,(z0+gate-1.1)/2,gate-1.1-z0,'z');fence(x0,(gate+1.1+z1)/2,z1-gate-1.1,'z');}
  paddock(-9,0,-2.7);paddock(3,13);
  function shelter(x,z,color){const s=group(scene,x,0,z);for(const px of[-2,2])for(const pz of[-1.3,1.3])box(s,'#8f5c31',px,1.25,pz,.17,2.5,.17);box(s,color,0,1.1,-1.3,4,2.1,.14);roof(s,4.6,3.4,1.1,2.4,'#b44c32');for(const px of[-1.6,0,1.6])box(s,'#efc75b',px,.27,-.7,.8,.5,.7);}
  shelter(18,-7,'#b75b3e');shelter(18,4.5,'#b98545');
  function horse(x,z,color){const h=group(scene,x,0,z);ball(h,color,0,1.05,0,.65,.65,.85,1.3);bar(h,color,[0,1.2,.45],[0,1.9,.85],.22);ball(h,color,0,1.9,1,.31,.7,1,1.45);for(const px of[-.28,.28])for(const pz of[-.48,.48]){bar(h,color,[px,.15,pz],[px,.9,pz],.09);box(h,'#403c31',px,.12,pz,.19,.2,.24);}for(const px of[-.13,.13]){mesh(new THREE.ConeGeometry(.09,.32,4),color,h,px,2.25,.9);ball(h,'#302f29',px*1.6,1.98,1.13,.035);}bar(h,'#483626',[0,1.45,-.65],[.06,.55,-1],.09);bar(h,'#483626',[0,1.4,.42],[0,2.12,.7],.09);return h;}
  const horses=[horse(16.7,9,'#ae7140'),horse(20.2,10,'#f5e7be')];horses[1].rotation.y=-.7;
  for(const [x,z]of[[-1,-8],[13,9],[-12,8]]){const crate=group(scene,x,0,z);box(crate,'#ba864a',0,.35,0,.75,.7,.7);for(const y of[.1,.36,.63])box(crate,'#e2b373',0,y,.36,.8,.06,.05);}
  // Instanced grass and flowers keep draw calls low.
  const tuftGeo=new THREE.ConeGeometry(.035,.28,3),tuftMat=mat('#a3cd53'),grass=new THREE.InstancedMesh(tuftGeo,tuftMat,1800);geometries.add(tuftGeo);const dummy=new THREE.Object3D();
  let count=0;for(let i=0;i<4000&&count<1800;i++){const x=-22+random()*44,z=-17+random()*33;if(x>-9&&x<3&&z>-2&&z<11||Math.abs(z+2.7)<1.4||x>3&&x<14&&z>-9&&z<9||x>-15&&x<-2&&z>-10&&z<-3)continue;dummy.position.set(x,.13,z);dummy.rotation.set(0,random()*6,.12);dummy.updateMatrix();grass.setMatrixAt(count++,dummy.matrix);}grass.count=count;scene.add(grass);
  for(let i=0;i<65;i++){const x=-14+random()*29,z=9+random()*2;if(x>1&&x<4)continue;bar(scene,'#579048',[x,0,z],[x,.22,z],.012);ball(scene,i%3?'#fff2ac':'#f7ab80',x,.25,z,.07);}
  // Batch the static farm into one mesh per material. Trees' crowns and water
  // remain separate so animation does not rebuild geometry every frame.
  scene.updateMatrixWorld(true);
  const animated=new Set(rings);trees.forEach(({leaves})=>leaves.traverse(o=>animated.add(o)));horses.forEach(h=>h.traverse(o=>animated.add(o)));
  const buckets=new Map(),originals=[];
  scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||animated.has(o))return;const geometry=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone());geometry.applyMatrix4(o.matrixWorld);if(!buckets.has(o.material))buckets.set(o.material,[]);buckets.get(o.material).push(geometry);originals.push(o);});
  for(const [material,parts]of buckets){const geometry=mergeGeometries(parts,false);if(geometry){geometries.add(geometry);const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;scene.add(m);}parts.forEach(g=>g.dispose());}
  originals.forEach(o=>{o.removeFromParent();o.geometry.dispose();geometries.delete(o.geometry);});
  const beds=[],soilMap=texture('soil');
  function plotPosition(i){return new THREE.Vector3(-7.1+(i%4)*2.55,0,-.35+Math.floor(i/4)*2.55);}
  const crops=group(scene),signs=group(scene),animals=group(scene);
  const pondVisual=group(scene,-13,0,-6),swimmingFish=[];let pondSignature='';
  function farmLabel(parent,text,x,y,z,width=3){const c=document.createElement('canvas');c.width=384;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#f2fbff';ctx.fillRect(0,0,384,96);ctx.strokeStyle='#409ac2';ctx.lineWidth=7;ctx.strokeRect(3,3,378,90);ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.fillStyle='#255474';ctx.fillText(text,192,58);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;textures.push(tex);const material=new THREE.SpriteMaterial({map:tex});const sprite=new THREE.Sprite(material);sprite.position.set(x,y,z);sprite.scale.set(width,width/4,1);parent.add(sprite);return sprite;}
  farmLabel(scene,'GALINHEIRO',6.7,1.1,1.1,3.1);farmLabel(scene,'CURRAL',14.1,1.2,-4.5,2.5);farmLabel(scene,'ESTÁBULO',14.1,1.2,8,2.8);
  const lakeSign=farmLabel(scene,`LAGO À VENDA · ${POND.cost}`,-13,1,-2.4,4.1);
  const ownedLakeSign=farmLabel(scene,'SEU LAGO · PEIXES E CAMARÕES',-13,1,-2.4,4.5);ownedLakeSign.visible=false;
  function updatePond(state){const pond=state.pond||{owned:false,stock:[]},key=JSON.stringify([pond.owned,pond.stock.map(a=>a.type)]);if(key===pondSignature)return;pondSignature=key;clear(pondVisual);swimmingFish.length=0;lakeSign.visible=!pond.owned;ownedLakeSign.visible=pond.owned;canvas.dataset.pondOwned=String(pond.owned);canvas.dataset.shrimpCages=String(pond.stock.filter(a=>a.type==='shrimp').length);
    if(!pond.owned)return;
    for(let j=0;j<5;j++)box(pondVisual,'#c48c4b',.65,.2,1.9+j*.18,1.5,.09,.14);
    for(const x of[0,1.3])bar(pondVisual,'#7c5733',[x,0,2.7],[x,.65,2.7],.06);
    if(pond.stock.some(a=>a.type==='fish'))for(let i=0;i<5;i++){const f=group(pondVisual);ball(f,i%2?'#ffbf41':'#63c8ef',0,0,0,.21,1.5,.4,.6);const tail=mesh(new THREE.ConeGeometry(.14,.22,3),'#e78438',f,-.33,0,0);tail.rotation.z=Math.PI/2;f.userData.phase=i*Math.PI*.4;swimmingFish.push(f);}
    pond.stock.filter(a=>a.type==='shrimp').forEach((a,i)=>{const g=group(pondVisual,-1.5+i*1.05,.17,.8);box(g,'#679eb0',0,-.1,0,.82,.24,.7);for(const x of[-.45,.45])for(const z of[-.38,.38])ball(g,'#ffc646',x,.12,z,.1);for(const z of[-.4,.4])bar(g,'#e2eff0',[-.45,.09,z],[.45,.09,z],.025);for(let j=0;j<5;j++){const p=-.4+j*.2;bar(g,'#c9e2e4',[p,.09,-.4],[p,.09,.4],.015);bar(g,'#c9e2e4',[-.45,.09,p],[.45,.09,p],.015);}});
  }
  for(let i=0;i<16;i++){const pos=plotPosition(i);const b=group(scene,pos.x,0,pos.z);const soil=box(b,'#fff',0,.08,0,2.24,.16,2.24);soil.material=mat('#ffffff',{map:soilMap});for(let j=0;j<4;j++)box(b,'#8e572f',-.8+j*.52,.175,0,.07,.035,2);beds.push(b);}
  function clear(g){for(const child of [...g.children]){child.traverse(o=>{if(o.geometry){o.geometry.dispose();geometries.delete(o.geometry);}});g.remove(child);}}
  function leaf(p,x,y,z,angle=0,size=1){const l=ball(p,'#5d9d35',x,y,z,.2,.45,.25,1.7);l.rotation.y=angle;l.rotation.z=.3;l.scale.multiplyScalar(size);return l;}
  function plant(p,id,maturity){const size=.35+maturity*.65;p.scale.setScalar(size);bar(p,'#629734',[0,0,0],[0,.55,0],.035);leaf(p,-.18,.23,0,.6);leaf(p,.18,.33,0,-.6);
    if(id==='corn'||id==='wheat'){for(let j=0;j<3;j++){bar(p,'#79a23a',[(j-1)*.22,0,0],[(j-1)*.22,.85,0],.035);ball(p,id==='corn'?'#f7c73d':'#e4bb57',(j-1)*.22,.68,.08,.16,.65,1.6,.65);leaf(p,(j-1)*.23,.45,.1,j);}}
    else if(['turnip','carrot'].includes(id)){ball(p,id==='turnip'?'#f4e7b1':'#ef963e',0,.15,0,.22,1,.7,1);for(let j=0;j<4;j++)leaf(p,Math.sin(j*2)*.18,.4,Math.cos(j*2)*.18,j,1.3);}
    else {const color={strawberry:'#df5363',tomato:'#ed6242',pumpkin:'#eda139',watermelon:'#4b8f42'}[id];for(let j=0;j<3;j++)ball(p,color,Math.sin(j*2)*.22,.2,Math.cos(j*2)*.22,.18+(id==='pumpkin'||id==='watermelon'?.11:0));}
  }
  const expansionMaterials=new Map();
  function expansionMaterial(price){
    if(expansionMaterials.has(price))return expansionMaterials.get(price);
    const c=document.createElement('canvas');c.width=300;c.height=100;const ctx=c.getContext('2d');
    ctx.fillStyle='#fff2ba';ctx.fillRect(3,3,294,94);ctx.strokeStyle='#be8d2d';ctx.lineWidth=6;ctx.strokeRect(3,3,294,94);
    ctx.textAlign='center';ctx.fillStyle='#79511d';ctx.font='bold 31px Arial';ctx.fillText('+ EXPANDIR',150,42);ctx.font='25px Arial';ctx.fillText(`${price} moedas`,150,77);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;textures.push(tex);const material=new THREE.SpriteMaterial({map:tex});expansionMaterials.set(price,material);return material;
  }
  function marker(p,kind){const g=group(signs,p.x,.2,p.z);if(kind==='ready'){const halo=mesh(new THREE.TorusGeometry(.2,.035,4,16),'#fff0a2',g,0,1.28,0);halo.rotation.x=Math.PI/2;ball(g,'#ffdc66',0,1.26,0,.08);}
    if(kind==='dry'){const drop=ball(g,'#62c7ef',0,1.05,0,.12,1,1.4,.7);drop.rotation.z=-.1;}
    if(kind==='locked'){
      for(const z of[-1.12,1.12])box(g,'#ffdf71',0,.02,z,2.24,.065,.065);
      for(const x of[-1.12,1.12])box(g,'#ffdf71',x,.02,0,.065,.065,2.24);
      const sign=new THREE.Sprite(expansionMaterial(expansionPrice(currentState)));sign.position.set(0,.75,0);sign.scale.set(1.9,.63,1);g.add(sign);
    }}
  function animal(p,type){if(type==='chicken'){ball(p,'#fff7db',0,.38,0,.28,1.2,1,1.2);ball(p,'#fff9e9',0,.65,.19,.19);mesh(new THREE.ConeGeometry(.08,.19,4),'#eab447',p,0,.64,.38).rotation.x=Math.PI/2;ball(p,'#d75944',0,.85,.16,.08,.6,1,1);for(const x of[-.065,.065])ball(p,'#403c2a',x,.69,.34,.024);for(const x of[-.11,.11])bar(p,'#b68836',[x,.05,0],[x,.23,0],.025);}
    else{ball(p,'#f4eee0',0,.64,0,.48,1.3,1,1.8);ball(p,'#665b49',-.2,.82,.1,.25,1,1,1.8);box(p,'#f3e8d8',0,.72,.65,.45,.45,.48);box(p,'#e5b6a2',0,.55,.88,.42,.22,.1);for(const x of[-.3,.3])for(const z of[-.45,.45])bar(p,'#f3e8d8',[x,.1,z],[x,.6,z],.065);for(const x of[-.17,.17])ball(p,'#403c2a',x,.82,.9,.035);}}
  let currentState,signature='';
  function hitMarkup(){if(!currentState)return;const project=v=>{v.project(camera);return[(v.x+1)*700,(1-v.y)*410];};
    const polygons=currentState.plots.map((p,i)=>{const pos=plotPosition(i),points=[[-1.12,-1.12],[1.12,-1.12],[1.12,1.12],[-1.12,1.12]].map(([x,z])=>project(new THREE.Vector3(pos.x+x,.2,pos.z+z)).join(',')).join(' ');const status=plotStatus(p),label=!p.unlocked?`Expandir canteiro ${i+1} por ${expansionPrice(currentState)} moedas`:`Canteiro ${i+1}${p.crop?', '+CROPS[p.crop].name:''}`;const [sx,sy]=project(pos.clone().setY(.95));const sw=1.9/(camera.right-camera.left)*1400,sh=.63/(camera.top-camera.bottom)*820;const plaque=p.unlocked?'':`<rect class="expansion-hitbox" x="${sx-sw/2}" y="${sy-sh/2}" width="${sw}" height="${sh}"/>`;return `<g class="plot ${status} ${p.watered?'watered':''}" data-plot="${i}" tabindex="0" role="button" aria-label="${label}"><title>${label}</title><polygon class="tile-top" points="${points}"/>${plaque}</g>`;}).join('');
    const focus=document.activeElement?.dataset.plot;svg.querySelector('#plots').innerHTML=polygons;
    svg.querySelector('#animals').innerHTML=currentState.animals.map((a,i)=>{const pos=animalPosition(i),[x,y]=project(pos.clone().add(new THREE.Vector3(0,.5,0)));return `<g class="farm-animal" role="button" tabindex="0" data-animal="${i}" data-enclosure="${a.type==='cow'?'cattle':'chickens'}" aria-label="${a.type==='cow'?'Vaca no curral':'Galinha no galinheiro'}"><title>${a.type==='cow'?'Vaca':'Galinha'}</title><rect x="${x-25}" y="${y-30}" width="50" height="60"/></g>`;}).join('');
    const [hx,hy]=project(new THREE.Vector3(-5.2,2,-6));svg.querySelector('#buildings').innerHTML=`<g role="button" tabindex="0" data-building="house" aria-label="Casa: nome da fazenda"><rect x="${hx-45}" y="${hy-40}" width="90" height="70"/></g>`;
    const [lx,ly]=project(new THREE.Vector3(-13,1,-2.4)),lw=4.5/(camera.right-camera.left)*1400,lh=1.125/(camera.top-camera.bottom)*820;
    svg.querySelector('#pond').innerHTML=`<g role="button" tabindex="0" data-building="pond" aria-label="${currentState.pond?.owned?'Cuidar do lago':'Comprar lago por '+POND.cost+' moedas'}"><rect x="${lx-lw/2}" y="${ly-lh/2}" width="${lw}" height="${lh}"/></g>`;
    if(focus!==undefined)svg.querySelector(`[data-plot="${focus}"]`)?.focus({preventScroll:true});
  }
  function animalPosition(i){const type=currentState.animals[i].type,index=currentState.animals.slice(0,i).filter(a=>a.type===type).length;return type==='cow'?new THREE.Vector3(16+index%3*1.65,0,-3.7+Math.floor(index/3)*1.9):new THREE.Vector3(5.8+index%3*1.7,0,3.4+Math.floor(index/3)*1.8);}
  function update(state){currentState=state;updateAppearance(state.farmer||'male');updatePond(state);const now=Date.now(),key=JSON.stringify([state.plots.map(p=>[p.unlocked,p.crop,p.watered,plotStatus(p,now),Math.floor(progress(p,now)*4),plotCare(p,now)]),state.animals.map(a=>[a.type,animalProduction(a,now).hungry,animalProduction(a,now).amount]),state.pond?.owned]);
    if(key===signature)return;signature=key;renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;clear(crops);clear(signs);clear(animals);
    state.plots.forEach((p,i)=>{const pos=plotPosition(i),status=plotStatus(p,now);beds[i].visible=true;for(const ridge of beds[i].children.slice(1))ridge.visible=p.unlocked;beds[i].children[0].material=!p.unlocked?mat('#b4ce61',{transparent:true,opacity:.45}):mat(p.watered?'#b5947c':'#ffffff',{map:soilMap});
      if(!p.unlocked){marker(pos,'locked');return;}if(!p.crop)return;const maturity=status==='ready'?1:Math.max(.1,progress(p,now));for(const [x,z]of[[-.58,-.58],[.55,-.55],[-.55,.55],[.55,.55]]){const g=group(crops,pos.x+x,.17,pos.z+z);plant(g,p.crop,maturity);}
      marker(pos,status);const care=plotCare(p,now);if(care.weeds)for(let j=0;j<3;j++){const g=group(crops,pos.x-.8+j*.75,.18,pos.z);leaf(g,0,.1,0,j,.9);}
      if(care.pests)for(let j=0;j<2;j++)ball(crops,'#6d3d78',pos.x-.4+j*.8,.7,pos.z,.07);
    });
    state.animals.forEach((a,i)=>{const pos=animalPosition(i),g=group(animals,pos.x,0,pos.z);animal(g,a.type);g.userData.phase=i*1.8; if(animalProduction(a,now).hungry)ball(g,'#df8255',0,1.3,0,.1);});hitMarkup();
  }
  // Farmer rig: tools attach to the hand, never to the body or world.
  const farmer=group(scene,1.2,0,9.7);farmer.scale.setScalar(1.3);
  const body=group(farmer,0,0,0);box(body,'#438cb0',0,.81,0,.47,.56,.32);box(body,'#edc45b',0,1.08,0,.56,.26,.33);box(body,'#438cb0',0,.91,.18,.3,.35,.055);
  for(const x of[-.16,.16]){box(body,'#4485a0',x,1.07,.2,.07,.34,.025);ball(body,'#e7c164',x,.94,.23,.025);}
  const legs=[];for(const x of[-.14,.14]){const l=group(body,x,.56,0);box(l,'#336e91',0,-.19,0,.2,.4,.23);box(l,'#785331',0,-.43,.045,.24,.18,.36);legs.push(l);}
  const head=group(body,0,1.39,0);ball(head,'#efbd87',0,0,0,.27,.9,1.05,.9);ball(head,'#7b502c',0,.15,-.05,.23,1,.7,.9);for(const x of[-.09,.09])ball(head,'#343526',x,.03,.235,.025,1,1.3,.7);box(head,'#bf754f',0,-.09,.235,.075,.025,.015);
  cylinder(head,'#d99c35',0,.2,0,.42,.42,.075,12);cylinder(head,'#efc25a',0,.32,0,.24,.28,.22,10);cylinder(head,'#886733',0,.235,0,.281,.281,.055,10);
  const arms=[];for(const x of[-.33,.33]){const a=group(body,x,1.1,0);box(a,'#edc45b',0,-.08,0,.18,.24,.22);box(a,'#efbd87',0,-.29,0,.14,.26,.15);ball(a,'#edbc87',0,-.45,0,.095,.9,1.1,1);arms.push(a);}
  const braid=group(head,0,0,-.2);braid.visible=false;
  for(let i=0;i<5;i++)ball(braid,'#80502e',.04,-.03-i*.09,-.04,.11-i*.01,1,1.15,.8);
  ball(braid,'#e5a783',.04,-.43,-.04,.05,1,.4,1);
  let appearance='';
  function updateAppearance(style){if(style===appearance)return;appearance=style;const female=style==='female';braid.visible=female;
    const colors={'438cb0':'#64a18a','4485a0':'#4a8975','336e91':'#477e70','edc45b':'#e49d83'};
    farmer.traverse(o=>{if(!o.isMesh)return;o.userData.originalMaterial??=o.material;const original=o.userData.originalMaterial;const color=original.color.getHexString();o.material=female&&colors[color]?mat(colors[color]):original;});
    canvas.dataset.farmerStyle=style;renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;
  }
  const held=group(arms[1],0,-.46,.03),toolModels={};
  function toolGroup(id){const g=group(held);g.visible=false;toolModels[id]=g;return g;}
  let g=toolGroup('harvest');g.position.set(0,-.28,-.19);cylinder(g,'#be8849',0,-.12,.19,.25,.19,.3,10);const handle=mesh(new THREE.TorusGeometry(.24,.025,4,16,Math.PI),'#8e5e31',g,0,.04,.19);handle.rotation.y=Math.PI/2;
  for(let y=-.24;y<.04;y+=.06){const r=mesh(new THREE.TorusGeometry(.225,.012,3,10),'#e2b46a',g,0,y,.19);r.rotation.x=Math.PI/2;}
  g=toolGroup('water');cylinder(g,'#5bb6cc',0,-.1,.15,.2,.2,.3,12);bar(g,'#5bb6cc',[0,-.03,.25],[0,.02,.65],.06);const spout=cylinder(g,'#95d6dc',0,.02,.68,.11,.1,.06,10);spout.rotation.x=Math.PI/2;const wh=mesh(new THREE.TorusGeometry(.18,.035,5,12),'#4d9fb9',g,0,-.06,-.05);wh.rotation.y=Math.PI/2;
  g=toolGroup('plant');ball(g,'#b98242',0,-.1,.17,.22,.8,1.1,.7);cylinder(g,'#ead3a0',0,.1,.17,.11,.13,.08);ball(g,'#629a39',0,-.08,.31,.07);
  g=toolGroup('weed');bar(g,'#af7d40',[0,-.05,0],[0,.65,.2],.035);box(g,'#98aca3',0,.67,.24,.35,.07,.22);
  g=toolGroup('spray');cylinder(g,'#e6b071',0,-.05,.15,.13,.16,.35,10);box(g,'#648d84',0,.18,.2,.2,.12,.16);bar(g,'#647c79',[0,.18,.2],[0,.18,.5],.025);
  g=toolGroup('fertilize');ball(g,'#e4d3a4',0,-.14,.2,.25,.8,1.2,.7);box(g,'#89a94a',0,-.1,.37,.16,.16,.03);cylinder(g,'#b39a65',0,.13,.2,.08,.1,.08);
  const particles=group(scene),particleBits=[];for(let i=0;i<28;i++){const b=ball(particles,'#8bdef2',0,0,0,.035);b.visible=false;particleBits.push(b);}
  const selection=mesh(new THREE.TorusGeometry(.9,.035,4,40),'#fff0a4',scene,0,.2,0);selection.rotation.x=-Math.PI/2;selection.visible=false;
  const queue=[];let job=null,phase='idle',elapsed=0,impact=false,route=[],walkTime=0,selected='smart',disposed=false,raf=0,last=performance.now(),zoom=1;
  function equip(id){Object.entries(toolModels).forEach(([key,m])=>m.visible=key===id);canvas.dataset.heldTool=id;}
  function setPhase(next){phase=next;elapsed=0;canvas.dataset.actionPhase=next;canvas.setAttribute('aria-busy',String(next!=='idle'));canvas.dataset.pending=String(queue.length+(job?1:0));}
  function selectTool(id){selected=id;if(!job)equip(id);}
  function enqueue(type,index,apply){if(queue.length>=12){onError('Aguarde o fazendeiro terminar as tarefas.');return false;}if((job?.index===index&&job.type===type)||queue.some(j=>j.index===index&&j.type===type))return false;
    heldKeys.clear();manualRoute=[];queue.push({type,index,apply});canvas.dataset.pending=String(queue.length+(job?1:0));return true;}
  function nextJob(){job=queue.shift();if(!job){setPhase('idle');equip(selected);onStatus('Selecione uma ferramenta e clique em um canteiro.');return;}
    const p=plotPosition(job.index),laneX=p.x+1.23,target=new THREE.Vector3(laneX,0,p.z);
    route=findRoute(farmer.position,target);
    if(!route){onError('Não foi possível chegar ao canteiro.');job=null;nextJob();return;}
    equip(job.type);setPhase('walking');selection.position.set(p.x,.22,p.z);selection.visible=true;onStatus(`Indo ao canteiro ${job.index+1} · ${queue.length} na fila`);
  }
  const heldKeys=new Set();let manualRoute=[];
  function blocked(x,z){
    if(x < -22.95 || x > 22.95 || z < -17.05 || z > 16.1)return true;
    if(x>-8.05&&x<-2.35&&z>-9.35&&z<-4.35)return true;
    if(x>6.35&&x<11.65&&z>-8.8&&z<-4.3)return true;
    if((x+13)**2/13.7+(z+6)**2/7.5<1)return true;
    if((x-12.5)**2+(z+7.5)**2<1.5)return true;
    if(fenceColliders.some(f=>Math.abs(x-f.x)<f.halfX&&Math.abs(z-f.z)<f.halfZ))return true;
    if(Math.abs(x-10.8)<1.05&&Math.abs(z-1.9)<.9)return true;
    if(Math.abs(x-18)<2.3&&(Math.abs(z+7)<1.55||Math.abs(z-4.5)<1.55))return true;
    if(horses.some(h=>(x-h.position.x)**2+(z-h.position.z)**2<.7))return true;
    for(let i=0;i<(currentState?.plots.length||0);i++){if(!currentState.plots[i].unlocked)continue;const p=plotPosition(i);if(Math.abs(x-p.x)<1.2&&Math.abs(z-p.z)<1.2)return true;}
    for(const {leaves}of trees){const t=leaves.parent;if((x-t.position.x)**2+(z-t.position.z)**2<.12*t.scale.x*t.scale.x)return true;}
    return false;
  }
  // A* on the farm ground, with cells aligned to the narrow crop aisles.
  // Smoothing afterwards gives long, natural walking segments.
  function findRoute(start,end){
    if(blocked(end.x,end.z))return null;
    const step=.255,x0=-22.91,z0=-16.925,nx=181,nz=130,total=nx*nz;
    const point=id=>new THREE.Vector3(x0+(id%nx)*step,0,z0+Math.floor(id/nx)*step);
    const passable=new Int8Array(total);
    function free(id){if(id<0||id>=total)return false;if(!passable[id]){const p=point(id);passable[id]=blocked(p.x,p.z)?-1:1;}return passable[id]===1;}
    function nearest(p){const x=Math.round((p.x-x0)/step),z=Math.round((p.z-z0)/step);let best=-1,distance=Infinity;
      for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){const cx=x+dx,cz=z+dz,id=cz*nx+cx;if(cx<0||cx>=nx||cz<0||cz>=nz||!free(id))continue;const dist=point(id).distanceToSquared(p);if(dist<distance){best=id;distance=dist;}}return best;}
    const from=nearest(start),goal=nearest(end);if(from<0||goal<0)return null;
    const cost=new Float32Array(total);cost.fill(Infinity);cost[from]=0;const came=new Int32Array(total);came.fill(-1);const heap=[];
    function push(id,score){let i=heap.length;heap.push({id,score});while(i>0){const parent=(i-1)>>1;if(heap[parent].score<=score)break;[heap[i],heap[parent]]=[heap[parent],heap[i]];i=parent;}}
    function pop(){const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;while(true){const left=i*2+1,right=left+1;let best=i;if(left<heap.length&&heap[left].score<heap[best].score)best=left;if(right<heap.length&&heap[right].score<heap[best].score)best=right;if(best===i)break;[heap[i],heap[best]]=[heap[best],heap[i]];i=best;}}return top.id;}
    const heuristic=id=>Math.abs(id%nx-goal%nx)+Math.abs(Math.floor(id/nx)-Math.floor(goal/nx));push(from,heuristic(from));let reached=false;
    const visited=new Uint8Array(total);while(heap.length){const id=pop();if(visited[id])continue;visited[id]=1;if(id===goal){reached=true;break;}const x=id%nx,z=Math.floor(id/nx);
      for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){if(x+dx<0||x+dx>=nx||z+dz<0||z+dz>=nz)continue;const next=id+dx+dz*nx;if(!free(next)||visited[next])continue;const g=cost[id]+1;if(g<cost[next]){cost[next]=g;came[next]=id;push(next,g+heuristic(next));}}}
    if(!reached)return null;const path=[end.clone()];for(let id=goal;id!==from;id=came[id])path.push(point(id));path.reverse();
    const clearLine=(a,b)=>{const n=Math.ceil(a.distanceTo(b)/.08);for(let i=1;i<=n;i++){const f=i/n;if(blocked(a.x+(b.x-a.x)*f,a.z+(b.z-a.z)*f))return false;}return true;};
    const smooth=[];let current=start.clone(),i=0;while(i<path.length){let j=path.length-1;while(j>i&&!clearLine(current,path[j]))j--;smooth.push(path[j]);current=path[j];i=j+1;}return smooth;
  }
  function cancelTasks(){queue.length=0;job=null;impact=false;route=[];manualRoute=[];heldKeys.clear();setPhase('idle');selection.visible=false;body.rotation.x=0;body.position.y=0;arms.forEach(a=>a.rotation.x=0);legs.forEach(l=>l.rotation.x=0);held.rotation.x=0;particleBits.forEach(p=>p.visible=false);equip(selected);}
  function moveTo(clientX,clientY){const rect=canvas.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((clientX-rect.left)/rect.width*2-1,1-(clientY-rect.top)/rect.height*2),camera);const target=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),new THREE.Vector3());if(!target)return;
    const planned=findRoute(farmer.position,target);if(!planned){onError('Escolha um trecho livre de chão para caminhar.');return;}cancelTasks();manualRoute=planned;setPhase('moving');onStatus('Caminhando · WASD ou setas também movem o personagem.');}
  const moveCodes=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight']);
  function keyDown(e){if(!moveCodes.has(e.code)||e.ctrlKey||e.metaKey||e.altKey||document.querySelector('dialog[open]')||document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'))return;e.preventDefault();if(job||queue.length)cancelTasks();manualRoute=[];heldKeys.add(e.code);setPhase('moving');}
  function keyUp(e){heldKeys.delete(e.code);}
  function clearKeys(){heldKeys.clear();}
  document.addEventListener('keydown',keyDown);document.addEventListener('keyup',keyUp);window.addEventListener('blur',clearKeys);document.addEventListener('visibilitychange',clearKeys);
  function moveManually(dt){const direction=new THREE.Vector3();if(heldKeys.size){const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0).setY(0).normalize(),forward=camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize();direction.addScaledVector(forward,Number(heldKeys.has('KeyW')||heldKeys.has('ArrowUp'))-Number(heldKeys.has('KeyS')||heldKeys.has('ArrowDown')));direction.addScaledVector(right,Number(heldKeys.has('KeyD')||heldKeys.has('ArrowRight'))-Number(heldKeys.has('KeyA')||heldKeys.has('ArrowLeft')));}
    else if(manualRoute.length){direction.copy(manualRoute[0]).sub(farmer.position);if(direction.length()<=dt*5.8){farmer.position.copy(manualRoute.shift());direction.set(0,0,0);}}
    const walking=direction.lengthSq()>.001;if(walking){direction.normalize();farmer.rotation.y=Math.atan2(direction.x,direction.z);const pieces=Math.max(1,Math.ceil(dt*5.8/.08)),distance=dt*5.8/pieces;
      for(let i=0;i<pieces;i++){const x=farmer.position.x+direction.x*distance,z=farmer.position.z+direction.z*distance;if(!blocked(x,z))farmer.position.set(x,0,z);else if(!blocked(x,farmer.position.z))farmer.position.x=x;else if(!blocked(farmer.position.x,z))farmer.position.z=z;}
      walkTime+=dt*11;legs.forEach((l,i)=>l.rotation.x=Math.sin(walkTime+i*Math.PI)*.55);arms.forEach((a,i)=>a.rotation.x=Math.sin(walkTime+i*Math.PI)*.3);body.position.y=Math.abs(Math.sin(walkTime))*.025;
    }else{legs.forEach(l=>l.rotation.x=0);arms.forEach(a=>a.rotation.x=0);body.position.y=0;}
    if(!heldKeys.size&&!manualRoute.length){setPhase('idle');onStatus('Selecione uma ferramenta e clique em um canteiro.');}
  }
  function tick(now){if(disposed)return;raf=requestAnimationFrame(tick);const dt=Math.min(.25,Math.max(0,(now-last)/1000));last=now;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,t=now/1000;
    if(!reduced){trees.forEach(({leaves,phase})=>leaves.rotation.z=Math.sin(t*.75+phase)*.018);rings.forEach((r,i)=>{r.scale.setScalar(1+Math.sin(t*1.2+i)*.12);});animals.children.forEach((a,i)=>a.rotation.y=Math.sin(t*.45+i)*.15);horses.forEach((h,i)=>h.rotation.y=Math.sin(t*.3+i)*.18-i*.7);swimmingFish.forEach(f=>{const a=t*.45+f.userData.phase;f.position.set(Math.cos(a)*1.7,.14,Math.sin(a)*.9-.4);f.rotation.y=-a-Math.PI/2;});}
    if(heldKeys.size||manualRoute.length)moveManually(dt);
    else if(phase==='moving')moveManually(dt);
    if(!job&&queue.length)nextJob();
    if(job){elapsed+=dt;if(phase==='walking'){
      const target=route[0],dist=farmer.position.distanceTo(target),step=dt*5.8;
      if(dist<=step){farmer.position.copy(target);route.shift();if(!route.length){setPhase('acting');farmer.rotation.y=-Math.PI/2;onStatus({plant:'Semeando',water:'Regando',harvest:'Colhendo',weed:'Capinando',spray:'Dedetizando',fertilize:'Adubando'}[job.type]+'…');}}
      else{const direction=target.clone().sub(farmer.position).normalize();farmer.position.addScaledVector(direction,step);farmer.rotation.y=Math.atan2(direction.x,direction.z);}
      walkTime+=dt*11;legs.forEach((l,i)=>l.rotation.x=Math.sin(walkTime+i*Math.PI)*.55);arms[0].rotation.x=-Math.sin(walkTime)*.35;body.position.y=Math.abs(Math.sin(walkTime))*.025;
    }else if(phase==='acting'){
      legs.forEach(l=>l.rotation.x=0);body.position.y=0;const swing=Math.sin(Math.min(1,elapsed/1.25)*Math.PI);body.rotation.x=swing*.16;arms[1].rotation.x=-.65-swing*.55;arms[0].rotation.x=-swing*.5;held.rotation.x=job.type==='water'?1.25+swing*.7:0;
      if(!impact&&elapsed>=.62){impact=true;const ok=job.apply();canvas.dataset.lastAction=job.type;canvas.dataset.lastResult=String(ok);canvas.dataset.completed=String(Number(canvas.dataset.completed||0)+1);if(!ok){particleBits.forEach(p=>p.visible=false);}}
      particleBits.forEach((b,i)=>{const active=elapsed>.25&&elapsed<1.15;b.visible=active;if(!active)return;const p=plotPosition(job.index),f=(elapsed*2.6+i/28)%1;b.material=mat(job.type==='water'?'#a2e2ef':job.type==='harvest'?'#f9da67':job.type==='spray'?'#d7e7be':'#d9b278');if(job.type==='water'){const tip=toolModels.water.localToWorld(new THREE.Vector3(0,.02,.72));const end=new THREE.Vector3(p.x+(i%5-2)*.16,.2,p.z+(i%4-1.5)*.17);b.position.copy(tip).lerp(end,f);}else b.position.set(p.x+.65-i%5*.18, .9-f*.65, p.z+(i%4-1.5)*.17);});
      if(elapsed>=1.3){job=null;impact=false;body.rotation.x=0;arms.forEach(a=>a.rotation.x=0);held.rotation.x=0;particleBits.forEach(p=>p.visible=false);selection.visible=false;nextJob();}
    }}else if(!reduced){body.position.y=Math.sin(t*2)*.008;}
    if(now-(tick.lastRender||0)>33){
      const projected=farmer.position.clone().project(camera);
      if(Math.abs(projected.x)>.76||Math.abs(projected.y)>.68){const shift=farmer.position.clone().sub(cameraFocus).setY(0).multiplyScalar(Math.min(.15,dt*1.5));camera.position.add(shift);cameraFocus.add(shift);camera.updateMatrixWorld();hitMarkup();}
      if((job||phase==='moving')&&now-(tick.lastShadow||0)>100){renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;tick.lastShadow=now;}renderer.render(scene,camera);tick.lastRender=now;canvas.dataset.frames=String(Number(canvas.dataset.frames||0)+1);canvas.dataset.playerX=farmer.position.x.toFixed(3);canvas.dataset.playerZ=farmer.position.z.toFixed(3);canvas.dataset.cameraFocusX=cameraFocus.x.toFixed(3);canvas.dataset.cameraFocusZ=cameraFocus.z.toFixed(3);
    }
  }
  function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);const aspect=width/height,halfH=Math.max(24/aspect,12.5)/zoom,halfW=halfH*aspect;camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();camera.updateMatrixWorld();hitMarkup();renderer.render(scene,camera);}
  function setZoom(value){zoom=value;resize();}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();queue.length=0;job=null;onError('O navegador perdeu a conexão 3D. Recarregue para continuar; seu progresso foi salvo.');});
  const observer=new ResizeObserver(resize);observer.observe(host);resize();raf=requestAnimationFrame(tick);canvas.dataset.renderer='three';canvas.dataset.actionPhase='idle';canvas.dataset.completed='0';
  return {update,selectTool,enqueue,setZoom,moveTo,cancel:cancelTasks,dispose(){disposed=true;cancelAnimationFrame(raf);document.removeEventListener('keydown',keyDown);document.removeEventListener('keyup',keyUp);window.removeEventListener('blur',clearKeys);document.removeEventListener('visibilitychange',clearKeys);observer.disconnect();renderer.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());expansionMaterials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());},get busy(){return !!job||queue.length>0;}};
}
