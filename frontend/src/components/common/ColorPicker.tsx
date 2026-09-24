import { Check } from 'lucide-react';
import { SWATCHES } from '@/lib/colors';
import { cn } from '@/lib/utils';

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cor">
      {SWATCHES.map((color) => (
        <button
          key={color}
          type="button"
          role="radio"
          aria-checked={value === color}
          aria-label={color}
          onClick={() => onChange(color)}
          className={cn(
            'grid size-7 place-items-center rounded-full ring-offset-2 ring-offset-background transition',
            value === color && 'ring-2 ring-foreground',
          )}
          style={{ backgroundColor: color }}
        >
          {value === color && <Check className="size-3.5 text-white" />}
        </button>
      ))}
    </div>
  );
}
