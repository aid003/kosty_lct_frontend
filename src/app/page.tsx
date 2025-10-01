"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Search, UserPlus } from "lucide-react";

import {
  createPatient,
  fetchRecentPatients,
  fetchRecentStudies,
  searchPatients,
  type PatientSummary,
  type PatientSearchResult,
  type StudySummary,
} from "@/shared/api";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { AppSidebarLayout } from "@/widgets";

const patientStatusLabels: Record<PatientSummary["monitoringStatus"], string> = {
  stable: "Мониторинг активен",
  warning: "Требует проверки",
  critical: "Повышенное внимание",
};

const studyStatusLabels: Record<StudySummary["status"], string> = {
  ready: "Отчёт доступен",
  processing: "В обработке",
  scheduled: "Запланировано",
};

const SEARCH_DEBOUNCE_MS = 350;

export default function Home() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPatients, setRecentPatients] = useState<PatientSummary[]>([]);
  const [recentStudies, setRecentStudies] = useState<StudySummary[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingStudies, setIsLoadingStudies] = useState(false);
  const recentStudiesSectionRef = useRef<HTMLDivElement | null>(null);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  useEffect(() => {
    const patientsController = new AbortController();
    const studiesController = new AbortController();

    async function loadDashboardData() {
      setIsLoadingPatients(true);
      setIsLoadingStudies(true);

      try {
        const [patients, studies] = await Promise.all([
          fetchRecentPatients(patientsController.signal),
          fetchRecentStudies(studiesController.signal),
        ]);

        setRecentPatients(patients);
        setRecentStudies(studies);
      } catch (error) {
        console.error("Не удалось загрузить данные главной страницы", error);
      } finally {
        setIsLoadingPatients(false);
        setIsLoadingStudies(false);
      }
    }

    void loadDashboardData();

    return () => {
      patientsController.abort();
      studiesController.abort();
    };
  }, []);

  const handleAddPatientClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleFindPatientClick = () => {
    setIsSearchDialogOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = patientName.trim();
    if (!trimmedName) {
      return;
    }

    setIsSubmitting(true);

    try {
      const createdPatient = await createPatient({ fullName: trimmedName });

      setIsCreateDialogOpen(false);
      setPatientName("");

      if (createdPatient) {
        setRecentPatients((prev) => [
          {
            id: createdPatient.id,
            fullName: createdPatient.fullName,
            lastStudyType: "Мониторинг запущен",
            lastStudyDate: new Date().toISOString(),
            monitoringStatus: "stable",
          },
          ...prev,
        ]);
      }

      const targetUrl = `/monitoring?patient=${encodeURIComponent(trimmedName)}`;
      router.push(targetUrl);
    } catch (error) {
      console.error("Не удалось создать пациента", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isSearchDialogOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
        searchAbortControllerRef.current = null;
      }
    }
  }, [isSearchDialogOpen]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!isSearchDialogOpen) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!trimmedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }

      const controller = new AbortController();
      searchAbortControllerRef.current = controller;
      setIsSearching(true);

      try {
        const results = await searchPatients(trimmedQuery, controller.signal);
        setSearchResults(results);
      } catch (error) {
        console.error("Не удалось выполнить поиск пациентов", error);
      } finally {
        setIsSearching(false);
        searchAbortControllerRef.current = null;
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [searchQuery, isSearchDialogOpen]);

  const handleSearchResultSelect = (patient: PatientSearchResult) => {
    setIsSearchDialogOpen(false);
    setSearchQuery("");
    setSearchResults([]);

    const targetUrl = `/monitoring?patient=${encodeURIComponent(
      patient.fullName
    )}&patientId=${encodeURIComponent(patient.id)}`;
    router.push(targetUrl);
  };

  return (
    <AppSidebarLayout
      title="Главная"
      contentClassName="gap-10 px-6 py-10"
    >
      <section className="max-w-3xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">
            Добро пожаловать!
          </h2>
          <p className="text-muted-foreground text-base">
            Управляйте мониторингом пациентов, создавайте новые записи и возвращайтесь
            к последним исследованиям в один клик.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleAddPatientClick} size="lg">
            <UserPlus className="mr-2 size-4" />
            Добавить пациента
          </Button>
          <Button onClick={handleFindPatientClick} size="lg" variant="outline">
            <Search className="mr-2 size-4" />
            Найти пациента
          </Button>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Активные пациенты</CardTitle>
            <CardDescription>
              Последние пациенты, у которых запущен мониторинг.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingPatients ? (
              <p className="text-sm text-muted-foreground">Загрузка списка…</p>
            ) : recentPatients.length ? (
              recentPatients.slice(0, 4).map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-start justify-between gap-3 border-b pb-4 last:border-none last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {patient.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {patient.lastStudyType}
                      </p>
                      <p className="text-xs text-muted-foreground/80">
                        {dateFormatter.format(new Date(patient.lastStudyDate))}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-muted-foreground/30 text-muted-foreground"
                    >
                      {patientStatusLabels[patient.monitoringStatus]}
                    </Badge>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Пока нет активных пациентов.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section ref={recentStudiesSectionRef} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold">Недавние исследования</h3>
            <p className="text-muted-foreground text-sm">
              Последние обследования, требующие внимания врача.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {isLoadingStudies ? (
            <Card>
              <CardHeader>
                <CardTitle>Загрузка исследований…</CardTitle>
                <CardDescription>
                  Данные поступят через несколько секунд.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : recentStudies.length ? (
            recentStudies.map((study) => (
              <Card key={study.id} className="h-full">
                  <CardHeader>
                    <CardTitle>{study.patientName}</CardTitle>
                    <CardDescription>{study.modality}</CardDescription>
                    <Badge
                      variant="outline"
                      className="border-muted-foreground/30 text-muted-foreground"
                    >
                      {studyStatusLabels[study.status]}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {dateFormatter.format(new Date(study.performedAt))}
                    </p>
                    <p className="text-sm leading-relaxed">
                      {study.findingsSummary}
                    </p>
                  </CardContent>
                </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Нет недавних исследований</CardTitle>
                <CardDescription>
                  Как только появятся новые исследования, они отобразятся здесь.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </section>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Введите ФИО пациента</DialogTitle>
            <DialogDescription>
              Эта информация поможет персонализировать мониторинг пациента.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="patient-name">
                ФИО пациента
              </label>
              <Input
                id="patient-name"
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
                placeholder="Иванов Иван Иванович"
                autoComplete="name"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={!patientName.trim() || isSubmitting}
                className="min-w-[160px]"
              >
                {isSubmitting ? "Создаём карточку…" : "Перейти к мониторингу"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Найти пациента</DialogTitle>
            <DialogDescription>
              Введите ФИО, номер истории болезни или другую информацию.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Например, Петрова Анастасия"
              autoFocus
            />

            <div className="space-y-3">
              {isSearching ? (
                <p className="text-sm text-muted-foreground">Выполняем поиск…</p>
              ) : searchQuery.trim() && !searchResults.length ? (
                <p className="text-sm text-muted-foreground">
                  Пациенты не найдены. Попробуйте изменить запрос.
                </p>
              ) : (
                searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:border-muted-foreground/40"
                  >
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {patient.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        История болезни: {patient.medicalRecord}
                      </p>
                      <p className="text-xs text-muted-foreground/80">
                        Дата рождения: {patient.birthDate}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="self-start"
                      onClick={() => handleSearchResultSelect(patient)}
                    >
                      Перейти к мониторингу
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppSidebarLayout>
  );
}
