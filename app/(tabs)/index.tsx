import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { describeSeries, formatChange, formatKpi, normalize, sampleSeries, summarize, type Kpi } from "../../lib/analytics";

const SERIES = sampleSeries(60);
const RANGES = [7, 14, 30] as const;
type Metric = "visitors" | "signups" | "revenue";

export default function DashboardScreen() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(7);
  const [metric, setMetric] = useState<Metric>("visitors");

  const kpis = useMemo(() => summarize(SERIES, days), [days]);
  const rows = SERIES.slice(-days);
  const bars = normalize(rows.map((r) => r[metric]));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Analytics Dashboard
        </Text>
        <Text style={styles.subtitle}>
          Last {days} days vs the {days} days before · sample data ending {SERIES[SERIES.length - 1].date}
        </Text>
      </View>

      <View style={styles.chips}>
        {RANGES.map((r) => (
          <Chip key={r} label={`${r}d`} a11yLabel={`Last ${r} days`} active={days === r} onPress={() => setDays(r)} />
        ))}
      </View>

      <View style={styles.grid}>
        {kpis.map((k) => (
          <KpiCard key={k.key} kpi={k} />
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily trend</Text>
        <View style={styles.chips}>
          {(["visitors", "signups", "revenue"] as const).map((m) => (
            <Chip key={m} label={m} a11yLabel={`Show daily ${m}`} active={metric === m} onPress={() => setMetric(m)} />
          ))}
        </View>
        <View
          style={styles.chart}
          accessibilityRole="image"
          accessibilityLabel={describeSeries(rows, metric)}
        >
          {bars.map((h, i) => (
            <View key={rows[i].date} style={[styles.bar, { height: `${Math.max(2, h * 100)}%` }]} />
          ))}
        </View>
        <View style={styles.axis}>
          <Text style={styles.axisText}>{rows[0].date}</Text>
          <Text style={styles.axisText}>{rows[rows.length - 1].date}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const up = kpi.change === null || kpi.change >= 0;
  return (
    <View style={styles.kpi} accessible accessibilityLabel={`${kpi.label} ${formatKpi(kpi)}, ${formatChange(kpi.change)} vs previous period`}>
      <Text style={styles.kpiLabel}>{kpi.label}</Text>
      <Text style={styles.kpiValue}>{formatKpi(kpi)}</Text>
      <Text style={[styles.kpiChange, up ? styles.up : styles.down]}>{formatChange(kpi.change)}</Text>
    </View>
  );
}

function Chip({
  label,
  a11yLabel,
  active,
  onPress,
}: {
  label: string;
  a11yLabel?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? label}
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { backgroundColor: "#2F6DB5", padding: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: "#E3ECF7" },
  chipActive: { backgroundColor: "#4A90D9" },
  chipText: { color: "#2A5A8C", fontWeight: "500", textTransform: "capitalize" },
  chipTextActive: { color: "#fff" },
  grid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 },
  kpi: { flexBasis: "47%", flexGrow: 1, backgroundColor: "#fff", borderRadius: 12, padding: 14, elevation: 2 },
  kpiLabel: { fontSize: 13, color: "#666" },
  kpiValue: { fontSize: 22, fontWeight: "700", color: "#222", marginVertical: 4 },
  kpiChange: { fontSize: 13, fontWeight: "600" },
  up: { color: "#1B7F3B" },
  down: { color: "#B00020" },
  card: { backgroundColor: "#fff", borderRadius: 12, margin: 16, marginTop: 4, paddingBottom: 16, elevation: 2 },
  cardTitle: { fontSize: 17, fontWeight: "600", color: "#333", paddingHorizontal: 16, paddingTop: 16 },
  chart: { height: 140, flexDirection: "row", alignItems: "flex-end", gap: 2, paddingHorizontal: 16, marginTop: 16 },
  bar: { flex: 1, backgroundColor: "#4A90D9", borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  axis: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 4 },
  axisText: { fontSize: 11, color: "#666" },

});
