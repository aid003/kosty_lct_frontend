"use client";

import { useAIWebSocket, useLastAIMessage, useAIStatus } from "@/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { ConnectionBadge } from "@/shared/ui/connection-badge";
import { StatusIndicator } from "@/shared/ui/status-indicator";
import { AIEventsList } from "./ai-events-list";


export function AIPanel() {
  useAIWebSocket();
  const last = useLastAIMessage();
  const aiStatus = useAIStatus();

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>Статус и вероятности</CardDescription>
          </div>
          <ConnectionBadge status={aiStatus} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-6 pt-0">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {last?.short_term.status && (
              <StatusIndicator status={last.short_term.status} />
            )}

            <div>
              <div className="text-sm text-muted-foreground mb-2">События</div>
              <AIEventsList events={last?.short_term.events ?? []} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Hypoxia 60
                  </span>
                  <span className="text-sm font-medium">
                    {last
                      ? `${(last.long_term.hypoxia_60 * 100).toFixed(1)}%`
                      : "—"}
                  </span>
                </div>
                <Progress
                  className="bg-muted/40"
                  indicatorClassName="bg-slate-500"
                  value={
                    last
                      ? Math.max(
                          0,
                          Math.min(100, last.long_term.hypoxia_60 * 100)
                        )
                      : 0
                  }
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Emergency 30
                  </span>
                  <span className="text-sm font-medium">
                    {last
                      ? `${(last.long_term.emergency_30 * 100).toFixed(1)}%`
                      : "—"}
                  </span>
                </div>
                <Progress
                  className="bg-muted/40"
                  indicatorClassName="bg-slate-500"
                  value={
                    last
                      ? Math.max(
                          0,
                          Math.min(100, last.long_term.emergency_30 * 100)
                        )
                      : 0
                  }
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
