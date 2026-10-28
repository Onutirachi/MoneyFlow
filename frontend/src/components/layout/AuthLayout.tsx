import { CalendarRange, CreditCard, PieChart } from 'lucide-react';
import type { ReactNode } from 'react';
import { Logo } from '@/components/common/Logo';
import { ApiStatusBanner } from './ApiStatusBanner';
import { Brand } from './Sidebar';

const FEATURES = [
  { icon: CreditCard, text: 'Contas com seus métodos de pagamento' },
  { icon: CalendarRange, text: 'Parcelas e custos fixos lançados automaticamente' },
  { icon: PieChart, text: 'Dashboard comparando mês a mês' },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-muted/50 p-10 lg:flex">
        <Logo className="h-10 w-auto self-start text-foreground" />
        <div className="space-y-6">
          <h2 className="max-w-md text-3xl font-semibold tracking-tight">
            Saiba para onde vai cada real, e se você economizou este mês.
          </h2>
          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-muted-foreground">
                <Icon className="size-4 text-foreground" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">TCC · Gerenciamento financeiro pessoal</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <ApiStatusBanner />
          {children}
        </div>
      </div>
    </div>
  );
}
