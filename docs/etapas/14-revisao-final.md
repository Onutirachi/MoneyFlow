# Etapa 14 — Revisão final e verificação end-to-end

- **Status:** ✅ concluída
- **Data:** 2026-09-24

## Objetivo
Verificar o sistema inteiro como um usuário real, corrigir o que aparecer e deixar a documentação pronta para consulta.

## O que foi feito
- **E2E com usuário novo** (Playwright + Edge): cadastro → `/contas` → criar "Carteira Física" (Dinheiro) e "Banco XPTO" (PIX, Crédito, Débito) → saída em dinheiro (método selecionado automaticamente) → saída parcelada em 3x no crédito → dashboard. Os números conferem: 1.700,00 − 45,50 − 400,00 = **R$ 1.254,50**.
- **Bug corrigido: redirecionamento pós-autenticação.** Depois do cadastro, o usuário caía no dashboard em vez de `/contas`, porque havia corrida entre o `navigate()` da página e o `<Navigate>` do `PublicOnlyRoute`. Agora o `PublicOnlyRoute` é o único que redireciona e respeita `location.state.from`. Também foi verificado o login voltando para a rota de origem (`/custos-fixos`).
- **Acabamento dos gráficos**: margem superior para o rótulo do topo do eixo não ser comprimido, e concordância "1 mês" / "N meses".
- Bateria final: backend (typecheck, lint, build, 21 testes) e frontend (typecheck, lint, build, Prettier) sem erros.
- README com funcionalidades, como rodar e mapa da documentação.

## Arquivos principais
| Arquivo | Papel |
|---|---|
| `frontend/src/components/layout/RouteGuards.tsx` | Redirecionamento único pós-login |
| `frontend/src/pages/Login.tsx`, `Register.tsx` | Não navegam mais por conta própria |
| `README.md` | Visão geral |

## Decisões
- Regra registrada no `frontend/CLAUDE.md`: páginas públicas não chamam `navigate()` depois de autenticar.

## Como testar
```bash
cd backend && npm run seed && npm run dev
cd frontend && npm run dev
```
Roteiro completo:
1. `/cadastro` → criar conta → cai em `/contas`.
2. Criar "Carteira Física" (Dinheiro) e "Banco XPTO" (PIX, Crédito, Débito).
3. `/movimentos` → **Saída** → Carteira Física → só "Dinheiro" disponível → R$ 45,50.
4. **Saída** → Banco XPTO → Crédito → R$ 1.200,00 → Parcelado 3 → prévia 3x de R$ 400,00 → Lançar.
5. Avançar os meses → "Celular 2/3" e "3/3".
6. `/custos-fixos` → criar "Aluguel" → aparece nos meses seguintes com a badge "Fixo".
7. Dashboard → KPIs, "economizou?", gráficos e filtro por conta.
8. Sair e entrar com `demo@demo.com` / `123456` para ver o painel com 7 meses de histórico.

## Pendências / próximos passos
Ver "Ideias futuras" no [ROADMAP](../ROADMAP.md): fatura de cartão (fechamento/vencimento), transferência entre contas, metas por categoria, exportação CSV. Também dá para reduzir o bundle principal (~800 kB) com lazy loading das demais páginas.
