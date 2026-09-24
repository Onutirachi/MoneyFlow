import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { AccountSelect, CategorySelect, MethodSelect } from '@/components/common/EntitySelects';
import { Field } from '@/components/common/Field';
import { MoneyInput } from '@/components/common/MoneyInput';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAccountMethodSync } from '@/hooks/useAccountMethodSync';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { useSaveRecurring } from '@/hooks/useRecurring';
import { getErrorMessage } from '@/lib/api';
import { currentMonth } from '@/lib/date';
import type { PaymentMethod, RecurringCost } from '@/types';

const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

const schema = z
  .object({
    type: z.enum(['ENTRADA', 'SAIDA']),
    description: z.string().trim().min(1, 'Descreva o custo fixo'),
    amount: z.number().int().positive('Informe um valor maior que zero'),
    accountId: z.string().min(1, 'Escolha a conta'),
    method: z.enum(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO'], {
      error: 'Escolha o método de pagamento',
    }),
    categoryId: z.string().min(1, 'Escolha a categoria'),
    dayOfMonth: z
      .number({ error: 'Informe o dia' })
      .int()
      .min(1, 'Dia 1 a 31')
      .max(31, 'Dia 1 a 31'),
    startMonth: z.string().regex(monthRegex, 'Informe o mês inicial'),
    hasEnd: z.boolean(),
    endMonth: z.string(),
    active: z.boolean(),
  })
  .refine((v) => !v.hasEnd || monthRegex.test(v.endMonth), {
    message: 'Informe o mês final',
    path: ['endMonth'],
  })
  .refine((v) => !v.hasEnd || v.endMonth >= v.startMonth, {
    message: 'Deve ser igual ou depois do mês inicial',
    path: ['endMonth'],
  });
type FormValues = z.infer<typeof schema>;

export function RecurringFormDialog({
  open,
  onOpenChange,
  recurring,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recurring?: RecurringCost;
}) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const save = useSaveRecurring();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;
    reset({
      type: recurring?.type ?? 'SAIDA',
      description: recurring?.description ?? '',
      amount: recurring?.amount ?? 0,
      accountId: recurring?.accountId ?? (accounts.length === 1 ? accounts[0]!.id : ''),
      method: recurring?.method,
      categoryId: recurring?.categoryId ?? '',
      dayOfMonth: recurring?.dayOfMonth ?? 10,
      startMonth: recurring?.startMonth ?? currentMonth(),
      hasEnd: !!recurring?.endMonth,
      endMonth: recurring?.endMonth ?? '',
      active: recurring?.active ?? true,
    } as FormValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetar só ao abrir
  }, [open, recurring]);

  const [type, accountId, method, categoryId, hasEnd] = useWatch({
    control,
    name: ['type', 'accountId', 'method', 'categoryId', 'hasEnd'],
  });
  const account = accounts.find((a) => a.id === accountId);
  const typeCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );

  useAccountMethodSync({
    account,
    method,
    setMethod: useCallback((m) => setValue('method', m as PaymentMethod), [setValue]),
    type,
    categoryId,
    categories,
    setCategoryId: useCallback((id) => setValue('categoryId', id), [setValue]),
  });

  const onSubmit = handleSubmit(async ({ hasEnd: withEnd, endMonth, ...v }) => {
    try {
      await save.mutateAsync({
        id: recurring?.id,
        input: { ...v, endMonth: withEnd ? endMonth : null },
      });
      toast.success(recurring ? 'Custo fixo atualizado' : 'Custo fixo criado');
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{recurring ? 'Editar custo fixo' : 'Novo custo fixo'}</DialogTitle>
          <DialogDescription>
            É lançado automaticamente todo mês.
            {recurring && ' Alterações valem a partir de amanhã; lançamentos passados não mudam.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <ToggleGroup
                type="single"
                variant="outline"
                className="w-full"
                value={field.value}
                onValueChange={(v) => v && field.onChange(v)}
              >
                <ToggleGroupItem value="SAIDA" className="flex-1">
                  Saída
                </ToggleGroupItem>
                <ToggleGroupItem value="ENTRADA" className="flex-1">
                  Entrada
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <Field label="Descrição" htmlFor="rec-description" error={errors.description?.message}>
              <Input
                id="rec-description"
                placeholder={type === 'SAIDA' ? 'Aluguel, Internet...' : 'Salário...'}
                {...register('description')}
              />
            </Field>
            <Field label="Valor" htmlFor="rec-amount" error={errors.amount?.message}>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <MoneyInput id="rec-amount" value={field.value ?? 0} onChange={field.onChange} />
                )}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Conta" error={errors.accountId?.message}>
              <Controller
                control={control}
                name="accountId"
                render={({ field }) => (
                  <AccountSelect
                    accounts={accounts}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Field
              label="Método"
              error={errors.method?.message}
              hint={!account ? 'Escolha a conta primeiro' : undefined}
            >
              <Controller
                control={control}
                name="method"
                render={({ field }) => (
                  <MethodSelect account={account} value={field.value} onChange={field.onChange} />
                )}
              />
            </Field>
          </div>

          <Field label="Categoria" error={errors.categoryId?.message}>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <CategorySelect
                  categories={typeCategories}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Dia do mês"
              htmlFor="rec-day"
              error={errors.dayOfMonth?.message}
              hint="Dia 31 em meses curtos vira o último dia"
            >
              <Input
                id="rec-day"
                type="number"
                min={1}
                max={31}
                {...register('dayOfMonth', { valueAsNumber: true })}
              />
            </Field>
            <Field label="A partir de" htmlFor="rec-start" error={errors.startMonth?.message}>
              <Input id="rec-start" type="month" {...register('startMonth')} />
            </Field>
          </div>

          <div className="grid gap-3 rounded-lg border p-3">
            <label className="flex items-center justify-between gap-2 text-sm font-medium">
              Tem data para terminar?
              <Controller
                control={control}
                name="hasEnd"
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </label>
            {hasEnd && (
              <Field label="Último mês" htmlFor="rec-end" error={errors.endMonth?.message}>
                <Input id="rec-end" type="month" {...register('endMonth')} />
              </Field>
            )}
          </div>

          <label className="flex items-center justify-between gap-2 text-sm font-medium">
            Ativo
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending || !accounts.length}>
              {save.isPending && <Loader2 className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
