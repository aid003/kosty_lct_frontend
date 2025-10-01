# Архитектура WebSocket интеграции

## 📐 Общая схема

```
┌─────────────────────────────────────────────────────────┐
│                    React Components                      │
│  (MonitoringDashboard, Charts, Custom Components)       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    React Hooks                           │
│  useAIWebSocket() | useBPMWebSocket() | useUCWebSocket() │
│              useAllWebSockets()                          │
└────────────────────────┬────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
┌─────────────────────┐    ┌──────────────────────────────┐
│   WebSocket API     │    │     Zustand Store            │
│                     │    │                              │
│ WebSocketClient<T>  │◄───┤  aiData, bpmData, ucData    │
│ - connect()         │    │  Statuses, Actions           │
│ - disconnect()      │───►│  Selectors                   │
│ - reconnect()       │    │                              │
└──────────┬──────────┘    └──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│                  WebSocket Servers                       │
│  ws://server/ws/ai | ws://server/ws/bpm | ws://server/ws/uc │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Поток данных

### 1. Подключение

```
Component
  └─> useAIWebSocket()
       └─> createAISocket(url, handlers)
            └─> new WebSocketClient()
                 └─> ws.connect()
                      └─> WebSocket connection
```

### 2. Получение данных

```
WebSocket Server
  └─> sends message
       └─> WebSocketClient.onmessage
            └─> JSON.parse(data)
                 └─> onMessage callback
                      └─> addAIMessage(message)
                           └─> Zustand store update
                                └─> Component re-render
```

### 3. Доступ к данным

```
Component
  └─> useAIData() selector
       └─> Zustand store
            └─> return state.aiData
                 └─> Component renders data
```

## 🏗️ Feature-Sliced Design

```
src/
├── app/                    # Application layer
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
│
├── features/              # Features layer
│   └── monitoring/        # Monitoring feature
│       ├── index.ts
│       └── ui/
│           └── monitoring-dashboard.tsx
│
├── entities/              # Entities layer (empty for now)
│
├── widgets/               # Widgets layer (empty for now)
│
└── shared/                # Shared layer
    ├── api/               # API clients
    │   ├── websocket.ts   # WebSocket client implementation
    │   └── index.ts
    │
    ├── types/             # TypeScript types
    │   ├── websocket.ts   # WebSocket message types
    │   └── index.ts
    │
    ├── store/             # State management
    │   ├── index.ts
    │   ├── types.ts       # Base store types
    │   ├── hooks.ts       # Base store hooks
    │   ├── selectors.ts   # Base selectors
    │   ├── websocket-store.ts        # WebSocket store
    │   └── websocket-selectors.ts    # WebSocket selectors
    │
    ├── hooks/             # React hooks
    │   ├── use-websocket.ts    # WebSocket hooks
    │   └── index.ts
    │
    ├── config/            # Configuration
    │   └── app-config.ts  # App config with WS URLs
    │
    ├── components/        # UI components
    │   └── ui/
    │       ├── button.tsx
    │       └── alert.tsx
    │
    └── providers/         # React providers
        ├── store-provider.tsx
        └── theme-provider.tsx
```

## 📦 Модули и зависимости

### WebSocket Client (`shared/api/websocket.ts`)

- **Зависимости:** Browser WebSocket API
- **Экспорты:**
  - `WebSocketClient<T>` class
  - `createAISocket()`, `createBPMSocket()`, `createUCSocket()`
- **Особенности:**
  - Generic типизация
  - Автоматическое переподключение
  - Обработка ошибок
  - Lifecycle управление

### WebSocket Store (`shared/store/websocket-store.ts`)

- **Зависимости:** Zustand
- **Экспорты:**
  - `useWebSocketStore` hook
  - State и Actions типы
- **Особенности:**
  - Хранение данных (макс 1000 точек)
  - Devtools интеграция
  - Immutable updates

### WebSocket Hooks (`shared/hooks/use-websocket.ts`)

- **Зависимости:**
  - React (useEffect, useCallback, useRef)
  - WebSocket API
  - WebSocket Store
- **Экспорты:**
  - `useAIWebSocket()`
  - `useBPMWebSocket()`
  - `useUCWebSocket()`
  - `useAllWebSockets()`
- **Особенности:**
  - Автоподключение
  - Cleanup при unmount
  - Мемоизация callbacks

### Types (`shared/types/websocket.ts`)

- **Зависимости:** TypeScript
- **Экспорты:**
  - Message types: `AISocketMessage`, `BPMSocketMessage`, `UCSocketMessage`
  - Enum types: `AIEventType`, `AIStatus`, `SocketStatus`
- **Особенности:**
  - Строгая типизация
  - Нет any типов
  - Переиспользуемые типы

## 🔐 Типобезопасность

### Generic WebSocket Client

```typescript
class WebSocketClient<T extends SocketMessage> {
  private onMessage: MessageHandler<T>;

  constructor(config: SocketConfig<T>) { }
}

// Использование
const client = new WebSocketClient<AISocketMessage>({
  onMessage: (msg: AISocketMessage) => { ... }
});
```

### Store типизация

```typescript
interface WebSocketState {
  aiData: AISocketMessage[];
  bpmData: BPMSocketMessage[];
  ucData: UCSocketMessage[];
}

type WebSocketStore = WebSocketState & WebSocketActions;
```

### Hook типизация

```typescript
function useAIWebSocket(autoConnect?: boolean): {
  connect: () => void;
  disconnect: () => void;
  status: SocketStatus;
  isConnected: boolean;
};
```

## 🎯 Принципы проектирования

### 1. Separation of Concerns

- API слой отделен от UI
- Store отделен от бизнес-логики
- Hooks инкапсулируют сложность

### 2. Type Safety

- Все типы явные
- Generic типы где нужно
- Нет any, unknown используется осознанно

### 3. Reusability

- Generic WebSocket client
- Переиспользуемые hooks
- Универсальные селекторы

### 4. Performance

- Мемоизация в hooks
- Оптимизированные селекторы
- Ограничение размера данных

### 5. Developer Experience

- Понятное API
- Хорошая документация
- TypeScript автодополнение

## 🔌 Точки расширения

### 1. Новые типы сокетов

```typescript
// 1. Добавить тип в types/websocket.ts
export interface NewSocketMessage { ... }

// 2. Создать фабрику в api/websocket.ts
export function createNewSocket(...) { ... }

// 3. Добавить в store/websocket-store.ts
newData: NewSocketMessage[];

// 4. Создать хук в hooks/use-websocket.ts
export function useNewWebSocket() { ... }
```

### 2. Middleware для WebSocket

```typescript
// Можно добавить в WebSocketClient
private middleware: Array<(msg: T) => T> = [];

addMiddleware(fn: (msg: T) => T) {
  this.middleware.push(fn);
}
```

### 3. Персистентность данных

```typescript
// Добавить в websocket-store.ts
import { persist } from 'zustand/middleware';

export const useWebSocketStore = create<WebSocketStore>()(
  persist(
    devtools(...),
    { name: 'websocket-storage' }
  )
);
```

### 4. Мокирование для тестов

```typescript
// Создать mock в tests/mocks/websocket.ts
export class MockWebSocketClient<T> {
  connect() {
    /* mock */
  }
  disconnect() {
    /* mock */
  }
  sendMockData(data: T) {
    /* ... */
  }
}
```

## 📊 Управление состоянием

### Zustand Store Structure

```typescript
{
  // AI данные
  aiData: AISocketMessage[],          // История сообщений
  aiStatus: SocketStatus,              // Статус подключения
  lastAIMessage: AISocketMessage,      // Последнее сообщение

  // BPM данные
  bpmData: BPMSocketMessage[],
  bpmStatus: SocketStatus,
  lastBPMMessage: BPMSocketMessage,

  // UC данные
  ucData: UCSocketMessage[],
  ucStatus: SocketStatus,
  lastUCMessage: UCSocketMessage,

  // Actions
  addAIMessage(msg),
  setAIStatus(status),
  clearAIData(),
  // ... и т.д.
}
```

### Селекторы (Memoized)

```typescript
// Базовые
useAIData()           → state.aiData
useBPMData()          → state.bpmData

// Вычисляемые
useRecentBPMData(100) → state.bpmData.slice(-100)
useAllConnected()     → ai && bpm && uc connected

// Композитные
useConnectionStatus() → { ai, bpm, uc }
```

## 🚦 Управление подключениями

### Lifecycle

```
1. Mount Component
   └─> useWebSocket(true)  // autoConnect
        └─> useEffect(() => connect(), [])

2. Unmount Component
   └─> useEffect cleanup
        └─> disconnect()
             └─> clearTimeout(reconnect)
                  └─> ws.close()
```

### Reconnection Logic

```
1. Connection Lost
   └─> ws.onclose
        └─> attemptReconnect()
             └─> if (attempts < max)
                  └─> setTimeout(() => connect(), interval)
```

## 🎨 UI Integration

```tsx
// 1. Простое использование
function Simple() {
  useAIWebSocket();
  const data = useAIData();
  return <div>{data.length}</div>;
}

// 2. С управлением
function Controlled() {
  const { connect, disconnect } = useAIWebSocket(false);
  return <button onClick={connect}>Connect</button>;
}

// 3. Множественные сокеты
function Multi() {
  const { connectAll, ai, bpm, uc } = useAllWebSockets();
  return <Dashboard ai={ai} bpm={bpm} uc={uc} />;
}
```
