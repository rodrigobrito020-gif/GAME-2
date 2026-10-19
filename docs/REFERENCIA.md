# Referência para a recriação

O usuário forneceu `Colheita_Feliz_Guia_Ilustrado.pdf`, com 7 páginas, durante a implementação desta versão. O documento está preservado nesta pasta para consulta. Suas capturas são referências visuais; não são arquivos executáveis, sprites separados nem o cliente Flash original.

Foi escolhida a tela clássica do tutorial de 2011 como referência principal para a organização da interface. O guia distingue essa tela das mudanças da versão 2.0 de 2010. Não se afirma que os valores históricos dos prints formam uma tabela completa de economia.

## Aplicado nesta versão

- Cenário contínuo, com lago no alto à esquerda, casa e casinha do cachorro ao fundo, cercado à direita e canteiros na parte inferior.
- Ferramentas sobre a borda inferior do mapa, controles de loja e armazém junto ao cenário.
- Dois nabos na nova fazenda, conforme o tutorial descrito na página 2.
- Nabo, cenoura, milho, tomate, morango e melancia, além dos cultivos já existentes.
- Saúde e crescimento ao apontar para uma planta, conforme a página 3.
- Rega, capina, combate a pragas e adubação.
- Armazém para vender produtos e loja com sementes, animais e ferramentas.
- Galinhas e vacas que produzem ovos e leite. A alimentação mantém a produção; sem ração, ela pausa. O princípio vem da página 5.

Na versão 0.3, o cenário e a textura da terra usam arte gerada especificamente para o projeto. As plantas, os animais e os ícones permanecem em SVG. Não foi usado código dos repositórios públicos consultados na pesquisa inicial.

## Regras provisórias de teste

Os ciclos curtos, preços, XP, capacidade de seis animais, intervalos de ração e bônus de colheita são parâmetros desta implementação. Remover mato e pragas recupera saúde; tratar ambos rende um produto extra. Os números não são apresentados como taxas oficiais da Elex/Mentez.

## Ainda a implementar

Vizinhos reais, visitas, ajuda e roubo de colheitas; proteção do cachorro; flores, popularidade, presentes e decoração editável. A versão é local e o desenvolvimento do jogo foi priorizado pelo usuário antes da hospedagem na VPS Windows. Os requisitos futuros de conexão são internet e aproximadamente 30 jogadores.

## Correção de rega na versão 0.3

O cultivo recém-plantado fica seco e pausado até receber água. Nenhum tempo de crescimento é acumulado nesse período, inclusive após recarregar o jogo. A rega começa o ciclo e a adubação exige que ele já tenha sido regado. O progresso e os itens antigos são preservados, e plantações antigas sem rega também precisam de água.
