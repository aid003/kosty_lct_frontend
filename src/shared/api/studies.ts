import { appConfig } from "@/shared/config/app-config";

export type StudySummary = {
  id: string;
  patientId: string;
  patientName: string;
  modality: string;
  status: "ready" | "processing" | "scheduled";
  performedAt: string;
  findingsSummary: string;
};

const fallbackRecentStudies: StudySummary[] = [
  {
    id: "st-1001",
    patientId: "pt-001",
    patientName: "Иванов Иван Иванович",
    modality: "Холтеровское мониторирование",
    status: "ready",
    performedAt: "2024-05-11T16:20:00.000Z",
    findingsSummary: "Синусовый ритм, редкие одиночные экстрасистолы",
  },
  {
    id: "st-1002",
    patientId: "pt-002",
    patientName: "Петрова Анастасия Сергеевна",
    modality: "Экспресс-ЭКГ",
    status: "processing",
    performedAt: "2024-05-10T09:05:00.000Z",
    findingsSummary: "Подозрение на нарушения реполяризации, требуется оценка врача",
  },
  {
    id: "st-1003",
    patientId: "pt-003",
    patientName: "Смирнов Михаил Андреевич",
    modality: "Суточное мониторирование АД",
    status: "scheduled",
    performedAt: "2024-05-14T12:00:00.000Z",
    findingsSummary: "Запланировано исследование для уточнения динамики давления",
  },
];

const studiesEndpoints = appConfig.api.studies;

function getFetchError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Не удалось выполнить запрос к API");
}

export async function fetchRecentStudies(signal?: AbortSignal): Promise<StudySummary[]> {
  try {
    const response = await fetch(studiesEndpoints.recent, {
      method: "GET",
      signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = (await response.json()) as StudySummary[];

    if (!Array.isArray(data)) {
      throw new Error("Invalid response shape for recent studies");
    }

    return data;
  } catch (error) {
    const normalizedError = getFetchError(error);

    if (appConfig.isUsingMock) {
      console.warn("fetchRecentStudies fallback triggered", normalizedError);
      return fallbackRecentStudies;
    }

    throw normalizedError;
  }
}
