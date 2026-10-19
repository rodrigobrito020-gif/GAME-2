# GAME-2 — Sítio Aurora

Um novo jogo de fazenda para navegador, inspirado no ciclo de plantio do **Colheita Feliz**, clássico do Orkut. Arte vetorial e implementação próprias. Projeto independente do GAME-1.

## Jogar sem instalar

No pacote entregue, extraia a pasta e abra **JOGAR.html** com dois cliques no Chrome, Edge ou Firefox atualizado. O arquivo contém a interface, a arte e o código, sem downloads ou serviços externos.

O progresso é salvo neste navegador e neste endereço/arquivo. Mudar de navegador, mover o arquivo, limpar os dados do site ou usar modo anônimo pode deixar o progresso anterior indisponível. Não há contas nem sincronização entre dispositivos nesta versão.

## O que já funciona

- Fazenda isométrica com 9 canteiros iniciais e expansão até 16.
- Cinco cultivos: cenoura, trigo, morango, milho e abóbora.
- Bolsa de sementes, compra na loja, plantio, rega, crescimento, colheita e venda no armazém.
- A rega adianta 25% do tempo total, uma vez por cultivo.
- Experiência, níveis e cultivos desbloqueados progressivamente.
- Três objetivos iniciais com recompensas únicas.
- Crescimento calculado por horário, inclusive depois de fechar e reabrir.
- Zoom, atalhos de teclado, controles por toque e interface adaptada para telas pequenas.
- Backup de progresso ilegível e aviso quando o salvamento não está disponível.

Os primeiros ciclos duram de 30 segundos a 5 minutos para facilitar a avaliação do protótipo. A economia e os tempos ainda são iniciais.

## Desenvolver

Requer Node.js 22 ou superior. A aplicação não tem dependências de execução.

```sh
npm start
```

Abra `http://localhost:3000` no navegador. `PORT=3001 npm start` usa outra porta. Uma hospedagem estática também pode servir o conteúdo da pasta `public/` na raiz do site.

Para gerar novamente o HTML independente:

```sh
npm run build
```

O resultado fica em `dist/JOGAR.html`.

O mesmo HTML completo também é gerado em `index.html` e `public/index.html`. Essas entradas contêm o CSS, a arte e o JavaScript, permitindo prévias que recebem apenas o HTML. `npm start` executa a geração automaticamente antes de iniciar o servidor. Para editar a estrutura da página, use `src/index.template.html`; os fontes de estilo e lógica continuam em `public/`.

## Verificação

```sh
npm ci
npm test
npm run test:browser
```

Os testes de navegador usam Chromium em `/usr/bin/chromium` neste ambiente. Em outra máquina, defina `CHROMIUM_PATH` para o executável instalado. Exemplo no Windows PowerShell:

```powershell
$env:CHROMIUM_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
npm run test:browser
```

As verificações cobrem as regras de economia, maturidade, rega, recompensas únicas, compras, expansão, níveis, dados inválidos e o ciclo completo. No navegador, cobrem as interações reais, salvamento, crescimento ao voltar, teclado, zoom, tela móvel e o arquivo HTML independente. O relógio é avançado nos testes para verificar o crescimento sem esperar minutos reais.

O Chromium gerenciado deste ambiente bloqueia endereços `file://`. Por isso, o HTML independente foi testado por HTTP, fornecendo apenas esse arquivo e verificando que não solicita recursos auxiliares. A abertura direta por dois cliques não pôde ser verificada aqui. Se seu navegador também bloquear, use o servidor descrito acima.

## Escopo desta versão

Este protótipo é para um jogador, com salvamento local. Animais, decoração editável, visitas, presentes e interação entre amigos ainda não foram implementados. Multiplayer e autenticação exigirão um servidor.

Não usa modelos ou código do RPG GAME-1 nem arquivos do Colheita Feliz original. O nome Sítio Aurora é provisório e pode ser alterado.
