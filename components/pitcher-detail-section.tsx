"use client"

import { useState } from "react"

import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BarChart3, ChevronDown } from "lucide-react"

import { useLang } from "@/components/lang-context"

type MonthRow = {
  month: string
  ERA: number
  K9: number
  W: number
}

type Props = {
  monthlyRows: MonthRow[]
  selectedSeason: number
  availableSeasons: number[]
}

const TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
  fontSize: 12,
}

function formatMonth(month: string, lang: "ko" | "en") {
  const monthValue = Number(month.slice(4, 6))
  return lang === "ko" ? `${monthValue}월` : `M${monthValue}`
}

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildChartRows(rows: MonthRow[], lang: "ko" | "en") {
  return rows
    .slice()
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((row) => ({
      monthLabel: formatMonth(row.month, lang),
      ERA: toNumber(row.ERA),
      K9: toNumber(row.K9),
      W: toNumber(row.W),
    }))
}

export function PitcherDetailSection({ monthlyRows, selectedSeason, availableSeasons }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const { lang } = useLang()
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const isDark = resolvedTheme === "dark"
  const tickColor = isDark ? "#9ca3af" : "#64748b"
  const gridColor = isDark ? "#1e293b" : "#e2e8f0"
  const labelColor = isDark ? "#ffffff" : "#1e293b"
  const chartRows = buildChartRows(monthlyRows, lang)

  function handleSeasonChange(season: string) {
    const params = new URLSearchParams(window.location.search)
    params.set("season", season)
    params.set("player_type", "pitcher")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{lang === "ko" ? "시각화" : "Visualization"}</h2>
          <span className="ml-1 rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {selectedSeason}
            {lang === "ko" ? "시즌" : " Season"}
          </span>
        </div>
        <div className="relative">
          <select
            value={String(selectedSeason)}
            onChange={(event) => handleSeasonChange(event.target.value)}
            className="appearance-none rounded-md border border-border bg-secondary px-3 py-1.5 pr-8 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            {availableSeasons.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {chartRows.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {lang === "ko" ? "월별 투수 데이터가 없습니다." : "No monthly pitcher data."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">

          {/* 누적 ERA — 단독 라인, Y축 반전 (위=낮음=좋음) */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">
              {lang === "ko" ? "누적 평균자책점 (ERA)" : "Cumulative ERA"}
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              {lang === "ko" ? "낮을수록 좋음" : "Lower is better"}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartRows} margin={{ top: 6, right: 8, bottom: 16, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: tickColor }} />
                <YAxis
                  tick={{ fontSize: 11, fill: tickColor }}
                  tickFormatter={(v) => toNumber(v).toFixed(2)}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value) => [toNumber(value).toFixed(3), lang === "ko" ? "평자" : "ERA"]}
                />
                <Line
                  type="monotone"
                  dataKey="ERA"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 월별 승수 — 막대, 숫자만, 툴팁 없음 */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">
              {lang === "ko" ? "월별 승수" : "Wins per Month"}
            </h3>
            <p className="mb-3 text-xs text-muted-foreground">
              {lang === "ko" ? "해당 월 승리 수" : "Wins recorded that month"}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartRows}
                margin={{ top: 24, right: 8, bottom: 4, left: -16 }}
                onMouseLeave={() => setActiveIdx(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: tickColor }} />
                <Bar
                  dataKey="W"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  onMouseEnter={(_: unknown, index: number) => setActiveIdx(index)}
                  label={({ x, y, width, value, index }: { x: number; y: number; width: number; value: number; index: number }) =>
                    index === activeIdx ? (
                      <text
                        x={x + width / 2}
                        y={y - 6}
                        fill={labelColor}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={700}
                      >
                        {value}
                      </text>
                    ) : <text />
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </section>
  )
}
