"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  ActivitySquare,
  Home as HomeIcon,
  LucideIcon,
  Settings,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
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
  SidebarTrigger,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { cn } from "@/shared/lib/utils";
import { ThemeToggle } from "@/shared/ui/theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
};

type AppSidebarLayoutProps = {
  title: string;
  children: ReactNode;
  contentClassName?: string;
};

function SidebarBrand() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div
      className={cn(
        "flex h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
        isCollapsed && "justify-center"
      )}
    >
      <span
        className={cn(
          "truncate transition-opacity duration-200",
          isCollapsed && "opacity-0"
        )}
      >
        Fetal Monitor
      </span>
    </div>
  );
}

function SidebarFooterControls() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg bg-muted/40 p-2 transition-all",
        isCollapsed &&
          "mx-auto max-w-[3.75rem] flex-col justify-center gap-1 rounded-full bg-muted/20 p-1"
      )}
    >
      <ThemeToggle
        variant="ghost"
        className={cn(
          "border-none focus-visible:outline-none focus-visible:ring-0",
          isCollapsed ? "" : "hover:bg-muted"
        )}
      />
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 focus-visible:outline-none focus-visible:ring-0",
          isCollapsed ? "" : "hover:bg-muted"
        )}
        aria-label="Открыть настройки"
      >
        <Settings className="size-4" />
      </Button>
    </div>
  );
}

export function AppSidebarLayout({
  title,
  children,
  contentClassName,
}: AppSidebarLayoutProps) {
  const pathname = usePathname();
  const isMonitoringRoute = pathname?.startsWith("/monitoring");
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMonitoringRoute);

  useEffect(() => {
    setIsSidebarOpen(!isMonitoringRoute);
  }, [isMonitoringRoute]);

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        href: "/",
        label: "Главная",
        icon: HomeIcon,
        isActive: pathname === "/",
      },
      {
        href: "/monitoring",
        label: "Мониторинг",
        icon: ActivitySquare,
        isActive: Boolean(isMonitoringRoute),
      },
    ],
    [pathname, isMonitoringRoute]
  );

  const navButtonClassName =
    "w-full justify-start gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted/60 data-[active=true]:bg-muted data-[active=true]:text-foreground sm:gap-3 sm:px-4 md:text-base [&>span:last-child]:truncate group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:h-[3.5rem] group-data-[collapsible=icon]:w-[3.5rem] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:text-sm group-data-[collapsible=icon]:[&>span:last-child]:sr-only";

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar collapsible="icon" className="border-r bg-background/95">
          <SidebarHeader className="gap-3 px-3 py-4 sm:px-4">
            <SidebarBrand />
          </SidebarHeader>

          <SidebarContent className="px-2 py-3 sm:px-3">
            <SidebarGroup className="gap-1 p-0">
              <SidebarGroupLabel className="px-3 text-[0.7rem] uppercase tracking-wide text-muted-foreground sm:px-4">
                Навигация
              </SidebarGroupLabel>
              <SidebarGroupContent className="px-1 sm:px-0">
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={item.isActive}
                        className={navButtonClassName}
                        asChild
                      >
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-2 pb-4 sm:px-3">
            <SidebarFooterControls />
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>

          <div
            className={cn("flex flex-1 flex-col gap-4 p-6", contentClassName)}
          >
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
