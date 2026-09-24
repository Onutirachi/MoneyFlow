# 0007 — Padrões de visualização de dados do dashboard

- **Status:** Aceita
- **Data:** 2026-09-23

## Contexto
O dashboard precisa mostrar tudo de forma **unificada** (todas as contas) e **separada** (por conta, categoria e método), além de responder "economizei este mês?". Gráficos escolhidos por gosto costumam falhar em daltonismo, no tema escuro ou na leitura rápida.

## Decisão
Seguir o método da skill `dataviz`:
- **Forma pelo trabalho do dado:** KPIs como *stat tiles* (valor, delta vs mês anterior e sparkline); 12 meses como colunas agrupadas entradas × saídas (**um único eixo**, sem eixo duplo); resultado mensal como **barras divergentes** (azul = sobrou, vermelho = faltou, base no zero); "para onde foi" como **barras horizontais de uma cor só**, com a identidade no rótulo e a cauda agrupada em "Outras" depois de 7 itens; composição das saídas como barra 100% empilhada com 2px de respiro.
- **Cor:** paleta categórica de referência em ordem fixa (azul, laranja, aqua, amarelo), em CSS vars (`index.css`) com versões próprias para claro e escuro. Foi **validada com `validate_palette.js`** contra as superfícies dos cards (#ffffff / #171717): passou em tudo; no claro, aqua e amarelo ficam abaixo de 3:1, o que é compensado com legenda e valores visíveis e visão em tabela.
- **Semântica de delta:** saída que cai é boa (verde); entrada ou resultado que sobe é bom. A cor sempre vem com ícone ▲/▼ e texto.
- **Filtro de conta** no topo, valendo para o painel inteiro. Na troca de mês ou conta, o quadro anterior fica esmaecido (sem skeleton piscando).
- Eixos com **ticks redondos** (`lib/chartTicks.ts`) e o zero sempre incluído.

## Alternativas consideradas
- **Donut por categoria:** comparar fatias próximas é difícil e não escala além de ~6 itens.
- **Linha do resultado sobreposta às colunas:** mistura duas leituras num gráfico só; as barras divergentes respondem "sobrou?" de forma direta.

## Consequências
- Cores de gráficos só via `lib/chartColors.ts`. Série nova usa o próximo slot, nunca uma cor gerada.
- Categorias e contas mantêm a cor escolhida pelo usuário como identidade (bolinha ao lado do nome), mas as barras de ranking usam uma só cor.
