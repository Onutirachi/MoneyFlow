@echo off
rem Sobe banco (Docker), backend (3334) e frontend (5174) e abre o navegador.
rem Uso: dois cliques neste arquivo. Requer o Docker Desktop aberto.
rem Para parar: feche as duas janelas (o banco continua no Docker; "docker compose stop" na pasta backend para ele).
setlocal
cd /d "%~dp0"

where docker >nul 2>nul || (
  echo Docker nao encontrado. Instale o Docker Desktop: https://www.docker.com/products/docker-desktop/
  goto :erro
)
docker info >nul 2>nul || (
  echo O Docker nao esta rodando. Abra o Docker Desktop, espere ele iniciar e tente de novo.
  goto :erro
)

if not exist "backend\.env" copy "backend\.env.example" "backend\.env" >nul

echo Subindo o banco PostgreSQL...
docker compose -f backend\docker-compose.yml up -d --wait || goto :erro

if not exist "backend\node_modules" (
  echo Instalando dependencias do backend...
  call npm --prefix backend install || goto :erro
)
if not exist "frontend\node_modules" (
  echo Instalando dependencias do frontend...
  call npm --prefix frontend install || goto :erro
)

rem dados de demonstracao so na primeira vez (banco vazio)
pushd backend
call npm run seed -- --if-empty || (popd & goto :erro)
popd

start "Financas - BACKEND (3334)" cmd /k "cd /d "%~dp0backend" && npm run dev"
start "Financas - FRONTEND (5174)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Aguardando os servidores...
timeout /t 5 /nobreak >nul
start "" http://localhost:5174
echo.
echo Pronto: http://localhost:5174  (login demo@demo.com / 123456)
echo Para parar, feche as janelas "Financas - BACKEND" e "Financas - FRONTEND".
exit /b 0

:erro
echo.
echo Algo deu errado. Veja a mensagem acima.
pause
exit /b 1
