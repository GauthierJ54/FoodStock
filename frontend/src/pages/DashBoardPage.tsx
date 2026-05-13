import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Label, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CalendarClock, CheckCircle2, Layers3, Package, PieChart as PieChartIcon, TrendingUp, Warehouse } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStock, type FoodItem } from "@/api/generated/foodstockapi/stockAPI";

const chartColors = {
  green: "#16a34a",
  emerald: "#059669",
  amber: "#d97706",
  red: "#dc2626",
  cyan: "#0891b2",
  violet: "#7c3aed",
  slate: "#64748b",
  blue: "#2563eb",
};

function DashboardPage() {
  const { token } = useAuth();
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let isCancelled = false;

    async function loadStock() {
      try {
        setStatus("loading");

        const data = await getStock(token as string);

        if (isCancelled) return;

        setItems(data);
        setStatus("success");
      } catch {
        if (isCancelled) return;

        setError(t("dashboard.error"));
        setStatus("error");
      }
    }

    void loadStock();

    return () => {
      isCancelled = true;
    };
  }, [token, t]);

  const dashboard = useMemo(() => buildDashboardData(items, t, i18n.language), [items, t, i18n.language]);

  return (
    <div className="min-h-screen bg-green-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {t("dashboard.eyebrow")}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {t("dashboard.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              {t("dashboard.subtitle")}
            </p>
          </div>

          <Button asChild className="w-full bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 sm:w-auto">
            <Link to="/stock">
              <Package className="h-4 w-4" />
              {t("dashboard.manageStock")}
            </Link>
          </Button>
        </section>

        {status === "loading" ? (
          <div className="rounded-xl border border-green-100 bg-white p-8 text-center text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {t("dashboard.loading")}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title={t("dashboard.metrics.items")}
                value={dashboard.totalItems}
                detail={t("dashboard.metrics.itemsDetail", { count: dashboard.categoryCount })}
                icon={<Package className="h-5 w-5" />}
              />
              <MetricCard
                title={t("dashboard.metrics.expired")}
                value={dashboard.expiredItems}
                detail={t("dashboard.metrics.expiredDetail", { count: dashboard.expiringSoonItems })}
                icon={<AlertTriangle className="h-5 w-5" />}
                tone="red"
              />
              <MetricCard
                title={t("dashboard.metrics.lowStock")}
                value={dashboard.lowStockItems}
                detail={t("dashboard.metrics.lowStockDetail", { percent: dashboard.stockHealthPercent })}
                icon={<Layers3 className="h-5 w-5" />}
                tone="amber"
              />
              <MetricCard
                title={t("dashboard.metrics.locations")}
                value={dashboard.locationCount}
                detail={t("dashboard.metrics.locationsDetail", { count: dashboard.totalQuantity })}
                icon={<Warehouse className="h-5 w-5" />}
                tone="cyan"
              />
            </section>

            <section className="grid gap-4 xl:grid-cols-5">
              <ChartCard
                className="xl:col-span-3"
                title={t("dashboard.charts.category.title")}
                description={t("dashboard.charts.category.description")}
                icon={<Layers3 className="h-4 w-4" />}
              >
                <ChartContainer>
                  <ResponsiveContainer>
                    <BarChart data={dashboard.categoryData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltipContent config={{ count: { label: t("dashboard.labels.items"), color: chartColors.green } }} />} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} fill={chartColors.green} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </ChartCard>

              <ChartCard
                className="xl:col-span-2"
                title={t("dashboard.charts.expiration.title")}
                description={t("dashboard.charts.expiration.description")}
                icon={<PieChartIcon className="h-4 w-4" />}
              >
                <ChartContainer>
                  <ResponsiveContainer>
                    <PieChart>
                      <Tooltip content={<ChartTooltipContent config={{ value: { label: t("dashboard.labels.items"), color: chartColors.green } }} />} />
                      <Pie data={dashboard.expirationData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                        {dashboard.expirationData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </ChartCard>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <ChartCard
                title={t("dashboard.charts.created.title")}
                description={t("dashboard.charts.created.description")}
                icon={<TrendingUp className="h-4 w-4" />}
              >
                <ChartContainer>
                  <ResponsiveContainer>
                    <AreaChart data={dashboard.createdByMonth}>
                      <defs>
                        <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.emerald} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={chartColors.emerald} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltipContent config={{ count: { label: t("dashboard.labels.created"), color: chartColors.emerald } }} />} />
                      <Area type="monotone" dataKey="count" stroke={chartColors.emerald} fill="url(#createdGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </ChartCard>

              <ChartCard
                title={t("dashboard.charts.upcoming.title")}
                description={t("dashboard.charts.upcoming.description")}
                icon={<CalendarClock className="h-4 w-4" />}
              >
                <ChartContainer>
                  <ResponsiveContainer>
                    <LineChart data={dashboard.expiringTimeline}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltipContent config={{ count: { label: t("dashboard.labels.expirations"), color: chartColors.amber } }} />} />
                      <Line type="monotone" dataKey="count" stroke={chartColors.amber} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </ChartCard>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
              <ChartCard
                className="xl:col-span-2"
                title={t("dashboard.charts.locationQuantity.title")}
                description={t("dashboard.charts.locationQuantity.description")}
                icon={<Warehouse className="h-4 w-4" />}
              >
                <ChartContainer>
                  <ResponsiveContainer>
                    <BarChart data={dashboard.locationQuantityData} layout="vertical" margin={{ left: 4, right: 8 }}>
                      <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                      <XAxis type="number" tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={72} />
                      <Tooltip content={<ChartTooltipContent config={{ quantity: { label: t("dashboard.labels.quantity"), color: chartColors.cyan } }} />} />
                      <Bar dataKey="quantity" radius={[0, 8, 8, 0]} fill={chartColors.cyan} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </ChartCard>

              <ChartCard
                title={t("dashboard.charts.stockHealth.title")}
                description={t("dashboard.charts.stockHealth.description")}
                icon={<CheckCircle2 className="h-4 w-4" />}
              >
                <ChartContainer>
                  <ResponsiveContainer>
                    <RadialBarChart data={dashboard.stockHealthData} startAngle={90} endAngle={-270} innerRadius={74} outerRadius={106}>
                      <RadialBar dataKey="value" background cornerRadius={10} fill={chartColors.green} />
                      <Label
                        position="center"
                        content={() => (
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                            <tspan x="50%" className="fill-slate-950 text-3xl font-bold dark:fill-slate-100">
                              {dashboard.stockHealthPercent}%
                            </tspan>
                            <tspan x="50%" dy="24" className="fill-slate-500 text-xs dark:fill-slate-400">
                              {t("dashboard.labels.stockOk")}
                            </tspan>
                          </text>
                        )}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </ChartCard>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
              <ChartCard
                title={t("dashboard.charts.profile.title")}
                description={t("dashboard.charts.profile.description")}
                icon={<PieChartIcon className="h-4 w-4" />}
              >
                <ChartContainer>
                  <ResponsiveContainer>
                    <RadarChart data={dashboard.profileData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <Tooltip content={<ChartTooltipContent config={{ value: { label: t("dashboard.labels.score"), color: chartColors.violet } }} />} />
                      <Radar dataKey="value" stroke={chartColors.violet} fill={chartColors.violet} fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </ChartCard>

              <TopListCard
                title={t("dashboard.lists.expiration.title")}
                description={t("dashboard.lists.expiration.description")}
                items={dashboard.expirationPriorities}
                renderValue={(item) => new Date(item.expirationDate || "").toLocaleDateString("fr-FR")}
                emptyLabel={t("dashboard.lists.empty")}
              />

              <TopListCard
                title={t("dashboard.lists.stock.title")}
                description={t("dashboard.lists.stock.description")}
                items={dashboard.lowStockPriorities}
                renderValue={(item) => `${item.quantity} / ${item.minimumQuantity} ${item.unit}`}
                emptyLabel={t("dashboard.lists.empty")}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon,
  tone = "green",
}: {
  title: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
  tone?: "green" | "red" | "amber" | "cyan";
}) {
  const toneClass = {
    green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  }[tone];

  return (
    <Card className="border-green-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-2 text-3xl font-bold">{value}</CardTitle>
        </div>
        <div className={`rounded-xl p-2 ${toneClass}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 dark:text-slate-400">{detail}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  icon,
  className,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={`border-green-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className ?? ""}`}>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="rounded-lg bg-green-50 p-2 text-green-700 dark:bg-slate-800 dark:text-green-400">
          {icon}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function TopListCard({
  title,
  description,
  items,
  renderValue,
  emptyLabel,
}: {
  title: string;
  description: string;
  items: FoodItem[];
  renderValue: (item: FoodItem) => string;
  emptyLabel: string;
}) {
  return (
    <Card className="border-green-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
              {emptyLabel}
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-950 dark:text-slate-100">{item.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.category} - {item.location}</p>
                </div>
                <Badge variant="secondary" className="w-fit shrink-0">
                  {renderValue(item)}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function buildDashboardData(items: FoodItem[], t: (key: string, options?: Record<string, unknown>) => string, language: string) {
  const today = startOfDay(new Date());
  const inSevenDays = addDays(today, 7);
  const inThirtyDays = addDays(today, 30);

  const expiredItems = items.filter((item) => parseDate(item.expirationDate || "") < today).length;
  const expiringSoonItems = items.filter((item) => {
    const date = parseDate(item.expirationDate || "");
    return date >= today && date <= inSevenDays;
  }).length;
  const healthyExpirationItems = Math.max(items.length - expiredItems - expiringSoonItems, 0);
  const lowStockItems = items.filter((item) => item.quantity <= item.minimumQuantity).length;
  const stockHealthPercent = items.length === 0 ? 0 : Math.round(((items.length - lowStockItems) / items.length) * 100);

  return {
    totalItems: items.length,
    totalQuantity: round(items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)),
    expiredItems,
    expiringSoonItems,
    lowStockItems,
    categoryCount: new Set(items.map((item) => item.category).filter(Boolean)).size,
    locationCount: new Set(items.map((item) => item.location).filter(Boolean)).size,
    stockHealthPercent,
    categoryData: topEntries(groupCount(items, (item) => item.category || t("dashboard.labels.uncategorized")), 8),
    expirationData: [
      { name: t("dashboard.expiration.expired"), value: expiredItems, color: chartColors.red },
      { name: t("dashboard.expiration.soon"), value: expiringSoonItems, color: chartColors.amber },
      { name: t("dashboard.expiration.ok"), value: healthyExpirationItems, color: chartColors.green },
    ],
    createdByMonth: buildCreatedByMonth(items, language),
    expiringTimeline: buildExpiringTimeline(items, today, inThirtyDays, t),
    locationQuantityData: topEntries(groupSum(items, (item) => item.location || t("dashboard.labels.unstored"), (item) => item.quantity || 0), 8, "quantity"),
    stockHealthData: [{ name: t("dashboard.labels.stockOk"), value: stockHealthPercent, fill: chartColors.green }],
    profileData: [
      { name: t("dashboard.profile.categories"), value: score(new Set(items.map((item) => item.category)).size, 8) },
      { name: t("dashboard.profile.locations"), value: score(new Set(items.map((item) => item.location)).size, 6) },
      { name: t("dashboard.profile.stock"), value: stockHealthPercent },
      { name: t("dashboard.profile.freshness"), value: items.length === 0 ? 0 : Math.round((healthyExpirationItems / items.length) * 100) },
      { name: t("dashboard.profile.volume"), value: score(items.length, 30) },
    ],
    expirationPriorities: [...items]
      .filter((item) => parseDate(item.expirationDate || "") <= inThirtyDays)
      .sort((a, b) => parseDate(a.expirationDate || "").getTime() - parseDate(b.expirationDate || "").getTime())
      .slice(0, 5),
    lowStockPriorities: [...items]
      .filter((item) => item.quantity <= item.minimumQuantity)
      .sort((a, b) => (Number(a.quantity || 0) - Number(a.minimumQuantity || 0)) - (Number(b.quantity || 0) - Number(b.minimumQuantity || 0)))
      .slice(0, 5),
  };
}

function groupCount(items: FoodItem[], getKey: (item: FoodItem) => string) {
  return items.reduce<Record<string, number>>((groups, item) => {
    const key = getKey(item);
    groups[key] = (groups[key] ?? 0) + 1;
    return groups;
  }, {});
}

function groupSum(items: FoodItem[], getKey: (item: FoodItem) => string, getValue: (item: FoodItem) => number) {
  return items.reduce<Record<string, number>>((groups, item) => {
    const key = getKey(item);
    groups[key] = round((groups[key] ?? 0) + Number(getValue(item) || 0));
    return groups;
  }, {});
}

function topEntries(values: Record<string, number>, limit: number, valueKey = "count") {
  return Object.entries(values)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, value]) => ({ name, [valueKey]: value }));
}

function buildCreatedByMonth(items: FoodItem[], language: string) {
  const formatter = new Intl.DateTimeFormat(language, { month: "short" });
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    return {
      month: formatter.format(date),
      count: items.filter((item) => {
        const created = new Date(item.createdAt);
        return `${created.getFullYear()}-${created.getMonth()}` === key;
      }).length,
    };
  });
}

function buildExpiringTimeline(
  items: FoodItem[],
  start: Date,
  end: Date,
  t: (key: string, options?: Record<string, unknown>) => string
) {
  const windows = [
    { day: t("dashboard.timeline.days", { from: 0, to: 7 }), from: start, to: addDays(start, 7) },
    { day: t("dashboard.timeline.days", { from: 8, to: 14 }), from: addDays(start, 8), to: addDays(start, 14) },
    { day: t("dashboard.timeline.days", { from: 15, to: 21 }), from: addDays(start, 15), to: addDays(start, 21) },
    { day: t("dashboard.timeline.days", { from: 22, to: 30 }), from: addDays(start, 22), to: end },
  ];

  return windows.map((window) => ({
    day: window.day,
    count: items.filter((item) => {
      const expiration = parseDate(item.expirationDate || "");
      return expiration >= window.from && expiration <= window.to;
    }).length,
  }));
}

function parseDate(value: string) {
  return startOfDay(new Date(value));
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function score(value: number, target: number) {
  return Math.min(100, Math.round((value / target) * 100));
}

export default DashboardPage;
