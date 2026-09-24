# Etapa 09 — Frontend: login e cadastro

- **Status:** ✅ concluída
- **Data:** 2026-09-23

## Objetivo
Telas de login e cadastro e proteção das rotas autenticadas.

## O que foi feito
- `/login` e `/cadastro`: layout dividido (painel de apresentação no desktop), formulários com react-hook-form + zod (confirmação de senha no cadastro) e erros da API em toast.
- `PrivateRoute` manda para `/login` e guarda a rota de origem, para voltar a ela depois do login. `PublicOnlyRoute` manda o usuário logado para o dashboard.
- Depois do cadastro, o usuário é levado para `/contas`, já que o primeiro passo é cadastrar as contas.
- Componente `Field` (rótulo + controle + erro) como padrão dos formulários.
- `ThemeProvider` próprio no lugar do `next-themes`, que gerava aviso de `<script>` no console com React 19. Um script inline no `index.html` evita o flash de tema.
- **Portas padrão alteradas para backend 3334 e frontend 5174.** Já existe outro projeto nesta máquina (`Desktop\TCC`) usando 3333 e 5173. O backend agora encerra com uma mensagem clara se a porta estiver ocupada.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `frontend/src/pages/Login.tsx`, `Register.tsx` | Telas |
| `frontend/src/components/layout/AuthLayout.tsx` | Layout das telas públicas |
| `frontend/src/components/layout/RouteGuards.tsx` | Proteção de rotas |
| `frontend/src/components/common/Field.tsx` | Campo de formulário |
| `frontend/src/contexts/ThemeContext.tsx` | Tema claro/escuro |
| `backend/src/server.ts` | Aviso de porta em uso |

## Decisões
- Verificação visual com Playwright (`playwright-core` + Edge do Windows), fora do repositório, com screenshots em desktop/mobile e claro/escuro, além de checagem de erros no console.

## Como testar
```bash
cd backend && npm run seed && npm run dev
cd frontend && npm run dev     # http://localhost:5174
```
1. Acessar `/movimentos` sem login → redireciona para `/login`.
2. Entrar com `demo@demo.com` / `123456` → volta para a rota de origem.
3. Senha errada → toast "E-mail ou senha inválidos".
4. Criar conta nova → cai em `/contas`.

## Pendências / próximos passos
- Etapa 10: contas e categorias.
