import { Banknote, CreditCard, type LucideIcon, QrCode, WalletCards } from 'lucide-react';
import type { PaymentMethod } from '@/types';

export const METHOD_ICONS: Record<PaymentMethod, LucideIcon> = {
  DINHEIRO: Banknote,
  PIX: QrCode,
  CREDITO: CreditCard,
  DEBITO: WalletCards,
};
