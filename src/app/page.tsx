"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ActivitySquare, Home, Settings } from "lucide-react";

мне нужно чтобы ты сделал на главной странице всплывающее модальное окно введите ФИО пациента

я уже установил shadcn dialog

после введения данных меня должно перебрасывать на страницу мониторинга

так же сделай сайд бар (тоже уже установил) там настрой скрытие его открытие так же добавь туда переключение тем
так же добавь в него иконку настроек но пока ничего не реализуй в ней

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

export default function Home() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [patientName, setPatientName] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = patientName.trim();
    if (!trimmedName) {
      return;
    }

    setIsDialogOpen(false);
    router.push(`/monitoring?patient=${encodeURIComponent(trimmedName)}`);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader>
            <div className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold">
              <span className="truncate">Kosty Monitor</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Навигация</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <Home className="size-4" />
                      <span>Главная</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/monitoring">
                        <ActivitySquare className="size-4" />
                        <span>Мониторинг</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarSeparator />

          <SidebarFooter>
            <div className="flex items-center justify-between gap-2 rounded-md bg-muted/30 p-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Открыть настройки"
              >
                <Settings className="size-4" />
              </Button>
            </div>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Главная</h1>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight">
                Добро пожаловать!
              </h2>
              <p className="text-muted-foreground">
                Введите ФИО пациента, чтобы перейти к мониторингу показателей в
                реальном времени.
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} size="lg">
              Ввести данные пациента
            </Button>
          </div>
        </SidebarInset>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                disabled={!patientName.trim()}
                className="min-w-[140px]"
              >
                Перейти к мониторингу
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
