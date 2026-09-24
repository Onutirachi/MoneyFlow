import { PiggyBank, TrendingUp } from 'lucide-react';
import { addMonths, currentMonth } from '@/lib/date';
import { formatBRL, formatMonth } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Dashboard } from '@/types';

const monthName = (month: string) => formatMonth(month).split(' ')[0]!.toLowerCase();

/** A frase que responde "economizei este mês?" (comparação de saídas com o mês anterior). */
export function SavingsInsight({ data }: { data: Dashboard }) {
  const { summary, month } = data;
  const prevMonth = addMonths(month, -1);
  const diff = summary.expense - summary.previous.expense;
  const saved = diff < 0;
  const isCurrent = month === currentMonth();
  const isFuture = month > currentMonth();

  if (!summary.previous.expense && !summary.expense) return null;

  const Icon = saved ? PiggyBank : TrendingUp;
  const verb = isFuture ? 'está previsto gastar' : isCurrent ? 'gastou até agora' : 'gastou';

  return (
    <div
      className={cn(
        'mb-6 flex items-start gap-3 rounded-xl border p-4',
        saved ? 'bg-[var(--delta-good)]/5' : 'bg-[var(--delta-bad)]/5',
      )}
    >
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-full',
          saved
            ? 'bg-[var(--delta-good)]/15 text-[var(--delta-good)]'
            : 'bg-[var(--delta-bad)]/15 text-[var(--delta-bad)]',
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="text-sm">
        <p className="font-medium">
          {summary.previous.expense === 0
            ? `Em ${monthName(month)} você ${verb} ${formatBRL(summary.expense)}.`
            : saved
              ? `Economizou! Em ${monthName(month)} você ${verb} ${formatBRL(-diff)} a menos que em ${monthName(prevMonth)}.`
              : `Em ${monthName(month)} você ${verb} ${formatBRL(diff)} a mais que em ${monthName(prevMonth)}.`}
        </p>
        <p className="text-muted-foreground">
          {summary.result >= 0
            ? `Sobraram ${formatBRL(summary.result)} das entradas do mês`
            : `As saídas passaram as entradas em ${formatBRL(-summary.result)}`}
          {summary.previous.result !== 0 &&
            ` (em ${monthName(prevMonth)}: ${summary.previous.result >= 0 ? 'sobraram' : 'faltaram'} ${formatBRL(Math.abs(summary.previous.result))}).`}
        </p>
      </div>
    </div>
  );
}
