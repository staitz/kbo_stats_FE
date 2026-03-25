"use client"

import { useLang, tr } from "@/components/lang-context"
import { formatTeamName } from "@/lib/romanize"

type GameRow = {
  game_id: string
  away_team: string
  away_score: number
  home_team: string
  home_score: number
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
            const homeWin = game.home_score > game.away_score
            const awayWin = game.away_score > game.home_score
            return (
              <div key={game.game_id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50">
                <div className="flex flex-1 justify-end">
                  <span className={`text-sm font-medium ${awayWin ? "text-foreground" : "text-muted-foreground"}`}>{formatTeamName(game.away_team, lang)}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1">
                  <span className={`text-base font-mono font-bold ${awayWin ? "text-foreground" : "text-muted-foreground"}`}>{game.away_score}</span>
                  <span className="text-xs text-muted-foreground">:</span>
                  <span className={`text-base font-mono font-bold ${homeWin ? "text-foreground" : "text-muted-foreground"}`}>{game.home_score}</span>
                </div>
                <div className="flex flex-1">
                  <span className={`text-sm font-medium ${homeWin ? "text-foreground" : "text-muted-foreground"}`}>{formatTeamName(game.home_team, lang)}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}