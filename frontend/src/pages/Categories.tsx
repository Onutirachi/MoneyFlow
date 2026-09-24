import { ArrowDownCircle, ArrowUpCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { RowActions } from '@/components/common/RowActions';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { getErrorMessage } from '@/lib/api';
import type { Category, MovementType } from '@/types';

const GROUPS: { type: MovementType; title: string; icon: typeof ArrowUpCircle }[] = [
  { type: 'SAIDA', title: 'Saídas', icon: ArrowUpCircle },
  { type: 'ENTRADA', title: 'Entradas', icon: ArrowDownCircle },
];

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const remove = useDeleteCategory();
  const [form, setForm] = useState<{ open: boolean; category?: Category; type: MovementType }>({
    open: false,
    type: 'SAIDA',
  });
  const [deleting, setDeleting] = useState<Category | null>(null);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success('Categoria excluída');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
    setDeleting(null);
  };

  return (
    <>
      <PageHeader
        title="Categorias"
        description="Agrupam seus lançamentos nos gráficos do dashboard"
        actions={
          <Button onClick={() => setForm({ open: true, type: 'SAIDA' })}>
            <Plus />
            Nova categoria
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {GROUPS.map(({ type, title, icon: Icon }) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="size-4 text-muted-foreground" />
                {title}
              </CardTitle>
              <CardAction>
                <Button variant="ghost" size="sm" onClick={() => setForm({ open: true, type })}>
                  <Plus />
                  Adicionar
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48" />
              ) : (
                <ul className="divide-y">
                  {categories
                    ?.filter((c) => c.type === type)
                    .map((category) => (
                      <li key={category.id} className="flex items-center gap-3 py-2">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                          aria-hidden
                        />
                        <span className="flex-1 text-sm">{category.name}</span>
                        <RowActions
                          onEdit={() => setForm({ open: true, category, type })}
                          onDelete={() => setDeleting(category)}
                        />
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <CategoryFormDialog
        open={form.open}
        onOpenChange={(open) => setForm((f) => ({ ...f, open }))}
        category={form.category}
        defaultType={form.type}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Excluir "${deleting?.name}"?`}
        description="Só é possível excluir categorias sem movimentos ou custos fixos vinculados."
        onConfirm={confirmDelete}
      />
    </>
  );
}
