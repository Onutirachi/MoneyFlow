import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { METHOD_LABELS } from '@/lib/format';
import {
  type Account,
  type Category,
  type MovementFilters as Filters,
  PAYMENT_METHODS,
} from '@/types';

export type FilterValues = Omit<Filters, 'month'>;

const ALL = '__all__';

export function MovementFilters({
  value,
  onChange,
  accounts,
  categories,
}: {
  value: FilterValues;
  onChange: (value: FilterValues) => void;
  accounts: Account[];
  categories: Category[];
}) {
  const account = accounts.find((a) => a.id === value.accountId);
  const methods = account?.methods ?? PAYMENT_METHODS;
  const visibleCategories = categories.filter((c) => !value.type || c.type === value.type);
  const hasFilters = Object.values(value).some(Boolean);

  const set = (patch: Partial<FilterValues>) => {
    const next = { ...value, ...patch };
    // mantém coerência: método da conta e categoria do tipo
    if (next.method && next.accountId) {
      const acc = accounts.find((a) => a.id === next.accountId);
      if (acc && !acc.methods.includes(next.method)) next.method = undefined;
    }
    if (next.categoryId && next.type) {
      const cat = categories.find((c) => c.id === next.categoryId);
      if (cat && cat.type !== next.type) next.categoryId = undefined;
    }
    onChange(next);
  };

  const pick = (v: string) => (v === ALL ? undefined : v);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={value.type ?? ALL}
        onValueChange={(v) => v && set({ type: pick(v) as FilterValues['type'] })}
      >
        <ToggleGroupItem value={ALL}>Todos</ToggleGroupItem>
        <ToggleGroupItem value="SAIDA">Saídas</ToggleGroupItem>
        <ToggleGroupItem value="ENTRADA">Entradas</ToggleGroupItem>
      </ToggleGroup>

      <Select value={value.accountId ?? ALL} onValueChange={(v) => set({ accountId: pick(v) })}>
        <SelectTrigger size="sm" className="w-44" aria-label="Filtrar por conta">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as contas</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.method ?? ALL}
        onValueChange={(v) => set({ method: pick(v) as FilterValues['method'] })}
      >
        <SelectTrigger size="sm" className="w-40" aria-label="Filtrar por método">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos os métodos</SelectItem>
          {methods.map((m) => (
            <SelectItem key={m} value={m}>
              {METHOD_LABELS[m]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.categoryId ?? ALL} onValueChange={(v) => set({ categoryId: pick(v) })}>
        <SelectTrigger size="sm" className="w-44" aria-label="Filtrar por categoria">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas as categorias</SelectItem>
          {visibleCategories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          <X />
          Limpar
        </Button>
      )}
    </div>
  );
}
