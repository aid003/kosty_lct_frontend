'use client';

import { RealtimeUPlot } from '@/widgets';

interface SeriesDef {
  label: string;
  color: string;
}

interface ChartCardProps {
  title: string;
  data: Array<Array<number | null>>; // [x, y]
  series: SeriesDef[];
  yLabel?: string;
  height?: number;
  scrollable?: boolean;
  pixelsPerSecond?: number;
}

export function ChartCard({
  title,
  data,
  series,
  yLabel,
  height = 300,
  scrollable,
  pixelsPerSecond,
}: ChartCardProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <RealtimeUPlot
        data={data}
        series={series}
        yLabel={yLabel}
        height={height}
        scrollable={scrollable}
        pixelsPerSecond={pixelsPerSecond}
      />
    </div>
  );
}

