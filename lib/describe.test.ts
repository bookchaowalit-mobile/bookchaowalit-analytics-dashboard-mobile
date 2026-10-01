import { describe, expect, it } from "vitest";
import { describeSeries, type DailyMetric } from "./analytics";

const rows: DailyMetric[] = [
  { date: "2025-06-01", visitors: 10, signups: 1, revenue: 100 },
  { date: "2025-06-02", visitors: 30, signups: 0, revenue: 1500.4 },
  { date: "2025-06-03", visitors: 20, signups: 2, revenue: 50 },
];

describe("describeSeries", () => {
  it("summarises total, min and max for screen readers", () => {
    expect(describeSeries(rows, "visitors")).toBe(
      "Daily visitors from 2025-06-01 to 2025-06-03: total 60, lowest 10 on 2025-06-01, highest 30 on 2025-06-02.",
    );
    expect(describeSeries(rows, "revenue")).toContain("highest ฿1,500 on 2025-06-02");
  });
  it("handles an empty series", () => {
    expect(describeSeries([], "signups")).toBe("No signups data.");
  });
});
