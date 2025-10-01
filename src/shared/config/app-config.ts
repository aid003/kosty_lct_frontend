/**
 * Конфигурация приложения
 */

export const appConfig = {
  name: "Hackaton LCT Frontend",
  version: "0.1.0",
  environment: process.env.NODE_ENV || "development",
  isUsingMock:
    process.env.NEXT_PUBLIC_IS_USING_MOC === "1" ||
    process.env.NEXT_PUBLIC_IS_USING_MOC === "true",
  websocket: {
    ai: process.env.NEXT_PUBLIC_WS_AI_URL || "ws://localhost:8000/ws/ai",
    bpm: process.env.NEXT_PUBLIC_WS_BPM_URL || "ws://localhost:8000/ws/bpm",
    uc: process.env.NEXT_PUBLIC_WS_UC_URL || "ws://localhost:8000/ws/uc",
  },
} as const;
