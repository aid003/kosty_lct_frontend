# Руководство по работе с WebSocket

## Обзор

В проекте реализована полная поддержка WebSocket для получения медицинских данных в реальном времени. Реализовано три типа сокетов:

- **AI Socket** - анализ данных ИИ (статус, события, долгосрочный анализ)
- **BPM Socket** - частота сердцебиения
- **UC Socket** - сокращения матки

## Архитектура

Реализация следует принципам **Feature-Sliced Design**:

```
src/
├── shared/
│   ├── types/          # Типы WebSocket сообщений
│   ├── api/            # WebSocket клиенты
│   ├── store/          # Zustand store для данных
│   ├── hooks/          # React хуки для работы с сокетами
│   └── config/         # Конфигурация URL
└── features/
    └── monitoring/     # Пример использования
```

## Типы данных

### AI Socket Message

```typescript
interface AISocketMessage {
  time: number;
  short_term: {
    status: "Норма" | "Подозрение" | "Тревога";
    events: Array<{
      type: "late_decel" | "low_variability" | ...;
      severity: number;
    }>;
  };
  long_term: {
    hypoxia_60: number;
    emergency_30: number;
  };
}
```

### BPM/UC Socket Message

```typescript
interface BPMSocketMessage {
  time_sec: number;
  value: number;
}

interface UCSocketMessage {
  time_sec: number;
  value: number;
}
```

## Использование

### 1. Базовое использование хуков

```typescript
"use client";

import { useAIWebSocket, useAIData, useLastAIMessage } from "@/shared";

export function MyComponent() {
  // Автоматическое подключение при монтировании
  const { status, isConnected } = useAIWebSocket();

  // Получение данных из store
  const aiData = useAIData();
  const lastMessage = useLastAIMessage();

  return (
    <div>
      <p>Статус: {status}</p>
      <p>Всего данных: {aiData.length}</p>
      {lastMessage && <p>Последний статус: {lastMessage.short_term.status}</p>}
    </div>
  );
}
```

### 2. Ручное управление подключением

```typescript
"use client";

import { useAIWebSocket } from "@/shared";

export function MyComponent() {
  // autoConnect = false - не подключаться автоматически
  const { connect, disconnect, isConnected } = useAIWebSocket(false);

  return (
    <div>
      <button onClick={connect}>Подключиться</button>
      <button onClick={disconnect}>Отключиться</button>
      <p>{isConnected ? "Подключено" : "Отключено"}</p>
    </div>
  );
}
```

### 3. Работа со всеми сокетами

```typescript
"use client";

import { useAllWebSockets } from "@/shared";

export function Dashboard() {
  const { ai, bpm, uc, connectAll, disconnectAll, allConnected } =
    useAllWebSockets(false);

  return (
    <div>
      <button onClick={connectAll}>Подключить все</button>
      <button onClick={disconnectAll}>Отключить все</button>

      <div>
        <p>AI: {ai.status}</p>
        <p>BPM: {bpm.status}</p>
        <p>UC: {uc.status}</p>
      </div>
    </div>
  );
}
```

### 4. Использование селекторов

```typescript
"use client";

import {
  useAIData,
  useBPMData,
  useUCData,
  useRecentBPMData,
  useConnectionStatus,
  useAllSocketsConnected,
} from "@/shared";

export function MonitoringChart() {
  // Все данные
  const aiData = useAIData();
  const bpmData = useBPMData();

  // Последние N точек
  const recent100BPM = useRecentBPMData(100);

  // Статусы
  const connectionStatus = useConnectionStatus();
  const allConnected = useAllSocketsConnected();

  return <div>{/* Рендер графиков */}</div>;
}
```

### 5. Работа с действиями store

```typescript
"use client";

import { useWebSocketActions } from "@/shared";

export function Controls() {
  const { clearAllData, clearBPMData } = useWebSocketActions();

  return (
    <div>
      <button onClick={clearBPMData}>Очистить BPM данные</button>
      <button onClick={clearAllData}>Очистить все данные</button>
    </div>
  );
}
```

## Конфигурация

### Переменные окружения

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_WS_AI_URL=ws://your-server.com/ws/ai
NEXT_PUBLIC_WS_BPM_URL=ws://your-server.com/ws/bpm
NEXT_PUBLIC_WS_UC_URL=ws://your-server.com/ws/uc
```

### Конфигурация в коде

```typescript
// src/shared/config/app-config.ts
export const appConfig = {
  websocket: {
    ai: process.env.NEXT_PUBLIC_WS_AI_URL || "ws://localhost:8000/ws/ai",
    bpm: process.env.NEXT_PUBLIC_WS_BPM_URL || "ws://localhost:8000/ws/bpm",
    uc: process.env.NEXT_PUBLIC_WS_UC_URL || "ws://localhost:8000/ws/uc",
  },
};
```

## Хранение данных

### Store структура

```typescript
{
  // AI данные
  aiData: AISocketMessage[];        // Массив всех сообщений (макс 1000)
  aiStatus: SocketStatus;            // 'connected' | 'connecting' | 'disconnected' | 'error'
  lastAIMessage: AISocketMessage | null;

  // BPM данные
  bpmData: BPMSocketMessage[];
  bpmStatus: SocketStatus;
  lastBPMMessage: BPMSocketMessage | null;

  // UC данные
  ucData: UCSocketMessage[];
  ucStatus: SocketStatus;
  lastUCMessage: UCSocketMessage | null;
}
```

### Ограничение размера

По умолчанию хранится максимум **1000 точек данных** для каждого типа сокета. При превышении старые данные автоматически удаляются (FIFO).

Изменить это значение можно в `src/shared/store/websocket-store.ts`:

```typescript
const MAX_DATA_POINTS = 1000; // Измените на нужное значение
```

## Особенности реализации

### Автоматическое переподключение

WebSocket клиент автоматически пытается переподключиться при разрыве соединения:

- Максимум 5 попыток
- Интервал между попытками: 3 секунды
- Настраивается при создании клиента

### Типобезопасность

Все компоненты полностью типизированы TypeScript без использования `any`:

```typescript
// ✅ Правильно - полная типизация
const message: AISocketMessage = data;

// ❌ Неправильно - избегаем any
const message: any = data;
```

### Производительность

- Данные хранятся в Zustand с минимальными ре-рендерами
- Селекторы оптимизированы для выбора только нужных данных
- Автоматическая очистка при размонтировании компонентов

## Пример компонента для графиков

```typescript
"use client";

import { useBPMData, useUCData } from "@/shared";
import { useEffect, useRef } from "react";

export function RealtimeChart() {
  const bpmData = useBPMData();
  const ucData = useUCData();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    // Рисуем график с использованием bpmData и ucData
  }, [bpmData, ucData]);

  return <canvas ref={canvasRef} width={800} height={400} />;
}
```

## Отладка

### Zustand DevTools

Все stores подключены к Redux DevTools. Установите расширение браузера для мониторинга:

- Chrome: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/)
- Firefox: [Redux DevTools](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

### Логирование

WebSocket клиент логирует все события в консоль:

```
[WebSocket] Connected to ws://localhost:8000/ws/ai
[WebSocket] Disconnected from ws://localhost:8000/ws/ai
[WebSocket] Reconnecting to ws://localhost:8000/ws/ai (attempt 1/5)...
```

## API Reference

### Хуки

- `useAIWebSocket(autoConnect?)` - Подключение к AI сокету
- `useBPMWebSocket(autoConnect?)` - Подключение к BPM сокету
- `useUCWebSocket(autoConnect?)` - Подключение к UC сокету
- `useAllWebSockets(autoConnect?)` - Подключение ко всем сокетам

### Селекторы данных

- `useAIData()` - Все AI данные
- `useBPMData()` - Все BPM данные
- `useUCData()` - Все UC данные
- `useLastAIMessage()` - Последнее AI сообщение
- `useLastBPMMessage()` - Последнее BPM сообщение
- `useLastUCMessage()` - Последнее UC сообщение
- `useRecentAIData(count)` - Последние N AI сообщений
- `useRecentBPMData(count)` - Последние N BPM сообщений
- `useRecentUCData(count)` - Последние N UC сообщений

### Селекторы статуса

- `useAIStatus()` - Статус AI соединения
- `useBPMStatus()` - Статус BPM соединения
- `useUCStatus()` - Статус UC соединения
- `useConnectionStatus()` - Все статусы
- `useAllSocketsConnected()` - Все ли сокеты подключены

### Действия

- `useWebSocketActions()` - Получить все действия store
- `clearAllData()` - Очистить все данные
- `clearAIData()` - Очистить AI данные
- `clearBPMData()` - Очистить BPM данные
- `clearUCData()` - Очистить UC данные

## Тестирование

Для локального тестирования можно использовать mock WebSocket сервер или инструменты типа [websocat](https://github.com/vi/websocat).

## Лицензия

Проект разработан для LCT Hackaton.
