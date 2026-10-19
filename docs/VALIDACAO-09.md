# Validação da versão 0.9.0

Em 19/10/2026:

- `npm run build`: três HTMLs autocontidos idênticos, conferidos por teste de prévia.
- `npm test`: **47 testes de regras passaram**. Incluem ferramentas bloqueadas, compras permanentes sem cobrança duplicada, adubo por unidade, água, slots únicos, capacidade do lago, produção e migração dos saves.
- `npx playwright test --trace off`: **53 cenários passaram**; um teste antigo do moinho ainda tentava comprar peixe sem escolher o novo viveiro. O percurso desse teste foi atualizado para selecionar o espaço primeiro, conservando as verificações de ingredientes, tempo, estoque, alimentação e moedas.
- `npx playwright test tests/browser/mill.spec.mjs --grep 'soja colhida' --trace off`: **o cenário atualizado passou**. Assim, os 54 cenários de navegador foram verificados com sucesso entre a execução principal e essa repetição.

Cobertura de navegador: novas compras em 2D e 3D, controles bloqueados por compra, atalhos, plantio contextual, cesta/colheita, fila, cuidados, recarga de dois minutos, saldo e estoque persistidos, moinho e animais, seleção de viveiro no mapa, alimentação/coleta/venda, quatro margens caminháveis, zoom, arraste sem clique acidental, celular, fallback sem WebGL e prévia isolada sem arquivos externos. O teste de arraste mantém o limite de menos de 140 chamadas de desenho para a fazenda inicial e verifica que os canteiros não são recriados durante o gesto.

A renderização dos testes usa Chromium com SwiftShader. Esta validação não promete uma taxa de quadros específica em hardware real. A suíte antiga de desempenho da 0.8.1 continua documentada separadamente em `DESEMPENHO.md`.

Depois da revisão visual, quatro cenários do lago foram repetidos com a escolha de espécie no topo da janela; todos passaram. A compra de ferramentas em 2D e a igualdade dos três HTMLs também foram verificadas novamente após o ajuste do recorte dos ícones. As capturas foram revisadas em 1440 × 900 e 390 × 844, incluindo a barra bloqueada, a loja e o lago com espécies em posições distintas. Não houve erros de JavaScript/console nem rolagem da página nas capturas.
