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
      ? 'text-green-600 border-green-600'
      : status === 'connecting'
        ? 'text-yellow-600 border-yellow-600'
        : status === 'error'
          ? 'text-red-600 border-red-600'
          : '';

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
}

