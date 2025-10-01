"use client";

import { RealtimeCharts } from "@/features/monitoring/ui/realtime-charts";
import { AIPanel } from "@/features/monitoring/ui/ai-panel";
import { AlertsPanel } from "@/features/monitoring/ui/alerts-panel";

export default function MonitoringPage() {
  return (
    <main className="h-screen flex flex-col p-6 gap-6 overflow-hidden">
      <h1 className="text-2xl font-bold flex-shrink-0">Мониторинг</h1>
      {/* Нижний ряд: Графики */}
      <div className="flex-shrink-0">
        <RealtimeCharts />
      </div>

      {/* Верхний ряд: AI Analysis и Alerts */}
      <div className="grid gap-6 lg:grid-cols-2 flex-1 min-h-0">
        <AIPanel />
        <AlertsPanel />
      </div>
    </main>
  );
}
