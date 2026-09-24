import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useDeleteMovement } from '@/hooks/useMovements';
import { getErrorMessage } from '@/lib/api';
import type { Movement, MovementScope } from '@/types';

export function DeleteMovementDialog({
  movement,
  onClose,
}: {
  movement: Movement | null;
  onClose: () => void;
}) {
  const remove = useDeleteMovement();
  const [scope, setScope] = useState<MovementScope>('one');

  const isInstallment = !!movement?.installmentGroupId;

  const confirm = async () => {
    if (!movement) return;
    try {
      await remove.mutateAsync({ id: movement.id, scope });
      toast.success(scope === 'group' ? 'Parcelas excluídas' : 'Movimento excluído');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
    onClose();
  };

  return (
    <ConfirmDialog
      open={!!movement}
      onOpenChange={(o) => !o && onClose()}
      title={`Excluir "${movement?.description}"?`}
      description={
        movement?.recurringId
          ? 'Esta ocorrência do custo fixo não será recriada. Para parar os próximos meses, desative o custo fixo.'
          : undefined
      }
      onConfirm={confirm}
    >
      {isInstallment && (
        <ToggleGroup
          type="single"
          variant="outline"
          className="w-full"
          value={scope}
          onValueChange={(v) => v && setScope(v as MovementScope)}
        >
          <ToggleGroupItem value="one" className="flex-1">
            Só esta parcela
          </ToggleGroupItem>
          <ToggleGroupItem value="group" className="flex-1">
            Todas as {movement?.installmentTotal} parcelas
          </ToggleGroupItem>
        </ToggleGroup>
      )}
    </ConfirmDialog>
  );
}
