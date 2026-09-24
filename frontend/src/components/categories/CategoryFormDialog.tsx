import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ColorPicker } from '@/components/common/ColorPicker';
import { Field } from '@/components/common/Field';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSaveCategory } from '@/hooks/useCategories';
import { getErrorMessage } from '@/lib/api';
import { SWATCHES } from '@/lib/colors';
import type { Category, MovementType } from '@/types';

const schema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  type: z.enum(['ENTRADA', 'SAIDA']),
  color: z.string(),
});
type FormValues = z.infer<typeof schema>;

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  defaultType = 'SAIDA',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  defaultType?: MovementType;
}) {
  const save = useSaveCategory();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) reset(category ?? { name: '', type: defaultType, color: SWATCHES[4]! });
  }, [open, category, defaultType, reset]);

  const onSubmit = handleSubmit(async (input) => {
    try {
      await save.mutateAsync({ id: category?.id, input });
      toast.success(category ? 'Categoria atualizada' : 'Categoria criada');
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <Field label="Tipo">
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={field.value}
                  onValueChange={(v) => v && field.onChange(v)}
                  disabled={!!category}
                >
                  <ToggleGroupItem value="SAIDA">Saída</ToggleGroupItem>
                  <ToggleGroupItem value="ENTRADA">Entrada</ToggleGroupItem>
                </ToggleGroup>
              )}
            />
          </Field>
          <Field label="Nome" htmlFor="category-name" error={errors.name?.message}>
            <Input id="category-name" placeholder="Pets" {...register('name')} />
          </Field>
          <Field label="Cor">
            <Controller
              control={control}
              name="color"
              render={({ field }) => <ColorPicker value={field.value} onChange={field.onChange} />}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
