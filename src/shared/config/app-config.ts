/**
 * Конфигурация приложения
 */

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

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
  api: {
    baseUrl: apiBaseUrl,
    patients: {
      recent:
        process.env.NEXT_PUBLIC_API_PATIENTS_RECENT_URL ||
        `${apiBaseUrl}/patients/recent`,
      search:
        process.env.NEXT_PUBLIC_API_PATIENTS_SEARCH_URL ||
        `${apiBaseUrl}/patients/search`,
      create:
        process.env.NEXT_PUBLIC_API_PATIENTS_CREATE_URL ||
        `${apiBaseUrl}/patients`,
    },
    studies: {
      recent:
        process.env.NEXT_PUBLIC_API_STUDIES_RECENT_URL ||
        `${apiBaseUrl}/studies/recent`,
    },
  },
} as const;
