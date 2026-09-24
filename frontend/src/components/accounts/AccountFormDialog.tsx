import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ColorPicker } from '@/components/common/ColorPicker';
import { Field } from '@/components/common/Field';
import { MoneyInput } from '@/components/common/MoneyInput';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSaveAccount } from '@/hooks/useAccounts';
import { getErrorMessage } from '@/lib/api';
import { SWATCHES } from '@/lib/colors';
import { METHOD_LABELS } from '@/lib/format';
import { METHOD_ICONS } from '@/lib/methods';
import { cn } from '@/lib/utils';
import { type Account, PAYMENT_METHODS, type PaymentMethod } from '@/types';

const schema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da conta'),
  color: z.string(),
  initialBalance: z.number().int(),
  methods: z
    .array(z.enum(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO']))
    .min(1, 'Selecione ao menos um método de pagamento'),
});
type FormValues = z.infer<typeof schema>;

const empty: FormValues = { name: '', color: SWATCHES[0]!, initialBalance: 0, methods: [] };

export function AccountFormDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** conta sendo editada; ausente = nova conta */
  account?: Account;
}) {
  const save = useSaveAccount();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (open) reset(account ? { ...account } : empty);
  }, [open, account, reset]);

  const onSubmit = handleSubmit(async (input) => {
    try {
      await save.mutateAsync({ id: account?.id, input });
      toast.success(account ? 'Conta atualizada' : 'Conta criada');
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{account ? 'Editar conta' : 'Nova conta'}</DialogTitle>
          <DialogDescription>
            Ex.: Banco XPTO, Carteira Física. Os métodos escolhidos aqui serão as opções ao lançar
            um movimento nesta conta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <Field label="Nome" htmlFor="account-name" error={errors.name?.message}>
            <Input id="account-name" placeholder="Banco XPTO" {...register('name')} />
          </Field>

          <Field
            label="Saldo inicial"
            htmlFor="account-balance"
            hint="Quanto havia na conta antes do primeiro lançamento. Digite '-' para negativo."
          >
            <Controller
              control={control}
              name="initialBalance"
              render={({ field }) => (
                <MoneyInput
                  id="account-balance"
                  allowNegative
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>

          <Field label="Métodos de pagamento" error={errors.methods?.message}>
            <Controller
              control={control}
              name="methods"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method: PaymentMethod) => {
                    const Icon = METHOD_ICONS[method];
                    const checked = field.value.includes(method);
                    return (
                      <label
                        key={method}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors',
                          checked && 'border-primary bg-muted',
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) =>
                            field.onChange(
                              c
                                ? PAYMENT_METHODS.filter(
                                    (m) => m === method || field.value.includes(m),
                                  )
                                : field.value.filter((m) => m !== method),
                            )
                          }
                        />
                        <Icon className="size-4 text-muted-foreground" />
                        {METHOD_LABELS[method]}
                      </label>
                    );
                  })}
                </div>
              )}
            />
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
