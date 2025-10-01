/**
 * Компонент списка событий AI
 */

'use client';

import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import type { AIEvent } from '@/shared';

interface AIEventsListProps {
  events: AIEvent[];
}

export function AIEventsList({ events }: AIEventsListProps) {
  if (!events || events.length === 0) {
    return (
      <div className="h-32 rounded border flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Нет событий</div>
      </div>
    );
  }

  // Сортируем события по severity (высокие сверху)
  const sortedEvents = [...events].sort((a, b) => b.severity - a.severity);

  return (
    <ScrollArea className="h-32 rounded border">
      <div className="p-3 space-y-3">
        {sortedEvents.map((e, idx) => (
          <div key={`${e.type}-${idx}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs uppercase tracking-wide text-muted-foreground"
                >
                  {e.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  severity: {e.severity.toFixed(2)}
                </span>
              </div>
            </div>
            <Progress
              className="bg-muted/40"
              indicatorClassName="bg-slate-500"
              value={Math.max(0, Math.min(100, e.severity * 100))}
            />
            {idx < sortedEvents.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
