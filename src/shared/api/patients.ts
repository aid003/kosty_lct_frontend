import { appConfig } from "@/shared/config/app-config";

export type PatientSummary = {
  id: string;
  fullName: string;
  lastStudyType: string;
  lastStudyDate: string;
  monitoringStatus: "stable" | "warning" | "critical";
};

export type PatientSearchResult = PatientSummary & {
  birthDate: string;
  medicalRecord: string;
};

const fallbackRecentPatients: PatientSummary[] = [
  {
    id: "pt-001",
    fullName: "Иванов Иван Иванович",
    lastStudyType: "Экспресс-ЭКГ",
    lastStudyDate: "2024-05-12T08:30:00.000Z",
    monitoringStatus: "stable",
  },
  {
    id: "pt-002",
    fullName: "Петрова Анастасия Сергеевна",
    lastStudyType: "Холтеровское мониторирование",
    lastStudyDate: "2024-05-08T14:15:00.000Z",
    monitoringStatus: "warning",
  },
  {
    id: "pt-003",
    fullName: "Смирнов Михаил Андреевич",
    lastStudyType: "Велоэргометрия",
    lastStudyDate: "2024-04-30T10:45:00.000Z",
    monitoringStatus: "critical",
  },
];

const fallbackSearchResults: PatientSearchResult[] = fallbackRecentPatients.map(
  (patient, index) => ({
    ...patient,
    birthDate: index === 0 ? "1988-09-14" : index === 1 ? "1994-11-03" : "1979-02-21",
    medicalRecord: `MR-${patient.id.toUpperCase()}`,
  })
);

const patientsEndpoints = appConfig.api.patients;

function getFetchError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error("Не удалось выполнить запрос к API");
}

export async function fetchRecentPatients(signal?: AbortSignal): Promise<PatientSummary[]> {
  try {
    const response = await fetch(patientsEndpoints.recent, {
      method: "GET",
      signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = (await response.json()) as PatientSummary[];

    if (!Array.isArray(data)) {
      throw new Error("Invalid response shape for recent patients");
    }

    return data;
  } catch (error) {
    const normalizedError = getFetchError(error);

    if (appConfig.isUsingMock) {
      console.warn("fetchRecentPatients fallback triggered", normalizedError);
      return fallbackRecentPatients;
    }

    throw normalizedError;
  }
}

export async function searchPatients(
  query: string,
  signal?: AbortSignal
): Promise<PatientSearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `${patientsEndpoints.search}?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        signal,
      }
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = (await response.json()) as PatientSearchResult[];

    if (!Array.isArray(data)) {
      throw new Error("Invalid response shape for patient search");
    }

    return data;
  } catch (error) {
    const normalizedError = getFetchError(error);

    if (appConfig.isUsingMock) {
      console.warn("searchPatients fallback triggered", normalizedError);

      const normalizedQuery = query.trim().toLowerCase();
      return fallbackSearchResults.filter((item) =>
        item.fullName.toLowerCase().includes(normalizedQuery)
      );
    }

    throw normalizedError;
  }
}

export async function createPatient(payload: {
  fullName: string;
}): Promise<{ id: string; fullName: string } | null> {
  const trimmedName = payload.fullName.trim();

  if (!trimmedName) {
    return null;
  }

  try {
    const response = await fetch(patientsEndpoints.create, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullName: trimmedName }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = (await response.json()) as { id: string; fullName: string };

    if (!data?.id) {
      throw new Error("Patient creation response is missing id");
    }

    return data;
  } catch (error) {
    const normalizedError = getFetchError(error);

    if (appConfig.isUsingMock) {
      console.warn("createPatient fallback triggered", normalizedError);

      const fallbackId = `pt-${Date.now()}`;
      return {
        id: fallbackId,
        fullName: trimmedName,
      };
    }

    throw normalizedError;
  }
}
