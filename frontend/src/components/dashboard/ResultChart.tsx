import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { niceTicks } from '@/lib/chartTicks';
import { CHART } from '@/lib/chartColors';
import { formatBRL, formatBRLCompact, formatMonth, formatMonthShort } from '@/lib/format';
import type { Dashboard } from '@/types';
import { ChartLegend } from './ChartLegend';
import { ChartTooltipBox } from './ChartTooltip';

interface Point {
  month: string;
  label: string;
  result: number;
}

/** Barra com a ponta de dado arredondada (4px) e a base reta, para valores positivos e negativos. */
function DivergingBar(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: Point;
}) {
  const { x = 0, y = 0, width = 0, fill } = props;
  const height = props.height ?? 0;
  if (!width || !height) return null;
  const top = Math.min(y, y + height);
  const h = Math.abs(height);
  const r = Math.min(4, h, width / 2);
  const negative = (props.payload?.result ?? 0) < 0;
  const d = negative
    ? // base reta em cima (linha do zero), ponta arredondada embaixo
      `M${x},${top} h${width} v${h - r} q0,${r} -${r},${r} h-${width - 2 * r} q-${r},0 -${r},-${r} Z`
    : `M${x},${top + h} v-${h - r} q0,-${r} ${r},-${r} h${width - 2 * r} q${r},0 ${r},${r} v${h - r} Z`;
  return <path d={d} fill={fill} />;
}

function ResultTooltip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <ChartTooltipBox
      title={formatMonth(point.month)}
      rows={[
        {
          label: point.result >= 0 ? 'sobrou' : 'faltou',
          value: point.result,
          color: point.result >= 0 ? CHART.pos : CHART.neg,
        },
      ]}
    />
  );
}

/** Resultado (entradas − saídas) por mês: divergente em torno do zero. */
export function ResultChart({ history }: { history: Dashboard['history'] }) {
  const data: Point[] = history.map((h) => ({
    month: h.month,
    label: formatMonthShort(h.month),
    result: h.result,
  }));
  const positives = data.filter((d) => d.result > 0).length;
  const withData = data.filter((d) => d.result !== 0).length;

  const yTicks = niceTicks(data.map((d) => d.result));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sobrou ou faltou?</CardTitle>
        <CardDescription>
          Resultado mensal · {positives} de {withData} {withData === 1 ? 'mês' : 'meses'} no azul
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ChartLegend
          items={[
            { label: 'Sobrou', color: CHART.pos },
            { label: 'Faltou', color: CHART.neg },
          ]}
        />
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, left: 4, right: 4 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
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
              <ReferenceLine y={0} stroke={CHART.axis} />
              <Tooltip content={<ResultTooltip />} cursor={{ fill: CHART.grid, opacity: 0.5 }} />
              <Bar dataKey="result" maxBarSize={24} shape={<DivergingBar />}>
                {data.map((d) => (
                  <Cell key={d.month} fill={d.result >= 0 ? CHART.pos : CHART.neg} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="sr-only">
          {data.map((d) => `${formatMonth(d.month)}: ${formatBRL(d.result)}`).join('; ')}
        </p>
      </CardContent>
    </Card>
  );
}
