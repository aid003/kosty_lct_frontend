"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";

import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

type ThemeToggleProps = {
  variant?: ComponentProps<typeof Button>["variant"];
  className?: string;
};

/**
 * Компонент переключателя темы
 */
export function ThemeToggle({
  variant = "outline",
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn("h-9 w-9", className)}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Переключить тему</span>
    </Button>
  );
}
