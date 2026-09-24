import { Badge } from '@/components/ui/badge';
import { METHOD_LABELS } from '@/lib/format';
import { METHOD_ICONS } from '@/lib/methods';
import type { PaymentMethod } from '@/types';

export function MethodBadge({ method }: { method: PaymentMethod }) {
  const Icon = METHOD_ICONS[method];
  return (
    <Badge variant="secondary" className="gap-1 font-normal">
      <Icon className="size-3" />
      {METHOD_LABELS[method]}
    </Badge>
  );
}
