import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const base=new URL('./',import.meta.url);
const read=name=>readFile(new URL(name,base),'utf8');
const { build }=await import('esbuild');
const bundled=await build({entryPoints:[fileURLToPath(new URL('public/app.js',base))],bundle:true,format:'iife',write:false,minify:true,legalComments:'inline',target:'es2022'});
let source=bundled.outputFiles[0].text.replace(/[ \t]+$/gm,'');
for(const name of ['farm-painted.webp','soil-painted.webp','produce-painted.webp','tools-painted.webp','animals-painted.webp']) {
  const asset=await readFile(new URL('public/assets/'+name,base));
  source=source.replaceAll('./assets/'+name,`data:image/${name.endsWith('.png')?'png':'webp'};base64,${asset.toString('base64')}`);
}
source=source.replaceAll('</script','<\\/script');
let html=await read('src/index.template.html');
html=html.replace('class="brand" href="./"','class="brand" href="#"');
const css=await read('public/style.css');
const favicon=await read('public/favicon.svg');
html=html.replace('<link rel="stylesheet" href="./style.css">',()=>`<style>${css}</style>`);
html=html.replace('<link rel="icon" type="image/svg+xml" href="./favicon.svg">',()=>`<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon)}">`);
html=html.replace('<script type="module" src="./app.js"></script>',()=>`<script>document.addEventListener('DOMContentLoaded',()=>{\n${source}\n});</script>`);
await mkdir(new URL('dist/',base),{recursive:true});
// Toda entrada que a prévia possa descobrir é autocontida, inclusive a página
// pública do servidor. Assim, copiar só o HTML também preserva o jogo inteiro.
await Promise.all(['index.html','public/index.html','dist/JOGAR.html'].map(name=>writeFile(new URL(name,base),html)));
console.log(`Entradas autocontidas atualizadas. Para jogar: ${fileURLToPath(new URL('dist/JOGAR.html',base))}`);
