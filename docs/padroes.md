# Padrões de código

## Gerais
- **TypeScript strict** nos dois projetos. Scripts obrigatórios em cada `package.json`: `dev`, `build`, `typecheck`, `lint`, `format`.
- **ESLint + Prettier**. Prettier: aspas simples, com ponto e vírgula, `printWidth: 100`, `trailingComma: all`.
- **Nomes de arquivo:** módulos `camelCase.ts` (`jsonDb.ts`, `movements.service.ts`); componentes React `PascalCase.tsx`.
- **Idioma:** identificadores em inglês; UI, docs e commits em pt-BR.
- **Dinheiro:** inteiro em centavos (`amount: 12990` = R$ 129,90). Nunca `float` para dinheiro.
- **Datas:** strings ISO `YYYY-MM-DD` (data) e `YYYY-MM` (mês). Manipulação via utilitários (`utils/date.ts` no back, `lib/date.ts` no front) — nada de aritmética de datas espalhada.
- **Enums de domínio** como union types de string: `'ENTRADA' | 'SAIDA'`, `'DINHEIRO' | 'PIX' | 'CREDITO' | 'DEBITO'`.

## Backend
Fluxo de uma requisição:
```
routes/x.routes.ts  →  validate(zodSchema)  →  services/x.service.ts  →  db/jsonDb.ts
```
- **Rotas finas:** só extraem `req.userId`, `req.body` validado e chamam o service.
- **Toda regra de negócio fica em `services/`.** Services não conhecem `req`/`res`.
- **Validação:** todo body/query passa por um schema zod (`schemas/x.schema.ts`).
- **Erros:** lançar `AppError(status, code, message)`; o `errorHandler` responde `{ "error": { "code": "...", "message": "..." } }`. Erros de zod → 400 `VALIDATION_ERROR` com `details`.
- **Multiusuário:** todo acesso a dados filtra por `userId`. Recurso de outro usuário → 404 (não 403).
- **IDs:** `crypto.randomUUID()`.

## Frontend
Fluxo:
```
pages/X.tsx  →  hooks/useX.ts (TanStack Query)  →  lib/api.ts (axios)
```
- **Nenhuma chamada HTTP fora de `hooks/`.** Páginas e componentes usam só hooks.
- Query keys centralizadas em `lib/queryKeys.ts`; mutations invalidam as keys afetadas (movimentos → também `dashboard` e `accounts`).
- **Formulários:** react-hook-form + zod (`zodResolver`). Campos monetários usam `MoneyInput` (digita reais, entrega centavos).
- **UI:** componentes shadcn em `components/ui/` (não editar a lógica deles, só estilo). Componentes de domínio em `components/<dominio>/`.
- **Formatação:** sempre via `lib/format.ts` (`formatBRL`, `formatDate`, `formatMonth`).
- **Mês selecionado** vive na URL (`?month=YYYY-MM`) via hook `useMonthParam`.
- Cores de gráficos vêm de `lib/chartColors.ts` (uma única paleta para o app inteiro).

## Git
- Conventional Commits em pt-BR: `feat(backend): cria rota de movimentos`.
- Tipos: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `style`.
- Escopos: `backend`, `frontend`, `docs`, `harness`.
- Um commit (ou mais) por etapa; o último commit da etapa inclui a atualização da documentação.
