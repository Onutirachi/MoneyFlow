import { useEffect } from 'react';
import type { Account, Category, MovementType, PaymentMethod } from '@/types';

/**
 * Mantém método e categoria coerentes com a conta e o tipo escolhidos no formulário:
 * - método fora de `account.methods` é limpo (ou auto-selecionado se a conta tiver só um);
 * - categoria de outro tipo é limpa.
 */
export function useAccountMethodSync({
  account,
  method,
  setMethod,
  type,
  categoryId,
  categories,
  setCategoryId,
}: {
  account: Account | undefined;
  method: PaymentMethod | undefined;
  setMethod: (method: PaymentMethod | undefined) => void;
  type: MovementType;
  categoryId: string | undefined;
  categories: Category[];
  setCategoryId: (id: string) => void;
}) {
  useEffect(() => {
    if (!account) return;
    if (!method || !account.methods.includes(method)) {
      setMethod(account.methods.length === 1 ? account.methods[0] : undefined);
    }
  }, [account, method, setMethod]);

  useEffect(() => {
    if (!categoryId) return;
    const category = categories.find((c) => c.id === categoryId);
    if (category && category.type !== type) setCategoryId('');
  }, [type, categoryId, categories, setCategoryId]);
}
