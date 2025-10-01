# 🚀 Быстрый старт с WebSocket

## Шаг 1: Настройка окружения

Создайте `.env.local`:

```env
NEXT_PUBLIC_WS_AI_URL=ws://localhost:8000/ws/ai
NEXT_PUBLIC_WS_BPM_URL=ws://localhost:8000/ws/bpm
NEXT_PUBLIC_WS_UC_URL=ws://localhost:8000/ws/uc
```

## Шаг 2: Простейший пример

Создайте файл `src/app/monitoring/page.tsx`:

```tsx
"use client";

import { useAllWebSockets, useLastBPMMessage } from "@/shared";

export default function MonitoringPage() {
  const { connectAll, disconnectAll, allConnected } = useAllWebSockets(false);
  const lastBPM = useLastBPMMessage();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Мониторинг</h1>

      <div className="space-x-2 mb-4">
        <button
          onClick={connectAll}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Подключиться
        </button>
        <button
          onClick={disconnectAll}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Отключиться
        </button>
      </div>

      <div className="p-4 border rounded">
        <h2 className="font-semibold">Частота сердцебиения</h2>
        {lastBPM ? (
          <p className="text-3xl">{lastBPM.value} BPM</p>
        ) : (
          <p>Нет данных</p>
        )}
      </div>
    </div>
  );
}
```

## Шаг 3: Запустите проект

```bash
npm run dev
```

Откройте http://localhost:3000/monitoring

## Готовые компоненты

### Использование готовой панели

```tsx
// src/app/dashboard/page.tsx
import { MonitoringDashboard } from "@/features";

export default function DashboardPage() {
  return <MonitoringDashboard />;
}
```

## Доступные хуки

```tsx
// Подключение к сокетам
useAIWebSocket(); // AI анализ
useBPMWebSocket(); // Частота сердцебиения
useUCWebSocket(); // Сокращения матки
useAllWebSockets(); // Все сокеты сразу

// Получение данных
useAIData(); // Все AI данные
useBPMData(); // Все BPM данные
useUCData(); // Все UC данные

// Последние сообщения
useLastAIMessage();
useLastBPMMessage();
useLastUCMessage();

// Статусы
useConnectionStatus();
useAllSocketsConnected();
```

## Формат данных

### AI Socket

```json
{
  "time": 1234,
  "short_term": {
    "status": "Норма",
    "events": [{ "type": "late_decel", "severity": 0.45 }]
  },
  "long_term": {
    "hypoxia_60": 0.59,
    "emergency_30": 0.55
  }
}
```

### BPM/UC Socket

```json
{
  "time_sec": 1234,
  "value": 98
}
```

## Типы TypeScript

Все типы автоматически экспортируются:

```tsx
import type {
  AISocketMessage,
  BPMSocketMessage,
  UCSocketMessage,
  AIStatus,
  SocketStatus,
} from "@/shared";
```

## Следующие шаги

- 📖 Читайте [WEBSOCKET_GUIDE.md](./WEBSOCKET_GUIDE.md) для подробной документации
- 💡 Смотрите [EXAMPLE_USAGE.md](./EXAMPLE_USAGE.md) для продвинутых примеров
- 🎨 Добавьте графики используя Chart.js, Recharts или Canvas API
