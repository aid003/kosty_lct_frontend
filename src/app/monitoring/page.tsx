"use client";

import { RealtimeCharts } from "@/features/monitoring/ui/realtime-charts";
import { AIPanel } from "@/features/monitoring/ui/ai-panel";
import { AlertsPanel } from "@/features/monitoring/ui/alerts-panel";
import { AppSidebarLayout } from "@/widgets";

export default function MonitoringPage() {
  return (
    <AppSidebarLayout title="Мониторинг" contentClassName="gap-6 overflow-hidden">
      <div className="flex-shrink-0">
        <RealtimeCharts />
      </div>

      <div className="grid flex-1 min-h-0 gap-6 lg:grid-cols-2">
        <AIPanel />
        <AlertsPanel />
      </div>
    </AppSidebarLayout>
  );
}
