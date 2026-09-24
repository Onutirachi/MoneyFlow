import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMonthParam } from '@/hooks/useMonthParam';
import { addMonths, currentMonth } from '@/lib/date';
import { formatMonth } from '@/lib/format';

/** Navegação entre meses (‹ Setembro de 2026 ›). O mês fica na URL. */
export function MonthSelector() {
  const [month, setMonth] = useMonthParam();
  const isCurrent = month === currentMonth();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        aria-label="Mês anterior"
        onClick={() => setMonth(addMonths(month, -1))}
      >
        <ChevronLeft />
      </Button>
      <span className="min-w-40 text-center text-sm font-medium tabular-nums">
        {formatMonth(month)}
      </span>
      <Button
        variant="outline"
        size="icon"
        aria-label="Próximo mês"
        onClick={() => setMonth(addMonths(month, 1))}
      >
        <ChevronRight />
      </Button>
      {!isCurrent && (
        <Button variant="ghost" size="sm" onClick={() => setMonth(currentMonth())}>
          Hoje
        </Button>
      )}
    </div>
  );
}
