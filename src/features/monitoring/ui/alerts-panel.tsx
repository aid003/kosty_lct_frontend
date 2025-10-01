/**
 * Панель предупреждений и уведомлений
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { AlertTriangle, Bell, CheckCircle, X } from 'lucide-react';
import { useAIAlerts, type Alert } from '../hooks/use-ai-alerts';

function getAlertIcon(type: Alert['type']) {
  switch (type) {
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'info':
    default:
      return <Bell className="h-4 w-4 text-blue-500" />;
  }
}

function getAlertBadgeVariant(type: Alert['type']) {
  switch (type) {
    case 'error':
      return 'destructive' as const;
    case 'warning':
      return 'secondary' as const;
    case 'success':
      return 'default' as const;
    case 'info':
    default:
      return 'outline' as const;
  }
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
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  
  const unacknowledgedAlerts = allAlerts.filter(alert => !acknowledgedIds.has(alert.id));
  const acknowledgedAlerts = allAlerts.filter(alert => acknowledgedIds.has(alert.id));
  
  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedIds(prev => new Set([...prev, alertId]));
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Предупреждения</CardTitle>
            <CardDescription>Системные уведомления и события</CardDescription>
          </div>
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            {unacknowledgedAlerts.length} активных
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-6 pt-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
        {/* Активные предупреждения */}
        {unacknowledgedAlerts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Требуют внимания ({unacknowledgedAlerts.length})
            </h4>
            <ScrollArea className="h-48">
              <div className="space-y-3 pr-4">
                {unacknowledgedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50"
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-medium">{alert.title}</h5>
                        <Badge variant={getAlertBadgeVariant(alert.type)} className="text-xs">
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(alert.timestamp)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Подтвержденные уведомления */}
        {acknowledgedAlerts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Подтвержденные ({acknowledgedAlerts.length})
            </h4>
            <ScrollArea className="h-32">
              <div className="space-y-2 pr-4">
                {acknowledgedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-3 p-2 border rounded opacity-60"
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h5 className="text-sm font-medium">{alert.title}</h5>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Пустое состояние */}
        {allAlerts.length === 0 && (
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
