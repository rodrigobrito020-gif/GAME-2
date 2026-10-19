# GAME-2 — Colheita Feliz para evento

O usuário esclareceu que deseja uma reprodução fiel do Colheita Feliz clássico do Orkut para jogar com amigos de sua cidade em um evento, sem intenção de publicação. Um jogo genérico apenas inspirado no ciclo de fazenda não atende ao objetivo.

O usuário forneceu `Colheita_Feliz_Guia_Ilustrado.pdf`. A versão atual usa as capturas e descrições do documento para orientar a organização do cenário e o ciclo de cuidado de plantas e animais. Consulte `docs/REFERENCIA.md` para o que foi aplicado e o que ainda falta. O projeto continua independente do GAME-1 e ainda não permite partidas entre jogadores.

## Próxima direção

- Priorizar o jogo antes da hospedagem, conforme a orientação mais recente do usuário. Usar o guia ilustrado fornecido como referência principal, sem bloquear a implementação por acesso à VPS.
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
- Saúde das plantas, ervas daninhas, pragas, adubo e bônus de cuidado.
- Loja com oito cultivos, duas espécies de animais e adubo.
- Animais com ração, ciclos de produção de ovos/leite, coleta, pausa por falta de alimento e persistência.

O primeiro protótipo usa ciclos curtos para permitir testar o jogo. Os tempos e a economia poderão ser ajustados depois.

## Funcionalidades adicionais a definir com a referência

Animais, decoração, visitas a outras fazendas, presentes, eventos e funções sociais. Contas, sincronização entre dispositivos e interação real entre jogadores precisam de um servidor; não fazem parte da primeira versão local.

## Plataforma

Navegador, conforme a escolha do usuário. Interface em HTML/CSS e mapa isométrico em SVG, com regras em JavaScript sem dependências de execução. Funciona em servidor estático ou como arquivo HTML independente gerado por `npm run build`.

## Atualização 0.3

O usuário pediu vegetação viva, terra mais real, movimento na água/árvores e casas detalhadas. Foram adicionados cenário ilustrado e textura de terra gerados, com composição animada na água, folhagem e grama. O crescimento de plantas sem água também foi corrigido: a rega é necessária para iniciar o ciclo; esperar offline ou usar adubo não contorna essa regra.

## Nova direção visual — versão 0.4

Após mostrar uma referência de fazenda 3D cartoon com câmera inclinada, o usuário decidiu manter as mecânicas de Colheita Feliz nesse estilo. Pediu que o fazendeiro segure e use a ferramenta adequada: cesta ao colher, regador ao regar e os demais objetos correspondentes. Autorizou salvar este projeto no GitHub como GAME-2.

A vista principal passa a ser uma cena 3D em Three.js, com modelos próprios e câmera ortográfica inclinada. O personagem caminha pelos corredores entre os canteiros e executa as tarefas com ferramentas presas à mão. A alteração da plantação ocorre durante a animação e é validada naquele instante. Uma fila conserva a intenção de cada clique. As regras, o estoque e o salvamento local continuam independentes do renderizador. A vista SVG anterior é mantida como alternativa compatível quando WebGL não está disponível. A compilação continua gerando HTML autocontido.

O objetivo de jogo online para cerca de 30 pessoas permanece no escopo futuro; mudar o renderizador e salvar no GitHub não implementa multiplayer.


## Atualização 0.5 — água e interação com a fazenda

Requisitos confirmados pelo usuário: começar com 30 águas, recuperar uma água a cada dois minutos e mostrar água e moedas no topo. Cada rega bem-sucedida consome uma água. A reserva para de acumular ao chegar a 30. O prazo é persistido por timestamp; reabrir ou ficar offline preserva o tempo. O personagem só consome durante o movimento de regar. Sem água, o canteiro permanece seco.

O usuário também pediu movimento manual, escolha entre fazendeiro e fazendeira e áreas de expansão mais visíveis. O 3D passa a aceitar WASD, setas e clique no chão, com caminhos que evitam obstáculos. O avatar no topo abre a escolha de aparência junto com o nome da fazenda. Os terrenos bloqueados recebem bordas douradas e placas, além de um botão lateral para expandir.

Próxima etapa registrada: progressão que aumenta a capacidade de água conforme o nível. A curva e os marcos de nível serão definidos nessa etapa; a capacidade atual permanece 30.
