import { ServerOff } from 'lucide-react';
import { useApiHealth } from '@/hooks/useApiHealth';

/** Avisa quando o backend não responde, antes mesmo de o usuário tentar entrar. */
export function ApiStatusBanner() {
  const { offline } = useApiHealth();
  if (!offline) return null;
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-lg border border-[var(--delta-bad)]/40 bg-[var(--delta-bad)]/5 p-3 text-sm"
    >
      <ServerOff className="mt-0.5 size-4 shrink-0 text-[var(--delta-bad)]" />
      <div>
        <p className="font-medium">O backend não está respondendo</p>
        <p className="text-muted-foreground">
          Rode <code>npm run dev</code> na pasta <code>backend</code> (ou dê dois cliques em{' '}
          <code>iniciar.cmd</code>). Esta mensagem some sozinha quando ele subir.
        </p>
      </div>
    </div>
  );
}
