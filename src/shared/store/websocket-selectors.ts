/**
 * Селекторы для WebSocket store
 */

import { useWebSocketStore } from './websocket-store';
import { useShallow } from 'zustand/react/shallow';
import type { AISocketMessage, BPMSocketMessage, UCSocketMessage } from '../types';

/**
 * Селекторы для AI данных
 */
export const useAIData = () => useWebSocketStore((state) => state.aiData);
export const useLastAIMessage = () =>
  useWebSocketStore((state) => state.lastAIMessage);
export const useAIStatus = () => useWebSocketStore((state) => state.aiStatus);

/**
 * Селекторы для BPM данных
 */
export const useBPMData = () => useWebSocketStore((state) => state.bpmData);
export const useLastBPMMessage = () =>
  useWebSocketStore((state) => state.lastBPMMessage);
export const useBPMStatus = () => useWebSocketStore((state) => state.bpmStatus);

/**
 * Селекторы для UC данных
 */
export const useUCData = () => useWebSocketStore((state) => state.ucData);
export const useLastUCMessage = () =>
  useWebSocketStore((state) => state.lastUCMessage);
export const useUCStatus = () => useWebSocketStore((state) => state.ucStatus);

/**
 * Селектор для получения последних N точек данных
 */
export const useRecentAIData = (count: number): AISocketMessage[] =>
  useWebSocketStore(
    useShallow((state) => state.aiData.slice(-count))
  );

export const useRecentBPMData = (count: number): BPMSocketMessage[] =>
  useWebSocketStore(
    useShallow((state) => state.bpmData.slice(-count))
  );

export const useRecentUCData = (count: number): UCSocketMessage[] =>
  useWebSocketStore(
    useShallow((state) => state.ucData.slice(-count))
  );

/**
 * Селектор для проверки, что все сокеты подключены
 */
export const useAllSocketsConnected = () =>
  useWebSocketStore(
    (state) =>
      state.aiStatus === 'connected' &&
      state.bpmStatus === 'connected' &&
      state.ucStatus === 'connected'
  );

/**
 * Селектор для получения общего статуса подключений
 */
export const useConnectionStatus = () =>
  useWebSocketStore((state) => ({
    ai: state.aiStatus,
    bpm: state.bpmStatus,
    uc: state.ucStatus,
  }));

/**
 * Селектор для получения действий
 */
export const useWebSocketActions = () =>
  useWebSocketStore((state) => ({
    clearAllData: state.clearAllData,
    resetAllStatuses: state.resetAllStatuses,
    clearAIData: state.clearAIData,
    clearBPMData: state.clearBPMData,
    clearUCData: state.clearUCData,
  }));

