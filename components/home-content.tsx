"use client"

import { Activity } from "lucide-react"
import { useLang, tr } from "@/components/lang-context"
import { StandingsTable } from "@/components/standings-table"
import { LeaderboardMini } from "@/components/leaderboard-mini"
import { RecentGames } from "@/components/recent-games"

type StandingsResponse = {
  as_of_date: string | null
  rows: {
    rank: number
    team: string
    wins: number
    losses: number
    draws: number
    win_pct: number | string
    gb: number | string | null
    streak?: string | null
    recent_10?: string | null
  }[]
}

type GamesResponse = {
  date: string | null
  rows: {
    game_id: string
    away_team: string
    away_score: number | null
    home_team: string
    home_score: number | null
    status?: string
    game_time?: string | null
  }[]
}

type HomeSummaryResponse = {
  leaderboards: {
    avg_top5?: { player_name: string, team: string, AVG?: number | string, PA?: number, H?: number, HR?: number | string, RBI?: number, OPS?: number | string }[]
    ops_top5: { player_name: string, team: string, OPS: number | string, PA?: number, H?: number }[]
    hr_top5: { player_name: string, team: string, HR: number | string, RBI?: number, OPS?: number | string }[]
    era_top5?: { player_name: string, team: string, ERA?: number | string, PA?: number }[]
    war_top5?: { player_name: string, team: string, WAR?: number | string }[]
  }
  totals?: {
    players: number
    teams: number
    total_hr: number
    total_pa: number
    total_games: number
  }
}

export function HomeContent({
  season,
  standings,
  games,
  summary,
}: {
  season: number
  standings: StandingsResponse
  games: GamesResponse
  summary: HomeSummaryResponse
}) {
  const { lang } = useLang()

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <section className="mb-8 rounded-xl border border-border bg-card px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-primary">{season} {tr("home.season", lang)}</span>
            </div>
            <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">{tr("home.title", lang)}</h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {tr("home.subtitle", lang)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground">{tr("home.games", lang)}</p>
              <p className="text-xl font-mono font-bold text-foreground">{summary.totals?.total_games ?? 0}</p>
            </div>
            <div className="rounded-lg bg-secondary px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground">{tr("home.players", lang)}</p>
              <p className="text-xl font-mono font-bold text-foreground">{summary.totals?.players ?? 0}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <LeaderboardMini summary={summary} />
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1">
          <StandingsTable rows={standings.rows} asOfDate={standings.as_of_date} currentSeason={season} />
          <RecentGames rows={games.rows} date={games.date} />
        </div>
      </div>
    </main>
  )
}
