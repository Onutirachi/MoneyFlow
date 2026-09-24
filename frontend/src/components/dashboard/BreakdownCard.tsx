import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { METHOD_COLORS, SERIES } from '@/lib/chartColors';
import { formatBRL, METHOD_LABELS } from '@/lib/format';
import type { Dashboard } from '@/types';

interface Row {
  key: string;
  label: string;
  /** cor da entidade (bolinha ao lado do nome = identidade) */
  color: string;
  total: number;
}

/**
 * Barras horizontais de uma série só (uma cor para todas as barras; a identidade fica no
 * rótulo). Funciona como tabela: nome, barra, valor e % sempre visíveis.
 */
function BarList({ rows, empty }: { rows: Row[]; empty: string }) {
  const total = rows.reduce((a, r) => a + r.total, 0);
  const max = Math.max(...rows.map((r) => r.total), 1);
  if (!rows.length)
    return <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>;

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li
          key={row.key}
          className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 text-sm sm:grid-cols-[minmax(0,9rem)_1fr_auto]"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span className="truncate">{row.label}</span>
          </span>
          <span
            className="order-last col-span-2 h-2 overflow-hidden rounded-full bg-muted sm:order-none sm:col-span-1"
            aria-hidden
          >
            <span
              className="block h-full rounded-full"
              style={{ width: `${(row.total / max) * 100}%`, backgroundColor: SERIES[0] }}
            />
          </span>
          <span className="text-right tabular-nums">
            <span className="font-medium">{formatBRL(row.total)}</span>
            <span className="ml-2 inline-block w-10 text-xs text-muted-foreground">
              {Math.round((row.total / total) * 100)}%
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

const TOP = 7;

/** Junta a cauda em "Outras" para não passar de ~7 linhas (skill dataviz › choosing-a-form). */
function foldTail(rows: Row[]): Row[] {
  if (rows.length <= TOP + 1) return rows;
  const tail = rows.slice(TOP);
  return [
    ...rows.slice(0, TOP),
    {
      key: '__other__',
      label: `Outras (${tail.length})`,
      color: 'var(--chart-muted)',
      total: tail.reduce((a, r) => a + r.total, 0),
    },
  ];
}

/** "Para onde foi o dinheiro": saídas do mês separadas por categoria, conta ou método. */
export function BreakdownCard({ data, showAccounts }: { data: Dashboard; showAccounts: boolean }) {
  const byCategory = foldTail(
    data.expenseByCategory.map((c) => ({
      key: c.categoryId,
      label: c.name,
      color: c.color,
      total: c.total,
    })),
  );
  const byAccount = data.expenseByAccount.map((a) => ({
    key: a.accountId,
    label: a.name,
    color: a.color,
    total: a.total,
  }));
  const byMethod = data.expenseByMethod.map((m) => ({
    key: m.method,
    label: METHOD_LABELS[m.method],
    color: METHOD_COLORS[m.method],
    total: m.total,
  }));
  const income = data.incomeByCategory.map((c) => ({
    key: c.categoryId,
    label: c.name,
    color: c.color,
    total: c.total,
  }));
  const empty = 'Nenhuma saída neste mês';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Para onde foi o dinheiro</CardTitle>
        <CardDescription>Saídas do mês · total {formatBRL(data.summary.expense)}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="category">
          <TabsList className="mb-4">
            <TabsTrigger value="category">Categoria</TabsTrigger>
            {showAccounts && <TabsTrigger value="account">Conta</TabsTrigger>}
            <TabsTrigger value="method">Método</TabsTrigger>
            <TabsTrigger value="income">Entradas</TabsTrigger>
          </TabsList>
          <TabsContent value="category">
            <BarList rows={byCategory} empty={empty} />
          </TabsContent>
          {showAccounts && (
            <TabsContent value="account">
              <BarList rows={byAccount} empty={empty} />
            </TabsContent>
          )}
          <TabsContent value="method">
            <BarList rows={byMethod} empty={empty} />
          </TabsContent>
          <TabsContent value="income">
            <BarList rows={income} empty="Nenhuma entrada neste mês" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
