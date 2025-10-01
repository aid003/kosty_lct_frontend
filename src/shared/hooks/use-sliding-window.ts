/**
 * Хук для управления скользящим окном данных
 */

'use client';

import { useState, useCallback, useMemo } from 'react';

interface SlidingWindowOptions {
  windowSize: number; // размер окна в секундах
  maxPoints: number; // максимальное количество точек
}

interface DataPoint {
  time_sec: number;
  value: number;
}

export function useSlidingWindow<T extends DataPoint>(
  data: T[],
  options: SlidingWindowOptions
) {
  const { windowSize, maxPoints } = options;
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Вычисляем данные для скользящего окна
  const windowData = useMemo(() => {
    if (data.length === 0) return [];

    const now = Date.now() / 1000;
    const windowStart = now - windowSize;
    
    // Фильтруем данные по времени
    const filteredData = data.filter(point => point.time_sec >= windowStart);
    
    // Ограничиваем количество точек
    const limitedData = filteredData.length > maxPoints 
      ? filteredData.slice(-maxPoints)
      : filteredData;

    return limitedData;
  }, [data, windowSize, maxPoints]);

  // Обновляем текущее время
  const updateTime = useCallback(() => {
    setCurrentTime(Date.now() / 1000);
  }, []);

  // Получаем данные для отображения на графике
  const chartData = useMemo(() => {
    if (windowData.length === 0) return [[], []] as Array<Array<number | null>>;
    
    const t0 = windowData[0].time_sec;
    const x = windowData.map((p) => p.time_sec - t0);
    const y = windowData.map((p) => p.value);
    
    return [x, y] as Array<Array<number | null>>;
  }, [windowData]);

  return {
    windowData,
    chartData,
    currentTime,
    updateTime,
    windowSize,
    dataCount: windowData.length,
  };
}
