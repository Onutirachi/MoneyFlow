# Publicação na VPS (Docker)

**No ar:** https://moneyflowapp.duckdns.org (desde 2026-10-28).

## Como está montado
A VPS (Oracle Cloud Always Free, Ubuntu 24.04 ARM Ampere, `afvps.duckdns.org`, usuário `ubuntu`) hospeda mais de um projeto. Um **Caddy compartilhado** (`/opt/proxy`) é o único dono das portas 80/443: recebe os acessos, escolhe o projeto pelo domínio e cuida do HTTPS (Let's Encrypt) sozinho.

```
navegador ─https─► Caddy (/opt/proxy, rede "proxy")
                     ├─ capturax.duckdns.org     → capturax-signal   (outro projeto)
                     └─ moneyflowapp.duckdns.org → moneyflow-web ─► moneyflow-api ─► moneyflow-db
```

| Onde | O quê |
|---|---|
| `/opt/moneyflow` | clone deste repositório (dono: `ubuntu`) |
| `/opt/moneyflow/.env` | segredos gerados na VPS (`chmod 600`, fora do git), com `COMPOSE_FILE=docker-compose.yml:docker-compose.vps.yml` |
| `docker-compose.vps.yml` | coloca o `moneyflow-web` na rede `proxy` do Caddy |
| `/opt/proxy/sites/moneyflow.caddy` | regra do domínio (cópia de [`deploy/moneyflow.caddy`](../deploy/moneyflow.caddy)) |
| volume `moneyflow_db-data` | os dados do banco |

Nenhuma porta do MoneyFlow fica aberta para a internet: o web e o banco só escutam em `127.0.0.1` (8080 e 5433), e a API não publica porta. O acesso é sempre pelo domínio. Abrir pelo IP não funciona, porque o Caddy escolhe o site pelo nome.

O domínio `moneyflowapp.duckdns.org` precisa apontar para o IP da VPS (163.176.189.160), o que se configura no painel do DuckDNS.

## Acesso SSH
```bash
ssh -i ~/.ssh/capturax_vps ubuntu@afvps.duckdns.org
```
O login é só por chave: a privada fica na máquina de quem acessa, e a pública fica em `~/.ssh/authorized_keys` na VPS. Para dar acesso a outra pessoa, ela gera a própria chave (`ssh-keygen -t ed25519`) e você adiciona a parte `.pub` nesse arquivo. Para revogar, é só apagar a linha.

## Atualizar para uma versão nova
Depois de fazer `git push` com as mudanças:
```bash
ssh -i ~/.ssh/capturax_vps ubuntu@afvps.duckdns.org
cd /opt/moneyflow
git pull
docker compose up -d --build --wait
```
Só os containers que mudaram são recriados. O banco e o volume continuam como estão. Se a regra do Caddy mudar (`deploy/moneyflow.caddy`), copie e recarregue como no passo 5 abaixo.

## Dia a dia (dentro de `/opt/moneyflow`)
| Tarefa | Comando |
|---|---|
| Ver status | `docker compose ps` |
| Logs da API (ao vivo) | `docker compose logs -f api` |
| Reiniciar só a API | `docker compose restart api` |
| Parar tudo (dados ficam) | `docker compose down` |
| Backup do banco | `docker compose exec -T db pg_dump -U moneyflow moneyflow > ~/backup-$(date +%F).sql` |
| Restaurar backup | `docker compose exec -T db psql -U moneyflow moneyflow < backup.sql` (em banco vazio) |
| Abrir o psql | `docker compose exec db psql -U moneyflow` |
| Logs do HTTPS/domínio | `docker logs proxy-caddy-1 --since 10m` |

> **Nunca** rode `docker compose down -v` nem `node dist/seed.js` (sem `--if-empty`) na VPS: o primeiro apaga o volume do banco, e o segundo apaga todos os dados.

## Instalação do zero (como foi feita)
Pré-requisitos: Docker instalado e o Caddy compartilhado rodando em `/opt/proxy` com a rede `proxy`.
```bash
# 1. clonar
sudo mkdir /opt/moneyflow && sudo chown ubuntu:ubuntu /opt/moneyflow
git clone https://github.com/Onutirachi/MoneyFlow.git /opt/moneyflow
cd /opt/moneyflow

# 2. segredos (gerados aqui, nunca copiados de outra máquina)
cat > .env <<ENV
JWT_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 16)
WEB_PORT=8080
DB_PORT=5433
COMPOSE_FILE=docker-compose.yml:docker-compose.vps.yml
ENV
chmod 600 .env

# 3. subir os três containers
docker compose up -d --build --wait

# 4. usuário de demonstração (só se o banco estiver vazio)
docker compose exec -T api node dist/seed.js --if-empty < /dev/null

# 5. regra no Caddy: validar ANTES de recarregar (um erro derrubaria os outros sites)
sudo cp deploy/moneyflow.caddy /opt/proxy/sites/moneyflow.caddy
cd /opt/proxy
docker compose exec -T caddy caddy validate --config /etc/caddy/Caddyfile \
  && docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile
```
O certificado sai em segundos, desde que o domínio já aponte para a VPS.

## Testar localmente antes
O mesmo compose roda em qualquer máquina com Docker, sem o Caddy:
```bash
cp .env.example .env
docker compose up -d --build --wait
docker compose exec api node dist/seed.js --if-empty
# http://localhost:8080
```
