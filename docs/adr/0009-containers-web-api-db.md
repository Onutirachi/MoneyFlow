# 0009 — Três containers (web, api, db) num único compose

- **Status:** Aceita
- **Data:** 2026-10-28

## Contexto
O sistema vai ser publicado numa VPS para o grupo do TCC usar. Até a etapa 15, o Docker só rodava o PostgreSQL de desenvolvimento (`backend/docker-compose.yml`), enquanto backend e frontend rodavam com `npm run dev`.

## Decisão
Um `docker-compose.yml` na **raiz** com `name: moneyflow` e três serviços, cada um num container:
- **web** (`moneyflow-web`): nginx com o build estático do frontend. Repassa `/api/` para `api:3334`, o mesmo papel do proxy do Vite em desenvolvimento, então o front não muda. É o **único** serviço publicado na internet (`WEB_PORT`).
- **api** (`moneyflow-api`): imagem multi-stage do backend (compila o TypeScript e mantém só `dist/` e as dependências de produção), rodando como usuário `node`, com healthcheck em `/api/health`. Sem porta publicada.
- **db** (`moneyflow-db`): `postgres:16-alpine` com volume `db-data`. Publicado só em `127.0.0.1:5433`, para o backend em desenvolvimento e para manutenção.

A ordem de subida segue os healthchecks: db saudável → api → web. Segredos (`JWT_SECRET`, `POSTGRES_PASSWORD`) vêm do `.env` da raiz, fora do git. Em desenvolvimento, `docker compose up -d db` sobe só o banco.

## Alternativas consideradas
- **Um container com tudo:** exigiria um gerenciador de processos dentro dele, e qualquer atualização derrubaria o banco junto.
- **Node servindo o front (sem nginx):** um container a menos, mas o nginx serve arquivos estáticos com gzip e cache melhor e isola a API da internet.
- **Compose separado para dev e produção:** evita condicionais, mas duplica a configuração do banco. Um arquivo só basta enquanto a diferença for só quais serviços sobem.

## Consequências
- A mesma configuração roda na máquina de cada um (`http://localhost:8080`) e na VPS. Dá para testar o deploy antes de publicar.
- Atualizar é `git pull && docker compose up -d --build`. O volume do banco não é tocado.
- Sem `JWT_SECRET`, a API se recusa a subir em produção.
- O volume de desenvolvimento antigo (`backend_moneyflow-data`) deixou de ser usado.
- HTTPS fica para quando houver domínio (ex.: Caddy ou certbot na frente do web).
