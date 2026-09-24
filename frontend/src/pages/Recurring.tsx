import { Plus, Repeat } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { MethodBadge } from '@/components/common/MethodBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { RowActions } from '@/components/common/RowActions';
import { RecurringFormDialog } from '@/components/recurring/RecurringFormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useDeleteRecurring, useRecurring, useSaveRecurring } from '@/hooks/useRecurring';
import { getErrorMessage } from '@/lib/api';
import { formatBRL, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { RecurringCost } from '@/types';

const toInput = ({ id: _id, materializedMonths: _m, createdAt: _c, ...input }: RecurringCost) =>
  input;

export function RecurringPage() {
  const { data: items, isLoading } = useRecurring();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const save = useSaveRecurring();
  const remove = useDeleteRecurring();
  const [form, setForm] = useState<{ open: boolean; recurring?: RecurringCost }>({ open: false });
  const [deleting, setDeleting] = useState<RecurringCost | null>(null);

  const accountById = new Map(accounts.map((a) => [a.id, a]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const active = items?.filter((r) => r.active) ?? [];
  const monthlyExpense = active.filter((r) => r.type === 'SAIDA').reduce((a, r) => a + r.amount, 0);
  const monthlyIncome = active
    .filter((r) => r.type === 'ENTRADA')
    .reduce((a, r) => a + r.amount, 0);

  const toggleActive = async (r: RecurringCost, value: boolean) => {
    try {
      await save.mutateAsync({ id: r.id, input: { ...toInput(r), active: value } });
      toast.success(value ? `"${r.description}" reativado` : `"${r.description}" pausado`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success('Custo fixo excluído. Os lançamentos já gerados foram mantidos.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
    setDeleting(null);
  };

  return (
    <>
      <PageHeader
        title="Custos fixos"
        description="Lançados automaticamente todo mês: aluguel, internet, assinaturas, salário..."
        actions={
          <Button onClick={() => setForm({ open: true })}>
            <Plus />
            Novo custo fixo
          </Button>
        }
      />

      {!!items?.length && (
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border bg-card p-3 text-sm sm:max-w-md">
          <div>
            <p className="text-xs text-muted-foreground">Saídas fixas / mês</p>
            <p className="font-semibold tabular-nums">{formatBRL(monthlyExpense)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Entradas fixas / mês</p>
            <p className="font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
              {formatBRL(monthlyIncome)}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !items?.length ? (
        <EmptyState
          icon={Repeat}
          title="Nenhum custo fixo"
          description="Cadastre gastos e receitas que se repetem todo mês. Eles aparecem sozinhos nos próximos meses."
          action={
            <Button onClick={() => setForm({ open: true })}>
              <Plus />
              Cadastrar custo fixo
            </Button>
          }
        />
      ) : (
        <Card className="py-0">
          <CardContent className="divide-y p-0">
            {items.map((r) => {
              const account = accountById.get(r.accountId);
              const category = categoryById.get(r.categoryId);
              return (
                <div
                  key={r.id}
                  className={cn(
                    'flex flex-wrap items-center gap-3 px-4 py-3',
                    !r.active && 'opacity-60',
                  )}
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-center leading-none">
                    <span className="text-[10px] text-muted-foreground">dia</span>
                    <span className="text-sm font-semibold">{r.dayOfMonth}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-medium">{r.description}</span>
                      {!r.active && <Badge variant="outline">pausado</Badge>}
                    </div>
                    <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: category?.color }}
                        aria-hidden
                      />
                      {category?.name} · {account?.name ?? 'Conta removida'}
                      <span aria-hidden>·</span>
                      desde {formatMonthShort(r.startMonth)}
                      {r.endMonth ? ` até ${formatMonthShort(r.endMonth)}` : ' · sem fim'}
                    </p>
                  </div>
                  <MethodBadge method={r.method} />
                  <span
                    className={cn(
                      'w-28 text-right font-medium tabular-nums',
                      r.type === 'ENTRADA' && 'text-emerald-600 dark:text-emerald-400',
                    )}
                  >
                    {r.type === 'ENTRADA' ? '+' : '−'}
                    {formatBRL(r.amount)}
                  </span>
                  <Switch
                    checked={r.active}
                    onCheckedChange={(v) => toggleActive(r, v)}
                    aria-label={r.active ? 'Pausar' : 'Reativar'}
                  />
                  <RowActions
                    onEdit={() => setForm({ open: true, recurring: r })}
                    onDelete={() => setDeleting(r)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <RecurringFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((f) => ({ ...f, open }))}
        recurring={form.recurring}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Excluir "${deleting?.description}"?`}
        description="Os lançamentos futuros deste custo fixo serão removidos; os de hoje e do passado continuam no histórico. Para só pausar, use o botão ao lado."
        onConfirm={confirmDelete}
      />
    </>
  );
}
