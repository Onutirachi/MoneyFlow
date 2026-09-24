@echo off
rem Sobe backend (3334) e frontend (5174) em duas janelas e abre o navegador.
rem Uso: dois cliques neste arquivo. Para parar: feche as duas janelas.
setlocal
cd /d "%~dp0"

if not exist "backend\node_modules" (
  echo Instalando dependencias do backend...
  call npm --prefix backend install || goto :erro
)
if not exist "frontend\node_modules" (
  echo Instalando dependencias do frontend...
  call npm --prefix frontend install || goto :erro
)
if not exist "backend\data\db.json" (
  echo Criando dados de demonstracao...
  call npm --prefix backend run seed || goto :erro
)

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
