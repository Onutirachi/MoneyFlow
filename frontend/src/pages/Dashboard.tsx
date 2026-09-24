import { ArrowDownCircle, ArrowUpCircle, Landmark, Scale, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { AccountBalances } from '@/components/dashboard/AccountBalances';
import { BreakdownCard } from '@/components/dashboard/BreakdownCard';
import { CommitmentsCard } from '@/components/dashboard/CommitmentsCard';
import { HistoryChart } from '@/components/dashboard/HistoryChart';
import { ResultChart } from '@/components/dashboard/ResultChart';
import { SavingsInsight } from '@/components/dashboard/SavingsInsight';
import { type Delta, StatTile } from '@/components/dashboard/StatTile';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccounts } from '@/hooks/useAccounts';
import { useDashboard } from '@/hooks/useDashboard';
import { useMonthParam } from '@/hooks/useMonthParam';
import { FLOW_COLORS } from '@/lib/chartColors';
import { formatBRL, formatMonth, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';

const ALL = '__all__';

function percentDelta(pct: number | null, upIsGood: boolean): Delta | undefined {
  if (pct === null) return undefined;
  const direction = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
  return {
    text: formatPercent(pct),
    direction,
    good: direction === 'flat' ? null : (direction === 'up') === upIsGood,
  };
}

function moneyDelta(diff: number): Delta {
  const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
  return {
    text: `${diff > 0 ? '+' : diff < 0 ? '−' : ''}${formatBRL(Math.abs(diff))}`,
    direction,
    good: direction === 'flat' ? null : direction === 'up',
  };
}

export function DashboardPage() {
  const [month] = useMonthParam();
  const [accountId, setAccountId] = useState<string | undefined>();
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { data, isLoading, isPlaceholderData } = useDashboard(month, accountId);

  if (!loadingAccounts && !accounts.length) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <EmptyState
          icon={Wallet}
          title="Bem-vindo! Comece cadastrando suas contas"
          description="Depois lance suas entradas e saídas. Os gráficos aparecem aqui."
          action={
            <Button asChild>
              <Link to="/contas">Cadastrar contas</Link>
            </Button>
          }
        />
      </>
    );
  }

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const trend = (key: 'income' | 'expense' | 'result') =>
    data?.history.slice(-6).map((h) => h[key]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`${formatMonth(month)} · ${selectedAccount ? selectedAccount.name : 'todas as contas'}`}
        actions={
          <>
            <MonthSelector />
            <Select
              value={accountId ?? ALL}
              onValueChange={(v) => setAccountId(v === ALL ? undefined : v)}
            >
              <SelectTrigger className="w-44" aria-label="Filtrar por conta">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas as contas</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
          <Skeleton className="h-80 rounded-xl sm:col-span-2 xl:col-span-4" />
        </div>
      ) : (
        // no refetch (troca de mês/conta) mantém o quadro anterior esmaecido, sem piscar
        <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Saldo atual"
              icon={Landmark}
              value={formatBRL(data.totalBalance)}
              hint={
                selectedAccount
                  ? 'Saldo desta conta hoje'
                  : `Soma de ${data.accounts.length} ${data.accounts.length === 1 ? 'conta' : 'contas'} hoje`
              }
            />
            <StatTile
              label="Entradas do mês"
              icon={ArrowDownCircle}
              value={formatBRL(data.summary.income)}
              delta={percentDelta(data.summary.variation.income, true)}
              trend={trend('income')}
              accent={FLOW_COLORS.income}
            />
            <StatTile
              label="Saídas do mês"
              icon={ArrowUpCircle}
              value={formatBRL(data.summary.expense)}
              delta={percentDelta(data.summary.variation.expense, false)}
              trend={trend('expense')}
              accent={FLOW_COLORS.expense}
            />
            <StatTile
              label="Resultado do mês"
              icon={Scale}
              value={formatBRL(data.summary.result)}
              delta={moneyDelta(data.summary.result - data.summary.previous.result)}
              trend={trend('result')}
            />
          </div>

          <SavingsInsight data={data} />

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <HistoryChart history={data.history} />
            </div>
            <ResultChart history={data.history} />
            <div className="xl:col-span-2">
              <BreakdownCard data={data} showAccounts={!accountId} />
            </div>
            <AccountBalances data={data} />
            <div className="xl:col-span-3">
              <CommitmentsCard data={data} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
