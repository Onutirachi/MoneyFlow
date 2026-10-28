# Especificação do sistema

Descreve **o que** o sistema faz, em forma de requisitos verificáveis. Os detalhes ficam nos documentos de referência, que esta spec não repete:
- payloads, rotas e códigos de erro → [api.md](api.md);
- fórmulas e regras (parcelas, custos fixos, saldo) → [regras-de-negocio.md](regras-de-negocio.md);
- o porquê de cada escolha → [adr/](adr/README.md).

Escrita a partir do código da etapa 14 e atualizada na etapa 15 (backend PostgreSQL), em 2026-10-28. Se o código e esta spec divergirem, o código vale até a spec ser corrigida.

## 1. Escopo
Aplicação web de finanças pessoais para **um usuário por conta de login**: registra entradas e saídas em contas, parcela compras, lança custos fixos automaticamente e mostra um dashboard mensal.

**Fora do escopo atual:** fatura de cartão (fechamento/vencimento), transferência entre contas, orçamento por categoria, exportação, compartilhamento entre usuários.

## 2. Glossário
| Termo | Significado |
|---|---|
| Conta | Onde o dinheiro está (ex.: "Banco XPTO", "Carteira Física"). Tem saldo inicial e métodos aceitos. |
| Método | `DINHEIRO`, `PIX`, `CREDITO`, `DEBITO`. Cada conta aceita um subconjunto. |
| Movimento | Um lançamento: `ENTRADA` ou `SAIDA`, valor, data, conta, método e categoria. |
| Previsto | Movimento com data posterior a hoje. Aparece no mês dele, mas não entra no saldo. |
| Parcelamento | Grupo de N movimentos (`installmentGroupId`) gerado a partir de um valor total. |
| Custo fixo | Modelo recorrente (`RecurringCost`) que gera um movimento por mês. |
| Materializar | Gerar os movimentos reais de um custo fixo para os meses consultados (ADR 0004). |
| Avulso | Saída que não é parcela nem custo fixo. |

## 3. Atores
- **Visitante:** só acessa login e cadastro.
- **Usuário autenticado:** acessa apenas os próprios dados. O recurso de outro usuário responde `404`.

## 4. Requisitos funcionais

### RF01 — Cadastro e login
- RF01.1 O visitante cria uma conta com nome (2–80), e-mail único e senha (6–72). E-mail é normalizado (trim + minúsculas).
- RF01.2 Ao se cadastrar, o usuário recebe 13 **categorias padrão** (4 de entrada e 9 de saída, ver `backend/src/services/defaults.ts`) e entra logado direto.
- RF01.3 Login com e-mail e senha devolve um token JWT válido por 7 dias.
- RF01.4 A sessão é restaurada ao reabrir o app (token salvo no navegador e validado em `/auth/me`).
- RF01.5 Token inválido ou expirado em qualquer chamada desloga o usuário e manda para `/login`. Depois do login, ele volta à página onde estava.

**Aceite:** e-mail repetido → mensagem "Este e-mail já está cadastrado". Senha errada → "E-mail ou senha inválidos". E-mail com espaços nas pontas é aceito.

### RF02 — Contas
- RF02.1 Criar, listar, editar e excluir contas com nome (1–60), cor, saldo inicial (pode ser negativo) e ao menos um método.
- RF02.2 A listagem mostra o **saldo atual** de cada conta (RN de saldo).
- RF02.3 Excluir conta com movimentos ou custos fixos vinculados é bloqueado (`ACCOUNT_IN_USE`).
- RF02.4 Remover um método da conta é permitido. Os movimentos antigos com esse método continuam como estão.

### RF03 — Categorias
- RF03.1 Criar, listar (com filtro por tipo), editar e excluir categorias com nome (1–40), tipo e cor.
- RF03.2 O tipo de uma categoria não muda depois de criada.
- RF03.3 Excluir categoria com vínculos é bloqueado (`CATEGORY_IN_USE`).

### RF04 — Movimentos
- RF04.1 Lançar entrada ou saída com descrição (1–100), valor (> 0, até R$ 1 bi), data, conta, método e categoria.
- RF04.2 O formulário só oferece os **métodos da conta escolhida**. Se a conta tem um só método, ele vem selecionado. A API recusa método fora da conta (`METHOD_NOT_ALLOWED`).
- RF04.3 A categoria precisa ser do mesmo tipo do movimento (`CATEGORY_TYPE_MISMATCH`). Trocar o tipo no formulário limpa a categoria.
- RF04.4 A lista é **mensal**, agrupada por dia (com total do dia), em ordem decrescente de data. Os dias futuros recebem o selo "previsto".
- RF04.5 Filtros: tipo, conta, método e categoria. Escolher uma conta restringe os métodos do filtro.
- RF04.6 O topo da tela mostra os totais de entradas, saídas e resultado do mês (respeitando os filtros).
- RF04.7 Editar um movimento não muda o tipo dele.
- RF04.8 Sem nenhuma conta cadastrada, a tela orienta a cadastrar uma.

### RF05 — Parcelamento
- RF05.1 No lançamento, o usuário pode ativar "parcelado" e informar 2–72 parcelas. O valor digitado passa a ser o **total**.
- RF05.2 O formulário mostra uma prévia das parcelas (valor e data de cada uma).
- RF05.3 O sistema gera as N parcelas com a descrição `"<descrição> i/n"`, em meses consecutivos e com soma exata (regras-de-negocio.md).
- RF05.4 Ao editar ou excluir uma parcela, o usuário escolhe "só esta" ou "todas". Em "todas", valor e data ficam bloqueados.

### RF06 — Custos fixos
- RF06.1 Criar, listar, editar, pausar/reativar e excluir custos fixos (descrição, valor, tipo, conta, método, categoria, dia 1–31, mês inicial e mês final opcional).
- RF06.2 Os movimentos dos custos fixos ativos aparecem sozinhos ao consultar um mês (materialização lazy e idempotente).
- RF06.3 Editar, pausar ou excluir **vale daqui pra frente**: as ocorrências futuras são regeneradas ou removidas, e as de hoje e do passado ficam intactas (ADR 0006).
- RF06.4 Na exclusão, as ocorrências passadas continuam no histórico, sem vínculo com o custo.
- RF06.5 Excluir uma ocorrência isolada não a recria (a tela avisa: "para parar os próximos meses, desative o custo fixo").
- RF06.6 A tela mostra o total mensal de saídas fixas e de entradas fixas **ativas**.

### RF07 — Navegação mensal
- RF07.1 Dashboard e Movimentos compartilham o mês selecionado, que fica na URL (`?month=YYYY-MM`). Sem mês na URL, vale o mês atual.
- RF07.2 É possível navegar para meses passados e futuros.
- RF07.3 Um novo lançamento sugere a data de hoje no mês atual e o dia 1 nos outros meses.

### RF08 — Dashboard
Todos os blocos respeitam o mês selecionado e o filtro opcional por conta.
- RF08.1 **Indicadores:** saldo atual, entradas, saídas e resultado do mês, com variação contra o mês anterior. Entradas e saídas mostram a variação em %, e o resultado mostra a diferença em R$.
- RF08.2 **Frase de economia:** "Economizou!" quando as saídas são menores que as do mês anterior. Também diz quanto sobrou ou faltou. O verbo muda para mês passado, atual ou futuro.
- RF08.3 **Histórico:** entradas e saídas dos 12 meses até o selecionado (gráfico e tabela), mais o gráfico "Sobrou ou faltou?".
- RF08.4 **Para onde foi o dinheiro:** saídas por categoria, conta (só sem filtro de conta) e método, além de entradas por categoria.
- RF08.5 **Saldo por conta.**
- RF08.6 **Compromissos:** saídas do mês por origem (parcelas, custos fixos, avulsos) e saídas já lançadas nos 3 meses seguintes, com o total.
- RF08.7 Usuário sem contas vê as boas-vindas com um atalho para cadastrar contas.

### RF09 — Experiência geral
- RF09.1 Tema claro/escuro e layout responsivo (menu lateral vira gaveta no celular).
- RF09.2 Toda ação de gravação confirma com um toast ou mostra o erro da API em pt-BR.
- RF09.3 Se o backend estiver fora, aparece um aviso que se resolve sozinho (nova checagem a cada 3 s).
- RF09.4 Os campos de dinheiro funcionam no estilo "caixa registradora" (digitar 1234 → R$ 12,34).

## 5. Requisitos não funcionais
| ID | Requisito | Como é atendido |
|---|---|---|
| RNF01 | Exatidão monetária | Valores inteiros em centavos ponta a ponta (ADR 0002). |
| RNF02 | Isolamento entre usuários | Todo acesso filtra por `userId`. Recurso alheio responde 404. Coberto por teste. |
| RNF03 | Segurança de credenciais | Senha com bcrypt (custo 10). JWT assinado. `passwordHash` nunca sai da API. |
| RNF04 | Contrato estável | `api.md` é a fonte da verdade, e os tipos são espelhados no back e no front, para trocar o mock por um backend real. |
| RNF05 | Integridade dos dados | PostgreSQL com chaves estrangeiras e `CHECK`s. Transações nas operações compostas. Trava de linha na geração de custos fixos (ADR 0008). |
| RNF06 | Validação | Todo body/query passa por Zod, com mensagens em pt-BR. |
| RNF07 | Qualidade | TypeScript strict, ESLint, Prettier e 24 testes de integração no backend (contra PostgreSQL). |
| RNF08 | Desempenho percebido | Cache do TanStack Query (30 s). Dashboard carregado sob demanda (lazy). |
| RNF09 | Idioma | UI, mensagens e docs em pt-BR. Código em inglês. |
| RNF10 | Fuso horário | "Hoje" segue `America/Sao_Paulo` no backend, independente do fuso do servidor. |

## 6. Telas
| Rota | Tela | Requisitos |
|---|---|---|
| `/login`, `/cadastro` | Autenticação | RF01 |
| `/` | Dashboard | RF07, RF08 |
| `/movimentos` | Movimentos | RF04, RF05, RF07 |
| `/contas` | Contas | RF02 |
| `/custos-fixos` | Custos fixos | RF06 |
| `/categorias` | Categorias | RF03 |

Rota desconhecida → `/`. Rotas privadas sem sessão → `/login`.

## 7. Comportamentos de borda conhecidos
Comportamentos reais do código que não são óbvios. Os itens 1–3 estão planejados para a etapa 16 do [ROADMAP](ROADMAP.md).

1. **Materialização sem limite à frente:** abrir um mês distante (ex.: 2035) em Movimentos gera de uma vez todas as ocorrências dos custos fixos sem fim até aquele mês, e elas ficam gravadas.
2. **Mês inicial retroativo:** editar um custo fixo para um `startMonth` anterior gera as ocorrências dos meses passados que faltavam na próxima consulta. Avançar o `startMonth` não remove as ocorrências passadas.
3. **Método removido da conta:** um custo fixo que usa um método depois removido da conta continua gerando movimentos com esse método (a materialização não revalida). Editar o custo exige corrigir o método.
4. **Edição de ocorrência futura de custo fixo:** a alteração manual se perde se o custo fixo for editado depois (trade-off da ADR 0006).
5. **Conta com histórico não pode ser excluída:** como as ocorrências passadas de custos fixos ficam no histórico, a conta continua "em uso" mesmo após excluir o custo.
6. **Variação percentual:** é `null` quando o mês anterior é 0. Nesse caso a UI não mostra o indicador de variação.

## 8. Rastreabilidade com os testes (backend)
| Requisito | Teste (`backend/src/test/`) |
|---|---|
| RF01 | `auth.test.ts` |
| RF02, RF03, RNF02 | `accounts.test.ts` |
| RF04, RF05 | `movements.test.ts` |
| RF06 | `recurring.test.ts` |
| RF08 | `dashboard.test.ts` |
| RNF01, utilitários de data | `utils.test.ts` |

O frontend não tem testes automatizados. A verificação dele é manual, pelo roteiro "Como testar" de cada [etapa](etapas/).
