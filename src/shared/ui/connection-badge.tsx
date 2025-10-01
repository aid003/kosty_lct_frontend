/**
 * Shared UI: Badge для статуса подключения
 */

import { Badge } from '../components/ui/badge';
import type { SocketStatus } from '../types';

interface ConnectionBadgeProps {
  status: SocketStatus;
}

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const className =
    status === 'connected'
      ? 'border-slate-400 text-muted-foreground'
      : status === 'connecting'
        ? 'border-dashed border-slate-400 text-muted-foreground'
        : status === 'error'
          ? 'border-slate-700 text-slate-700'
          : 'border-slate-300 text-muted-foreground';

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
}
