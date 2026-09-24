export interface LegendItem {
  label: string;
  color: string;
  /** valor já formatado, opcional (serve de rótulo direto) */
  value?: string;
}

/** Legenda HTML: retângulo para barras/áreas; texto sempre na cor de texto, nunca na da série. */
export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: item.color }} />
          {item.label}
          {item.value && <span className="font-medium text-foreground">{item.value}</span>}
        </li>
      ))}
    </ul>
  );
}
