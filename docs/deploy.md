# Publicação na VPS (Docker)

O sistema roda em três containers agrupados no projeto **moneyflow** ([ADR 0009](adr/0009-containers-web-api-db.md)):

```
Internet :80 → moneyflow-web (nginx: front + proxy /api) → moneyflow-api (Node) → moneyflow-db (PostgreSQL)
```

Só o `moneyflow-web` fica exposto. A API e o banco só são alcançáveis pela rede interna do Docker; o banco aparece em `127.0.0.1:5433` apenas para manutenção na própria VPS.

## Requisitos
- VPS Linux (os comandos abaixo são para Ubuntu/Debian) com pelo menos 1 GB de RAM.
- Acesso SSH com um usuário que tenha `sudo`.
- Porta 80 livre (e 443, quando houver HTTPS).

## 1. Instalar o Docker (uma vez)
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # usar docker sem sudo (saia e entre de novo no SSH)
docker compose version          # confere
```

## 2. Baixar o projeto
```bash
git clone <url-do-repositório> moneyflow
cd moneyflow
```

## 3. Configurar
```bash
cp .env.example .env
nano .env
```
Ajuste no `.env`:
| Variável | Valor na VPS |
|---|---|
| `JWT_SECRET` | resultado de `openssl rand -hex 32` |
| `POSTGRES_PASSWORD` | resultado de `openssl rand -hex 16` (**antes** da primeira subida; depois disso não muda o banco) |
| `WEB_PORT` | `80` |

O `.env` não vai para o git. Guarde as senhas num lugar seguro.

## 4. Subir
```bash
docker compose up -d --build --wait
docker compose ps          # os três "healthy"
```
O site abre em `http://<ip-da-vps>`.

Dados de demonstração (opcional, só se o banco estiver vazio):
```bash
docker compose exec api node dist/seed.js --if-empty   # demo@demo.com / 123456
```
> `node dist/seed.js` **sem** `--if-empty` apaga todos os dados. Na VPS, cada pessoa do grupo deve criar o próprio cadastro.

## 5. Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable
```
O Docker abre as portas publicadas por conta própria, por isso o compose só publica a 80 (web) e a 5433 presa a `127.0.0.1` (banco).

## Atualizar para uma versão nova
```bash
cd moneyflow
git pull
docker compose up -d --build --wait
```
Só os containers que mudaram são recriados. O banco e o volume `moneyflow_db-data` continuam como estão.

## Dia a dia
| Tarefa | Comando |
|---|---|
| Ver status | `docker compose ps` |
| Logs da API (ao vivo) | `docker compose logs -f api` |
| Reiniciar só a API | `docker compose restart api` |
| Parar tudo (dados ficam) | `docker compose down` |
| Backup do banco | `docker compose exec -T db pg_dump -U moneyflow moneyflow > backup-$(date +%F).sql` |
| Restaurar backup | `docker compose exec -T db psql -U moneyflow moneyflow < backup.sql` (em banco vazio) |
| Abrir o psql | `docker compose exec db psql -U moneyflow` |

> **Nunca** rode `docker compose down -v` na VPS: o `-v` apaga o volume do banco, e com ele todos os dados.

## Testar localmente antes
O mesmo `docker-compose.yml` roda na sua máquina:
```bash
cp .env.example .env              # WEB_PORT=8080 já vem no exemplo
docker compose up -d --build --wait
docker compose exec api node dist/seed.js --if-empty
# http://localhost:8080
```

## Pendente
- **HTTPS:** exige um domínio apontando para a VPS. Sem ele, o site roda em `http://` e o navegador mostra "não seguro". As senhas trafegam sem criptografia, então não usem senhas reais por enquanto.
