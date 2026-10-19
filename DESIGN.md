# GAME-2 — Fazenda

Novo jogo inspirado no ciclo de fazenda do Colheita Feliz, clássico do Orkut. Projeto independente do GAME-1, com nome, arte e implementação próprios.

## Primeira versão jogável

- Fazenda com visão isométrica e canteiros clicáveis.
- Comprar sementes, plantar, esperar o crescimento e colher.
- Guardar a produção no armazém e vender por moedas.
- Ganhar experiência e desbloquear cultivos e expansões.
- Ver o tempo restante de cada plantação.
- Salvar o progresso localmente e calcular o crescimento ao voltar.
- Tutorial curto com objetivos para orientar a primeira colheita.

O primeiro protótipo usa ciclos curtos para permitir testar o jogo. Os tempos e a economia poderão ser ajustados depois.

## Próximas etapas a discutir

Animais, decoração, visitas a outras fazendas, presentes, eventos e funções sociais. Contas, sincronização entre dispositivos e interação real entre jogadores precisam de um servidor; não fazem parte da primeira versão local.

## Plataforma

Navegador, conforme a escolha do usuário. Interface em HTML/CSS e mapa isométrico em SVG, com regras em JavaScript sem dependências de execução. Funciona em servidor estático ou como arquivo HTML independente gerado por `npm run build`.
