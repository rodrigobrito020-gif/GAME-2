import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CROPS, PLOT_LAYOUT, ANIMALS, POND, pondCellPosition, plotStatus, cropStage, plotCare, animalProduction, expansionPrice } from './game.js';

// All models are made for GAME-2. No external models, textures or CDN requests.
export function createFarm3D(svg, { onStatus, onError, onQueue=()=>{} }) {
  const host=svg.parentElement, canvas=document.createElement('canvas');
  canvas.id='farm-canvas'; canvas.setAttribute('aria-label','Fazenda em 3D com fazendeiro e ferramentas animadas');
  let renderer;
  try { renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'}); }
  catch { return null; }
  host.insertBefore(canvas,svg); host.classList.add('has-3d');svg.setAttribute('preserveAspectRatio','none'); svg.setAttribute('aria-label','Fazenda 3D. Selecione uma ferramenta e um canteiro. Tab e Enter também funcionam.');
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.25)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18; renderer.setClearColor('#c3e5ec');
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#c3e5ec');scene.fog=new THREE.Fog('#c3e5ec',65,140);
  scene.add(new THREE.HemisphereLight(0xe8f5ff,0x657247,1.7));
  const sun=new THREE.DirectionalLight(0xffe8c3,2.7); sun.position.set(-18,32,20); sun.castShadow=true;
  Object.assign(sun.shadow.camera,{left:-36,right:36,top:36,bottom:-36,near:1,far:90});
  sun.shadow.mapSize.set(1024,1024); renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;sun.shadow.normalBias=.05; sun.shadow.bias=-.0002; scene.add(sun);
  const camera=new THREE.OrthographicCamera(-18,18,11,-11,.1,140),cameraFocus=new THREE.Vector3();let cameraPinned=false,panX=0,panY=0,projectionDirty=false; camera.position.set(24,32,34); camera.lookAt(cameraFocus);
  const materials=new Map(), geometries=new Set(), textures=[];let woodMap=null,roofMap=null;
  const woodColors=new Set(['#83532b','#a26931','#d49a49','#8f5c31','#895b30','#ba8045','#754f31','#b88445','#c48c4b','#98603a','#ad6739','#8a5a33']);
  const roofColors=new Set(['#b8572e','#b44c32','#b56837','#804a32']);
  const mat=(color,extra={})=>{const surface=woodColors.has(color)?woodMap:roofColors.has(color)?roofMap:null,options={...(surface?{map:surface}:{}),...extra};const key=JSON.stringify([color,Object.fromEntries(Object.entries(options).map(([k,v])=>[k,v?.isTexture?v.uuid:v]))]);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.82,...options}));return materials.get(key);};
  const mesh=(geometry,color,parent,x=0,y=0,z=0,extra={})=>{geometries.add(geometry);const m=new THREE.Mesh(geometry,mat(color,extra));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const box=(p,c,x,y,z,w,h,d)=>mesh(new THREE.BoxGeometry(w,h,d),c,p,x,y,z);
  const ball=(p,c,x,y,z,r,sx=1,sy=1,sz=1,detail=2)=>{const m=mesh(new THREE.IcosahedronGeometry(r,detail),c,p,x,y,z);m.scale.set(sx,sy,sz);return m;};
  const cylinder=(p,c,x,y,z,r1,r2,h,n=8)=>mesh(new THREE.CylinderGeometry(r1,r2,h,n),c,p,x,y,z);
  const group=(p,x=0,y=0,z=0)=>{const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g;};
  const bar=(p,c,a,b,r=.04)=>{const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start);const m=cylinder(p,c,0,0,0,r,r,v.length());m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;};
  let seed=721;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function texture(kind){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),colors={grass:['#6a9d47','#83ae58','#4e823a'],soil:['#956440','#ad7b50','#724a31'],wood:['#d7bd92','#bfa072','#ede0bc'],roof:['#d4a17b','#bd8862','#edd0a3'],path:['#c7aa7c','#d6be96','#b39a72']},pal=colors[kind];ctx.fillStyle=pal[0];ctx.fillRect(0,0,256,256);
    for(let i=0;i<4200;i++){const x=random()*256,y=random()*256;ctx.globalAlpha=.12+random()*.4;ctx.fillStyle=pal[1+i%2];if(kind==='wood')ctx.fillRect(x,y,1,10+random()*40);else if(kind==='roof')ctx.fillRect(x,y,7+random()*13,2);else{ctx.beginPath();ctx.ellipse(x,y,1+random()*3,kind==='grass'?1+random()*4:.8+random()*1.2,random()*3,0,Math.PI*2);ctx.fill();}}
    ctx.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.repeat.setScalar(kind==='grass'?24:kind==='soil'?1:2);textures.push(t);return t;}
  woodMap=texture('wood');roofMap=texture('roof');const pathMap=texture('path');
  const ground=mesh(new THREE.PlaneGeometry(240,240),'#ffffff',scene,0,-.03,0,{map:texture('grass')});ground.rotation.x=-Math.PI/2;ground.castShadow=false;
  // A small rural farm framed by trees rather than a city.
  function path(x,z,w,d){const shape=new THREE.Shape(),r=Math.min(.7,w/3,d/3);shape.moveTo(-w/2+r,-d/2);shape.lineTo(w/2-r,-d/2);shape.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);shape.lineTo(w/2,d/2-r);shape.quadraticCurveTo(w/2,d/2,w/2-r,d/2);shape.lineTo(-w/2+r,d/2);shape.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);shape.lineTo(-w/2,-d/2+r);shape.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);const p=mesh(new THREE.ShapeGeometry(shape,8),'#e3d3ad',scene,x,.018,z,{map:pathMap});p.rotation.x=-Math.PI/2;p.castShadow=false;}
  path(0,-2.7,44,2.3);path(2.4,2,2,28);path(-3.8,-4.0,2.2,2.2);path(12.7,4,1.8,23);path(17.8,8,10,1.6);
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
  for(const [x,z]of[[-8,-8],[13,-8],[12,9],[1,-10],[14,3],[-22,-3]])bush(x,z,1.2);
  function roof(p,w,d,h,y,color){const angle=Math.atan2(h,w/2),length=Math.hypot(h,w/2);for(const side of[-1,1]){const panel=box(p,color,side*w/4,y+h/2,0,length+.12,.16,d);panel.rotation.z=-side*angle;for(let row=0;row<5;row++){const f=(row+.3)/5;bar(p,color,[side*w/2*(1-f),y+h*f+.1,-d/2],[side*w/2*(1-f),y+h*f+.1,d/2],.035);}}bar(p,'#8a5a33',[0,y+h+.08,-d/2-.05],[0,y+h+.08,d/2+.05],.085);}
  function gable(p,w,d,h,y,color){const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,h);shape.lineTo(w/2,0);shape.closePath();return mesh(new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),color,p,0,y,-d/2);}
  function windowPane(p,x,y,z,w=.65,h=.8){box(p,'#775534',x,y,z,w+.17,h+.17,.1);box(p,'#95cfd2',x,y,z+.065,w,h,.05);box(p,'#fff2c5',x,y,z+.1,.055,h,.05);box(p,'#fff2c5',x,y,z+.1,w,.055,.05);}
  function house(){const h=group(scene,-3.8,0,-8.2);h.scale.setScalar(1.45);box(h,'#9c8d7c',0,.13,0,5.4,.28,4.2);box(h,'#f1e4c9',0,1.6,0,5,2.9,3.8);gable(h,5,3.8,1.5,3,'#f1e4c9');roof(h,5.7,4.5,1.7,2.95,'#b8572e');
    for(const x of[-2.4,2.4])box(h,'#895b30',x,1.5,1.96,.13,2.9,.13);box(h,'#ba8045',0,.9,1.95,1,1.75,.13);box(h,'#754f31',0,.9,2.04,.76,1.5,.05);ball(h,'#f2c45e',.27,.85,2.09,.055);windowPane(h,-1.5,1.7,1.98);windowPane(h,1.5,1.7,1.98);
    box(h,'#e6c28b',0,.2,2.55,1.65,.2,1);box(h,'#f1d5a2',0,.08,3.1,2,.15,.55);
    for(const x of[-1.5,1.5]){box(h,'#ad6739',x,1.11,2.1,.95,.2,.34);for(let j=0;j<5;j++){ball(h,j%2?'#f9d55a':'#e97979',x-.32+j*.16,1.32,2.15,.11);}}
    box(h,'#ac947c',1.5,4, -.6,.6,1.9,.65);box(h,'#8b7764',1.5,4.95,-.6,.78,.15,.8);
    const side=group(h,2.56,0,0);side.rotation.y=Math.PI/2;windowPane(side,0,1.75,0,1,1);for(const x of[-.7,.7])box(side,'#5e8067',x,1.75,.08,.28,1.15,.08);
    for(const y of[.45,2.8]){box(h,'#895b30',0,y,1.96,5,.1,.1);box(h,'#895b30',2.55,y,0,.1,.1,3.9);}
    box(h,'#895b30',0,3.5,1.98,.12,1.1,.12);bar(h,'#895b30',[-2.4,3.02,2],[0,4.45,2],.06);bar(h,'#895b30', [0,4.45,2],[2.4,3.02,2],.06);
    for(const x of[-1.05,1.05])bar(h,'#895b30',[x,.25,2.95],[x,2.3,2.95],.06);const awning=box(h,'#648c6d',0,2.3,2.55,2.5,.12,1.35);awning.rotation.x=.15;
    box(h,'#8a5a33',0,2.85,2,5,.16,.14);
  }house();
  let millRotor;
  function millBuilding(){const m=group(scene,8.5,0,-7.2);m.scale.setScalar(1.3);
    box(m,'#bc9b70',-1.4,.15,0,3.2,.3,3.5);box(m,'#f1e4c9',-1.4,1.2,0,3,2.2,3.2);gable(m,3,3.2,1,2.3,'#f1e4c9');roof(m,3.6,3.8,1.2,2.3,'#b8572e');
    cylinder(m,'#c9bda5',1,2.5,-.4,1.15,1.65,5,16);mesh(new THREE.ConeGeometry(1.55,1.45,16),'#64816c',m,1,5.7,-.4);
    for(const y of[.5,1.25,2,2.75,3.5,4.25]){const ring=mesh(new THREE.TorusGeometry(1.65-y*.1,.035,3,32),'#a8977a',m,1,y,-.4);ring.rotation.x=Math.PI/2;}
    box(m,'#895b30',-1.4,.95,1.64,.8,1.8,.1);windowPane(m,-.3,1.45,1.65,.55,.65);
    millRotor=group(m,1,4.2,1.15);cylinder(millRotor,'#754f31',0,0,0,.16,.16,.35,12).rotation.x=Math.PI/2;
    for(let i=0;i<4;i++){const arm=group(millRotor);arm.rotation.z=i*Math.PI/2;box(arm,'#895b30',0,1.15,0,.11,2.4,.11);box(arm,'#eee3bd',.28,1.25,.03,.52,1.65,.07);for(let j=0;j<6;j++)box(arm,'#ba8045',.28,.48+j*.29,.085,.58,.035,.03);}
    const silo=group(scene,13,0,-10.7);silo.scale.setScalar(1.15);cylinder(silo,'#b3beb0',0,1.9,0,1,1,3.8,16);mesh(new THREE.ConeGeometry(1.15,.9,16),'#778f89',silo,0,4.2,0);
    for(let y=.5;y<4;y+=.8){const ring=mesh(new THREE.TorusGeometry(1.01,.035,4,16),'#81948d',silo,0,y,0);ring.rotation.x=Math.PI/2;}
    for(let i=0;i<3;i++){const sack=ball(scene,'#c9b181',6+i*.65,.4,-3.8,.35,1,1.2,1);bar(scene,'#8a5a33',[6+i*.65-.1,.7,-3.8],[6+i*.65+.1,.7,-3.8],.025);}
  }millBuilding();
  // Pond, stones, reeds and lily pads.
  const lake=group(scene,POND.x,0,POND.z);box(lake,'#d4c685',0,-.01,0,POND.size,.08,POND.size);
  const waterGeometry=new THREE.PlaneGeometry(POND.size-.6,POND.size-.6,16,16);waterGeometry.rotateX(-Math.PI/2);
  const water=mesh(waterGeometry,'#3c9fa5',lake,0,.10,0,{roughness:.24,metalness:.18});water.castShadow=false;
  const waterTime={value:0};water.material.onBeforeCompile=shader=>{shader.uniforms.farmTime=waterTime;shader.vertexShader='uniform float farmTime; varying vec3 farmLocal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n farmLocal=position; transformed.y += sin(position.x*2.8+farmTime)*.016+cos(position.z*3.2+farmTime*.8)*.014;');shader.fragmentShader='uniform float farmTime; varying vec3 farmLocal;\n'+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n float shallow=smoothstep(4.8,5.7,max(abs(farmLocal.x),abs(farmLocal.z))); float wave=sin(dot(farmLocal.xz,vec2(.75,.42))+farmTime*.5)*.025+sin(dot(farmLocal.xz,vec2(-1.1,.65))-farmTime*.35)*.013; float gleam=pow(max(0.0,sin(dot(farmLocal.xz,vec2(1.3,.7))+farmTime*.6)),18.0)*.025; diffuseColor.rgb=mix(vec3(.10,.43,.49),vec3(.28,.65,.59),shallow)+wave+gleam;');};
  const rings=[];for(let i=0;i<4;i++){const r=mesh(new THREE.TorusGeometry(.4+i*.1,.01,3,32),'#cce9dd',lake,-3+i*2,.11,Math.sin(i*2)*3,{transparent:true,opacity:.24,depthWrite:false});r.rotation.x=Math.PI/2;r.scale.y=.65;rings.push(r);}
  for(let i=0;i<7;i++)for(const side of[-1,1]){ball(lake,'#b9b6a0',-5.4+i*1.8,.11,side*5.9,.14,1.3,.6,1);ball(lake,'#b9b6a0',side*5.9,.11,-5.4+i*1.8,.14,1,.6,1.3);}
  for(const [x,z]of[[-5.2,-4.9],[5.15,-4.8]]){const pad=cylinder(lake,'#6eac53',x,.11,z,.3,.3,.02,10);ball(lake,'#f4b4ba',x,.16,z,.09,1,.5,1);pad.castShadow=false;}
  for(let i=0;i<7;i++)bar(lake,'#699647',[-4.8+i*.13,0,-5.5],[-4.9+i*.13,.5+random()*.25,-5.5],.025);
  // Right-hand animal paddock with a coop.
  fence(8.4,1,9);fence(12.9,4.3,6.6,'z');fence(8.4,7.6,9);path(8.5,4.3,7.9,5.7);
  const coop=group(scene,10.8,0,2.15);coop.scale.setScalar(1.2);box(coop,'#e9c789',0,.9,0,1.7,1.4,1.35);roof(coop,2,1.7,.8,1.55,'#b56837');box(coop,'#62412b',0,.65,.71,.65,.9,.05);const ramp=box(coop,'#b88445',0,.21,1.15,.65,.1,1);ramp.rotation.x=-.25;
  const trough=group(scene,6.4,0,2);box(trough,'#a87742',0,.25,0,1.6,.45,.55);box(trough,'#eac96c',0,.48,0,1.4,.04,.38);
  // Separate cattle and sheep paddocks, with gates wide enough to walk through.
  function paddock(z0,z1,gate=(z0+z1)/2){const x0=14,x1=22;fence(18,z0,8);fence(18,z1,8);fence(x1,(z0+z1)/2,z1-z0,'z');fence(x0,(z0+gate-1.1)/2,gate-1.1-z0,'z');fence(x0,(gate+1.1+z1)/2,z1-gate-1.1,'z');}
  paddock(-9,0,-2.7);paddock(3,13);
  function shelter(x,z,color){const s=group(scene,x,0,z);for(const px of[-2,2])for(const pz of[-1.3,1.3])box(s,'#8f5c31',px,1.25,pz,.17,2.5,.17);box(s,color,0,1.1,-1.3,4,2.1,.14);roof(s,4.6,3.4,1.1,2.4,'#b44c32');for(const px of[-1.6,0,1.6])box(s,'#efc75b',px,.27,-.7,.8,.5,.7);}
  shelter(18,-7,'#b75b3e');shelter(18,4.5,'#b98545');
  for(const [x,z]of[[.9,-12],[13,9],[-22,5]]){const crate=group(scene,x,0,z);box(crate,'#ba864a',0,.35,0,.75,.7,.7);for(const y of[.1,.36,.63])box(crate,'#e2b373',0,y,.36,.8,.06,.05);}
  // Instanced grass and flowers keep draw calls low.
  const tuftGeo=new THREE.ConeGeometry(.035,.28,3),tuftMat=mat('#a3cd53'),grass=new THREE.InstancedMesh(tuftGeo,tuftMat,1800);geometries.add(tuftGeo);const dummy=new THREE.Object3D();
  let count=0;for(let i=0;i<4000&&count<1800;i++){const x=-22+random()*44,z=-17+random()*33;if(x>-21.2&&x<2&&z>-1.7&&z<14||Math.abs(z+2.7)<1.4||x>3&&x<14&&z>-9&&z<9||x>-22&&x<-2&&z>-15.5&&z<-3)continue;dummy.position.set(x,.13,z);dummy.rotation.set(0,random()*6,.12);dummy.updateMatrix();grass.setMatrixAt(count++,dummy.matrix);}grass.count=count;scene.add(grass);
  for(let i=0;i<65;i++){const x=-14+random()*29,z=15+random()*.6;if(x>1&&x<4)continue;bar(scene,'#579048',[x,0,z],[x,.22,z],.012);ball(scene,i%3?'#fff2ac':'#f7ab80',x,.25,z,.07);}
  // Batch the static farm into one mesh per material. Trees' crowns and water
  // remain separate so animation does not rebuild geometry every frame.
  scene.updateMatrixWorld(true);
  const animated=new Set([...rings,water]);millRotor.traverse(o=>animated.add(o));trees.forEach(({leaves})=>leaves.traverse(o=>animated.add(o)));
  const crownGeometry=new THREE.IcosahedronGeometry(1,2),crownBatches=new Map(),crownMatrix=new THREE.Matrix4(),crownScale=new THREE.Vector3();geometries.add(crownGeometry);
  for(const {leaves}of trees)leaves.traverse(node=>{if(!node.isMesh)return;const radius=node.geometry.parameters.radius;let batch=crownBatches.get(node.material);if(!batch){batch={material:node.material,entries:[]};crownBatches.set(node.material,batch);}batch.entries.push({node,radius});node.visible=false;node.geometry.dispose();geometries.delete(node.geometry);node.geometry=crownGeometry;});
  for(const batch of crownBatches.values()){batch.mesh=new THREE.InstancedMesh(crownGeometry,batch.material,batch.entries.length);batch.mesh.castShadow=true;batch.mesh.receiveShadow=true;batch.mesh.frustumCulled=false;batch.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(batch.mesh);}
  function updateCrowns(){for(const {leaves}of trees)leaves.updateMatrixWorld(true);for(const batch of crownBatches.values()){batch.entries.forEach(({node,radius},i)=>{crownMatrix.copy(node.matrixWorld).scale(crownScale.setScalar(radius));batch.mesh.setMatrixAt(i,crownMatrix);});batch.mesh.instanceMatrix.needsUpdate=true;}}
  updateCrowns();
  batchLocalGeometry(millRotor);
  const buckets=new Map(),originals=[];
  scene.traverse(o=>{if(!o.isMesh||!o.visible||o.isInstancedMesh||animated.has(o)||o.parent===millRotor)return;const geometry=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone());geometry.applyMatrix4(o.matrixWorld);if(!buckets.has(o.material))buckets.set(o.material,[]);buckets.get(o.material).push(geometry);originals.push(o);});
  for(const [material,parts]of buckets){const geometry=mergeGeometries(parts,false);if(geometry){geometries.add(geometry);const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;scene.add(m);}parts.forEach(g=>g.dispose());}
  originals.forEach(o=>{o.removeFromParent();o.geometry.dispose();geometries.delete(o.geometry);});
  const soilMap=texture('soil');
  function plotPosition(i){const p=PLOT_LAYOUT[i];return new THREE.Vector3(p.x,0,p.z);}
  const crops=group(scene),signs=group(scene),animals=group(scene);
  const pondVisual=group(scene,POND.x,0,POND.z),swimmingFish=[];let pondSignature='';
  function updatePond(state){const pond=state.pond||{owned:false,stock:[]},key=JSON.stringify([pond.owned,pond.stock.map(a=>[a.slot,a.type])]);if(key===pondSignature)return;pondSignature=key;clear(pondVisual);swimmingFish.length=0;canvas.dataset.pondOwned=String(pond.owned);canvas.dataset.shrimpCages=String(pond.stock.filter(a=>a.type==='shrimp').length);canvas.dataset.pondCells=String(POND.slots);
    if(!pond.owned)return;const frames=group(pondVisual),half=POND.cellSize/2;
    for(let slot=0;slot<POND.slots;slot++){const pos=pondCellPosition(slot),x=pos.x-POND.x,z=pos.z-POND.z,a=pond.stock.find(a=>a.slot===slot),color=a?'#b78343':'#75aaa6';
      for(const side of[-1,1]){box(frames,color,x+side*half,.16,z,.07,.11,POND.cellSize);box(frames,color,x,.16,z+side*half,POND.cellSize,.11,.07);}
      for(const dx of[-half,half])for(const dz of[-half,half])ball(frames,a?'#f5cf62':'#b0d8cd',x+dx,.19,z+dz,.09);
      if(!a)continue;
      if(a.type==='shrimp')for(let j=0;j<5;j++){const k=-half+j*POND.cellSize/4;bar(frames,'#9cb9b3',[x+k,.095,z-half],[x+k,.095,z+half],.012);bar(frames,'#9cb9b3',[x-half,.095,z+k],[x+half,.095,z+k],.012);}
      const f=group(pondVisual,x,.14,z);f.userData.phase=slot*1.7;f.userData.homeX=x;f.userData.homeZ=z;
      if(a.type==='fish'){ball(f,'#ffc45a',0,0,0,.2,1.5,.4,.6);mesh(new THREE.ConeGeometry(.13,.2,3),'#e78438',f,-.3,0,0).rotation.z=Math.PI/2;}
      else{for(let j=0;j<4;j++)ball(f,'#ee9677',-.16+j*.09,0,Math.sin(j*.6)*.05,.075,1,.5,1);bar(f,'#f6c6a1',[.14,0,.05],[.35,.03,.12],.01);}
      batchLocalGeometry(f);f.traverse(o=>{if(o.isMesh)o.castShadow=false;});swimmingFish.push(f);
    }
    batchLocalGeometry(frames);renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;
  }
  const bedGeo=new THREE.BoxGeometry(2.24,.16,2.24),ridgeGeo=new THREE.BoxGeometry(.07,.035,2);
  geometries.add(bedGeo);geometries.add(ridgeGeo);
  const beds=new THREE.InstancedMesh(bedGeo,mat('#ffffff',{map:soilMap}),PLOT_LAYOUT.length),ridges=new THREE.InstancedMesh(ridgeGeo,mat('#77553a'),PLOT_LAYOUT.length*4);
  beds.receiveShadow=true;ridges.receiveShadow=true;scene.add(beds,ridges);
  PLOT_LAYOUT.forEach((pos,i)=>{dummy.position.set(pos.x,.08,pos.z);dummy.rotation.set(0,0,0);dummy.scale.setScalar(1);dummy.updateMatrix();beds.setMatrixAt(i,dummy.matrix);for(let j=0;j<4;j++){dummy.position.set(pos.x-.8+j*.52,.175,pos.z);dummy.updateMatrix();ridges.setMatrixAt(i*4+j,dummy.matrix);}});
  function clear(g){for(const child of [...g.children]){child.traverse(o=>{if(o.geometry){o.geometry.dispose();geometries.delete(o.geometry);}});g.remove(child);}}
  function batchLocalGeometry(root){
    root.updateWorldMatrix(true,true);const sprites=[];root.traverse(o=>{if(o.isSprite)sprites.push(o);});sprites.forEach(o=>root.attach(o));const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert(),matrix=new THREE.Matrix4(),batches=new Map();
    root.traverse(o=>{if(!o.isMesh)return;const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geometry.applyMatrix4(matrix.multiplyMatrices(inverse,o.matrixWorld));if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(geometry);});
    sprites.forEach(o=>root.remove(o));clear(root);sprites.forEach(o=>root.add(o));for(const [material,parts]of batches){const geometry=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());if(!geometry)continue;geometries.add(geometry);const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;root.add(m);}
  }
  function batchRig(root){
    for(const child of [...root.children])if(!child.isMesh)batchRig(child);
    const batches=new Map();for(const child of [...root.children]){if(!child.isMesh)continue;child.updateMatrix();const geometry=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();geometry.applyMatrix4(child.matrix);if(!batches.has(child.material))batches.set(child.material,[]);batches.get(child.material).push(geometry);child.geometry.dispose();geometries.delete(child.geometry);root.remove(child);}
    for(const [material,parts]of batches){const geometry=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());if(!geometry)continue;geometries.add(geometry);const m=new THREE.Mesh(geometry,material);m.receiveShadow=true;root.add(m);}
  }
  // Soft contact shadows follow characters without redrawing the entire sun shadow map.
  const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=64;
  const contactContext=contactCanvas.getContext('2d'),contactGradient=contactContext.createRadialGradient(32,32,3,32,32,32);
  contactGradient.addColorStop(0,'rgba(28,43,22,.32)');contactGradient.addColorStop(1,'rgba(28,43,22,0)');contactContext.fillStyle=contactGradient;contactContext.fillRect(0,0,64,64);
  const contactTexture=new THREE.CanvasTexture(contactCanvas);textures.push(contactTexture);
  const contactMaterial=new THREE.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false});materials.set('contact-shadow',contactMaterial);
  function contactShadow(root,size){const geometry=new THREE.PlaneGeometry(size,size);geometries.add(geometry);const shadow=new THREE.Mesh(geometry,contactMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.y=.025;root.add(shadow);}
  function batchCrops(){
    crops.updateWorldMatrix(true,true);const batches=new Map();
    crops.traverse(o=>{if(!o.isMesh)return;const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(geometry);});
    clear(crops);for(const [material,parts]of batches){const geometry=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());if(!geometry)continue;geometries.add(geometry);const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;crops.add(m);}
  }
  function leaf(p,x,y,z,angle=0,size=1){const l=ball(p,'#5d9d35',x,y,z,.2,.45,.25,1.7,1);l.rotation.y=angle;l.rotation.z=.3;l.scale.multiplyScalar(size);return l;}
  function plant(p,id,stage){
    if(stage==='seed'){for(let j=0;j<3;j++)ball(p,'#b68b58',(j-1)*.14,.04,0,.07,1,.5,1,0);return;}
    if(stage==='sprout'){bar(p,'#629734',[0,0,0],[0,.22,0],.022);leaf(p,-.08,.17,0,.7,.55);leaf(p,.08,.2,0,-.7,.55);return;}
    const ready=stage==='ready';p.scale.setScalar(ready?1:.78);
    if(id==='wheat'){
      for(let j=0;j<5;j++){const x=Math.sin(j*2)*.22,z=Math.cos(j*2)*.22,h=.7+j%3*.13;bar(p,ready?'#cba24c':'#79a23a',[x,0,z],[x,h,z],.02);
        for(let k=0;k<4;k++)for(const side of[-1,1]){const grain=ball(p,ready?'#f0c35a':'#9cbd49',x+side*.048,h-.2+k*.065,z,.055,.7,1.55,.7,0);grain.rotation.z=-side*.45;}}
    }else if(id==='corn'){
      bar(p,'#629734',[0,0,0],[0,1.15,0],.045);for(let j=0;j<5;j++)leaf(p,j%2?-.2:.2,.25+j*.15,0,j%2?-.8:.8,1.65);
      if(ready){ball(p,'#f7c73d',.17,.73,.04,.18,.65,1.8,.65,1);leaf(p,.21,.52,.08,-.3,1.1);for(let j=0;j<3;j++)bar(p,'#d4b55c',[0,1.05,0],[(j-1)*.12,1.35,0],.012);}
    }else if(id==='turnip'||id==='carrot'){
      if(ready){if(id==='carrot'){const root=mesh(new THREE.ConeGeometry(.14,.46,8),'#ef963e',p,0,.07,0);root.rotation.z=Math.PI;}
        else{ball(p,'#f4e7b1',0,.13,0,.24,1,.85,1,1);ball(p,'#c580a8',0,.25,0,.19,1,.35,1,1);}}
      for(let j=0;j<(id==='carrot'?7:5);j++)leaf(p,Math.sin(j*2)*.15,.32+j%2*.08,Math.cos(j*2)*.15,j,id==='carrot'?.9:1.4);
    }else if(id==='tomato'){
      bar(p,'#a26931',[0,0,0],[0,1.05,0],.026);for(let j=0;j<4;j++){leaf(p,Math.sin(j*2)*.22,.3+j*.16,Math.cos(j*2)*.17,j,1.1);if(ready)ball(p,'#ed6242',Math.sin(j*2)*.22,.25+j*.14,Math.cos(j*2)*.23,.15,1,1,1,1);}
    }else if(id==='strawberry'){
      for(let j=0;j<5;j++)leaf(p,Math.sin(j*2)*.19,.18,Math.cos(j*2)*.19,j,1.2);
      for(let j=0;j<3;j++){const x=Math.sin(j*2)*.26,z=Math.cos(j*2)*.26;ball(p,ready?'#df5363':'#fff8e7',x,.17,z,ready?.14:.06,1,1.25,1,1);if(ready){leaf(p,x,.3,z,j,.35);ball(p,'#f5d681',x+.08,.19,z+.08,.022,1,1,1,0);}}
    }else if(id==='pumpkin'||id==='watermelon'){
      for(let j=0;j<5;j++)leaf(p,Math.sin(j*2)*.29,.15,Math.cos(j*2)*.29,j,1.3);
      if(ready){if(id==='pumpkin'){for(let j=0;j<7;j++){const a=j*Math.PI*2/7;ball(p,j%2?'#eda139':'#d88b30',Math.cos(a)*.13,.23,Math.sin(a)*.13,.23,.9,1,.9,1);}bar(p,'#629734',[0,.35,0],[.04,.56,0],.045);}
        else{ball(p,'#427c3c',0,.23,0,.33,1.3,.85,.85,1);for(let j=0;j<3;j++)ball(p,'#8bad4d',(j-1)*.16,.28,.23,.15,.35,.85,.35,1);}}
    }else{
      bar(p,'#629734',[0,0,0],[0,.6,0],.025);for(let j=0;j<6;j++){const x=Math.sin(j*2)*.19,z=Math.cos(j*2)*.19;leaf(p,x,.22+j*.065,z,j,.9);if(ready){if(id==='soybean')ball(p,'#b3c975',x,.25+j*.065,z+.08,.07,.7,1.8,.7,0);else ball(p,'#a77cc1',x,.48+j*.045,z,.065,1,1.3,1,0);}}
    }
  }
  function marker(p,kind){const g=group(signs,p.x,.2,p.z);if(kind==='ready'){const halo=mesh(new THREE.TorusGeometry(.2,.035,4,16),'#fff0a2',g,0,1.28,0);halo.rotation.x=Math.PI/2;ball(g,'#ffdc66',0,1.26,0,.08);}
    if(kind==='dry'){const drop=ball(g,'#62c7ef',0,1.05,0,.12,1,1.4,.7);drop.rotation.z=-.1;}
    if(kind==='locked'){
      for(const z of[-1.12,1.12])box(g,'#ffdf71',0,.02,z,2.24,.065,.065);
      for(const x of[-1.12,1.12])box(g,'#ffdf71',x,.02,0,.065,.065,2.24);

    }}
  function animal(p,type){
    p.userData.legs=[];const head=group(p);p.userData.head=head;
    if(type==='chicken'){
      ball(p,'#fff8e7',0,.42,0,.32,1.2,1,1.35);head.position.set(0,.73,.23);ball(head,'#fff8e7',0,0,0,.21);mesh(new THREE.ConeGeometry(.08,.19,4),'#eab447',head,0,-.01,.23).rotation.x=Math.PI/2;ball(head,'#ce5546',0,.2,0,.09,.7,1,1);for(const x of[-.09,.09]){ball(head,'#fff',x,.04,.17,.045);ball(head,'#302c26',x,.04,.2,.024);}for(const x of[-.12,.12]){const leg=group(p,x,.22,0);bar(leg,'#bb8739',[0,-.18,0],[0,0,0],.025);p.userData.legs.push(leg);}for(const x of[-.32,.32])ball(p,'#e7dcc4',x,.45,0,.18,.5,1,1.4);
    }else{
      const sheep=type==='sheep',color=sheep?'#f5eedc':'#f8f1e1';ball(p,color,0,.76,0,.5,1.1,1,1.5);
      if(sheep){for(let i=0;i<10;i++){const a=i*Math.PI/5;ball(p,i%2?'#fff8e9':'#e8dfcb',Math.cos(a)*.36,.8+Math.sin(a)*.2,Math.sin(i*2)*.46,.22);}}
      else{ball(p,'#62564b',-.26,.9,.05,.28,.8,.8,1.8);ball(p,'#746453',.25,.65,-.35,.2);}
      for(const x of[-.26,.26])for(const z of[-.42,.42]){const leg=group(p,x,.58,z);bar(leg,sheep?'#756b5b':color,[0,-.45,0],[0,0,0],.075);box(leg,'#504739',0,-.48,.03,.17,.12,.21);p.userData.legs.push(leg);}
      head.position.set(0,sheep?1.03:1.15,.58);ball(head,sheep?'#837464':color,0,0,.04,.27,.9,1.1,1.35);ball(head,sheep?'#6b6054':'#ddb39d',0,-.14,.3,.2,1.1,.65,.65);
      for(const x of[-.25,.25]){ball(head,sheep?'#8f7d67':color,x,.06,0,.12,1.6,.6,1);ball(head,'#fffdf4',x*.52,.06,.25,.065);ball(head,'#322e29',x*.52,.06,.30,.035);if(!sheep)mesh(new THREE.ConeGeometry(.07,.24,6),'#ccb789',head,x*.65,.28,-.02);}
      if(sheep)ball(head,'#fff5dd',0,.19,-.02,.23,1.1,.6,1);bar(p,sheep?'#e9dfc7':'#665747',[0,.95,-.65],[.08,.53,-.85],.04);
    }
  }
  let currentState,signature='',animalSignature='';
  const svgNS='http://www.w3.org/2000/svg',projectionPoint=new THREE.Vector3();let hitPlots=[],hitAnimals=[],hitAnimalKey='',hitBuildings=null,hitPond=null,hitPondCells=[];
  function attribute(node,key,value){value=String(value);if(node.getAttribute(key)!==value)node.setAttribute(key,value);}
  function contextualLabel(node,text,x,y){
    let label=node.querySelector('.world-label');if(!label){label=document.createElementNS(svgNS,'g');label.setAttribute('class','world-label');label.innerHTML='<rect x="-80" y="-17" width="160" height="30" rx="9"/><text text-anchor="middle" y="3"></text>';node.append(label);}
    const scale=viewWidth<=650?.8:1;attribute(label,'transform',`translate(${x} ${y}) scale(${1400/viewWidth*scale} ${820/viewHeight*scale})`);const content=label.querySelector('text');if(content.textContent!==text)content.textContent=text;
  }
  function rectAt(node,x,y,w,h){attribute(node,'x',x-w/2);attribute(node,'y',y-h/2);attribute(node,'width',w);attribute(node,'height',h);}
  function projectedPoint(x,y,z){projectionPoint.set(x,y,z).project(camera);return[(projectionPoint.x+1)*700,(1-projectionPoint.y)*410];}
  function hitMarkup(positionsOnly=false){if(!currentState)return;
    if(hitPlots.length!==currentState.plots.length){svg.querySelector('#plots').innerHTML=currentState.plots.map((_,i)=>`<g class="plot" data-plot="${i}" tabindex="0" role="button"><title></title><polygon class="tile-top"/></g>`).join('');hitPlots=[...svg.querySelectorAll('[data-plot]')].map(node=>({node,title:node.querySelector('title'),polygon:node.querySelector('polygon'),plaque:null}));positionsOnly=false;}
    currentState.plots.forEach((p,i)=>{const pos=PLOT_LAYOUT[i],h=hitPlots[i];
      if(!positionsOnly){const status=plotStatus(p),label=!p.unlocked?`Expandir canteiro ${i+1} por ${expansionPrice(currentState)} moedas`:`Canteiro ${i+1}${p.crop?', '+CROPS[p.crop].name:''}`;attribute(h.node,'class',`plot ${status} ${p.watered?'watered':''}`);attribute(h.node,'data-stage',cropStage(p));attribute(h.node,'aria-label',label);if(h.title.textContent!==label)h.title.textContent=label;
        if(i===currentState.plots.findIndex(p=>!p.unlocked)&&!h.plaque){h.plaque=document.createElementNS(svgNS,'g');h.plaque.setAttribute('class','expansion-plaque');h.plaque.innerHTML='<rect x="-62" y="-20" width="124" height="40" rx="10"/><text text-anchor="middle" y="-2">+ EXPANDIR</text><text class="expansion-value" text-anchor="middle" y="13"></text>';h.node.append(h.plaque);}else if((p.unlocked||i!==currentState.plots.findIndex(p=>!p.unlocked))&&h.plaque){h.plaque.remove();h.plaque=null;}}
      attribute(h.polygon,'points',[[-1.12,-1.12],[1.12,-1.12],[1.12,1.12],[-1.12,1.12]].map(([x,z])=>projectedPoint(pos.x+x,.2,pos.z+z).join(',')).join(' '));
      if(h.plaque){const [x,y]=projectedPoint(pos.x,.2,pos.z);const scale=viewWidth<=650?.8:1;attribute(h.plaque,'transform',`translate(${x} ${y}) scale(${1400/viewWidth*scale} ${820/viewHeight*scale})`);const content=h.plaque.querySelector('.expansion-value'),price=`${expansionPrice(currentState)} moedas`;if(content.textContent!==price)content.textContent=price;}
    });
    const animalKey=currentState.animals.map(a=>a.type).join(',');
    if(animalKey!==hitAnimalKey){hitAnimalKey=animalKey;svg.querySelector('#animals').innerHTML=currentState.animals.map((a,i)=>`<g class="farm-animal" role="button" tabindex="0" data-animal="${i}" data-enclosure="${a.type==='cow'?'cattle':a.type==='sheep'?'sheep':'chickens'}" aria-label="${a.type==='cow'?'Vaca no curral':a.type==='sheep'?'Ovelha no aprisco':'Galinha no galinheiro'}"><title>${ANIMALS[a.type].name}</title><rect/></g>`).join('');hitAnimals=[...svg.querySelectorAll('[data-animal] rect')];}
    hitAnimals.forEach((node,i)=>{const p=animalPosition(i),[x,y]=projectedPoint(p.x,.5,p.z);rectAt(node,x,y,50,60);contextualLabel(node.parentNode,ANIMALS[currentState.animals[i].type].name,x,y-35);});
    if(!hitBuildings){svg.querySelector('#buildings').innerHTML='<g role="button" tabindex="0" data-building="house" aria-label="Casa: nome da fazenda"><rect/></g><g role="button" tabindex="0" data-building="mill" aria-label="Moinho de ração"><rect/></g>';hitBuildings=[...svg.querySelectorAll('#buildings rect')];}
    const [hx,hy]=projectedPoint(-3.8,1.3,-5.2),[mx,my]=projectedPoint(8.5,3,-7);rectAt(hitBuildings[0],hx,hy,65,65);rectAt(hitBuildings[1],mx,my,80,80);contextualLabel(hitBuildings[0].parentNode,'Sua casa',hx,hy-38);contextualLabel(hitBuildings[1].parentNode,'Moinho de ração',mx,my-48);
    if(!hitPond){svg.querySelector('#pond').innerHTML='<g role="button" tabindex="0" data-building="pond"><rect/></g>';hitPond=svg.querySelector('#pond rect');}
    if(!hitPondCells.length){for(let slot=0;slot<POND.slots;slot++){const g=document.createElementNS(svgNS,'g');g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('data-pond-cell',slot);const polygon=document.createElementNS(svgNS,'polygon');g.append(polygon);svg.querySelector('#pond').append(g);hitPondCells.push({g,polygon});}}
    hitPondCells.forEach(({g,polygon},slot)=>{g.style.display=currentState.pond?.owned?'':'none';const pos=pondCellPosition(slot),h=POND.cellSize/2;attribute(polygon,'points',[[-h,-h],[h,-h],[h,h],[-h,h]].map(([x,z])=>projectedPoint(pos.x+x,.25,pos.z+z).join(',')).join(' '));if(!positionsOnly){const a=currentState.pond?.stock.find(a=>a.slot===slot);attribute(g,'aria-label',`Viveiro ${slot+1}, ${a?a.type==='fish'?'peixes':'camarões':'vazio, escolher criação'}`);}});
    const [lx,ly]=projectedPoint(POND.x,1,-3.6);rectAt(hitPond,lx,ly,4.5/(camera.right-camera.left)*1400,1.125/(camera.top-camera.bottom)*820);contextualLabel(hitPond.parentNode,currentState.pond?.owned?'Seu lago':`Comprar lago · ${POND.cost}`,lx,ly-24);if(!positionsOnly)attribute(hitPond.parentNode,'aria-label',currentState.pond?.owned?'Cuidar do lago':'Comprar lago por '+POND.cost+' moedas');
  }
  function animalPosition(i){const type=currentState.animals[i].type,index=currentState.animals.slice(0,i).filter(a=>a.type===type).length;return type==='cow'?new THREE.Vector3(16+index%3*1.65,0,-3.7+Math.floor(index/3)*1.9):type==='sheep'?new THREE.Vector3(16+index%3*1.65,0,8.5+Math.floor(index/3)*1.8):new THREE.Vector3(5.8+index%3*1.7,0,3.4+Math.floor(index/3)*1.8);}
  function update(state){currentState=state;updateAppearance(state.farmer||'male');updatePond(state);const now=Date.now(),key=JSON.stringify([state.plots.map(p=>[p.unlocked,p.crop,p.watered,plotStatus(p,now),cropStage(p,now),plotCare(p,now)]),state.animals.map(a=>[a.type,animalProduction(a,now).hungry]),state.pond?.owned]);
    if(key===signature){hitMarkup();return;}signature=key;renderer.shadowMap.needsUpdate=true;sun.shadow.needsUpdate=true;clear(crops);clear(signs);
    state.plots.forEach((p,i)=>{const pos=plotPosition(i),status=plotStatus(p,now);
      dummy.position.set(pos.x,.08,pos.z);dummy.rotation.set(0,0,0);dummy.scale.setScalar(p.unlocked?1:0);dummy.updateMatrix();beds.setMatrixAt(i,dummy.matrix);
      for(let j=0;j<4;j++){dummy.position.set(pos.x-.8+j*.52,.175,pos.z);dummy.updateMatrix();ridges.setMatrixAt(i*4+j,dummy.matrix);}
      beds.setColorAt(i,new THREE.Color(p.watered?'#92928d':'#ffffff'));
      if(!p.unlocked){
        const patch=group(crops,pos.x,.03,pos.z);
        for(let j=0;j<6;j++){const x=Math.sin(i*3+j*2)*.8,z=Math.cos(i*2+j*3)*.8;leaf(patch,x,.12,z,j,.8+(j%3)*.25);}
        if(i%3===0){ball(patch,'#b9b6a0',-.4,.14,.45,.21,1.4,.65,1,0);ball(patch,'#b9b6a0',.5,.09,-.3,.14,1,.6,1,0);}
        if(i===state.plots.findIndex(p=>!p.unlocked))marker(pos,'locked');return;
      }
      if(!p.crop)return;const stage=cropStage(p,now);for(const [x,z]of[[-.58,-.58],[.55,-.55],[-.55,.55],[.55,.55]]){const g=group(crops,pos.x+x,.17,pos.z+z);plant(g,p.crop,stage);}
      marker(pos,status);const care=plotCare(p,now);if(care.weeds)for(let j=0;j<3;j++){const g=group(crops,pos.x-.8+j*.75,.18,pos.z);leaf(g,0,.1,0,j,.9);}
      if(care.pests)for(let j=0;j<2;j++)ball(crops,'#6d3d78',pos.x-.4+j*.8,.7,pos.z,.07);
    });
    beds.instanceMatrix.needsUpdate=true;ridges.instanceMatrix.needsUpdate=true;beds.instanceColor.needsUpdate=true;batchCrops();batchLocalGeometry(signs);const nextAnimals=JSON.stringify(state.animals.map(a=>[a.type,animalProduction(a,now).hungry]));if(nextAnimals!==animalSignature){animalSignature=nextAnimals;clear(animals);state.animals.forEach((a,i)=>{const pos=animalPosition(i),g=group(animals,pos.x,0,pos.z);animal(g,a.type);g.userData.phase=i*1.8;g.userData.homeX=pos.x; if(animalProduction(a,now).hungry)ball(g,'#df8255',0,1.3,0,.1);batchRig(g);contactShadow(g,a.type==='chicken'?1:1.9);});}hitMarkup();
  }
  // Farmer rig: tools attach to the hand, never to the body or world.
  const farmer=group(scene,2.4,0,13.9);farmer.scale.setScalar(1.3);
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
    farmer.traverse(o=>{if(!o.isMesh||o.material===contactMaterial)return;o.userData.originalMaterial??=o.material;const original=o.userData.originalMaterial;const color=original.color.getHexString();o.material=female&&colors[color]?mat(colors[color]):original;});
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
  batchRig(farmer);contactShadow(farmer,1.05);
  const particles=group(scene),particleBits=[];for(let i=0;i<28;i++){const b=ball(particles,'#8bdef2',0,0,0,.035);b.visible=false;particleBits.push(b);}
  const selection=mesh(new THREE.TorusGeometry(.9,.035,4,40),'#fff0a4',scene,0,.2,0);selection.rotation.x=-Math.PI/2;selection.visible=false;
  const queue=[];let job=null,phase='idle',elapsed=0,impact=false,route=[],walkTime=0,selected='smart',disposed=false,raf=0,last=performance.now(),zoom=1;
  function equip(id){Object.entries(toolModels).forEach(([key,m])=>m.visible=key===id);canvas.dataset.heldTool=id;}
  function publishQueue(){onQueue([...(job?[{...job,phase}]:[]),...queue.map(j=>({...j,phase:'queued'}))].map(({type,index,phase})=>({type,index,phase})));}
  function setPhase(next){phase=next;elapsed=0;canvas.dataset.actionPhase=next;canvas.setAttribute('aria-busy',String(next!=='idle'));canvas.dataset.pending=String(queue.length+(job?1:0));publishQueue();}
  function selectTool(id){selected=id;if(!job)equip(id);}
  function enqueue(type,index,apply){if(queue.length>=12){onError('Aguarde o fazendeiro terminar as tarefas.');return false;}if((job?.index===index&&job.type===type)||queue.some(j=>j.index===index&&j.type===type))return false;
    cameraPinned=false;heldKeys.clear();manualRoute=[];queue.push({type,index,apply});canvas.dataset.pending=String(queue.length+(job?1:0));publishQueue();return true;}
  function nextJob(){job=queue.shift();if(!job){setPhase('idle');equip(selected);onStatus('Arraste para mover a câmera · Clique num canteiro para cuidar');return;}
    const p=plotPosition(job.index),laneX=p.x+1.275,target=new THREE.Vector3(laneX,0,p.z);
    route=findRoute(farmer.position,target);
    if(!route){onError('Não foi possível chegar ao canteiro.');job=null;nextJob();return;}
    equip(job.type);setPhase('walking');selection.position.set(p.x,.22,p.z);selection.visible=true;onStatus(`Indo ao canteiro ${job.index+1} · ${queue.length} na fila`);
  }
  const heldKeys=new Set();let manualRoute=[];
  function blocked(x,z){
    if(x < -22.95 || x > 22.95 || z < -17.05 || z > 16.1)return true;
    if(x>-7.85&&x<.25&&z>-11.4&&z<-3.45)return true;
    if(x>4.3&&x<12.15&&z>-10.0&&z<-4.5)return true;
    if(Math.abs(x-POND.x)<POND.size/2+.12&&Math.abs(z-POND.z)<POND.size/2+.12)return true;
    if((x-13)**2+(z+10.7)**2<1.9)return true;
    if(fenceColliders.some(f=>Math.abs(x-f.x)<f.halfX&&Math.abs(z-f.z)<f.halfZ))return true;
    if(Math.abs(x-10.8)<1.05&&Math.abs(z-2.15)<1.1)return true;
    if(Math.abs(x-18)<2.3&&(Math.abs(z+7)<1.55||Math.abs(z-4.5)<1.55))return true;
    for(let i=0;i<(currentState?.plots.length||0);i++){if(!currentState.plots[i].unlocked)continue;const p=plotPosition(i);if(Math.abs(x-p.x)<1.13&&Math.abs(z-p.z)<1.13)return true;}
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
  function moveTo(clientX,clientY){const rect=canvas.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((clientX-rect.left)/rect.width*2-1,1-(clientY-rect.top)/rect.height*2),camera);const target=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),new THREE.Vector3());if(!target)return;canvas.dataset.moveTargetX=target.x.toFixed(3);canvas.dataset.moveTargetZ=target.z.toFixed(3);
    const planned=findRoute(farmer.position,target);if(!planned){onError('Escolha um trecho livre de chão para caminhar.');return;}cameraPinned=false;cancelTasks();manualRoute=planned;setPhase('moving');onStatus('Caminhando · WASD ou setas também movem o personagem.');}
  const panRay=new THREE.Raycaster(),panPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0),panFrom=new THREE.Vector3(),panTo=new THREE.Vector3();let viewWidth=1,viewHeight=1;
  function flushPan(){if(!panX&&!panY)return;
    panRay.setFromCamera(new THREE.Vector2(0,0),camera);panRay.ray.intersectPlane(panPlane,panFrom);
    panRay.setFromCamera(new THREE.Vector2(panX*2/viewWidth,-panY*2/viewHeight),camera);panRay.ray.intersectPlane(panPlane,panTo);panX=panY=0;
    const next=cameraFocus.clone().add(panFrom.sub(panTo));next.x=THREE.MathUtils.clamp(next.x,-18,18);next.z=THREE.MathUtils.clamp(next.z,-14,14);
    camera.position.add(next.clone().sub(cameraFocus));cameraFocus.copy(next);camera.updateMatrixWorld();projectionDirty=true;
    canvas.dataset.cameraFocusX=cameraFocus.x.toFixed(3);canvas.dataset.cameraFocusZ=cameraFocus.z.toFixed(3);
  }
  function panBy(dx,dy){panX+=dx;panY+=dy;cameraPinned=true;}
  function finishPan(){flushPan();if(projectionDirty){hitMarkup(true);projectionDirty=false;}}
  const moveCodes=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight']);
  function keyDown(e){if(!moveCodes.has(e.code)||e.ctrlKey||e.metaKey||e.altKey||document.querySelector('dialog[open]')||document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'))return;e.preventDefault();cameraPinned=false;if(job||queue.length)cancelTasks();manualRoute=[];heldKeys.add(e.code);setPhase('moving');}
  function keyUp(e){heldKeys.delete(e.code);}
  function clearKeys(){heldKeys.clear();}
  document.addEventListener('keydown',keyDown);document.addEventListener('keyup',keyUp);window.addEventListener('blur',clearKeys);document.addEventListener('visibilitychange',clearKeys);
  function moveManually(dt){const direction=new THREE.Vector3();if(heldKeys.size){const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0).setY(0).normalize(),forward=camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize();direction.addScaledVector(forward,Number(heldKeys.has('KeyW')||heldKeys.has('ArrowUp'))-Number(heldKeys.has('KeyS')||heldKeys.has('ArrowDown')));direction.addScaledVector(right,Number(heldKeys.has('KeyD')||heldKeys.has('ArrowRight'))-Number(heldKeys.has('KeyA')||heldKeys.has('ArrowLeft')));}
    else if(manualRoute.length){direction.copy(manualRoute[0]).sub(farmer.position);if(direction.length()<=dt*5.8){farmer.position.copy(manualRoute.shift());direction.set(0,0,0);}}
    const walking=direction.lengthSq()>.001;if(walking){direction.normalize();turnToward(Math.atan2(direction.x,direction.z),dt);const pieces=Math.max(1,Math.ceil(dt*5.8/.08)),distance=dt*5.8/pieces;
      for(let i=0;i<pieces;i++){const x=farmer.position.x+direction.x*distance,z=farmer.position.z+direction.z*distance;if(!blocked(x,z))farmer.position.set(x,0,z);else if(!blocked(x,farmer.position.z))farmer.position.x=x;else if(!blocked(farmer.position.x,z))farmer.position.z=z;}
      walkTime+=dt*11;legs.forEach((l,i)=>l.rotation.x=Math.sin(walkTime+i*Math.PI)*.55);arms.forEach((a,i)=>a.rotation.x=Math.sin(walkTime+i*Math.PI)*.3);body.position.y=Math.abs(Math.sin(walkTime))*.025;
    }else{legs.forEach(l=>l.rotation.x=0);arms.forEach(a=>a.rotation.x=0);body.position.y=0;}
    if(!heldKeys.size&&!manualRoute.length){setPhase('idle');onStatus('Arraste para mover a câmera · Clique num canteiro para cuidar');}
  }
  function turnToward(angle,dt){const delta=Math.atan2(Math.sin(angle-farmer.rotation.y),Math.cos(angle-farmer.rotation.y));farmer.rotation.y+=delta*(1-Math.exp(-dt*12));}
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)'),performanceDiagnostics=new URLSearchParams(location.search).has('performance');
  let maximumScale=Math.min(devicePixelRatio,1.25),renderScale=maximumScale,frameMean=16.7,qualityWindow=performance.now(),qualitySamples=0,previousFrame=0;
  function adaptResolution(now){
    if(previousFrame&&!document.hidden){const frame=now-previousFrame;if(frame<1000){frameMean=frameMean*.85+frame*.15;qualitySamples++;}}
    previousFrame=now;if(now-qualityWindow<1400||qualitySamples<5)return;
    const floor=Math.min(maximumScale,.65);let next=renderScale;
    if(frameMean>24)next=Math.max(floor,renderScale*.82);
    else if(frameMean<18&&now-qualityWindow>6000)next=Math.min(maximumScale,renderScale/.9);
    if(Math.abs(next-renderScale)>.025){renderScale=next;renderer.setPixelRatio(renderScale);renderer.setSize(viewWidth,viewHeight,false);qualityWindow=now;qualitySamples=0;}
    else if(frameMean>=18||renderScale>=maximumScale){qualityWindow=now;qualitySamples=0;}
  }
  function tick(now){if(disposed)return;raf=requestAnimationFrame(tick);const dt=Math.min(.25,Math.max(0,(now-last)/1000));last=now;flushPan();
    const reduced=motionPreference.matches,t=now/1000;
    if(!reduced){trees.forEach(({leaves,phase})=>leaves.rotation.z=Math.sin(t*.75+phase)*.018);rings.forEach((r,i)=>{r.scale.set(1+Math.sin(t*1.2+i)*.12,.65*(1+Math.sin(t*1.2+i)*.12),1);});animals.children.forEach((a,i)=>{a.rotation.y=Math.sin(t*.35+i)*.18;a.position.x=a.userData.homeX+Math.sin(t*.3+i)*.12;a.userData.head.rotation.x=Math.sin(t*.6+i)*.055;a.userData.legs.forEach((l,j)=>l.rotation.x=Math.sin(t*.6+i+j*Math.PI)*.035);});millRotor.rotation.z+=dt*(currentState?.mill?.job?.readyAt>Date.now()?1.3:.15);waterTime.value=t;swimmingFish.forEach(f=>{const a=t*.45+f.userData.phase;f.position.set(f.userData.homeX+Math.cos(a)*.55,.14,f.userData.homeZ+Math.sin(a)*.4);f.rotation.y=-a-Math.PI/2;});}
    if(heldKeys.size||manualRoute.length)moveManually(dt);
    else if(phase==='moving')moveManually(dt);
    if(!job&&queue.length)nextJob();
    if(job){elapsed+=dt;if(phase==='walking'){
      const target=route[0],dist=farmer.position.distanceTo(target),step=dt*5.8;
      if(dist<=step){farmer.position.copy(target);route.shift();if(!route.length){setPhase('acting');turnToward(-Math.PI/2,.12);onStatus({plant:'Semeando',water:'Regando',harvest:'Colhendo',weed:'Capinando',spray:'Dedetizando',fertilize:'Adubando'}[job.type]+'…');}}
      else{const direction=target.clone().sub(farmer.position).normalize();farmer.position.addScaledVector(direction,step);turnToward(Math.atan2(direction.x,direction.z),dt);}
      walkTime+=dt*11;legs.forEach((l,i)=>l.rotation.x=Math.sin(walkTime+i*Math.PI)*.55);arms[0].rotation.x=-Math.sin(walkTime)*.35;body.position.y=Math.abs(Math.sin(walkTime))*.025;
    }else if(phase==='acting'){
      legs.forEach(l=>l.rotation.x=0);body.position.y=0;const swing=Math.sin(Math.min(1,elapsed/1.25)*Math.PI);body.rotation.x=swing*.16;arms[1].rotation.x=-.65-swing*.55;arms[0].rotation.x=-swing*.5;held.rotation.x=job.type==='water'?1.25+swing*.7:0;
      if(!impact&&elapsed>=.62){impact=true;const ok=job.apply();canvas.dataset.lastAction=job.type;canvas.dataset.lastResult=String(ok);canvas.dataset.completed=String(Number(canvas.dataset.completed||0)+1);if(!ok){particleBits.forEach(p=>p.visible=false);}}
      particleBits.forEach((b,i)=>{const active=elapsed>.25&&elapsed<1.15&&(!impact||canvas.dataset.lastResult==='true');b.visible=active;if(!active)return;const p=plotPosition(job.index),f=(elapsed*2.6+i/28)%1;b.material=mat(job.type==='water'?'#a2e2ef':job.type==='harvest'?'#f9da67':job.type==='spray'?'#d7e7be':'#d9b278');if(job.type==='water'){const tip=toolModels.water.localToWorld(new THREE.Vector3(0,.02,.72));const end=new THREE.Vector3(p.x+(i%5-2)*.16,.2,p.z+(i%4-1.5)*.17);b.position.copy(tip).lerp(end,f);}else if(job.type==='harvest'){const end=toolModels.harvest.localToWorld(new THREE.Vector3(0,.1,.1));b.position.set(p.x+(i%5-2)*.15,.25+Math.sin(f*Math.PI)*.7,p.z+(i%4-1.5)*.16);b.position.lerp(end,f);}else b.position.set(p.x+.65-i%5*.18, .9-f*.65, p.z+(i%4-1.5)*.17);});
      if(elapsed>=1.3){job=null;impact=false;body.rotation.x=0;arms.forEach(a=>a.rotation.x=0);held.rotation.x=0;particleBits.forEach(p=>p.visible=false);selection.visible=false;nextJob();}
    }}else if(!reduced){body.position.y=Math.sin(t*2)*.008;}
    if(!document.hidden){
      const projected=farmer.position.clone().project(camera);
      if(!cameraPinned&&(Math.abs(projected.x)>.76||Math.abs(projected.y)>.68)){const shift=farmer.position.clone().sub(cameraFocus).setY(0).multiplyScalar(Math.min(.15,dt*1.5));camera.position.add(shift);cameraFocus.add(shift);camera.updateMatrixWorld();projectionDirty=true;}
      if(projectionDirty){hitMarkup(true);projectionDirty=false;}
      adaptResolution(now);updateCrowns();renderer.render(scene,camera);if(performanceDiagnostics){canvas.dataset.drawCalls=String(renderer.info.render.calls);canvas.dataset.triangles=String(renderer.info.render.triangles);canvas.dataset.renderScale=renderScale.toFixed(2);}canvas.dataset.frames=String(Number(canvas.dataset.frames||0)+1);canvas.dataset.playerX=farmer.position.x.toFixed(3);canvas.dataset.playerZ=farmer.position.z.toFixed(3);canvas.dataset.cameraFocusX=cameraFocus.x.toFixed(3);canvas.dataset.cameraFocusZ=cameraFocus.z.toFixed(3);
    }
  }
  function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;viewWidth=width;viewHeight=height;maximumScale=Math.min(devicePixelRatio,1.25,Math.sqrt(1500000/(width*height)));renderScale=Math.min(renderScale,maximumScale);renderer.setPixelRatio(renderScale);renderer.setSize(width,height,false);const aspect=width/height,halfH=Math.max((width<=650?15:24)/aspect,12.3)/zoom,halfW=halfH*aspect;camera.left=-halfW;camera.right=halfW;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();camera.updateMatrixWorld();canvas.dataset.viewHalfWidth=halfW.toFixed(5);canvas.dataset.viewHalfHeight=halfH.toFixed(5);hitMarkup();renderer.render(scene,camera);}
  function setZoom(value){zoom=value;resize();}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();queue.length=0;job=null;onError('O navegador perdeu a conexão 3D. Recarregue para continuar; seu progresso foi salvo.');});
  const observer=new ResizeObserver(resize);observer.observe(host);resize();raf=requestAnimationFrame(tick);canvas.dataset.renderer='three';canvas.dataset.actionPhase='idle';canvas.dataset.pending='0';canvas.dataset.completed='0';canvas.setAttribute('aria-busy','false');
  return {update,selectTool,enqueue,setZoom,projectPlot(index){const p=PLOT_LAYOUT[index];return p?projectedPoint(p.x,1.3,p.z):null;},panBy,finishPan,moveTo,cancel:cancelTasks,dispose(){disposed=true;cancelAnimationFrame(raf);document.removeEventListener('keydown',keyDown);document.removeEventListener('keyup',keyUp);window.removeEventListener('blur',clearKeys);document.removeEventListener('visibilitychange',clearKeys);observer.disconnect();renderer.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());},get busy(){return !!job||queue.length>0;}};
}
