import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBRL } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Dashboard } from '@/types';

/** Saldo atual de cada conta, com a participação no saldo total. */
export function AccountBalances({ data }: { data: Dashboard }) {
  const positiveTotal = data.accounts.reduce((a, acc) => a + Math.max(acc.balance, 0), 0) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saldo por conta</CardTitle>
        <CardDescription>Hoje · total {formatBRL(data.totalBalance)}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {data.accounts.map((acc) => (
            <li key={acc.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: acc.color }}
                  />
                  <span className="truncate">{acc.name}</span>
                </span>
                <span
                  className={cn(
                    'font-medium tabular-nums',
                    acc.balance < 0 && 'text-[var(--delta-bad)]',
                  )}
                >
                  {formatBRL(acc.balance)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(Math.max(acc.balance, 0) / positiveTotal) * 100}%`,
                    backgroundColor: acc.color,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
