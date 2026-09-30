import { describe, expect, it } from "vitest";
import { formatChange, formatKpi, isDecrease, normalize, percentChange, sampleSeries, summarize, type DailyMetric } from "./analytics";

const row = (date: string, visitors: number, signups: number, revenue: number): DailyMetric => ({ date, visitors, signups, revenue });

describe("percentChange", () => {
  it("computes relative change", () => {
    expect(percentChange(150, 100)).toBeCloseTo(0.5);
    expect(percentChange(50, 100)).toBeCloseTo(-0.5);
  });
  it("handles a zero baseline", () => {
    expect(percentChange(0, 0)).toBe(0);
    expect(percentChange(10, 0)).toBeNull();
  });
});

describe("summarize", () => {
  const series = [
    row("2025-01-01", 100, 5, 500),
    row("2025-01-02", 100, 5, 500),
    row("2025-01-03", 200, 20, 1000),
    row("2025-01-04", 200, 20, 1000),
  ];
  it("compares the last window with the one before", () => {
    const [visitors, signups, revenue, conversion] = summarize(series, 2);
    expect(visitors).toMatchObject({ value: 400, previous: 200, change: 1 });
    expect(signups).toMatchObject({ value: 40, previous: 10 });
    expect(revenue.value).toBe(2000);
    expect(conversion.value).toBeCloseTo(0.1);
    expect(conversion.previous).toBeCloseTo(0.05);
    expect(conversion.change).toBeCloseTo(1);
  });
  it("treats a missing previous window as new", () => {
    const [visitors] = summarize(series, 4);
    expect(visitors.previous).toBe(0);
    expect(visitors.change).toBeNull();
  });
  it("rejects invalid windows", () => {
    expect(() => summarize(series, 0)).toThrow(RangeError);
  });
});

describe("normalize", () => {
  it("scales to the max", () => {
    expect(normalize([1, 2, 4])).toEqual([0.25, 0.5, 1]);
    expect(normalize([0, 0])).toEqual([0, 0]);
    expect(normalize([])).toEqual([]);
  });
});

describe("sampleSeries", () => {
  it("is deterministic, ascending and ends on the end date", () => {
    const a = sampleSeries(30);
    expect(a).toEqual(sampleSeries(30));
    expect(a).toHaveLength(30);
    expect(a[29].date).toBe("2025-06-30");
    expect(a[0].date).toBe("2025-06-01");
    expect(a.every((r) => r.signups <= r.visitors)).toBe(true);
  });
});

describe("formatting", () => {
  it("formats kpis and changes", () => {
    expect(formatKpi({ key: "conversion", value: 0.0421 })).toBe("4.21%");
    expect(formatKpi({ key: "revenue", value: 12345.6 })).toBe("฿12,346");
    expect(formatKpi({ key: "visitors", value: 1500 })).toBe("1,500");
    expect(formatChange(0.123)).toBe("+12.3%");
    expect(formatChange(-0.05)).toBe("-5.0%");
    expect(formatChange(null)).toBe("new");
  });
});

describe("pass 3 edge cases", () => {
  it("does not compare a full window against a truncated previous window", () => {
    const rows = sampleSeries(10);
    const kpis = summarize(rows, 7);
    expect(kpis.every((k) => k.change === null)).toBe(true);
    expect(summarize(sampleSeries(14), 7).every((k) => k.change !== null)).toBe(true);
  });
  it("never shows a negative zero change or colours it as a decrease", () => {
    expect(formatChange(-0.0001)).toBe("0.0%");
    expect(isDecrease(-0.0001)).toBe(false);
    expect(formatChange(0)).toBe("0.0%");
    expect(isDecrease(-0.0006)).toBe(true);
    expect(formatChange(-0.0006)).toBe("-0.1%");
    expect(isDecrease(null)).toBe(false);
  });
  it("keeps bars finite when a value is NaN or Infinity", () => {
    expect(normalize([NaN, 5, 10])).toEqual([0, 0.5, 1]);
    expect(normalize([Infinity, 4])).toEqual([0, 1]);
  });
});
