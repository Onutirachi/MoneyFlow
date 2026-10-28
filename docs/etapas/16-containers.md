# Etapa 16 — Containers (web, api, db) e publicação na VPS

- **Status:** ✅ concluída. No ar em https://moneyflowapp.duckdns.org
- **Data:** 2026-10-28
- **Commit:** ver `git log --grep "etapa 16"`

## Objetivo
Empacotar o sistema em três containers agrupados no projeto Docker **moneyflow**, para publicar numa VPS e o grupo do TCC usar e testar:
- `moneyflow-web`: nginx servindo o frontend compilado e repassando `/api` ao backend (único exposto à internet);
- `moneyflow-api`: backend Node compilado;
- `moneyflow-db`: PostgreSQL com os dados num volume.

Um único `docker-compose.yml` na raiz descreve os três. Em desenvolvimento, sobe só o `db`.

## O que foi feito
- **`docker-compose.yml` na raiz** com `name: moneyflow` e os serviços `db`, `api` e `web`. A subida segue os healthchecks: db → api → web. Segredos vêm do `.env` da raiz (`.env.example` documenta cada variável).
- **`backend/Dockerfile`** multi-stage (Node 24 alpine): compila o TypeScript e mantém só `dist/`, `db/schema.sql` e as dependências de produção. Roda como usuário `node`, com healthcheck em `/api/health`. Imagem final: cerca de 264 MB.
- **`frontend/Dockerfile` + `nginx.conf`:** build do Vite servido por nginx (cerca de 95 MB), com proxy de `/api/`, fallback de SPA para as rotas do React, gzip e cache longo em `/assets/`.
- **Isolamento:** a API não publica porta. O banco só em `127.0.0.1:5433`.
- **Desenvolvimento:** `backend/docker-compose.yml` foi removido. `docker compose up -d db` na raiz sobe o mesmo `moneyflow-db` na 5433; `iniciar.cmd`, READMEs e CLAUDE.md foram atualizados.
- **`docs/deploy.md`:** passo a passo da VPS (instalar Docker, `.env` com segredos, subir, seed opcional, firewall, atualizar, backup e restauração).
- [ADR 0009](../adr/0009-containers-web-api-db.md).
- **Publicado na VPS** (Oracle ARM, `afvps.duckdns.org`) atrás do Caddy compartilhado que já atendia o capturax:
  - `docker-compose.vps.yml` coloca o web na rede `proxy`;
  - a regra `deploy/moneyflow.caddy` foi copiada para `/opt/proxy/sites/`;
  - o certificado Let's Encrypt foi emitido para `moneyflowapp.duckdns.org`;
  - a porta do web passou a abrir só em `127.0.0.1`.
- Banco da VPS começou vazio, só com o usuário demo (`seed --if-empty`).

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `docker-compose.yml` | os três containers do projeto moneyflow |
| `.env.example` | variáveis do compose (JWT_SECRET, POSTGRES_PASSWORD, WEB_PORT, DB_PORT) |
| `backend/Dockerfile` | imagem `moneyflow-api` |
| `frontend/Dockerfile` | imagem `moneyflow-web` |
| `frontend/nginx.conf` | front estático + proxy `/api` |
| `docker-compose.vps.yml` | na VPS: web na rede `proxy` do Caddy |
| `deploy/moneyflow.caddy` | regra do domínio no Caddy compartilhado |
| `docs/deploy.md` | como está montado na VPS, como atualizar, backup |

## Decisões
- Containers separados, um compose só, nginx na frente: [ADR 0009](../adr/0009-containers-web-api-db.md).
- Banco publicado em `127.0.0.1`, e não fechado de vez: serve ao `npm run dev` local e à manutenção via SSH na VPS, sem ficar exposto à internet.
- Site na porta 8080 por padrão (localmente a 80 costuma estar ocupada); na VPS, `WEB_PORT=80`.

## Como testar
```bash
cp .env.example .env
docker compose up -d --build --wait
docker compose ps                                     # moneyflow-web, -api e -db "healthy"
docker compose exec api node dist/seed.js --if-empty  # "Seed concluído: ~200 movimentos"
```
Resultado esperado:
- http://localhost:8080 abre o sistema, e o login `demo@demo.com` / `123456` mostra o dashboard;
- abrir direto http://localhost:8080/contas também funciona (fallback de SPA);
- `curl http://localhost:3334/api/health` falha: a API não fica exposta;
- `docker compose down` seguido de `docker compose up -d` mantém os dados;
- `docker compose run --rm --no-deps -e JWT_SECRET= api` termina com "Defina JWT_SECRET em produção.".

Verificado em 2026-10-28 com Docker 29.9: todos os itens acima, mais os 24 testes do backend rodando contra o `moneyflow-db`.

Na VPS, verificado no mesmo dia, de fora do servidor:
- https://moneyflowapp.duckdns.org responde 200 com certificado válido, e `http://` redireciona para `https://`;
- o login demo e o dashboard funcionam;
- as portas 8080 e 5433 estão fechadas para a internet;
- o capturax continuou respondendo 200.

## Pendências / próximos passos
- Backup automático do banco (hoje é manual, ver `docs/deploy.md`).
- Deploy automático no `git push` (hoje é `git pull` + `docker compose up -d --build` na VPS).
- O volume antigo `backend_moneyflow-data` (dados de demonstração do dev anterior) não é mais usado e pode ser apagado com `docker volume rm backend_moneyflow-data`.
