import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { CHART } from '@/lib/chartColors';
import { cn } from '@/lib/utils';

export interface Delta {
  /** texto já formatado, ex.: "-33,9%" ou "+R$ 120,00" */
  text: string;
  direction: 'up' | 'down' | 'flat';
  /** se a direção é boa para o usuário (ex.: saídas caindo = bom) */
  good: boolean | null;
}

/**
 * Stat tile (skill dataviz): rótulo · valor · delta vs mês anterior · sparkline opcional
 * em cinza com o mês atual destacado.
 */
export function StatTile({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  trend,
  accent,
  className,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: Delta;
  hint?: string;
  trend?: number[];
  /** cor da série que este número representa (ponto do sparkline) */
  accent?: string;
  className?: string;
}) {
  const DeltaIcon =
    delta?.direction === 'up' ? ArrowUpRight : delta?.direction === 'down' ? ArrowDownRight : Minus;
  const trendData = trend?.map((v, i) => ({ i, v }));

  return (
    <Card className={cn('gap-2 py-4', className)}>
      <CardContent className="space-y-1 px-4">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Icon className="size-4" />
          {label}
        </p>
        <div className="flex items-end justify-between gap-2">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {trendData && trendData.length > 1 && (
            <div className="h-8 w-20 shrink-0" aria-hidden>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <Line
                    dataKey="v"
                    stroke={CHART.muted}
                    strokeWidth={1.5}
                    isAnimationActive={false}
                    dot={(props: { cx?: number; cy?: number; index?: number }) =>
                      props.index === trendData.length - 1 ? (
                        <circle
                          key="last"
                          cx={props.cx}
                          cy={props.cy}
                          r={3.5}
                          fill={accent ?? CHART.muted}
                          stroke={CHART.surface}
                          strokeWidth={2}
                        />
                      ) : (
                        <g key={props.index} />
                      )
                    }
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {delta ? (
          <p className="flex items-center gap-1 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium',
                delta.good === true && 'text-[var(--delta-good)]',
                delta.good === false && 'text-[var(--delta-bad)]',
                delta.good === null && 'text-muted-foreground',
              )}
            >
              <DeltaIcon className="size-3.5" />
              {delta.text}
            </span>
            <span className="text-muted-foreground">vs mês anterior</span>
          </p>
        ) : (
          hint && <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
