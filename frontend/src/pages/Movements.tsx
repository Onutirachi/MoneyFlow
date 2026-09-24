import { ArrowLeftRight, Minus, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { DeleteMovementDialog } from '@/components/movements/DeleteMovementDialog';
import { type FilterValues, MovementFilters } from '@/components/movements/MovementFilters';
import { MovementFormDialog } from '@/components/movements/MovementFormDialog';
import { MovementList } from '@/components/movements/MovementList';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useMonthParam } from '@/hooks/useMonthParam';
import { useMovements } from '@/hooks/useMovements';
import { defaultDateForMonth } from '@/lib/date';
import { formatBRL, formatMonth } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Movement, MovementType } from '@/types';

export function MovementsPage() {
  const [month] = useMonthParam();
  const [filters, setFilters] = useState<FilterValues>({});
  const { data: movements, isLoading, isPlaceholderData } = useMovements({ month, ...filters });
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { data: categories = [] } = useCategories();

  const [form, setForm] = useState<{ open: boolean; movement?: Movement; type: MovementType }>({
    open: false,
    type: 'SAIDA',
  });
  const [deleting, setDeleting] = useState<Movement | null>(null);

  const income =
    movements?.filter((m) => m.type === 'ENTRADA').reduce((a, m) => a + m.amount, 0) ?? 0;
  const expense =
    movements?.filter((m) => m.type === 'SAIDA').reduce((a, m) => a + m.amount, 0) ?? 0;
  const result = income - expense;

  const newMovement = (type: MovementType) => setForm({ open: true, type });

  if (!loadingAccounts && !accounts.length) {
    return (
      <>
        <PageHeader title="Movimentos" />
        <EmptyState
          icon={Wallet}
          title="Cadastre uma conta primeiro"
          description="Todo movimento sai ou entra em uma conta (ex.: Carteira Física, Banco XPTO)."
          action={
            <Button asChild>
              <Link to="/contas">Ir para contas</Link>
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Movimentos"
        description={formatMonth(month)}
        actions={
          <>
            <MonthSelector />
            <Button variant="outline" onClick={() => newMovement('ENTRADA')}>
              <Plus />
              Entrada
            </Button>
            <Button onClick={() => newMovement('SAIDA')}>
              <Minus />
              Saída
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl border bg-card p-3 text-sm sm:max-w-xl">
        <div>
          <p className="text-xs text-muted-foreground">Entradas</p>
          <p className="font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
            {formatBRL(income)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Saídas</p>
          <p className="font-semibold tabular-nums">{formatBRL(expense)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Resultado</p>
          <p className={cn('font-semibold tabular-nums', result < 0 && 'text-destructive')}>
            {formatBRL(result)}
          </p>
        </div>
      </div>

      <MovementFilters
        value={filters}
        onChange={setFilters}
        accounts={accounts}
        categories={categories}
      />

      <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
        {isLoading ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : !movements?.length ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Nenhum movimento neste mês"
            description={
              Object.values(filters).some(Boolean)
                ? 'Nenhum movimento corresponde aos filtros.'
                : 'Lance uma entrada ou saída para começar.'
            }
            action={
              <Button onClick={() => newMovement('SAIDA')}>
                <Minus />
                Nova saída
              </Button>
            }
          />
        ) : (
          <MovementList
            movements={movements}
            accounts={accounts}
            categories={categories}
            onEdit={(movement) => setForm({ open: true, movement, type: movement.type })}
            onDelete={setDeleting}
          />
        )}
      </div>

      <MovementFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((f) => ({ ...f, open }))}
        movement={form.movement}
        defaultType={form.type}
        defaultDate={defaultDateForMonth(month)}
      />
      {/* key reinicia a escolha de escopo a cada movimento */}
      <DeleteMovementDialog
        key={deleting?.id ?? 'none'}
        movement={deleting}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
