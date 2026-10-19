# GAME-2 — Colheita Feliz 3D, versão 0.4

Jogo de fazenda para navegador, independente do GAME-1. Mantém o ciclo de cuidado do **Colheita Feliz** e agora usa uma fazenda **3D cartoon**, seguindo a nova direção escolhida pelo usuário. A implementação e os modelos 3D são próprios; não são recursos do cliente original. Ainda é uma versão para um jogador, com progresso salvo no navegador.

## Jogar

No pacote, extraia a pasta e abra **JOGAR.html** no Chrome, Edge ou Firefox atualizado. Se baixar o código pelo GitHub, a entrada pronta é **index.html**. O HTML inclui código, interface, biblioteca 3D e recursos visuais; não faz downloads durante o jogo. A visão 3D requer WebGL 2. Se o navegador não conseguir iniciar o renderizador, o jogo avisa e abre a fazenda 2D compatível.

Selecione uma ferramenta e clique no canteiro. O fazendeiro caminha pelas passagens, vira para a plantação e realiza a ação com o objeto na mão:

- Plantar: bolsa de sementes e movimento de semear.
- Regar: regador com água.
- Colher: cesta e movimento para recolher a produção.
- Capinar: enxada.
- Dedetizar: pulverizador.
- Adubar: saco de adubo.

A alteração acontece durante a animação, após chegar ao canteiro. É possível selecionar vários canteiros para formar uma fila de até 12 tarefas. Cada tarefa conserva a ferramenta e a semente escolhidas no clique; cliques repetidos na mesma tarefa não duplicam produtos. As condições são verificadas novamente quando a ação acontece. Uma tarefa ainda não aplicada não gasta sementes ou adubo e não é salva ao fechar a aba.

Use os botões **+ / −** ou o scroll sobre a fazenda para aproximar ou afastar a câmera. Os atalhos **1 a 7** selecionam ferramentas; **Tab e Enter** também permitem acionar os canteiros. A interface funciona por toque. A versão 2D continua disponível em `?view=classic`.

## Mecânicas preservadas

- Nove canteiros iniciais, expansão até 16 e oito cultivos: nabo, cenoura, trigo, morango, milho, abóbora, tomate e melancia.
- Duas plantações iniciais de nabo, já regadas.
- Sem água, a planta não cresce, inclusive fora do jogo. A primeira rega inicia o ciclo com 25% de bônus; adubo adianta mais 20% depois da rega. O tempo seco não acumula.
- Saúde das plantas, ervas daninhas, pragas e bônus de produto ao capinar e dedetizar o cultivo.
- Compra de sementes e adubo, armazém, venda da produção, experiência, níveis e missões com recompensas únicas.
- Galinhas e vacas com ração, ovos/leite, coleta e venda. Sem alimento, a produção fica pausada, inclusive offline.
- Nome da fazenda editável, bolsa de sementes e loja por categorias.
- Salvamento local, backup de progresso ilegível e aviso se o navegador bloquear o armazenamento.

Os ciclos duram de 30 segundos a 6 minutos para facilitar a avaliação. Preços, tempos, XP e bônus são provisórios, sem afirmar equivalência com os parâmetros do jogo histórico. O progresso da versão anterior é preservado pela mesma chave de salvamento.

## Desenvolver

Requer **Node.js 22+**. Three.js e esbuild têm versões registradas no lockfile; a biblioteca é embutida no HTML durante a compilação, sem CDN. Os testes usam Playwright.

```sh
npm ci
npm start
```

O servidor local usa a porta 3000. `PORT=3001 npm start` usa outra porta. Também é possível servir a pasta `public/` em uma hospedagem estática.

```sh
npm run build
npm test
npm run test:browser
```

`npm run build` gera três entradas autocontidas idênticas: `index.html`, `public/index.html` e `dist/JOGAR.html`. Edite `src/index.template.html`, `public/app.js`, `public/game.js`, `public/art.js`, `public/farm3d.js` e `public/style.css`; não edite o HTML gerado manualmente.

Os testes de navegador usam Chromium em `/usr/bin/chromium` neste ambiente. Em outra máquina, defina `CHROMIUM_PATH` para o executável instalado. No PowerShell:

```powershell
$env:CHROMIUM_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
npm run test:browser
```

O Chromium gerenciado deste ambiente bloqueia `file://`. O HTML independente é testado por HTTP como único arquivo disponível, incluindo iframe isolado sem recursos auxiliares. A abertura direta por dois cliques não foi verificada aqui.

## Visual e desempenho

`public/farm3d.js` constrói os modelos: fazendeiro com rig, seis ferramentas, culturas, casas, cercas, árvores, lago, galinheiro e animais. Luz e sombras são reais. Árvores, água e animais têm movimentos suaves; a preferência de movimento reduzido desliga os movimentos ambientais, preservando a execução das tarefas. Geometria estática é agrupada por material e a grama usa instâncias. O renderizador limita a resolução e atualiza sombras quando necessário.

A camada SVG transparente acompanha a projeção da câmera e oferece alvos de clique e navegação por teclado. A economia e o salvamento usam as mesmas regras em ambas as vistas. A vista 2D conserva o cenário e o solo gerados da versão 0.3, documentados em `public/assets/provenance.json`. Three.js usa licença MIT, incluída em `licenses/THREE-MIT.txt`.

## O que ainda falta para o evento

Esta versão é local. **GitHub armazena o código; não fornece, por si só, partidas online.** Contas, servidor persistente, visitas entre amigos, ajuda e roubo de colheitas ainda precisam ser implementados e validados para os cerca de 30 participantes. A hospedagem na VPS Windows será tratada depois do jogo, conforme a prioridade definida pelo usuário.

O guia histórico está em [docs/REFERENCIA.md](docs/REFERENCIA.md). Não há modelos ou código do RPG GAME-1 neste projeto.
