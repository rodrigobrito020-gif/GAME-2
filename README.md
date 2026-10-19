# GAME-2 — Colheita Feliz, versão 0.3

Recriação em desenvolvimento do **Colheita Feliz**, clássico do Orkut, orientada pelo guia ilustrado enviado pelo usuário. O cenário e as mecânicas seguem as referências históricas; o cenário ilustrado e a textura do solo foram gerados para o projeto, e a implementação é própria. O jogo ainda está em versão local para um jogador e continua independente do GAME-1.

O guia e o registro das referências aplicadas estão em [docs/REFERENCIA.md](docs/REFERENCIA.md).

## Jogar sem instalar

No pacote entregue, extraia a pasta e abra **JOGAR.html** com dois cliques no Chrome, Edge ou Firefox atualizado. O arquivo contém a interface, a arte e o código, sem downloads ou serviços externos.

O progresso é salvo neste navegador e neste endereço/arquivo. Mudar de navegador, mover o arquivo, limpar os dados do site ou usar modo anônimo pode deixar o progresso anterior indisponível. Não há contas nem sincronização entre dispositivos nesta versão.

## O que já funciona

- Cenário ilustrado com vegetação, casa detalhada e lago. Há movimento na superfície da água, na folhagem e nos tufos de grama, respeitando a preferência de movimento reduzido.
- Canteiros com textura de terra em perspectiva e aparência mais escura depois da rega; 9 canteiros iniciais e expansão até 16.
- Oito cultivos: nabo, cenoura, trigo, morango, milho, abóbora, tomate e melancia. Novas fazendas começam com duas plantações de nabo.
- Bolsa de sementes, compra na loja, plantio, rega, crescimento, colheita e venda no armazém.
- A plantação começa seca e só cresce depois de regada. O tempo sem água não acumula, inclusive fora do jogo; após regar, o ciclo começa com 25% de bônus. Os dois nabos iniciais já foram regados.
- Ervas daninhas, pragas e seca reduzem a saúde mostrada ao apontar para o canteiro. Capine e dedetize para recuperar a saúde e ganhar um produto extra por cultivo tratado.
- Adubo consumível adianta mais 20% do ciclo depois da rega. Não pode substituir água nem é consumido em planta seca.
- Galinhas e vacas com alimentação e produção de ovos/leite, incluindo crescimento offline, coleta e venda. Sem ração, a produção pausa; alimentar retoma o ciclo preservando produtos já gerados.
- Loja com categorias de sementes, animais e ferramentas; cercado com capacidade de seis animais.
- Nome da fazenda editável, missões em janela e bolsa que abre e fecha.
- Experiência, níveis e cultivos desbloqueados progressivamente.
- Três objetivos iniciais com recompensas únicas.
- Crescimento calculado por horário, inclusive depois de fechar e reabrir.
- Zoom, atalhos de teclado, controles por toque e interface adaptada para telas pequenas.
- Backup de progresso ilegível e aviso quando o salvamento não está disponível.

Os ciclos de cultivo duram de 30 segundos a 6 minutos para facilitar a avaliação. Preços, tempos, XP e bônus são parâmetros provisórios desta implementação, sem afirmar equivalência com a economia oficial do jogo histórico.

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

As verificações cobrem economia, maturidade, saúde, rega, capina, pragas, adubo, recompensas únicas, compras, expansão, níveis, dados inválidos e o ciclo completo. Também verificam alimentação dos animais, pausa da produção, coleta única, persistência e venda. No navegador, exercitam cliques reais, salvamento, crescimento ao voltar, teclado, zoom, tela móvel, prévia isolada e HTML independente. O relógio é avançado nos testes para verificar o crescimento sem esperar minutos reais.

O Chromium gerenciado deste ambiente bloqueia endereços `file://`. Por isso, o HTML independente foi testado por HTTP, fornecendo apenas esse arquivo e verificando que não solicita recursos auxiliares. A abertura direta por dois cliques não pôde ser verificada aqui. Se seu navegador também bloquear, use o servidor descrito acima.

## Escopo desta versão

Esta versão é para um jogador, com salvamento local. Vizinhos, ajuda, roubo de colheitas, proteção do cachorro, flores/popularidade, decoração editável e presentes ainda não foram implementados. Multiplayer e autenticação serão tratados depois do jogo, conforme a prioridade atual do usuário.

Não usa modelos ou código do RPG GAME-1. As capturas do guia orientam a reconstrução, e o cenário e o solo usam arte gerada, combinada com elementos interativos em SVG; esta entrega ainda não equivale ao cliente Flash original completo. O progresso anterior do protótipo Sítio Aurora é preservado pela mesma chave de salvamento, sem reiniciar os itens do jogador.

## Arte e animação

`public/assets/` contém o cenário e o solo. O cenário foi codificado em WebP sem perda, com igualdade dos pixels RGB verificada contra o PNG original. A textura de terra foi adaptada para 384×384, adequada aos canteiros pequenos, e codificada em WebP sem perda. A procedência e os hashes estão em `public/assets/provenance.json`.

`npm run build` embute as duas imagens em todas as entradas HTML. Água e folhas usam camadas animadas recortadas do cenário; as bordas têm tufos de grama animados. Isso é composição visual, sem simulação física de vento ou líquidos.
