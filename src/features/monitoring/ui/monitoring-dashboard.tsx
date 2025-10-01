/**
 * Компонент панели мониторинга
 */

'use client';

import {
  useAllWebSockets,
  useAIData,
  useBPMData,
  useUCData,
  useLastAIMessage,
  useLastBPMMessage,
  useLastUCMessage,
  useConnectionStatus,
} from '@/shared';
import { Button } from '@/shared/components/ui/button';

/**
 * Панель мониторинга с подключением к WebSocket
 */
export function MonitoringDashboard() {
  const { connectAll, disconnectAll, allConnected } = useAllWebSockets(false);
  const connectionStatus = useConnectionStatus();

  const aiData = useAIData();
  const bpmData = useBPMData();
  const ucData = useUCData();

  const lastAI = useLastAIMessage();
  const lastBPM = useLastBPMMessage();
  const lastUC = useLastUCMessage();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Панель мониторинга</h1>
        <div className="flex gap-2">
          <Button onClick={connectAll} disabled={allConnected}>
            Подключиться
          </Button>
          <Button onClick={disconnectAll} variant="outline">
            Отключиться
          </Button>
        </div>
      </div>

      {/* Статусы подключений */}
      <div className="grid grid-cols-3 gap-4">
        <StatusCard title="AI" status={connectionStatus.ai} />
        <StatusCard title="BPM" status={connectionStatus.bpm} />
        <StatusCard title="UC" status={connectionStatus.uc} />
      </div>

      {/* Последние данные */}
      <div className="grid grid-cols-3 gap-4">
        <DataCard title="AI Analysis" data={lastAI}>
          {lastAI && (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Статус:</strong> {lastAI.short_term.status}
              </p>
              <p>
                <strong>События:</strong> {lastAI.short_term.events.length}
              </p>
              <p>
                <strong>Hypoxia 60:</strong>{' '}
                {(lastAI.long_term.hypoxia_60 * 100).toFixed(1)}%
              </p>
              <p>
                <strong>Emergency 30:</strong>{' '}
                {(lastAI.long_term.emergency_30 * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </DataCard>

        <DataCard title="Heart Rate (BPM)" data={lastBPM}>
          {lastBPM && (
            <div className="text-3xl font-bold">{lastBPM.value} BPM</div>
          )}
        </DataCard>

        <DataCard title="Uterine Contractions" data={lastUC}>
          {lastUC && (
            <div className="text-3xl font-bold">{lastUC.value}</div>
          )}
        </DataCard>
      </div>

      {/* Статистика данных */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">AI данных</h3>
          <p className="text-2xl font-bold">{aiData.length}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">BPM данных</h3>
          <p className="text-2xl font-bold">{bpmData.length}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">UC данных</h3>
          <p className="text-2xl font-bold">{ucData.length}</p>
        </div>
      </div>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
}

function StatusCard({ title, status }: StatusCardProps) {
  const statusColors = {
    connected: 'bg-slate-400',
    connecting: 'bg-slate-300',
    disconnected: 'bg-slate-500',
    error: 'bg-slate-700',
  } as const;

  const statusLabels = {
    connected: 'Подключено',
    connecting: 'Подключение...',
    disconnected: 'Отключено',
    error: 'Ошибка',
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
        <span className="text-sm">{statusLabels[status]}</span>
      </div>
    </div>
  );
}

interface DataCardProps {
  title: string;
  data: unknown;
  children?: React.ReactNode;
}

function DataCard({ title, data, children }: DataCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-4">{title}</h3>
      {data ? (
        children
      ) : (
        <p className="text-muted-foreground text-sm">Нет данных</p>
      )}
    </div>
  );
}
