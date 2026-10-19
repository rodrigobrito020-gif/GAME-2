# Caminhada e arraste — 0.8.1

Medição em 19/10/2026, comparando o HTML autocontido da versão 0.8.0 (`c0814ceb`) com o da 0.8.1. Chromium headless, viewport 1280 × 720, DPR 1, **SwiftShader (renderização por software)**, um navegador por vez. Sem captura de trace ou vídeo durante a medição.

Estes números servem para comparar as duas versões neste ambiente. São taxas baixas porque não há aceleração de uma placa gráfica dedicada. Não representam o FPS esperado no computador do jogador nem comprovam 60 FPS em hardware real.

## Procedimento

O script [measure-render.mjs](../scripts/measure-render.mjs) carrega um único HTML, injeta um save conhecido, aguarda cinco quadros e mais oito segundos de aquecimento. Conta quadros e chamadas WebGL em repouso por cinco segundos; em seguida, arrasta o mouse de (580, 400) a (780, 450) em 12 passos e mantém W pressionado por 2,2 segundos. Os comandos do navegador podem levar mais tempo que o intervalo solicitado; os JSONs registram a duração efetiva de cada trecho.

- **Inicial:** save novo, nove terrenos livres, duas plantas de nabo.
- **Cheia:** 54 terrenos plantados e maduros, alternando nabo, cenoura, trigo e soja; duas galinhas, duas vacas e duas ovelhas alimentadas.

A versão anterior usou escala de renderização 1; a nova se ajustou para aproximadamente 0,67 neste ambiente lento. Parte do ganho vem desse ajuste: o 3D pode ficar mais suave em resolução, enquanto a interface HTML mantém a nitidez da tela. Em máquinas rápidas, a escala aumenta gradualmente até o limite permitido para a tela.

## Resultado observado

| Cenário e ação | FPS 0.8.0 | FPS 0.8.1 | Variação |
| --- | ---: | ---: | ---: |
| Inicial, arrastar | 3,79 | 5,55 | +46% |
| Inicial, caminhar | 3,58 | 5,75 | +61% |
| Cheia, arrastar | 1,92 | 3,00 | +56% |
| Cheia, caminhar | 1,68 | 2,99 | +77% |

Na caminhada inicial, a média caiu de 470 para 109 chamadas gráficas por quadro; na fazenda cheia, de 811 para 204. As mudanças não substituem medições no navegador e na máquina usados pelo jogador.

Durante o arraste na fazenda cheia, o observador registrou 1.674 nós removidos na versão anterior e nenhum na nova. No cenário inicial ainda há atualizações de texto conforme o nabo cresce; o teste de navegador verifica especificamente que os 54 elementos dos canteiros continuam sendo os mesmos após o arraste.

Os quatro cenários medidos terminaram sem erros de JavaScript. Dados brutos:

- [0.8.0 inicial](performance/v080-initial.json) e [0.8.1 inicial](performance/v081-initial.json).
- [0.8.0 cheia](performance/v080-full.json) e [0.8.1 cheia](performance/v081-full.json).

## Reproduzir

Depois de `npm ci` e `npm run build`:

```sh
git show c0814ceb:index.html > /tmp/game2-before.html
node scripts/measure-render.mjs /tmp/game2-before.html /tmp/before.json
node scripts/measure-render.mjs index.html /tmp/after.json
node scripts/measure-render.mjs /tmp/game2-before.html /tmp/before-full.json full
node scripts/measure-render.mjs index.html /tmp/after-full.json full
```

Não execute os cenários simultaneamente: eles disputariam o mesmo renderizador. O script intercepta a navegação e fornece o HTML diretamente; não precisa de um servidor na porta usada na URL de teste. Em outro sistema, informe `CHROMIUM_PATH`.

Para diagnóstico manual, abrir com `?performance=1` acrescenta `data-draw-calls`, `data-triangles` e `data-render-scale` ao canvas. Não acrescenta informações técnicas à interface do jogo.

## Validação funcional

Nesta atualização passaram os **43 testes de regras** (`npm test`) e **21 testes no Chromium** das suítes de fazenda 3D, controles do personagem, viewport, prévia isolada e ovelha/moinho. Incluem o ciclo plantar–regar–crescer–cuidar–colher, venda e persistência, fila sem recompensa duplicada, arraste sem transformar a liberação do botão em clique, zoom, teclado, celular, fallback sem WebGL e prévia 3D isolada. A suíte completa de 53 testes de navegador não foi executada nesta alteração.

```sh
npx playwright test tests/browser/viewport.spec.mjs tests/browser/player-controls.spec.mjs tests/browser/farm3d.spec.mjs tests/browser/mill.spec.mjs tests/browser/preview.spec.mjs --trace off --grep-invert 'soja colhida|moinho e ilustrações'
```

A revisão visual foi feita em 1440 × 900, 390 × 844 e 844 × 390, incluindo o seletor de sementes e a câmera após o arraste. As capturas não registraram erros de JavaScript/console nem rolagem da página. A arte dos cartões continua legível e a sombra de contato permanece junto ao personagem.
