/**
 * Типы для WebSocket сообщений
 */

/**
 * Типы событий для AI сокета
 */
export type AIEventType = 
  | 'late_decel' 
  | 'low_variability'
  | 'prolonged_decel'
  | 'tachycardia'
  | 'bradycardia';

/**
 * Статусы для AI анализа
 */
export type AIStatus = 
  | 'Норма' 
  | 'Подозрение' 
  | 'Тревога';

/**
 * Событие AI анализа
 */
export interface AIEvent {
  type: AIEventType;
  severity: number;
}

/**
 * Краткосрочный анализ
 */
export interface ShortTermAnalysis {
  status: AIStatus;
  events: AIEvent[];
}

/**
 * Долгосрочный анализ
 */
export interface LongTermAnalysis {
  hypoxia_60: number;
  emergency_30: number;
}

/**
 * Сообщение от AI сокета
 */
export interface AISocketMessage {
  time: number;
  short_term: ShortTermAnalysis;
  long_term: LongTermAnalysis;
}

/**
 * Сообщение от BPM сокета (частота сердцебиения)
 */
export interface BPMSocketMessage {
  time_sec: number;
  value: number;
}

/**
 * Сообщение от UC сокета (сокращения матки)
 */
export interface UCSocketMessage {
  time_sec: number;
  value: number;
}

/**
 * Типы WebSocket подключений
 */
export type SocketType = 'ai' | 'bpm' | 'uc';

/**
 * Состояния WebSocket подключения
 */
export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

