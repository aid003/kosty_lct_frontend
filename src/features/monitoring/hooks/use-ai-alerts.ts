/**
 * Хук для генерации предупреждений из AI данных
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLastAIMessage, useAIStatus } from '@/shared';
import type { AISocketMessage, SocketStatus } from '@/shared/types';

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  severity?: number;
}

const MAX_ALERTS = 100;

function createConnectionAlert(status: SocketStatus): Alert | null {
  const base: Pick<Alert, 'timestamp' | 'acknowledged'> = {
    timestamp: new Date(),
    acknowledged: status !== 'error',
  };

  switch (status) {
    case 'connected':
      return {
        id: `connection-${status}-${base.timestamp.getTime()}`,
        type: 'info',
        title: 'AI подключен',
        message: 'Система анализа данных активна',
        ...base,
      };
    case 'connecting':
      return {
        id: `connection-${status}-${base.timestamp.getTime()}`,
        type: 'info',
        title: 'Подключение к AI',
        message: 'Устанавливаем соединение с системой анализа',
        ...base,
      };
    case 'error':
      return {
        id: `connection-${status}-${base.timestamp.getTime()}`,
        type: 'error',
        title: 'Ошибка подключения AI',
        message: 'Не удается подключиться к системе анализа',
        ...base,
        acknowledged: false,
      };
    case 'disconnected':
    default:
      return {
        id: `connection-${status}-${base.timestamp.getTime()}`,
        type: 'info',
        title: 'Соединение разорвано',
        message: 'Ожидаем новое подключение к системе анализа',
        ...base,
      };
  }
}

function buildAlertsFromMessage(message: AISocketMessage): Alert[] {
  const alerts: Alert[] = [];
  const timestamp = new Date(message.time * 1000);

  const status = message.short_term.status;
  if (status === 'Тревога') {
    alerts.push({
      id: `status-alert-${message.time}`,
      type: 'error',
      title: 'Критический статус',
      message: 'Обнаружена тревога в анализе данных',
      timestamp,
      acknowledged: false,
    });
  } else if (status === 'Подозрение') {
    alerts.push({
      id: `status-warning-${message.time}`,
      type: 'warning',
      title: 'Подозрительная активность',
      message: `Требуется внимание: ${status}`,
      timestamp,
      acknowledged: false,
    });
  }

  message.short_term.events.forEach((event, index) => {
    if (event.severity > 0.7) {
      alerts.push({
        id: `event-high-${message.time}-${index}`,
        type: 'error',
        title: 'Высокий риск события',
        message: `${event.type}: уровень ${event.severity.toFixed(2)}`,
        timestamp,
        acknowledged: false,
        severity: event.severity,
      });
    } else if (event.severity > 0.4) {
      alerts.push({
        id: `event-medium-${message.time}-${index}`,
        type: 'warning',
        title: 'Повышенное внимание к событию',
        message: `${event.type}: уровень ${event.severity.toFixed(2)}`,
        timestamp,
        acknowledged: false,
        severity: event.severity,
      });
    }
  });

  if (message.long_term.hypoxia_60 > 0.8) {
    alerts.push({
      id: `hypoxia-high-${message.time}`,
      type: 'error',
      title: 'Высокий риск гипоксии',
      message: `Вероятность гипоксии 60 мин: ${(message.long_term.hypoxia_60 * 100).toFixed(1)}%`,
      timestamp,
      acknowledged: false,
    });
  } else if (message.long_term.hypoxia_60 > 0.6) {
    alerts.push({
      id: `hypoxia-medium-${message.time}`,
      type: 'warning',
      title: 'Повышенный риск гипоксии',
      message: `Вероятность гипоксии 60 мин: ${(message.long_term.hypoxia_60 * 100).toFixed(1)}%`,
      timestamp,
      acknowledged: false,
    });
  }

  if (message.long_term.emergency_30 > 0.7) {
    alerts.push({
      id: `emergency-high-${message.time}`,
      type: 'error',
      title: 'Высокий риск экстренной ситуации',
      message: `Вероятность экстренной ситуации 30 мин: ${(message.long_term.emergency_30 * 100).toFixed(1)}%`,
      timestamp,
      acknowledged: false,
    });
  } else if (message.long_term.emergency_30 > 0.5) {
    alerts.push({
      id: `emergency-medium-${message.time}`,
      type: 'warning',
      title: 'Повышенный риск экстренной ситуации',
      message: `Вероятность экстренной ситуации 30 мин: ${(message.long_term.emergency_30 * 100).toFixed(1)}%`,
      timestamp,
      acknowledged: false,
    });
  }

  return alerts;
}

export function useAIAlerts(): Alert[] {
  const lastMessage = useLastAIMessage();
  const aiStatus = useAIStatus();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const alertsRef = useRef<Map<string, Alert>>(new Map());
  const lastStatusRef = useRef<SocketStatus | null>(null);
  const lastMessageSignatureRef = useRef<string | null>(null);

  const upsertAlerts = useCallback((incoming: Alert[]) => {
    if (!incoming.length) return;

    const map = new Map(alertsRef.current);
    let changed = false;

    incoming.forEach((alert) => {
      const existing = map.get(alert.id);
      if (!existing || existing.timestamp.getTime() !== alert.timestamp.getTime()) {
        map.set(alert.id, alert);
        changed = true;
      }
    });

    if (!changed) return;

    const sorted = Array.from(map.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    const limited = sorted.slice(0, MAX_ALERTS);

    alertsRef.current = new Map(limited.map((alert) => [alert.id, alert]));
    setAlerts(limited);
  }, []);

  useEffect(() => {
    if (!aiStatus) return;
    if (lastStatusRef.current === aiStatus) return;

    const alert = createConnectionAlert(aiStatus);
    lastStatusRef.current = aiStatus;

    if (alert) {
      upsertAlerts([alert]);
    }
  }, [aiStatus, upsertAlerts]);

  useEffect(() => {
    if (!lastMessage) return;

    const signature = [
      lastMessage.time,
      lastMessage.short_term.status,
      lastMessage.short_term.events
        .map((event) => `${event.type}:${event.severity.toFixed(2)}`)
        .join('|'),
      lastMessage.long_term.hypoxia_60.toFixed(2),
      lastMessage.long_term.emergency_30.toFixed(2),
    ].join('-');

    if (lastMessageSignatureRef.current === signature) return;

    lastMessageSignatureRef.current = signature;
    const derived = buildAlertsFromMessage(lastMessage);
    upsertAlerts(derived);
  }, [lastMessage, upsertAlerts]);

  return alerts;
}
