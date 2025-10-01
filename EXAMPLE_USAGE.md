# Примеры использования WebSocket

## Быстрый старт

### 1. Простой компонент с автоподключением

```tsx
"use client";

import { useAIWebSocket, useLastAIMessage } from "@/shared";

export function AIMonitor() {
  const { status } = useAIWebSocket(); // Автоматически подключается
  const lastMessage = useLastAIMessage();

  return (
    <div>
      <p>Статус: {status}</p>
      {lastMessage && (
        <div>
          <h3>Анализ ИИ</h3>
          <p>Статус: {lastMessage.short_term.status}</p>
          <p>События: {lastMessage.short_term.events.length}</p>
          <p>
            Гипоксия: {(lastMessage.long_term.hypoxia_60 * 100).toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}
```

### 2. Компонент с графиком BPM

```tsx
"use client";

import { useBPMWebSocket, useRecentBPMData } from "@/shared";

export function BPMChart() {
  const { isConnected } = useBPMWebSocket();
  const last100Points = useRecentBPMData(100);

  return (
    <div>
      <h2>Частота сердцебиения</h2>
      <p>{isConnected ? "🟢 Подключено" : "🔴 Отключено"}</p>

      <div className="chart">
        {last100Points.map((point, i) => (
          <div key={i}>
            {point.time_sec}s: {point.value} BPM
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Полная панель мониторинга

```tsx
"use client";

import {
  useAllWebSockets,
  useAIData,
  useBPMData,
  useUCData,
  useWebSocketActions,
} from "@/shared";
import { Button } from "@/shared/components/ui/button";

export function FullDashboard() {
  const { connectAll, disconnectAll, allConnected, ai, bpm, uc } =
    useAllWebSockets(false);

  const aiData = useAIData();
  const bpmData = useBPMData();
  const ucData = useUCData();

  const { clearAllData } = useWebSocketActions();

  return (
    <div className="space-y-4">
      {/* Управление */}
      <div className="flex gap-2">
        <Button onClick={connectAll} disabled={allConnected}>
          Подключить всё
        </Button>
        <Button onClick={disconnectAll} variant="outline">
          Отключить всё
        </Button>
        <Button onClick={clearAllData} variant="destructive">
          Очистить данные
        </Button>
      </div>

      {/* Статусы */}
      <div className="grid grid-cols-3 gap-4">
        <StatusCard title="AI" status={ai.status} count={aiData.length} />
        <StatusCard title="BPM" status={bpm.status} count={bpmData.length} />
        <StatusCard title="UC" status={uc.status} count={ucData.length} />
      </div>
    </div>
  );
}

function StatusCard({
  title,
  status,
  count,
}: {
  title: string;
  status: string;
  count: number;
}) {
  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold">{title}</h3>
      <p>Статус: {status}</p>
      <p>Данных: {count}</p>
    </div>
  );
}
```

### 4. Использование в странице Next.js

```tsx
// app/monitoring/page.tsx
import { MonitoringDashboard } from "@/features";

export default function MonitoringPage() {
  return (
    <main>
      <MonitoringDashboard />
    </main>
  );
}
```

## Продвинутые примеры

### График с Canvas

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useBPMData, useBPMWebSocket } from "@/shared";

export function BPMCanvasChart() {
  useBPMWebSocket();
  const data = useBPMData();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Очистка
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Настройка
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const valueRange = maxValue - minValue || 1;

    // Рисуем график
    ctx.beginPath();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;

    data.forEach((point, i) => {
      const x = padding + (i / (data.length - 1)) * width;
      const y =
        padding + height - ((point.value - minValue) / valueRange) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={400}
      className="border rounded"
    />
  );
}
```

### Реактивные уведомления

```tsx
"use client";

import { useEffect } from "react";
import { useLastAIMessage, useAIWebSocket } from "@/shared";
import { useToast } from "@/shared/hooks/use-toast";

export function AIAlerts() {
  useAIWebSocket();
  const lastMessage = useLastAIMessage();
  const { toast } = useToast();

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.short_term.status === "Тревога") {
      toast({
        title: "⚠️ Тревога!",
        description: `Обнаружено событий: ${lastMessage.short_term.events.length}`,
        variant: "destructive",
      });
    } else if (lastMessage.short_term.status === "Подозрение") {
      toast({
        title: "⚡ Внимание",
        description: "Обнаружены подозрительные паттерны",
      });
    }
  }, [lastMessage, toast]);

  return null; // Компонент только для уведомлений
}
```

### Экспорт данных в CSV

```tsx
"use client";

import { useBPMData } from "@/shared";

export function ExportButton() {
  const bpmData = useBPMData();

  const exportToCSV = () => {
    const csv = [
      "Time (sec),BPM",
      ...bpmData.map((d) => `${d.time_sec},${d.value}`),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bpm-data-${Date.now()}.csv`;
    a.click();
  };

  return <button onClick={exportToCSV}>Экспорт BPM в CSV</button>;
}
```

### Статистика в реальном времени

```tsx
"use client";

import { useMemo } from "react";
import { useBPMData, useBPMWebSocket } from "@/shared";

export function BPMStats() {
  useBPMWebSocket();
  const data = useBPMData();

  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map((d) => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const current = values[values.length - 1];

    return { avg, max, min, current };
  }, [data]);

  if (!stats) return <p>Нет данных</p>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Текущий" value={stats.current} unit="BPM" />
      <StatCard title="Средний" value={stats.avg.toFixed(1)} unit="BPM" />
      <StatCard title="Максимум" value={stats.max} unit="BPM" />
      <StatCard title="Минимум" value={stats.min} unit="BPM" />
    </div>
  );
}

function StatCard({
  title,
  value,
  unit,
}: {
  title: string;
  value: string | number;
  unit: string;
}) {
  return (
    <div className="p-4 border rounded">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">
        {value} <span className="text-sm font-normal">{unit}</span>
      </p>
    </div>
  );
}
```

## Интеграция с популярными библиотеками

### Chart.js

```tsx
"use client";

import { Line } from "react-chartjs-2";
import { useBPMData, useBPMWebSocket } from "@/shared";

export function ChartJSExample() {
  useBPMWebSocket();
  const data = useBPMData();

  const chartData = {
    labels: data.map((d) => d.time_sec),
    datasets: [
      {
        label: "BPM",
        data: data.map((d) => d.value),
        borderColor: "rgb(59, 130, 246)",
        tension: 0.1,
      },
    ],
  };

  return <Line data={chartData} />;
}
```

### Recharts

```tsx
"use client";

import { LineChart, Line, XAxis, YAxis } from "recharts";
import { useBPMData, useBPMWebSocket } from "@/shared";

export function RechartsExample() {
  useBPMWebSocket();
  const data = useBPMData();

  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="time_sec" />
      <YAxis />
      <Line type="monotone" dataKey="value" stroke="#3b82f6" />
    </LineChart>
  );
}
```
