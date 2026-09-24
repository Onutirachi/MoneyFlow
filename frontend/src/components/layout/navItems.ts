import {
  ArrowLeftRight,
  LayoutDashboard,
  type LucideIcon,
  Repeat,
  Tags,
  Wallet,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** se a tela usa o mês selecionado (preserva ?month= ao navegar) */
  monthAware?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, monthAware: true },
  { to: '/movimentos', label: 'Movimentos', icon: ArrowLeftRight, monthAware: true },
  { to: '/contas', label: 'Contas', icon: Wallet },
  { to: '/custos-fixos', label: 'Custos fixos', icon: Repeat },
  { to: '/categorias', label: 'Categorias', icon: Tags },
];
