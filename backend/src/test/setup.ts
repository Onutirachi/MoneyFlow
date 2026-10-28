// Importar PRIMEIRO em todo teste: aponta a API para o banco de testes (nunca o de desenvolvimento).
// Criação do banco e migração acontecem em startTestApi() (helpers.ts).
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgres://moneyflow:moneyflow@localhost:5433/moneyflow_test';
