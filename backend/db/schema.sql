-- MoneyFlow — esquema do banco (PostgreSQL 13+). Idempotente: pode rodar várias vezes.
-- Dinheiro sempre em centavos (BIGINT). Datas em DATE. Meses em texto 'YYYY-MM'.

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,            -- sempre salvo em minúsculas e sem espaços
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  color           TEXT        NOT NULL,
  initial_balance BIGINT      NOT NULL DEFAULT 0,
  methods         TEXT[]      NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT accounts_methods_valid CHECK (
    cardinality(methods) >= 1
    AND methods <@ ARRAY['DINHEIRO','PIX','CREDITO','DEBITO']
  )
);
CREATE INDEX IF NOT EXISTS accounts_user_idx ON accounts (user_id);

CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  type       TEXT        NOT NULL CHECK (type IN ('ENTRADA','SAIDA')),
  color      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS categories_user_idx ON categories (user_id, type);

CREATE TABLE IF NOT EXISTS recurring_costs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description        TEXT        NOT NULL,
  amount             BIGINT      NOT NULL CHECK (amount > 0),
  type               TEXT        NOT NULL CHECK (type IN ('ENTRADA','SAIDA')),
  account_id         UUID        NOT NULL REFERENCES accounts(id)   ON DELETE RESTRICT,
  method             TEXT        NOT NULL CHECK (method IN ('DINHEIRO','PIX','CREDITO','DEBITO')),
  category_id        UUID        NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  day_of_month       SMALLINT    NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
  start_month        TEXT        NOT NULL CHECK (start_month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  end_month          TEXT                 CHECK (end_month   ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  active             BOOLEAN     NOT NULL DEFAULT TRUE,
  materialized_months TEXT[]     NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recurring_end_after_start CHECK (end_month IS NULL OR end_month >= start_month)
);
CREATE INDEX IF NOT EXISTS recurring_user_idx ON recurring_costs (user_id);

CREATE TABLE IF NOT EXISTS movements (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                 TEXT        NOT NULL CHECK (type IN ('ENTRADA','SAIDA')),
  description          TEXT        NOT NULL,
  amount               BIGINT      NOT NULL CHECK (amount > 0),
  date                 DATE        NOT NULL,
  account_id           UUID        NOT NULL REFERENCES accounts(id)   ON DELETE RESTRICT,
  method               TEXT        NOT NULL CHECK (method IN ('DINHEIRO','PIX','CREDITO','DEBITO')),
  category_id          UUID        NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  installment_group_id UUID,
  installment_number   INTEGER,
  installment_total    INTEGER,
  -- ao excluir o custo fixo, as ocorrências passadas ficam com recurring_id = NULL
  recurring_id         UUID        REFERENCES recurring_costs(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT movements_installment_consistent CHECK (
    (installment_group_id IS NULL AND installment_number IS NULL AND installment_total IS NULL)
    OR (installment_group_id IS NOT NULL AND installment_number BETWEEN 1 AND installment_total)
  )
);
CREATE INDEX IF NOT EXISTS movements_user_date_idx ON movements (user_id, date);
CREATE INDEX IF NOT EXISTS movements_account_idx   ON movements (account_id);
CREATE INDEX IF NOT EXISTS movements_category_idx  ON movements (category_id);
CREATE INDEX IF NOT EXISTS movements_group_idx     ON movements (installment_group_id) WHERE installment_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS movements_recurring_idx ON movements (recurring_id)         WHERE recurring_id IS NOT NULL;
