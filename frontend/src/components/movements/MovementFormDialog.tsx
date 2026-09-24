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
import { useCreateMovement, useUpdateMovement } from '@/hooks/useMovements';
import { getErrorMessage } from '@/lib/api';
import type { Movement, MovementScope, MovementType, PaymentMethod } from '@/types';
import { InstallmentPreview } from './InstallmentPreview';

const schema = z
  .object({
    type: z.enum(['ENTRADA', 'SAIDA']),
    accountId: z.string().min(1, 'Escolha a conta'),
    method: z.enum(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO'], {
      error: 'Escolha o método de pagamento',
    }),
    amount: z.number().int().positive('Informe um valor maior que zero'),
    description: z.string().trim().min(1, 'Descreva o movimento'),
    categoryId: z.string().min(1, 'Escolha a categoria'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data'),
    installmentsEnabled: z.boolean(),
    installments: z.number().int(),
    scope: z.enum(['one', 'group']),
  })
  .refine((v) => !v.installmentsEnabled || (v.installments >= 2 && v.installments <= 72), {
    message: 'Entre 2 e 72 parcelas',
    path: ['installments'],
  });
type FormValues = z.infer<typeof schema>;

export function MovementFormDialog({
  open,
  onOpenChange,
  movement,
  defaultType = 'SAIDA',
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** movimento em edição; ausente = novo */
  movement?: Movement;
  defaultType?: MovementType;
  defaultDate: string;
}) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const create = useCreateMovement();
  const update = useUpdateMovement();
  const isEdit = !!movement;
  const isInstallment = !!movement?.installmentGroupId;

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
      type: movement?.type ?? defaultType,
      accountId: movement?.accountId ?? (accounts.length === 1 ? accounts[0]!.id : ''),
      method: movement?.method,
      amount: movement?.amount ?? 0,
      description: movement?.description ?? '',
      categoryId: movement?.categoryId ?? '',
      date: movement?.date ?? defaultDate,
      installmentsEnabled: false,
      installments: 2,
      scope: 'one',
    } as FormValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resetar só ao abrir
  }, [open, movement]);

  const [
    type,
    accountId,
    method,
    categoryId,
    amount,
    description,
    date,
    installmentsEnabled,
    installments,
    scope,
  ] = useWatch({
    control,
    name: [
      'type',
      'accountId',
      'method',
      'categoryId',
      'amount',
      'description',
      'date',
      'installmentsEnabled',
      'installments',
      'scope',
    ],
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

  const groupEdit = isInstallment && scope === 'group';

  const onSubmit = handleSubmit(async (v) => {
    const base = {
      description: v.description,
      amount: v.amount,
      date: v.date,
      accountId: v.accountId,
      method: v.method,
      categoryId: v.categoryId,
    };
    try {
      if (movement) {
        await update.mutateAsync({ id: movement.id, input: base, scope: v.scope as MovementScope });
        toast.success(groupEdit ? 'Todas as parcelas foram atualizadas' : 'Movimento atualizado');
      } else {
        const created = await create.mutateAsync({
          ...base,
          type: v.type,
          installments: v.installmentsEnabled ? v.installments : undefined,
        });
        toast.success(
          created.length > 1
            ? `${created.length} parcelas lançadas até ${created.at(-1)!.date.slice(5, 7)}/${created.at(-1)!.date.slice(0, 4)}`
            : 'Movimento lançado',
        );
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar movimento' : 'Novo movimento'}</DialogTitle>
          {!accounts.length && (
            <DialogDescription>Cadastre uma conta antes de lançar movimentos.</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          {!isEdit && (
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
          )}

          {isInstallment && (
            <Field
              label="Aplicar alterações em"
              hint={
                groupEdit
                  ? 'Descrição, conta, método e categoria vão para todas as parcelas. Valor e data de cada parcela são mantidos.'
                  : undefined
              }
            >
              <Controller
                control={control}
                name="scope"
                render={({ field }) => (
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    className="w-full"
                    value={field.value}
                    onValueChange={(v) => v && field.onChange(v)}
                  >
                    <ToggleGroupItem value="one" className="flex-1">
                      Só esta parcela
                    </ToggleGroupItem>
                    <ToggleGroupItem value="group" className="flex-1">
                      Todas as parcelas
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            </Field>
          )}

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

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={installmentsEnabled ? 'Valor total' : 'Valor'}
              htmlFor="movement-amount"
              error={errors.amount?.message}
              hint={groupEdit ? 'Não se altera em todas as parcelas' : undefined}
            >
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <MoneyInput
                    id="movement-amount"
                    value={field.value ?? 0}
                    onChange={field.onChange}
                    disabled={groupEdit}
                  />
                )}
              />
            </Field>
            <Field
              label={installmentsEnabled ? 'Data da 1ª parcela' : 'Data'}
              htmlFor="movement-date"
              error={errors.date?.message}
            >
              <Input id="movement-date" type="date" disabled={groupEdit} {...register('date')} />
            </Field>
          </div>

          <Field
            label="Descrição"
            htmlFor="movement-description"
            error={errors.description?.message}
          >
            <Input
              id="movement-description"
              placeholder={
                type === 'SAIDA' ? 'Mercado, Notebook, Uber...' : 'Salário, Freelance...'
              }
              {...register('description')}
            />
          </Field>

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

          {!isEdit && (
            <div className="grid gap-3 rounded-lg border p-3">
              <label className="flex items-center justify-between gap-2 text-sm font-medium">
                Parcelado
                <Controller
                  control={control}
                  name="installmentsEnabled"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </label>
              {installmentsEnabled && (
                <>
                  <Field
                    label="Número de parcelas"
                    htmlFor="movement-installments"
                    error={errors.installments?.message}
                  >
                    <Input
                      id="movement-installments"
                      type="number"
                      min={2}
                      max={72}
                      {...register('installments', { valueAsNumber: true })}
                    />
                  </Field>
                  <InstallmentPreview
                    description={description ?? ''}
                    total={amount ?? 0}
                    count={installments >= 2 && installments <= 72 ? installments : 0}
                    firstDate={date ?? ''}
                  />
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || !accounts.length}>
              {pending && <Loader2 className="animate-spin" />}
              {isEdit ? 'Salvar' : 'Lançar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
