import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

export function ChartContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("h-[240px] w-full text-sm sm:h-[280px]", className)}>
      {children}
    </div>
  );
}

type TooltipPayload = {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
};

export function ChartTooltipContent({
  active,
  label,
  payload,
  config,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayload[];
  config?: ChartConfig;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="min-w-36 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {label !== undefined && (
        <p className="mb-2 font-medium text-slate-900 dark:text-slate-100">
          {label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? "");
          const item = config?.[key];

          return (
            <div key={`${key}-${entry.value}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item?.color ?? entry.color }}
                />
                {item?.label ?? entry.name ?? key}
              </span>
              <span className="font-semibold text-slate-950 dark:text-slate-100">
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
