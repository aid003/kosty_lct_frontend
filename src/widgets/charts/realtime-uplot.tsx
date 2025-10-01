"use client";

import { useEffect, useMemo, useRef } from "react";

interface SeriesDef {
  label: string;
  color: string;
}

interface UPlotApi {
  setData: (data: Array<Array<number | null>>, fire?: boolean) => void;
  setSize: (size: { width: number; height: number }) => void;
  destroy: () => void;
}

type UPlotCtor = new (
  opts: Record<string, unknown>,
  data: Array<Array<number | null>>,
  root: HTMLElement
) => UPlotApi;

interface RealtimeUPlotProps {
  data: Array<Array<number | null>>; // [x, y1, y2, ...]
  series: SeriesDef[]; // только Y-серии (без x)
  title?: string;
  yLabel?: string;
  height?: number;
  scrollable?: boolean;
  pixelsPerSecond?: number; // ширина в px на 1 секунду по оси X
}

export function RealtimeUPlot({
  data,
  series,
  title,
  yLabel,
  height = 240,
  scrollable = false,
  pixelsPerSecond = 4,
}: RealtimeUPlotProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<UPlotApi | null>(null);

  const desiredWidth = useMemo(() => {
    const xs = (data?.[0] as Array<number | null>) ?? [];
    if (!xs.length) return 400;
    const first = xs.find((v) => typeof v === "number") as number | undefined;
    const last = [...xs].reverse().find((v) => typeof v === "number") as
      | number
      | undefined;
    if (first == null || last == null) return 400;
    const range = Math.max(0, last - first);
    const widthPx = Math.round(range * pixelsPerSecond);
    return Math.max(400, widthPx);
  }, [data, pixelsPerSecond]);

  useEffect(() => {
    let disposed = false;
    let resizeObs: ResizeObserver | null = null;

    async function mount() {
      if (!rootRef.current) return;

      const mod = await import("uplot");
      const UPlot = mod.default as unknown as UPlotCtor;

      const root = rootRef.current;
      const w = scrollable ? desiredWidth : root.clientWidth;

      const opts: Record<string, unknown> = {
        width: Math.max(w, 100),
        height,
        title,
        padding: [8, 8, 8, 8],
        scales: {
          x: { time: false },
        },
        series: [
          {
            label: "Time (s)",
            value: (_u: unknown, v: number | null) =>
              v == null ? "-" : `${Math.round(v)}s`,
          },
          ...series.map((s) => ({
            label: s.label,
            stroke: s.color,
            value: (_u: unknown, v: number | null) =>
              v == null ? "-" : `${v}`,
          })),
        ],
        axes: [
          {
            stroke: "var(--muted-foreground)",
            grid: { show: true, stroke: "var(--border)" },
            // скрываем подписи на оси X, сохраняя сетку и тики
            values: (_u: unknown, vals: number[]) => vals.map(() => ""),
          },
          {
            label: yLabel,
            stroke: "var(--muted-foreground)",
            grid: { show: true, stroke: "var(--border)" },
          },
        ],
        legend: { live: true },
        // включаем курсор, возвращаем пунктирные линии
        cursor: {
          x: true,
          y: true,
          points: {
            show: (_u: unknown, sidx: number) => sidx > 0,
          },
        },
      };

      if (disposed) return;
      const plot = new UPlot(opts, data, root);
      plotRef.current = plot;

      if ("ResizeObserver" in window) {
        resizeObs = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.contentRect && plotRef.current) {
              // при скролле ширину контролируем данными; без скролла подстраиваемся под контейнер
              const width = scrollable
                ? desiredWidth
                : Math.max(Math.floor(entry.contentRect.width), 100);
              plotRef.current.setSize({ width, height });
            }
          }
        });
        resizeObs.observe(root);
      }
    }

    mount();

    return () => {
      disposed = true;
      if (resizeObs) resizeObs.disconnect();
      if (plotRef.current) {
        plotRef.current.destroy();
        plotRef.current = null;
      }
    };
  }, [height, title, yLabel, series, scrollable, desiredWidth, data]);

  useEffect(() => {
    if (plotRef.current) {
      // setData не вызывает React setState, безопасно обновлять
      plotRef.current.setData(data);
    }
  }, [data]);

  useEffect(() => {
    if (plotRef.current && scrollable) {
      plotRef.current.setSize({ width: desiredWidth, height });
    }
  }, [desiredWidth, height, scrollable]);

  if (scrollable) {
    return (
      <div className="w-full overflow-x-auto">
        <div style={{ width: desiredWidth }}>
          <div ref={rootRef} />
        </div>
      </div>
    );
  }

  return <div ref={rootRef} className="w-full" />;
}
