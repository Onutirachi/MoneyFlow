import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { niceTicks } from '@/lib/chartTicks';
import { CHART, ORIGIN_COLORS } from '@/lib/chartColors';
import { formatBRL, formatBRLCompact, formatMonth, formatMonthShort } from '@/lib/format';
import type { Composition, Dashboard } from '@/types';
import { ChartLegend } from './ChartLegend';
import { ChartTooltipBox } from './ChartTooltip';

const ORIGINS: { key: keyof Composition; label: string }[] = [
  { key: 'installments', label: 'Parcelas' },
  { key: 'recurring', label: 'Custos fixos' },
  { key: 'other', label: 'Avulsos' },
];

interface Point extends Composition {
  month: string;
  label: string;
}

function UpcomingTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Point }[];
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <ChartTooltipBox
      title={formatMonth(point.month)}
      rows={ORIGINS.filter((o) => point[o.key] > 0).map((o) => ({
        label: o.label,
        value: point[o.key],
        color: ORIGIN_COLORS[o.key],
      }))}
    />
  );
}

/** Barra 100% empilhada com 2px de respiro entre segmentos (skill dataviz › marks). */
function CompositionBar({ composition }: { composition: Composition }) {
  const total = ORIGINS.reduce((a, o) => a + composition[o.key], 0);
  if (!total) return <div className="h-3 rounded-full bg-muted" />;
  return (
    <div
      className="flex h-3 gap-0.5 overflow-hidden rounded-full"
      role="img"
      aria-label="Composição das saídas"
    >
      {ORIGINS.filter((o) => composition[o.key] > 0).map((o) => (
        <span
          key={o.key}
          title={`${o.label}: ${formatBRL(composition[o.key])}`}
          style={{ flexGrow: composition[o.key], backgroundColor: ORIGIN_COLORS[o.key] }}
        />
      ))}
    </div>
  );
}

/** Quanto das saídas já é compromisso (parcelas + fixos), neste mês e nos próximos 3. */
export function CommitmentsCard({ data }: { data: Dashboard }) {
  const { composition } = data;
  const committed = composition.installments + composition.recurring;
  const expense = data.summary.expense;
  const points: Point[] = data.upcoming.map((u) => ({ ...u, label: formatMonthShort(u.month) }));

  const yTicks = niceTicks(points.map((p) => p.installments + p.recurring + p.other));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compromissos</CardTitle>
        <CardDescription>
          {expense
            ? `${Math.round((committed / expense) * 100)}% das saídas do mês já eram parcelas ou custos fixos`
            : 'Parcelas e custos fixos'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Saídas deste mês por origem</p>
          <CompositionBar composition={composition} />
          <ChartLegend
            items={ORIGINS.map((o) => ({
              label: o.label,
              color: ORIGIN_COLORS[o.key],
              value: formatBRL(composition[o.key]),
            }))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-medium text-muted-foreground">Próximos 3 meses</p>
            <p className="text-sm">
              <span className="text-muted-foreground">já comprometido </span>
              <span className="font-semibold">{formatBRL(data.upcomingTotal)}</span>
            </p>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points} margin={{ top: 12, left: 4, right: 4 }} barCategoryGap="35%">
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: CHART.axis }}
                  tick={{ fill: CHART.muted, fontSize: 11 }}
                />
                <YAxis
                  ticks={yTicks}
                  domain={[yTicks[0]!, yTicks.at(-1)!]}
                  tickFormatter={formatBRLCompact}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: CHART.muted, fontSize: 11 }}
                  width={72}
                />
                <Tooltip
                  content={<UpcomingTooltip />}
                  cursor={{ fill: CHART.grid, opacity: 0.5 }}
                />
                {ORIGINS.map((o, i) => (
                  <Bar
                    key={o.key}
                    dataKey={o.key}
                    stackId="origin"
                    fill={ORIGIN_COLORS[o.key]}
                    stroke={CHART.surface}
                    strokeWidth={2}
                    maxBarSize={40}
                    radius={i === ORIGINS.length - 1 ? [4, 4, 0, 0] : 0}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
