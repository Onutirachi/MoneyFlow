import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { METHOD_LABELS } from '@/lib/format';
import { METHOD_ICONS } from '@/lib/methods';
import type { Account, Category, PaymentMethod } from '@/types';

// Selects controlados usados pelos formulários de movimento e de custo fixo.
// Valor vazio ('') = nada selecionado (mostra o placeholder).

const Dot = ({ color }: { color: string }) => (
  <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
);

export function AccountSelect({
  accounts,
  value,
  onChange,
}: {
  accounts: Account[];
  value: string | undefined;
  onChange: (id: string) => void;
}) {
  return (
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger className="w-full" aria-label="Conta">
        <SelectValue placeholder="Escolha a conta" />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            <Dot color={a.color} />
            {a.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Só oferece os métodos cadastrados na conta escolhida. */
export function MethodSelect({
  account,
  value,
  onChange,
}: {
  account: Account | undefined;
  value: PaymentMethod | undefined;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <Select
      value={value ?? ''}
      onValueChange={(v) => onChange(v as PaymentMethod)}
      disabled={!account}
    >
      <SelectTrigger className="w-full" aria-label="Método de pagamento">
        <SelectValue placeholder="Escolha o método" />
      </SelectTrigger>
      <SelectContent>
        {account?.methods.map((m) => {
          const Icon = METHOD_ICONS[m];
          return (
            <SelectItem key={m} value={m}>
              <Icon />
              {METHOD_LABELS[m]}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function CategorySelect({
  categories,
  value,
  onChange,
}: {
  /** já filtradas pelo tipo do lançamento */
  categories: Category[];
  value: string | undefined;
  onChange: (id: string) => void;
}) {
  return (
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger className="w-full" aria-label="Categoria">
        <SelectValue placeholder="Escolha a categoria" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <Dot color={c.color} />
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
