"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useBPMWebSocket,
  useUCWebSocket,
  useBPMData,
  useUCData,
  useSlidingWindow,
} from "@/shared";
import { ChartCard } from "./chart-card";
import { Button } from "@/shared/components/ui/button";

// Настройки скользящего окна
const WINDOW_SIZE = 100; // 5 минут в секундах
const MAX_POINTS = 250; // максимальное количество точек

type ChartMode = "window" | "scroll";

function toChartData(points: Array<{ time_sec: number; value: number }>) {
  if (!points.length) {
    return [[], []] as Array<Array<number | null>>;
  }

  const base = points[0]?.time_sec ?? 0;
  const xs = points.map((p) => p.time_sec - base);
  const ys = points.map((p) => p.value);

  return [xs, ys] as Array<Array<number | null>>;
}

export function RealtimeCharts() {
  const [mode, setMode] = useState<ChartMode>("window");

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

  const {
    chartData: bpmWindowChartData,
    dataCount: bpmWindowPoints,
    updateTime: updateBpmWindowTime,
  } = bpmWindow;
  const {
    chartData: ucWindowChartData,
    dataCount: ucWindowPoints,
    updateTime: updateUcWindowTime,
  } = ucWindow;

  const bpmFullChartData = useMemo(() => toChartData(allBpmData), [allBpmData]);
  const ucFullChartData = useMemo(() => toChartData(allUcData), [allUcData]);

  const bpmChartData =
    mode === "window" ? bpmWindowChartData : bpmFullChartData;
  const ucChartData = mode === "window" ? ucWindowChartData : ucFullChartData;

  const bpmPoints = mode === "window" ? bpmWindowPoints : allBpmData.length;
  const ucPoints = mode === "window" ? ucWindowPoints : allUcData.length;

  const subtitle =
    mode === "window" ? `${WINDOW_SIZE}с окно` : "горизонтальный скролл";

  const scrollable = mode === "scroll";

  // Обновляем время каждую секунду для скользящего окна
  useEffect(() => {
    if (mode !== "window") {
      return;
    }

    const interval = setInterval(() => {
      updateBpmWindowTime();
      updateUcWindowTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, updateBpmWindowTime, updateUcWindowTime]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">Режим отображения</div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "window" ? "default" : "outline"}
            onClick={() => setMode("window")}
          >
            Скользящее окно
          </Button>
          <Button
            size="sm"
            variant={mode === "scroll" ? "default" : "outline"}
            onClick={() => setMode("scroll")}
          >
            Горизонтальный скролл
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title={`Heart Rate (BPM)`}
          data={bpmChartData}
          series={[{ label: "BPM", color: "rgb(59, 130, 246)" }]}
          yLabel="сек / BPM"
          scrollable={scrollable}
          pixelsPerSecond={scrollable ? 6 : undefined}
        />

        <ChartCard
          title={`Uterine Contractions (UC)`}
          data={ucChartData}
          series={[{ label: "UC", color: "rgb(16, 185, 129)" }]}
          yLabel="сек / UC"
          scrollable={scrollable}
          pixelsPerSecond={scrollable ? 6 : undefined}
        />
      </div>
    </div>
  );
}
