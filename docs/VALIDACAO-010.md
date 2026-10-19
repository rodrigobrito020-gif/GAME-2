# Validação da versão 0.10.0

Validação em 19/10/2026, Chromium com renderização por software (SwiftShader).

## Regras e progressão

- `npm run build`: gera as três entradas autocontidas a partir das fontes.
- `npm test`: **53 testes passaram**. Incluem seis novos cenários de encomendas/estágios: consumo real de produtos, recompensa única por número, estoque insuficiente sem débito, migração de saves sem mudar os recursos anteriores, sequência de pedidos depois do tutorial, produtos aquáticos e exigência de rega nos estágios.
- `node scripts/check-progression.mjs`: percurso completo desde `newGame`, sem atribuir moedas, experiência ou estoque depois da criação. Compra as ferramentas, planta em seis terrenos por ciclo, cuida, entrega pedidos e vende. O save é codificado/decodificado nos marcos. Resultado: duas ferramentas com 20 moedas restantes; primeira expansão e galinha com 231 moedas; lago e primeiro viveiro com 510 moedas; após cinco ciclos, quatro encomendas entregues, nível 5, 918 moedas e cinco águas disponíveis.

O percurso usa relógio simulado e dois segundos entre ações. Não mede o tempo real de caminhar até cada canteiro. Verifica que a rota inicial funciona com os recursos existentes; não é um balanceamento definitivo de longo prazo ou do evento. Custos anteriores foram preservados; encomendas usam preço de venda +25% arredondado para cima e XP limitado por pedido.

## Navegador

A bateria direcionada a 3D, controles, viewport e encomendas verificou 23 cenários. Na execução principal, 22 passaram. O teste novo de cancelamento assumia que nenhuma ação teria terminado entre abrir a segunda seleção de sementes e clicar em Cancelar. A fila terminava normalmente nesse intervalo. O teste foi corrigido para agendar duas regas, incluindo um percurso longo, e comparar o save no instante exato do clique com o save depois do cancelamento. A ação já aplicada permanece; a rega ainda pendente não consome água. O cenário corrigido passou separadamente.

Os **37 cenários restantes passaram** em uma execução separada, abrangendo cuidado 2D, imagens embutidas e movimento reduzido, fazenda, moinho, lago, prévia, perfil, HTML independente, loja de ferramentas e água. Portanto, **os 60 cenários de navegador foram verificados com sucesso entre as execuções e a repetição do teste ajustado**; não foi uma única execução de 60 testes sem falhas.

Essa bateria inclui plantio, rega, mato, pragas, adubo, colheita e venda no 3D; cesta e XP; cancelamento e fila; caminhada manual; zoom e arraste sem clique acidental; identidade dos 54 alvos preservada ao arrastar; menos de 140 chamadas de desenho na fazenda inicial; telas 1440 × 900, 390 × 844 e 844 × 390 sem rolagem da página; sons opcionais com criação real de osciladores após interação; pedidos, estoque, entrega e persistência; iframe 3D isolado e alternativa sem WebGL.

A primeira execução de desenvolvimento, interrompida para corrigir o problema, encontrou uma placa de expansão que interceptava o clique de um terreno vizinho. A placa foi centralizada e seus elementos de texto deixaram de capturar eventos. Os testes de plantio, fila, expansão e arraste passaram com a correção.

## Revisão visual

As imagens desta versão são capturas reais do navegador, com modelos e interface do jogo. O quadro de encomendas e a comparação de cultivos usam um save de demonstração; a captura principal começa em `newGame`. São revisados terrenos com vegetação, transformação em canteiro, as dez plantas, água, placa de preço, nomes contextuais, fila e legibilidade do quadro no computador/celular.

As capturas finais em 1440 × 900 e 390 × 844 não registraram erros de JavaScript nem rolagem da página. A fazenda inicial apresentou 104 chamadas de desenho no modo de diagnóstico. A placa de expansão manteve o texto proporcional no celular, os nomes contextuais ficaram legíveis e a fila apareceu acima da barra de ferramentas.

O teste de sons verifica geração de áudio e preferência persistida. O Chromium de testes fica sem saída audível; não é uma avaliação acústica em alto-falantes reais. A renderização por software também não comprova uma taxa de quadros em placas de vídeo reais.
