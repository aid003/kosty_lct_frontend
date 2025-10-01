/**
 * Shared UI: Индикатор статуса с цветом
 */

import type { AIStatus } from '../types';

interface StatusIndicatorProps {
  status: AIStatus;
}

function statusColor(status: AIStatus): string {
  switch (status) {
    case 'Тревога':
      return 'bg-red-500';
    case 'Подозрение':
      return 'bg-yellow-500';
    case 'Норма':
    default:
      return 'bg-green-500';
  }
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-2 w-2 rounded-full ${statusColor(status)}`} />
      <span className="text-sm text-muted-foreground">Краткосрочный статус:</span>
      <span className="font-medium text-sm">{status}</span>
    </div>
  );
}

