"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts"
import { BarChart3, ChevronDown } from "lucide-react"
import { useLang, tr } from "@/components/lang-context"

/* ─── 타입 ────────────────────────────────────────── */
type MonthRow = {
  month: string     // "YYYYMM"
  games: number
  PA: number
  AB: number
  H: number
  HR: number
  BB: number
  HBP?: number
  SF?: number
  TB_adj?: number
  AVG: number       // 월별 소표본 (사용 안 함)
  OBP: number
  SLG: number
  OPS: number
}

type SeasonYear = {
  season: number
  team: string
  HR: number
  AVG: number | string
  OPS: number | string
  WAR?: number | string
}

type Props = {
  playerName: string
  playerId: string
  seasonHistory: SeasonYear[]
  monthlyRows: MonthRow[]
  selectedSeason: number
  availableSeasons: number[]
}

/* ─── 상수 ──────────────────────────────────────── */
const TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--foreground)",
  fontSize: 12,
}

/* ─── 유틸 ──────────────────────────────────────── */
function fmtMonth(m: string, lang: "ko" | "en") {
  const n = parseInt(m.slice(4))
  return lang === "en" ? `M${n}` : `${n}월`
}
function toN(v: unknown): number {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

/* 시즌 누적 타율/OPS 계산 */
type CumEntry = {
  monthLabel: string
  cumAVG: number
  cumOPS: number
  HR: number
  PA: number
}

function buildCumulative(rows: MonthRow[], lang: "ko" | "en"): CumEntry[] {
  let cumAB = 0, cumH = 0, cumBB = 0, cumHBP = 0, cumSF = 0, cumTB = 0

  return rows
    .slice()
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((r) => {
      cumAB  += toN(r.AB)
      cumH   += toN(r.H)
      cumBB  += toN(r.BB)
      cumHBP += toN(r.HBP)
      cumSF  += toN(r.SF)
      cumTB  += toN(r.TB_adj)

      const avg = cumAB > 0 ? cumH / cumAB : 0
      const obpDen = cumAB + cumBB + cumHBP + cumSF
      const obp = obpDen > 0 ? (cumH + cumBB + cumHBP) / obpDen : 0
      const slg = cumAB > 0 ? cumTB / cumAB : 0

      return {
        monthLabel: fmtMonth(r.month, lang),
        cumAVG: parseFloat(avg.toFixed(4)),
        cumOPS: parseFloat((obp + slg).toFixed(4)),
        HR: toN(r.HR),
        PA: toN(r.PA),
      }
    })
}

/* ─── 차트 컴포넌트 ──────────────────────────────── */

/** 타율/OPS: 누적 라인차트 */
function CumAvgOpsChart({ data, tickColor, gridColor, lang }: { data: CumEntry[]; tickColor: string; gridColor: string; lang: "ko" | "en" }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-sm font-semibold text-foreground">{tr("chart.cumAvgOpsTitle", lang)}</h3>
      <p className="mb-3 text-xs text-muted-foreground">{tr("chart.cumAvgOpsDesc", lang)}</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 6, right: 8, bottom: 16, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: tickColor }} />
          <YAxis
            domain={[0, 1.2]}
            tickFormatter={(v) => Number(v).toFixed(2)}
            tick={{ fontSize: 11, fill: tickColor }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, n) => [Number(v).toFixed(3), n === "cumAVG" ? tr("chart.cumAvg", lang) : tr("chart.cumOps", lang)]}
          />
          <Legend
            formatter={(v) => v === "cumAVG" ? tr("chart.cumAvg", lang) : tr("chart.cumOps", lang)}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone" dataKey="cumAVG" stroke="#22c55e" strokeWidth={2.5}
            dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls
          />
          <Line
            type="monotone" dataKey="cumOPS" stroke="#3b82f6" strokeWidth={2.5}
            dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/** 홈런: hover 시에만 값 표시, 하단에 월 표시 */
function HrBarChart({ data, tickColor, gridColor, labelColor, lang }: { data: CumEntry[]; tickColor: string; gridColor: string; labelColor: string; lang: "ko" | "en" }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-sm font-semibold text-foreground">{tr("chart.monthlyHr", lang)}</h3>
      <p className="mb-3 text-xs text-muted-foreground">{tr("chart.monthlyHrDesc", lang)}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
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
            dataKey="HR"
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
  )
}


/* ─── 메인 컴포넌트 ──────────────────────────────── */
export function PlayerDetailSection({
  monthlyRows,
  selectedSeason,
  availableSeasons,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const tickColor  = isDark ? "#9ca3af" : "#64748b"
  const gridColor  = isDark ? "#1e293b" : "#e2e8f0"
  const labelColor = isDark ? "#ffffff" : "#1e293b"

  function handleSeasonChange(season: string) {
    router.push(`${pathname}?season=${season}`)
  }

  const { lang } = useLang()
  const chartData = buildCumulative(monthlyRows, lang)

  return (
    <section className="mt-6">
      {/* 헤더: 타이틀 + 연도 선택 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{tr("chart.title", lang)}</h2>
          <span className="ml-1 rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {selectedSeason}{tr("chart.season", lang)}
          </span>
        </div>
        <div className="relative">
          <select
            value={String(selectedSeason)}
            onChange={(e) => handleSeasonChange(e.target.value)}
            className="appearance-none rounded-md border border-border bg-secondary px-3 py-1.5 pr-8 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            {availableSeasons.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          {selectedSeason}{tr("chart.season", lang)} {tr("chart.noData", lang)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <CumAvgOpsChart data={chartData} tickColor={tickColor} gridColor={gridColor} lang={lang} />
          <HrBarChart data={chartData} tickColor={tickColor} gridColor={gridColor} labelColor={labelColor} lang={lang} />
        </div>
      )}
    </section>
  )
}
