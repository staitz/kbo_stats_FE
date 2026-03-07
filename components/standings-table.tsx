"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLang } from "@/components/lang-context"

type StandingRow = {
  rank: number
  team: string
  wins: number
  losses: number
  draws: number
  win_pct: number | string
  gb: number | string | null
  streak?: string | null
  recent_10?: string | null
}

/**
 * 백엔드에서 오는 한국어 streak("3연패", "2연승" 등)을 영어("3L", "2W")로 변환.
 * 영어 모드가 아닐 때는 그대로 반환.
 */
function localizeStreak(streak: string | null | undefined, lang: "ko" | "en"): string {
  if (!streak) return "-"
  if (lang === "ko") return streak
  // "N연승" → "NW", "N연패" → "NL", "N연무" → "ND"
  const m = streak.match(/^(\d+)(연승|연패|연무)$/)
  if (m) {
    const n = m[1]
    const type = m[2] === "연승" ? "W" : m[2] === "연패" ? "L" : "D"
    return `${n}${type}`
  }
  return streak
}

export function StandingsTable({
  rows,
  asOfDate,
}: {
  rows: StandingRow[]
  asOfDate: string | null
}) {
  const { lang } = useLang()

  const title = lang === "en" ? "Season Standings" : "시즌 순위"
  const teamLabel = lang === "en" ? "Team" : "팀"

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="font-mono text-xs text-muted-foreground">{asOfDate ?? "-"}</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-10 text-center text-xs text-muted-foreground">#</TableHead>
            <TableHead className="text-xs text-muted-foreground">{teamLabel}</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">W</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">D</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">L</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">PCT</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">GB</TableHead>
            <TableHead className="hidden text-center text-xs text-muted-foreground sm:table-cell">Streak</TableHead>
            <TableHead className="hidden text-center text-xs text-muted-foreground md:table-cell">Last10</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((team) => (
            <TableRow key={`${team.rank}-${team.team}`} className="border-border transition-colors hover:bg-secondary/50">
              <TableCell className="text-center text-xs font-mono text-muted-foreground">{team.rank}</TableCell>
              <TableCell className="text-sm font-medium text-foreground">{team.team}</TableCell>
              <TableCell className="text-center text-sm font-mono text-foreground">{team.wins}</TableCell>
              <TableCell className="text-center text-sm font-mono text-muted-foreground">{team.draws}</TableCell>
              <TableCell className="text-center text-sm font-mono text-foreground">{team.losses}</TableCell>
              <TableCell className="text-center text-sm font-mono font-semibold text-foreground">
                {typeof team.win_pct === "number" ? team.win_pct.toFixed(3) : team.win_pct}
              </TableCell>
              <TableCell className="text-center text-sm font-mono text-muted-foreground">{team.gb ?? "-"}</TableCell>
              <TableCell className="hidden text-center text-xs font-mono sm:table-cell">
                {localizeStreak(team.streak, lang)}
              </TableCell>
              <TableCell className="hidden text-center text-xs font-mono text-muted-foreground md:table-cell">{team.recent_10 ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
