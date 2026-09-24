import { BarChart3, Table2 } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { niceTicks } from '@/lib/chartTicks';
import { CHART, FLOW_COLORS } from '@/lib/chartColors';
import { formatBRL, formatBRLCompact, formatMonth, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Dashboard } from '@/types';
import { ChartLegend } from './ChartLegend';
import { ChartTooltipBox } from './ChartTooltip';

interface Point {
  month: string;
  label: string;
  income: number;
  expense: number;
  result: number;
}

interface TooltipArgs {
  active?: boolean;
  payload?: { payload: Point }[];
}

function HistoryTooltip({ active, payload }: TooltipArgs) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <ChartTooltipBox
      title={formatMonth(point.month)}
      rows={[
        { label: 'Entradas', value: point.income, color: FLOW_COLORS.income },
        { label: 'Saídas', value: point.expense, color: FLOW_COLORS.expense },
      ]}
    />
  );
}

/** Entradas × saídas nos últimos 12 meses (colunas agrupadas, um único eixo). */
export function HistoryChart({ history }: { history: Dashboard['history'] }) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const data: Point[] = history.map((h) => ({ ...h, label: formatMonthShort(h.month) }));

  const yTicks = niceTicks(data.flatMap((d) => [d.income, d.expense]));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entradas e saídas</CardTitle>
        <CardDescription>Últimos 12 meses até o mês selecionado</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView(view === 'chart' ? 'table' : 'chart')}
          >
            {view === 'chart' ? <Table2 /> : <BarChart3 />}
            {view === 'chart' ? 'Tabela' : 'Gráfico'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        {view === 'chart' ? (
          <>
            <ChartLegend
              items={[
                { label: 'Entradas', color: FLOW_COLORS.income },
                { label: 'Saídas', color: FLOW_COLORS.expense },
              ]}
            />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  barGap={2}
                  barCategoryGap="28%"
                  margin={{ left: 4, right: 4 }}
                >
                  <CartesianGrid vertical={false} stroke={CHART.grid} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: CHART.axis }}
                    tick={{ fill: CHART.muted, fontSize: 11 }}
                    interval="preserveStartEnd"
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
                    content={<HistoryTooltip />}
                    cursor={{ fill: CHART.grid, opacity: 0.5 }}
                  />
                  <Bar
                    dataKey="income"
                    name="Entradas"
                    fill={FLOW_COLORS.income}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="expense"
                    name="Saídas"
                    fill={FLOW_COLORS.expense}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Entradas</TableHead>
                <TableHead className="text-right">Saídas</TableHead>
                <TableHead className="text-right">Resultado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...data].reverse().map((p) => (
                <TableRow key={p.month}>
                  <TableCell>{formatMonth(p.month)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(p.income)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatBRL(p.expense)}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-medium tabular-nums',
                      p.result < 0 && 'text-[var(--delta-bad)]',
                    )}
                  >
                    {formatBRL(p.result)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
