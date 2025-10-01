/**
 * Хуки для работы с WebSocket
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useWebSocketStore } from "../store/websocket-store";
import {
  createAISocket,
  createBPMSocket,
  createUCSocket,
  type WebSocketClient,
} from "../api/websocket";
import { appConfig } from "../config/app-config";
import type {
  AISocketMessage,
  BPMSocketMessage,
  UCSocketMessage,
  SocketStatus,
} from "../types";

/**
 * Хук для подключения к AI сокету
 */
export function useAIWebSocket(autoConnect = true) {
  const socketRef = useRef<WebSocketClient<AISocketMessage> | null>(null);
  const { addAIMessage, setAIStatus, aiStatus } = useWebSocketStore();

  const handleMessage = useCallback(
    (message: AISocketMessage) => {
      addAIMessage(message);
    },
    [addAIMessage]
  );

  const handleStatusChange = useCallback(
    (status: "open" | "close" | "error") => {
      const socketStatus: SocketStatus =
        status === "open"
          ? "connected"
          : status === "error"
          ? "error"
          : "disconnected";
      setAIStatus(socketStatus);
    },
    [setAIStatus]
  );

  const connect = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = createAISocket(
        appConfig.websocket.ai,
        handleMessage,
        undefined,
        handleStatusChange
      );
    }
    socketRef.current.connect();
  }, [handleMessage, handleStatusChange]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connect,
    disconnect,
    status: aiStatus,
    isConnected: aiStatus === "connected",
  };
}

/**
 * Хук для подключения к BPM сокету
 */
export function useBPMWebSocket(autoConnect = true) {
  const socketRef = useRef<WebSocketClient<BPMSocketMessage> | null>(null);
  const { addBPMMessage, setBPMStatus, bpmStatus } = useWebSocketStore();

  const handleMessage = useCallback(
    (message: BPMSocketMessage) => {
      addBPMMessage(message);
    },
    [addBPMMessage]
  );

  const handleStatusChange = useCallback(
    (status: "open" | "close" | "error") => {
      const socketStatus: SocketStatus =
        status === "open"
          ? "connected"
          : status === "error"
          ? "error"
          : "disconnected";
      setBPMStatus(socketStatus);
    },
    [setBPMStatus]
  );

  const connect = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = createBPMSocket(
        appConfig.websocket.bpm,
        handleMessage,
        undefined,
        handleStatusChange
      );
    }
    socketRef.current.connect();
  }, [handleMessage, handleStatusChange]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connect,
    disconnect,
    status: bpmStatus,
    isConnected: bpmStatus === "connected",
  };
}

/**
 * Хук для подключения к UC сокету
 */
export function useUCWebSocket(autoConnect = true) {
  const socketRef = useRef<WebSocketClient<UCSocketMessage> | null>(null);
  const { addUCMessage, setUCStatus, ucStatus } = useWebSocketStore();

  const handleMessage = useCallback(
    (message: UCSocketMessage) => {
      addUCMessage(message);
    },
    [addUCMessage]
  );

  const handleStatusChange = useCallback(
    (status: "open" | "close" | "error") => {
      const socketStatus: SocketStatus =
        status === "open"
          ? "connected"
          : status === "error"
          ? "error"
          : "disconnected";
      setUCStatus(socketStatus);
    },
    [setUCStatus]
  );

  const connect = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = createUCSocket(
        appConfig.websocket.uc,
        handleMessage,
        undefined,
        handleStatusChange
      );
    }
    socketRef.current.connect();
  }, [handleMessage, handleStatusChange]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connect,
    disconnect,
    status: ucStatus,
    isConnected: ucStatus === "connected",
  };
}

/**
 * Хук для подключения ко всем сокетам одновременно
 */
export function useAllWebSockets(autoConnect = true) {
  const ai = useAIWebSocket(autoConnect);
  const bpm = useBPMWebSocket(autoConnect);
  const uc = useUCWebSocket(autoConnect);

  const connectAll = useCallback(() => {
    ai.connect();
    bpm.connect();
    uc.connect();
  }, [ai, bpm, uc]);

  const disconnectAll = useCallback(() => {
    ai.disconnect();
    bpm.disconnect();
    uc.disconnect();
  }, [ai, bpm, uc]);

  const allConnected = ai.isConnected && bpm.isConnected && uc.isConnected;

  return {
    ai,
    bpm,
    uc,
    connectAll,
    disconnectAll,
    allConnected,
  };
}
