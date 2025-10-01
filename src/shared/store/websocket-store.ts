/**
 * Store для данных WebSocket
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  AISocketMessage,
  BPMSocketMessage,
  UCSocketMessage,
  SocketStatus,
} from '../types';

/**
 * Максимальное количество хранимых точек данных для графиков
 */
const MAX_DATA_POINTS = 1000;

/**
 * Состояние WebSocket store
 */
interface WebSocketState {
  // Данные AI
  aiData: AISocketMessage[];
  aiStatus: SocketStatus;
  lastAIMessage: AISocketMessage | null;

  // Данные BPM (частота сердцебиения)
  bpmData: BPMSocketMessage[];
  bpmStatus: SocketStatus;
  lastBPMMessage: BPMSocketMessage | null;

  // Данные UC (сокращения матки)
  ucData: UCSocketMessage[];
  ucStatus: SocketStatus;
  lastUCMessage: UCSocketMessage | null;
}

/**
 * Действия WebSocket store
 */
interface WebSocketActions {
  // AI actions
  addAIMessage: (message: AISocketMessage) => void;
  setAIStatus: (status: SocketStatus) => void;
  clearAIData: () => void;

  // BPM actions
  addBPMMessage: (message: BPMSocketMessage) => void;
  setBPMStatus: (status: SocketStatus) => void;
  clearBPMData: () => void;

  // UC actions
  addUCMessage: (message: UCSocketMessage) => void;
  setUCStatus: (status: SocketStatus) => void;
  clearUCData: () => void;

  // Общие actions
  clearAllData: () => void;
  resetAllStatuses: () => void;
}

/**
 * Полный тип store
 */
type WebSocketStore = WebSocketState & WebSocketActions;

/**
 * Начальное состояние
 */
const initialState: WebSocketState = {
  aiData: [],
  aiStatus: 'disconnected',
  lastAIMessage: null,

  bpmData: [],
  bpmStatus: 'disconnected',
  lastBPMMessage: null,

  ucData: [],
  ucStatus: 'disconnected',
  lastUCMessage: null,
};

/**
 * Zustand store для WebSocket данных
 */
export const useWebSocketStore = create<WebSocketStore>()(
  devtools(
    (set) => ({
      ...initialState,

      // AI actions
      addAIMessage: (message) =>
        set((state) => {
          const newData = [...state.aiData, message];
          // Ограничиваем количество хранимых точек
          const trimmedData =
            newData.length > MAX_DATA_POINTS
              ? newData.slice(newData.length - MAX_DATA_POINTS)
              : newData;

          return {
            aiData: trimmedData,
            lastAIMessage: message,
          };
        }),

      setAIStatus: (status) => set({ aiStatus: status }),

      clearAIData: () =>
        set({
          aiData: [],
          lastAIMessage: null,
        }),

      // BPM actions
      addBPMMessage: (message) =>
        set((state) => {
          const newData = [...state.bpmData, message];
          const trimmedData =
            newData.length > MAX_DATA_POINTS
              ? newData.slice(newData.length - MAX_DATA_POINTS)
              : newData;

          return {
            bpmData: trimmedData,
            lastBPMMessage: message,
          };
        }),

      setBPMStatus: (status) => set({ bpmStatus: status }),

      clearBPMData: () =>
        set({
          bpmData: [],
          lastBPMMessage: null,
        }),

      // UC actions
      addUCMessage: (message) =>
        set((state) => {
          const newData = [...state.ucData, message];
          const trimmedData =
            newData.length > MAX_DATA_POINTS
              ? newData.slice(newData.length - MAX_DATA_POINTS)
              : newData;

          return {
            ucData: trimmedData,
            lastUCMessage: message,
          };
        }),

      setUCStatus: (status) => set({ ucStatus: status }),

      clearUCData: () =>
        set({
          ucData: [],
          lastUCMessage: null,
        }),

      // Общие actions
      clearAllData: () =>
        set({
          aiData: [],
          lastAIMessage: null,
          bpmData: [],
          lastBPMMessage: null,
          ucData: [],
          lastUCMessage: null,
        }),

      resetAllStatuses: () =>
        set({
          aiStatus: 'disconnected',
          bpmStatus: 'disconnected',
          ucStatus: 'disconnected',
        }),
    }),
    {
      name: 'websocket-store',
    }
  )
);

// Экспорт типов
export type { WebSocketState, WebSocketActions, WebSocketStore };

