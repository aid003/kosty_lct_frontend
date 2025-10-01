/**
 * API для работы с WebSocket подключениями
 */

import type {
  AISocketMessage,
  BPMSocketMessage,
  UCSocketMessage,
} from '../types';

type SocketMessage = AISocketMessage | BPMSocketMessage | UCSocketMessage;

type MessageHandler<T extends SocketMessage> = (message: T) => void;
type ErrorHandler = (error: Event) => void;
type StatusHandler = (status: 'open' | 'close' | 'error') => void;

interface SocketConfig<T extends SocketMessage> {
  url: string;
  onMessage: MessageHandler<T>;
  onError?: ErrorHandler;
  onStatusChange?: StatusHandler;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

// -------------------- MOCK CLIENT --------------------
// -------------------- MOCK FACTORIES --------------------
function createMockAISocketImpl(
  onMessage: MessageHandler<AISocketMessage>,
  onStatusChange?: StatusHandler
) {
  let timer: number | null = null;
  const start = () => {
    if (timer) return;
    timer = window.setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const severity = () => Math.max(0, Math.min(1, Math.random()))
      const events = [
        { type: 'late_decel' as const, severity: severity() },
        { type: 'low_variability' as const, severity: severity() },
      ];
      const statuses: Array<'Норма' | 'Подозрение' | 'Тревога'> = ['Норма', 'Подозрение', 'Тревога'];
      const msg: AISocketMessage = {
        time: now,
        short_term: { status: statuses[Math.floor(Math.random() * statuses.length)], events },
        long_term: { hypoxia_60: severity(), emergency_30: severity() },
      };
      onMessage(msg);
    }, 1000);
  };

  return {
    connect() { onStatusChange?.('open'); start(); },
    disconnect() { if (timer) { window.clearInterval(timer); timer = null; } onStatusChange?.('close'); },
    getReadyState() { return 1; },
    isConnected() { return true; },
  } as unknown as WebSocketClient<AISocketMessage>;
}

function createMockBPMSocketImpl(
  onMessage: MessageHandler<BPMSocketMessage>,
  onStatusChange?: StatusHandler
) {
  let timer: number | null = null;
  let t = Math.floor(Date.now() / 1000);
  let value = 120;
  return {
    connect() {
      onStatusChange?.('open');
      if (timer) return;
      timer = window.setInterval(() => {
        t += 1;
        value += Math.round((Math.random() - 0.5) * 4);
        value = Math.max(80, Math.min(180, value));
        onMessage({ time_sec: t, value });
      }, 250);
    },
    disconnect() { if (timer) { window.clearInterval(timer); timer = null; } onStatusChange?.('close'); },
    getReadyState() { return 1; },
    isConnected() { return true; },
  } as unknown as WebSocketClient<BPMSocketMessage>;
}

function createMockUCSocketImpl(
  onMessage: MessageHandler<UCSocketMessage>,
  onStatusChange?: StatusHandler
) {
  let timer: number | null = null;
  let t = Math.floor(Date.now() / 1000);
  let phase = 0;
  return {
    connect() {
      onStatusChange?.('open');
      if (timer) return;
      timer = window.setInterval(() => {
        t += 1;
        phase += 0.2;
        const base = Math.sin(phase) * 30 + 50; // псевдосокращения 20..80
        const noise = (Math.random() - 0.5) * 10;
        const value = Math.max(0, Math.round(base + noise));
        onMessage({ time_sec: t, value });
      }, 500);
    },
    disconnect() { if (timer) { window.clearInterval(timer); timer = null; } onStatusChange?.('close'); },
    getReadyState() { return 1; },
    isConnected() { return true; },
  } as unknown as WebSocketClient<UCSocketMessage>;
}

/**
 * Класс для управления WebSocket подключением
 */
export class WebSocketClient<T extends SocketMessage> {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessage: MessageHandler<T>;
  private onError?: ErrorHandler;
  private onStatusChange?: StatusHandler;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;

  constructor(config: SocketConfig<T>) {
    this.url = config.url;
    this.onMessage = config.onMessage;
    this.onError = config.onError;
    this.onStatusChange = config.onStatusChange;
    this.reconnectInterval = config.reconnectInterval ?? 3000;
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? 5;
  }

  /**
   * Подключиться к WebSocket
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isIntentionallyClosed = false;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log(`[WebSocket] Connected to ${this.url}`);
      this.reconnectAttempts = 0;
      this.onStatusChange?.('open');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as T;
        this.onMessage(message);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error(`[WebSocket] Error on ${this.url}:`, error);
      this.onError?.(error);
      this.onStatusChange?.('error');
    };

    this.ws.onclose = () => {
      console.log(`[WebSocket] Disconnected from ${this.url}`);
      this.onStatusChange?.('close');

      if (!this.isIntentionallyClosed) {
        this.attemptReconnect();
      }
    };
  }

  /**
   * Попытка переподключения
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `[WebSocket] Max reconnect attempts (${this.maxReconnectAttempts}) reached for ${this.url}`
      );
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `[WebSocket] Reconnecting to ${this.url} (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Отключиться от WebSocket
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.reconnectAttempts = 0;
  }

  /**
   * Получить текущее состояние подключения
   */
  getReadyState(): number | null {
    return this.ws?.readyState ?? null;
  }

  /**
   * Проверить, подключен ли сокет
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

/**
 * Фабрика для создания WebSocket клиентов
 */
export function createWebSocketClient<T extends SocketMessage>(
  config: SocketConfig<T>
): WebSocketClient<T> {
  return new WebSocketClient(config);
}

/**
 * Типизированные фабрики для каждого типа сокета
 */
export function createAISocket(
  url: string,
  onMessage: MessageHandler<AISocketMessage>,
  onError?: ErrorHandler,
  onStatusChange?: StatusHandler
): WebSocketClient<AISocketMessage> {
  if (typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_IS_USING_MOC === '1' || process.env.NEXT_PUBLIC_IS_USING_MOC === 'true')) {
    return createMockAISocketImpl(onMessage, onStatusChange);
  }
  return createWebSocketClient({ url, onMessage, onError, onStatusChange });
}

export function createBPMSocket(
  url: string,
  onMessage: MessageHandler<BPMSocketMessage>,
  onError?: ErrorHandler,
  onStatusChange?: StatusHandler
): WebSocketClient<BPMSocketMessage> {
  if (typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_IS_USING_MOC === '1' || process.env.NEXT_PUBLIC_IS_USING_MOC === 'true')) {
    return createMockBPMSocketImpl(onMessage, onStatusChange);
  }
  return createWebSocketClient({ url, onMessage, onError, onStatusChange });
}

export function createUCSocket(
  url: string,
  onMessage: MessageHandler<UCSocketMessage>,
  onError?: ErrorHandler,
  onStatusChange?: StatusHandler
): WebSocketClient<UCSocketMessage> {
  if (typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_IS_USING_MOC === '1' || process.env.NEXT_PUBLIC_IS_USING_MOC === 'true')) {
    return createMockUCSocketImpl(onMessage, onStatusChange);
  }
  return createWebSocketClient({ url, onMessage, onError, onStatusChange });
}

