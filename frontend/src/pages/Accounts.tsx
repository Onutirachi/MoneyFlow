import { Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AccountFormDialog } from '@/components/accounts/AccountFormDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { MethodBadge } from '@/components/common/MethodBadge';
import { PageHeader } from '@/components/common/PageHeader';
import { RowActions } from '@/components/common/RowActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccounts, useDeleteAccount } from '@/hooks/useAccounts';
import { getErrorMessage } from '@/lib/api';
import { formatBRL } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Account } from '@/types';

export function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const remove = useDeleteAccount();
  const [editing, setEditing] = useState<Account | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Account | null>(null);

  const total = accounts?.reduce((acc, a) => acc + a.balance, 0) ?? 0;

  const openForm = (account?: Account) => {
    setEditing(account);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success('Conta excluída');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
    setDeleting(null);
  };

  return (
    <>
      <PageHeader
        title="Contas"
        description={
          accounts?.length ? `Saldo total hoje: ${formatBRL(total)}` : 'Bancos, carteiras e cartões'
        }
        actions={
          <Button onClick={() => openForm()}>
            <Plus />
            Nova conta
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : !accounts?.length ? (
        <EmptyState
          icon={Wallet}
          title="Nenhuma conta cadastrada"
          description="Cadastre onde seu dinheiro fica, como um banco ou a carteira física, e os métodos de pagamento de cada um."
          action={
            <Button onClick={() => openForm()}>
              <Plus />
              Cadastrar primeira conta
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} className="relative overflow-hidden">
              <span
                className="absolute inset-y-0 left-0 w-1"
                style={{ backgroundColor: account.color }}
                aria-hidden
              />
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{account.name}</CardTitle>
                <RowActions
                  onEdit={() => openForm(account)}
                  onDelete={() => setDeleting(account)}
                />
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Saldo atual</p>
                  <p
                    className={cn(
                      'text-2xl font-semibold tabular-nums',
                      account.balance < 0 && 'text-destructive',
                    )}
                  >
                    {formatBRL(account.balance)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Saldo inicial {formatBRL(account.initialBalance)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {account.methods.map((m) => (
                    <MethodBadge key={m} method={m} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AccountFormDialog open={formOpen} onOpenChange={setFormOpen} account={editing} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Excluir "${deleting?.name}"?`}
        description="Só é possível excluir contas sem movimentos ou custos fixos vinculados."
        onConfirm={confirmDelete}
      />
    </>
  );
}
