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
  const legendContainerRef = useRef<HTMLDivElement | null>(null);
  const legendElRef = useRef<HTMLElement | null>(null);
  const originalLegendParentRef = useRef<HTMLElement | null>(null);

  const desiredWidth = useMemo(() => {
    const xs = (data?.[0] as Array<number | null>) ?? [];
    if (!xs.length) return 400;

    const numeric = xs.filter((v): v is number => typeof v === "number");
    if (!numeric.length) return 400;

    const first = numeric[0];
    const last = numeric[numeric.length - 1];
    const range = Math.max(0, last - first);
    // если временной диапазон маленький, используем количество точек как запас
    const effectiveRange = Math.max(range, numeric.length);
    const widthPx = Math.round(effectiveRange * pixelsPerSecond);
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

      const legendEl = root.querySelector(".u-legend") as HTMLElement | null;
      if (legendEl) {
        legendElRef.current = legendEl;
        originalLegendParentRef.current = legendEl.parentElement as HTMLElement | null;
        legendEl.classList.add("text-xs", "text-muted-foreground");

        if (scrollable && legendContainerRef.current) {
          legendContainerRef.current.innerHTML = "";
          legendContainerRef.current.appendChild(legendEl);
        }
      }

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
      const legendEl = legendElRef.current;
      const originalParent = originalLegendParentRef.current;
      if (legendEl && originalParent && legendEl.parentElement !== originalParent) {
        originalParent.appendChild(legendEl);
      }
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

  useEffect(() => {
    const legendEl = legendElRef.current;
    if (!legendEl) return;

    if (scrollable) {
      if (legendContainerRef.current && legendEl.parentElement !== legendContainerRef.current) {
        legendContainerRef.current.innerHTML = "";
        legendContainerRef.current.appendChild(legendEl);
      }
    } else {
      const originalParent = originalLegendParentRef.current;
      if (originalParent && legendEl.parentElement !== originalParent) {
        originalParent.appendChild(legendEl);
      }
    }
  }, [scrollable]);

  if (scrollable) {
    return (
      <div className="space-y-2">
        <div
          ref={legendContainerRef}
          className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground"
        />
        <div className="w-full overflow-x-auto">
          <div style={{ width: desiredWidth }}>
            <div ref={rootRef} />
          </div>
        </div>
      </div>
    );
  }

  return <div ref={rootRef} className="w-full" />;
}
