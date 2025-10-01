/**
 * Панель предупреждений и уведомлений
 */

'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { AlertTriangle, Bell, Circle, Info, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAIAlerts, type Alert } from '../hooks/use-ai-alerts';

const ALERT_STYLES: Record<Alert['type'], { icon: LucideIcon; label: string; accent: string }> = {
  error: {
    icon: AlertTriangle,
    label: 'Критично',
    accent: 'border-l-slate-500',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Важно',
    accent: 'border-l-slate-400',
  },
  info: {
    icon: Info,
    label: 'Информация',
    accent: 'border-l-slate-300',
  },
  success: {
    icon: Circle,
    label: 'Событие',
    accent: 'border-l-slate-300',
  },
};

function renderAlertIcon(type: Alert['type']) {
  const Icon = ALERT_STYLES[type]?.icon ?? Bell;
  return <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />;
}

function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return `${seconds}с назад`;
  if (minutes < 60) return `${minutes}м назад`;
  if (hours < 24) return `${hours}ч назад`;
  return timestamp.toLocaleDateString();
}

export function AlertsPanel() {
  const allAlerts = useAIAlerts();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = allAlerts.filter((alert) => !dismissedIds.has(alert.id));

  const handleDismiss = (alertId: string) => {
    setDismissedIds((prev) => new Set([...prev, alertId]));
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Предупреждения</CardTitle>
            <CardDescription>Системные уведомления и события</CardDescription>
          </div>
          <Badge
            variant="outline"
            className="border-muted-foreground/30 text-muted-foreground"
          >
            {visibleAlerts.length} активных
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-6 pt-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
        {/* Активные предупреждения */}
        {visibleAlerts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Требуют внимания ({visibleAlerts.length})
            </h4>
            <ScrollArea className="h-48">
              <div className="space-y-3 pr-4">
                {visibleAlerts.map((alert) => {
                  const tone = ALERT_STYLES[alert.type] ?? ALERT_STYLES.info;
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 rounded-lg border border-slate-200 bg-muted/40 p-3 shadow-sm border-l-4 ${tone.accent}`}
                    >
                      {renderAlertIcon(alert.type)}
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="text-sm font-medium leading-tight">
                            {alert.title}
                          </h5>
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase tracking-wide text-muted-foreground"
                          >
                            {tone.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(alert.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground"
                        onClick={() => handleDismiss(alert.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Пустое состояние */}
        {visibleAlerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Нет активных предупреждений</p>
          </div>
        )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
