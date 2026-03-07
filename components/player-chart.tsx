"use client"

import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { HitterSeason } from "@/lib/mock-data"

/* HitterSeason.AVG/OPS/WAR 등은 string ("-" 포함) */
function toNum(v: string | number | undefined): number | null {
  if (v === undefined || v === null || v === "-") return null
  const n = typeof v === "number" ? v : parseFloat(v)
  return Number.isFinite(n) ? n : null
}

const TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
  fontSize: 12,
}

type ChartEntry = {
  season: string
  AVG: number | null
  OPS: number | null
  WAR: number | null
  HR: number | null
}

/* ─── 개별 차트 컴포넌트 ─────────────────────────────── */

function AvgOpsChart({ data }: { data: ChartEntry[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">타율 / OPS 추이</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="season" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <YAxis
            tickFormatter={(v) => typeof v === "number" ? v.toFixed(3) : v}
            domain={["auto", "auto"]}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name) => {
              if (value === null || value === undefined) return ["-", name]
              return [Number(value).toFixed(3), name === "AVG" ? "타율" : "OPS"]
            }}
          />
          <Legend
            formatter={(v) => v === "AVG" ? "타율" : "OPS"}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="AVG"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="OPS"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function WarChart({ data }: { data: ChartEntry[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">WAR 추이</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="season" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => [value === null ? "-" : Number(value).toFixed(1), "WAR"]}
          />
          <ReferenceLine y={0} stroke="var(--border)" />
          <Bar
            dataKey="WAR"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function HrChart({ data }: { data: ChartEntry[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-sm font-semibold text-foreground">홈런 추이</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="season" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => [value === null ? "-" : value, "HR"]}
          />
          <Bar
            dataKey="HR"
            fill="#f97316"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ─── 메인 export ─────────────────────────────────── */

export function PlayerChart({ seasons }: { seasons: HitterSeason[] }) {
  const sorted = [...seasons].sort((a, b) => Number(a.season) - Number(b.season))

  const data: ChartEntry[] = sorted.map((s) => ({
    season: String(s.season),
    AVG: toNum(s.AVG),
    OPS: toNum(s.OPS),
    WAR: toNum(s.WAR),
    HR:  toNum(s.HR),
  }))

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        시각화할 시즌 데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="md:col-span-2">
        <AvgOpsChart data={data} />
      </div>
      <WarChart data={data} />
      <HrChart data={data} />
    </div>
  )
}
