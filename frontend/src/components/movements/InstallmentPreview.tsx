import { addMonthsToDate } from '@/lib/date';
import { formatBRL, formatDate } from '@/lib/format';
import { splitInstallments } from '@/lib/money';

/** Prévia das parcelas que o backend vai gerar ("Notebook 1/10", "Notebook 2/10", ...). */
export function InstallmentPreview({
  description,
  total,
  count,
  firstDate,
}: {
  description: string;
  total: number;
  count: number;
  firstDate: string;
}) {
  const parts = splitInstallments(total, count);
  if (!parts.length || !firstDate) return null;

  const rows = parts.map((amount, i) => ({
    label: `${description.trim() || 'Movimento'} ${i + 1}/${count}`,
    amount,
    date: addMonthsToDate(firstDate, i),
  }));
  // mostra as 3 primeiras e a última para não ficar enorme
  const visible = rows.length > 5 ? [...rows.slice(0, 3), null, rows.at(-1)!] : rows;

  return (
    <div className="rounded-lg border bg-muted/40 p-3 text-sm">
      <p className="mb-2 font-medium">
        {count}x de {formatBRL(parts[1] ?? parts[0]!)}
        {parts[0] !== parts[1] && count > 1 && (
          <span className="font-normal text-muted-foreground"> (1ª de {formatBRL(parts[0]!)})</span>
        )}
      </p>
      <ul className="space-y-1 text-muted-foreground">
        {visible.map((row, i) =>
          row ? (
            <li key={row.label} className="flex justify-between gap-2 tabular-nums">
              <span className="truncate">
                {formatDate(row.date)} · {row.label}
              </span>
              <span>{formatBRL(row.amount)}</span>
            </li>
          ) : (
            <li key={`gap-${i}`} className="text-center">
              ⋯
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
