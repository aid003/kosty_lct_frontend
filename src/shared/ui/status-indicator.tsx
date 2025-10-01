/**
 * Shared UI: Индикатор статуса с цветом
 */

import type { AIStatus } from '../types';

interface StatusIndicatorProps {
  status: AIStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const tone =
    status === 'Тревога'
      ? 'bg-slate-700'
      : status === 'Подозрение'
        ? 'bg-slate-500'
        : 'bg-slate-300';

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${tone}`} />
      <span className="text-sm text-muted-foreground">Краткосрочный статус:</span>
      <span className="font-medium text-sm">{status}</span>
    </div>
  );
}
