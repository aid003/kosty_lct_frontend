'use client';

import { useEffect } from 'react';
import {
  useBPMWebSocket,
  useUCWebSocket,
  useBPMData,
  useUCData,
  useSlidingWindow,
} from '@/shared';
import { ChartCard } from './chart-card';

// Настройки скользящего окна
const WINDOW_SIZE = 300; // 5 минут в секундах
const MAX_POINTS = 1000; // максимальное количество точек

export function RealtimeCharts() {
  useBPMWebSocket();
  useUCWebSocket();

  // Получаем все данные
  const allBpmData = useBPMData();
  const allUcData = useUCData();

  // Создаем скользящие окна
  const bpmWindow = useSlidingWindow(allBpmData, {
    windowSize: WINDOW_SIZE,
    maxPoints: MAX_POINTS,
  });

  const ucWindow = useSlidingWindow(allUcData, {
    windowSize: WINDOW_SIZE,
    maxPoints: MAX_POINTS,
  });

  // Обновляем время каждую секунду для скользящего окна
  useEffect(() => {
    const interval = setInterval(() => {
      bpmWindow.updateTime();
      ucWindow.updateTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [bpmWindow, ucWindow]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ChartCard
        title={`Heart Rate (BPM) - ${bpmWindow.dataCount} точек (${WINDOW_SIZE}с окно)`}
        data={bpmWindow.chartData}
        series={[{ label: 'BPM', color: 'rgb(59, 130, 246)' }]}
        yLabel="сек / BPM"
      />

      <ChartCard
        title={`Uterine Contractions (UC) - ${ucWindow.dataCount} точек (${WINDOW_SIZE}с окно)`}
        data={ucWindow.chartData}
        series={[{ label: 'UC', color: 'rgb(16, 185, 129)' }]}
        yLabel="сек / UC"
      />
    </div>
  );
}


