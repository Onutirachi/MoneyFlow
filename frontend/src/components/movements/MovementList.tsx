import { CalendarClock, Layers, Repeat } from 'lucide-react';
import { RowActions } from '@/components/common/RowActions';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { todayISO } from '@/lib/date';
import { formatBRL, formatDayShort, METHOD_LABELS } from '@/lib/format';
import { METHOD_ICONS } from '@/lib/methods';
import { cn } from '@/lib/utils';
import type { Account, Category, Movement } from '@/types';

const weekday = (date: string) => {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long' });
};

export function MovementList({
  movements,
  accounts,
  categories,
  onEdit,
  onDelete,
}: {
  movements: Movement[];
  accounts: Account[];
  categories: Category[];
  onEdit: (m: Movement) => void;
  onDelete: (m: Movement) => void;
}) {
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const today = todayISO();

  const days = new Map<string, Movement[]>();
  for (const m of movements) days.set(m.date, [...(days.get(m.date) ?? []), m]);

  return (
    <div className="divide-y rounded-xl border bg-card">
      {[...days].map(([date, items]) => {
        const dayTotal = items.reduce(
          (acc, m) => acc + (m.type === 'ENTRADA' ? m.amount : -m.amount),
          0,
        );
        const planned = date > today;
        return (
          <section key={date}>
            <header className="flex items-center justify-between bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
              <span className="font-medium">
                {formatDayShort(date)} · {weekday(date)}
                {planned && (
                  <Badge variant="outline" className="ml-2 gap-1 font-normal">
                    <CalendarClock className="size-3" />
                    previsto
                  </Badge>
                )}
              </span>
              <span className="tabular-nums">{formatBRL(dayTotal)}</span>
            </header>
            <ul className="divide-y">
              {items.map((m) => {
                const account = accountById.get(m.accountId);
                const category = categoryById.get(m.categoryId);
                const MethodIcon = METHOD_ICONS[m.method];
                return (
                  <li
                    key={m.id}
                    className={cn('flex items-center gap-3 px-4 py-3', planned && 'opacity-70')}
                  >
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: category?.color ?? '#64748b' }}
                      aria-hidden
                    >
                      {category?.name.charAt(0) ?? '?'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate font-medium">{m.description}</span>
                        {m.installmentGroupId && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="gap-1 font-normal">
                                <Layers className="size-3" />
                                {m.installmentNumber}/{m.installmentTotal}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Parcela {m.installmentNumber} de {m.installmentTotal}
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {m.recurringId && (
                          <Badge variant="secondary" className="gap-1 font-normal">
                            <Repeat className="size-3" />
                            Fixo
                          </Badge>
                        )}
                      </div>
                      <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: account?.color }}
                          aria-hidden
                        />
                        {account?.name ?? 'Conta removida'}
                        <span aria-hidden>·</span>
                        <MethodIcon className="size-3" />
                        {METHOD_LABELS[m.method]}
                        <span aria-hidden>·</span>
                        {category?.name}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 font-medium tabular-nums',
                        m.type === 'ENTRADA' ? 'text-emerald-600 dark:text-emerald-400' : '',
                      )}
                    >
                      {m.type === 'ENTRADA' ? '+' : '−'}
                      {formatBRL(m.amount)}
                    </span>
                    <RowActions onEdit={() => onEdit(m)} onDelete={() => onDelete(m)} />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
