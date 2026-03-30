"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLang, tr } from "@/components/lang-context"
import { formatTeamName } from "@/lib/romanize"

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
  currentSeason,
}: {
  rows: StandingRow[]
  asOfDate: string | null
  currentSeason?: number
}) {
  const { lang } = useLang()

  // On opening day, asOfDate is still from last season → show 준비중
  const isStale =
    currentSeason != null &&
    asOfDate != null &&
    !asOfDate.startsWith(String(currentSeason))

  const KBO_TEAMS = ["KIA","삼성","LG","두산","KT","SSG","롯데","한화","NC","키움"]

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">
          {tr("standings.title", lang)}
          {currentSeason ? <span className="ml-1.5 text-xs text-muted-foreground font-normal">({currentSeason})</span> : null}
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {isStale ? "-" : (asOfDate && asOfDate.length === 8 ? `${asOfDate.slice(0, 4)}.${asOfDate.slice(4, 6)}.${asOfDate.slice(6, 8)}` : (asOfDate ?? "-"))}
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-10 text-center text-xs text-muted-foreground">#</TableHead>
            <TableHead className="text-xs text-muted-foreground">{tr("standings.team", lang)}</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">{tr("standings.w", lang)}</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">{tr("standings.d", lang)}</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">{tr("standings.l", lang)}</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">{lang === "en" ? "PCT" : "승률"}</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">{lang === "en" ? "GB" : "게임차"}</TableHead>
            <TableHead className="hidden text-center text-xs text-muted-foreground sm:table-cell">{lang === "en" ? "Streak" : "연속"}</TableHead>
            <TableHead className="hidden text-center text-xs text-muted-foreground md:table-cell">{lang === "en" ? "Last10" : "최근10"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isStale ? (
            KBO_TEAMS.map((team) => (
              <TableRow key={team} className="border-border transition-colors hover:bg-secondary/50">
                <TableCell className="text-center text-xs font-mono text-muted-foreground">-</TableCell>
                <TableCell className="text-sm font-medium">
                  <Link href={`/team?team=${encodeURIComponent(team)}`} className="text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors">
                    {formatTeamName(team, lang)}
                  </Link>
                </TableCell>
                <TableCell className="text-center text-sm font-mono text-primary">0</TableCell>
                <TableCell className="text-center text-sm font-mono text-muted-foreground">0</TableCell>
                <TableCell className="text-center text-sm font-mono text-primary">0</TableCell>
                <TableCell className="text-center text-sm font-mono text-muted-foreground">-</TableCell>
                <TableCell className="text-center text-sm font-mono text-muted-foreground">-</TableCell>
                <TableCell className="hidden text-center text-xs font-mono text-muted-foreground sm:table-cell">-</TableCell>
                <TableCell className="hidden text-center text-xs font-mono text-muted-foreground md:table-cell">-</TableCell>
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                {lang === "en" ? "No scheduled games." : "데이터가 없습니다."}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((team) => (
              <TableRow key={`${team.rank}-${team.team}`} className="border-border transition-colors hover:bg-secondary/50">
                <TableCell className="text-center text-xs font-mono text-muted-foreground">{team.rank}</TableCell>
                <TableCell className="text-sm font-medium">
                  <Link
                    href={`/team?team=${encodeURIComponent(team.team)}`}
                    className="text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors"
                  >
                    {formatTeamName(team.team, lang)}
                  </Link>
                </TableCell>
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
                <TableCell className="hidden text-center text-xs font-mono text-muted-foreground md:table-cell">
                  {team.recent_10 ? (lang === "en" ? team.recent_10.replace(/승/g, 'W-').replace(/무/g, 'D-').replace(/패/g, 'L').replace(/-$/, '') : team.recent_10) : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
