/** Pure analytics helpers: KPI summaries, period-over-period change, chart scaling. */

export type DailyMetric = { date: string; visitors: number; signups: number; revenue: number };

export type Kpi = {
  key: "visitors" | "signups" | "revenue" | "conversion";
  label: string;
  value: number;
  previous: number;
  /** Relative change vs the previous window (0.1 = +10%); null when previous is 0. */
  change: number | null;
};

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / previous;
}

function sum(rows: DailyMetric[], key: "visitors" | "signups" | "revenue"): number {
  return rows.reduce((acc, r) => acc + r[key], 0);
}

/**
 * Summarise the last `days` rows against the `days` rows before them.
 * Rows must be sorted by date ascending.
 */
export function summarize(series: DailyMetric[], days: number): Kpi[] {
  if (!Number.isInteger(days) || days <= 0) throw new RangeError("days must be a positive integer");
  const current = series.slice(-days);
  const previous = series.slice(Math.max(0, series.length - 2 * days), Math.max(0, series.length - days));
  const kpi = (key: "visitors" | "signups" | "revenue", label: string): Kpi => {
    const value = sum(current, key);
    const prev = sum(previous, key);
    return { key, label, value, previous: prev, change: percentChange(value, prev) };
  };
  const visitors = kpi("visitors", "Visitors");
  const signups = kpi("signups", "Sign-ups");
  const conv = visitors.value === 0 ? 0 : signups.value / visitors.value;
  const prevConv = visitors.previous === 0 ? 0 : signups.previous / visitors.previous;
  return [
    visitors,
    signups,
    kpi("revenue", "Revenue"),
    { key: "conversion", label: "Conversion", value: conv, previous: prevConv, change: percentChange(conv, prevConv) },
  ];
}

/** Scale values to 0..1 for a bar chart (all zeros stay zero). */
export function normalize(values: number[]): number[] {
  const max = Math.max(0, ...values);
  return values.map((v) => (max === 0 ? 0 : Math.max(0, v) / max));
}

/** Deterministic pseudo-random sample data so the dashboard is reproducible offline. */
export function sampleSeries(days: number, endDate = "2025-06-30", seed = 42): DailyMetric[] {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  const rows: DailyMetric[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(end - i * 86_400_000).toISOString().slice(0, 10);
    const trend = 1 + (days - i) / (days * 4);
    const visitors = Math.round((800 + rand() * 400) * trend);
    const signups = Math.round(visitors * (0.03 + rand() * 0.02));
    rows.push({ date, visitors, signups, revenue: signups * 290 });
  }
  return rows;
}

export function formatKpi(kpi: Pick<Kpi, "key" | "value">): string {
  if (kpi.key === "conversion") return `${(kpi.value * 100).toFixed(2)}%`;
  if (kpi.key === "revenue") return `฿${Math.round(kpi.value).toLocaleString("en-US")}`;
  return Math.round(kpi.value).toLocaleString("en-US");
}

export function formatChange(change: number | null): string {
  if (change === null) return "new";
  const pct = (change * 100).toFixed(1);
  return `${change >= 0 ? "+" : ""}${pct}%`;
}

/**
 * Screen-reader summary of a daily series (the bar chart is purely visual):
 * total, and the lowest and highest days.
 */
export function describeSeries(rows: DailyMetric[], metric: "visitors" | "signups" | "revenue"): string {
  if (rows.length === 0) return `No ${metric} data.`;
  let min = rows[0];
  let max = rows[0];
  let total = 0;
  for (const r of rows) {
    total += r[metric];
    if (r[metric] < min[metric]) min = r;
    if (r[metric] > max[metric]) max = r;
  }
  const fmt = (v: number) => (metric === "revenue" ? `฿${Math.round(v).toLocaleString("en-US")}` : Math.round(v).toLocaleString("en-US"));
  return `Daily ${metric} from ${rows[0].date} to ${rows[rows.length - 1].date}: total ${fmt(total)}, lowest ${fmt(min[metric])} on ${min.date}, highest ${fmt(max[metric])} on ${max.date}.`;
}
