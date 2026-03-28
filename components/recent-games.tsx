"use client"

import Link from "next/link"
import { useLang, tr } from "@/components/lang-context"
import { formatTeamName } from "@/lib/romanize"

type GameRow = {
  game_id: string
  away_team: string
  away_score: number | null
  home_team: string
  home_score: number | null
  status?: string
  game_time?: string | null
}

export function RecentGames({
  rows,
  date,
}: {
  rows: GameRow[]
  date: string | null
}) {
  const { lang } = useLang()

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{tr("recentGames.title", lang)}</h2>
        <span className="text-xs text-muted-foreground font-mono">{date ?? "-"}</span>
      </div>
      <div className="divide-y divide-border">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {lang === "en" ? "No games today." : "오늘 예정된 경기가 없습니다."}
          </div>
        ) : (
          rows.map((game) => {
            // Determine game state
            const isFinished = game.away_score !== null && game.status !== "live" && game.status !== "in_progress"
            const isLive = game.status === "live" || game.status === "in_progress"
            const isScheduled = !isFinished && !isLive

            const homeWin = isFinished && (game.home_score ?? 0) > (game.away_score ?? 0)
            const awayWin = isFinished && (game.away_score ?? 0) > (game.home_score ?? 0)
            return (
              <div key={game.game_id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 px-4 py-2.5 hover:bg-secondary/50">
                {/* Away team — right-aligned */}
                <div className="text-right">
                  <Link
                    href={`/team?team=${encodeURIComponent(game.away_team)}`}
                    className={`text-sm font-semibold hover:text-primary hover:underline underline-offset-2 transition-colors ${isFinished && !awayWin ? "text-muted-foreground font-normal" : "text-foreground"}`}
                  >
                    {formatTeamName(game.away_team, lang)}
                  </Link>
                </div>

                {/* Center badge */}
                <div className="flex flex-col items-center gap-0.5">
                  {isScheduled && (
                    <>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-mono font-semibold text-primary">
                        {game.game_time ? game.game_time.slice(0, 5) : lang === "ko" ? "예정" : "TBD"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{lang === "ko" ? "예정" : "Sched"}</span>
                    </>
                  )}
                  {isLive && (
                    <>
                      <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-semibold text-orange-400">
                        {lang === "ko" ? "진행중" : "LIVE"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{lang === "ko" ? "경기중" : "Live"}</span>
                    </>
                  )}
                  {isFinished && (
                    <div className="flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1">
                      <span className={`text-base font-mono font-bold ${awayWin ? "text-foreground" : "text-muted-foreground"}`}>{game.away_score}</span>
                      <span className="text-xs text-muted-foreground">:</span>
                      <span className={`text-base font-mono font-bold ${homeWin ? "text-foreground" : "text-muted-foreground"}`}>{game.home_score}</span>
                    </div>
                  )}
                </div>

                {/* Home team — left-aligned */}
                <div className="text-left">
                  <Link
                    href={`/team?team=${encodeURIComponent(game.home_team)}`}
                    className={`text-sm font-semibold hover:text-primary hover:underline underline-offset-2 transition-colors ${isFinished && !homeWin ? "text-muted-foreground font-normal" : "text-foreground"}`}
                  >
                    {formatTeamName(game.home_team, lang)}
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}