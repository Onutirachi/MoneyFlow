# Finanças Pessoais

Sistema de gerenciamento financeiro pessoal (TCC).

**No ar:** https://moneyflowapp.duckdns.org. Crie sua conta ou use o demo `demo@demo.com` / `123456`.

## Funcionalidades
- **Login e cadastro** (JWT).
- **Contas** (ex.: Banco XPTO, Carteira Física), cada uma com seus **métodos de pagamento** (Dinheiro, PIX, Crédito, Débito).
- **Movimentos** de entrada e saída. Ao lançar, você escolhe a conta, e **só aparecem os métodos cadastrados nela**:
  `Carteira Física → Saída → Dinheiro → R$ 45,50` · `Banco XPTO → Saída → Crédito → R$ 1.200,00`
- **Parcelamento**: informe o valor total e o número de parcelas. As parcelas são lançadas nos meses seguintes como `Celular 1/3`, `Celular 2/3`...
- **Custos fixos**: aluguel, internet, salário... entram sozinhos todo mês. Podem ser pausados, e editar vale daqui pra frente.
- **Navegação mês a mês**, para ver lançamentos passados e futuros (previstos).
- **Dashboard**: saldo, entradas, saídas e resultado com comparação ao mês anterior ("Economizou!"), histórico de 12 meses, sobrou/faltou por mês, gastos por categoria, conta e método, saldo por conta e compromissos dos próximos meses. Tudo filtrável por conta.
- Tema claro/escuro, layout responsivo.

## Projetos
| Pasta | Stack |
|---|---|
| [`backend/`](backend/) | API em Node + Express 5 + TypeScript com **PostgreSQL** (`pg`) |
| [`frontend/`](frontend/) | Vite + React 19 + TypeScript, Tailwind v4, shadcn/ui, Recharts, TanStack Query |

## Como rodar
Requisitos: Node 20.12 ou superior e [Docker Desktop](https://www.docker.com/products/docker-desktop/) aberto (é ele que roda o PostgreSQL).

**Jeito mais fácil:** dois cliques em **`iniciar.cmd`**. Ele sobe o banco no Docker, instala as dependências, cria os dados de demonstração na primeira vez, abre as janelas do backend e do frontend e o navegador em http://localhost:5174. Para parar, feche as duas janelas. O banco continua rodando no Docker; para desligar, rode `docker compose stop db` na raiz.

Manualmente:

```bash
# terminal 1
docker compose up -d db   # na raiz: PostgreSQL (container moneyflow-db) na porta 5433
cd backend
cp .env.example .env
npm install
npm run seed      # dados de demonstração (npm run reset = banco vazio)
npm run dev       # http://localhost:3334/api

# terminal 2
cd frontend
npm install
npm run dev       # http://localhost:5174
```

Login de demonstração: **demo@demo.com** / **123456**

> O frontend chama a API em `/api` no próprio endereço (5174), e o Vite repassa ao backend (proxy em `vite.config.ts`). Por isso não há problema de CORS nem de porta. As portas são 3334/5174 porque 3333/5173 já estão em uso por outro projeto nesta máquina. Para trocar o backend de porta: `PORT=xxxx npm run dev` e `API_TARGET=http://127.0.0.1:xxxx npm run dev` no frontend.

### Tudo em containers (como na VPS)
O `docker-compose.yml` da raiz sobe o sistema completo em três containers, agrupados como **moneyflow**: `moneyflow-web` (nginx com o front), `moneyflow-api` e `moneyflow-db`.
```bash
cp .env.example .env
docker compose up -d --build --wait
docker compose exec api node dist/seed.js --if-empty   # dados de demonstração
```
O site abre em http://localhost:8080. Para publicar na VPS, siga [docs/deploy.md](docs/deploy.md).

### O que é o seed?
`npm run seed` (no backend) **apaga todos os dados do banco** e cria um usuário de demonstração (**demo@demo.com / 123456**): 3 contas, custos fixos, compras parceladas e cerca de 7 meses de gastos, para o dashboard já ter gráficos. Use para demonstrar ou para voltar ao estado inicial. `npm run reset` deixa o banco vazio. Não precisa rodar toda vez: os dados ficam salvos no volume do Docker entre execuções.

## Qualidade
```bash
# em cada projeto
npm run typecheck && npm run lint && npm run build
# backend
npm test          # 24 testes de integração (usa o banco moneyflow_test no mesmo Postgres)
```

## Documentação
Tudo está em [`docs/`](docs/README.md):
- [Especificação](docs/especificacao.md): requisitos funcionais e não funcionais
- [ROADMAP](docs/ROADMAP.md): as etapas e o que cada uma entregou
- [Diário de etapas](docs/etapas/): o que foi feito e como testar
- [Contrato da API](docs/api.md) e [regras de negócio](docs/regras-de-negocio.md)
- [Decisões de arquitetura (ADRs)](docs/adr/README.md)
- [Padrões de código](docs/padroes.md) e [CHANGELOG](CHANGELOG.md)

O [`CLAUDE.md`](CLAUDE.md) é o harness do projeto, lido automaticamente pelo Claude Code. Os comandos `/nova-etapa`, `/fechar-etapa` e `/nova-adr` mantêm o padrão de documentação a cada nova etapa.
