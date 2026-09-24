import { formatBRL } from '@/lib/format';

export interface TooltipRow {
  label: string;
  value: number;
  color: string;
}

/**
 * Tooltip padrão dos gráficos: valor em destaque, nome da série secundário,
 * chave em traço curto da cor da série (skill dataviz › interaction).
 */
export function ChartTooltipBox({ title, rows }: { title: string; rows: TooltipRow[] }) {
  return (
    <div className="min-w-40 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1.5 font-medium text-muted-foreground">{title}</p>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: row.color }} />
            <span className="font-semibold tabular-nums">{formatBRL(row.value)}</span>
            <span className="text-muted-foreground">{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
