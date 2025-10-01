/**
 * Хук для генерации предупреждений из AI данных
 */

'use client';

import { useMemo } from 'react';
import { useLastAIMessage, useAIStatus } from '@/shared';

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  severity?: number;
}

export function useAIAlerts(): Alert[] {
  const lastMessage = useLastAIMessage();
  const aiStatus = useAIStatus();

  return useMemo(() => {
    const alerts: Alert[] = [];

    // Статус подключения
    if (aiStatus === 'connected') {
      alerts.push({
        id: 'connection-success',
        type: 'success',
        title: 'AI подключен',
        message: 'Система анализа данных активна',
        timestamp: new Date(),
        acknowledged: true,
      });
    } else if (aiStatus === 'error') {
      alerts.push({
        id: 'connection-error',
        type: 'error',
        title: 'Ошибка подключения AI',
        message: 'Не удается подключиться к системе анализа',
        timestamp: new Date(),
        acknowledged: false,
      });
    } else if (aiStatus === 'connecting') {
      alerts.push({
        id: 'connection-connecting',
        type: 'info',
        title: 'Подключение к AI',
        message: 'Установка соединения с системой анализа...',
        timestamp: new Date(),
        acknowledged: true,
      });
    }

    if (!lastMessage) return alerts;

    // Статус анализа
    const status = lastMessage.short_term.status;
    if (status === 'Тревога') {
      alerts.push({
        id: `status-alert-${lastMessage.time}`,
        type: 'error',
        title: 'Критический статус',
        message: `Обнаружена тревога в анализе данных`,
        timestamp: new Date(lastMessage.time * 1000),
        acknowledged: false,
      });
    } else if (status === 'Подозрение') {
      alerts.push({
        id: `status-warning-${lastMessage.time}`,
        type: 'warning',
        title: 'Подозрительная активность',
        message: `Требуется внимание: ${status}`,
        timestamp: new Date(lastMessage.time * 1000),
        acknowledged: false,
      });
    }

    // События с высокой severity
    lastMessage.short_term.events.forEach((event, index) => {
      if (event.severity > 0.7) {
        alerts.push({
          id: `event-high-${lastMessage.time}-${index}`,
          type: 'error',
          title: 'Высокая критичность события',
          message: `${event.type}: severity ${event.severity.toFixed(2)}`,
          timestamp: new Date(lastMessage.time * 1000),
          acknowledged: false,
          severity: event.severity,
        });
      } else if (event.severity > 0.4) {
        alerts.push({
          id: `event-medium-${lastMessage.time}-${index}`,
          type: 'warning',
          title: 'Средняя критичность события',
          message: `${event.type}: severity ${event.severity.toFixed(2)}`,
          timestamp: new Date(lastMessage.time * 1000),
          acknowledged: false,
          severity: event.severity,
        });
      }
    });

    // Долгосрочные риски
    if (lastMessage.long_term.hypoxia_60 > 0.8) {
      alerts.push({
        id: `hypoxia-high-${lastMessage.time}`,
        type: 'error',
        title: 'Высокий риск гипоксии',
        message: `Вероятность гипоксии 60: ${(lastMessage.long_term.hypoxia_60 * 100).toFixed(1)}%`,
        timestamp: new Date(lastMessage.time * 1000),
        acknowledged: false,
      });
    } else if (lastMessage.long_term.hypoxia_60 > 0.6) {
      alerts.push({
        id: `hypoxia-medium-${lastMessage.time}`,
        type: 'warning',
        title: 'Повышенный риск гипоксии',
        message: `Вероятность гипоксии 60: ${(lastMessage.long_term.hypoxia_60 * 100).toFixed(1)}%`,
        timestamp: new Date(lastMessage.time * 1000),
        acknowledged: false,
      });
    }

    if (lastMessage.long_term.emergency_30 > 0.7) {
      alerts.push({
        id: `emergency-high-${lastMessage.time}`,
        type: 'error',
        title: 'Высокий риск экстренной ситуации',
        message: `Вероятность экстренной ситуации 30: ${(lastMessage.long_term.emergency_30 * 100).toFixed(1)}%`,
        timestamp: new Date(lastMessage.time * 1000),
        acknowledged: false,
      });
    } else if (lastMessage.long_term.emergency_30 > 0.5) {
      alerts.push({
        id: `emergency-medium-${lastMessage.time}`,
        type: 'warning',
        title: 'Повышенный риск экстренной ситуации',
        message: `Вероятность экстренной ситуации 30: ${(lastMessage.long_term.emergency_30 * 100).toFixed(1)}%`,
        timestamp: new Date(lastMessage.time * 1000),
        acknowledged: false,
      });
    }

    // Сортируем по времени (новые сверху) и ограничиваем количество
    const sortedAlerts = alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Ограничиваем количество предупреждений для производительности
    const MAX_ALERTS = 50;
    return sortedAlerts.slice(0, MAX_ALERTS);
  }, [lastMessage, aiStatus]);
}
