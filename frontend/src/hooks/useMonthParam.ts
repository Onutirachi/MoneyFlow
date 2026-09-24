import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { currentMonth, isValidMonth } from '@/lib/date';

/** Mês selecionado, guardado na URL (?month=YYYY-MM) e compartilhado entre as telas. */
export function useMonthParam(): [string, (month: string) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get('month');
  const month = isValidMonth(raw) ? raw : currentMonth();

  const setMonth = useCallback(
    (next: string) =>
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set('month', next);
          return p;
        },
        { replace: true },
      ),
    [setParams],
  );

  return [month, setMonth];
}
