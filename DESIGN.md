# GAME-2 — Colheita Feliz para evento

O usuário esclareceu que deseja uma reprodução fiel do Colheita Feliz clássico do Orkut para jogar com amigos de sua cidade em um evento, sem intenção de publicação. Um jogo genérico apenas inspirado no ciclo de fazenda não atende ao objetivo.

O protótipo atual, chamado provisoriamente Sítio Aurora, é uma base técnica local. Ainda não reproduz o visual original e ainda não permite partidas entre jogadores. O projeto continua independente do GAME-1.

## Próxima direção

- Usar imagens ou arquivos de referência da versão original escolhida pelo usuário para orientar a reprodução da interface, cenário, itens e ações. Ainda não foram fornecidos recursos do Colheita Feliz.
- Planejar interação real entre os participantes do evento, sem simular amigos como se fossem pessoas conectadas.
- Conexão confirmada: pela internet, com cerca de 30 jogadores simultâneos. A data do evento ainda não foi informada.
- O jogo final para o evento precisará salvar as fazendas no servidor e sincronizar as ações entre os jogadores; o localStorage atual não atende a esse requisito.

## Requisitos de execução do evento

- Serviço central acessível pela internet, com HTTPS e armazenamento persistente das fazendas.
- Identificação e sessão de cada participante; cada pessoa joga em sua própria fazenda.
- Regras de compra, plantio, crescimento, colheita e interações validadas pelo servidor para evitar ações duplicadas ou alteração de saldo pelo navegador.
- Visitas e interações com os amigos precisam usar o estado real de suas fazendas, com autorização das ações permitidas.
- Verificar concorrência com 30 participantes, reconexão e conservação do progresso após reiniciar o servidor.
- Não confundir a prévia estática atual com uma partida online. Hospedagem, contas e sincronização ainda não foram implementadas nem publicadas.

## Funcionalidades do protótipo local atual

- Fazenda com visão isométrica e canteiros clicáveis.
- Comprar sementes, plantar, esperar o crescimento e colher.
- Guardar a produção no armazém e vender por moedas.
- Ganhar experiência e desbloquear cultivos e expansões.
- Ver o tempo restante de cada plantação.
- Salvar o progresso localmente e calcular o crescimento ao voltar.
- Tutorial curto com objetivos para orientar a primeira colheita.

O primeiro protótipo usa ciclos curtos para permitir testar o jogo. Os tempos e a economia poderão ser ajustados depois.

## Funcionalidades adicionais a definir com a referência

Animais, decoração, visitas a outras fazendas, presentes, eventos e funções sociais. Contas, sincronização entre dispositivos e interação real entre jogadores precisam de um servidor; não fazem parte da primeira versão local.

## Plataforma

Navegador, conforme a escolha do usuário. Interface em HTML/CSS e mapa isométrico em SVG, com regras em JavaScript sem dependências de execução. Funciona em servidor estático ou como arquivo HTML independente gerado por `npm run build`.
