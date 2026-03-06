import { SiteHeader } from "@/components/site-header"
import { StandingsTable } from "@/components/standings-table"
import { LeaderboardMini } from "@/components/leaderboard-mini"
import { RecentGames } from "@/components/recent-games"
import { fetchJson } from "@/lib/api"
import { Activity } from "lucide-react"

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
    away_score: number
    home_team: string
    home_score: number
  }[]
}

type HomeSummaryResponse = {
  leaderboards: {
    avg_top5?: {
      player_name: string
      team: string
      AVG?: number | string
      PA?: number
      H?: number
      HR?: number | string
      RBI?: number
      OPS?: number | string
    }[]
    ops_top5: {
      player_name: string
      team: string
      OPS: number | string
      PA?: number
      H?: number
    }[]
    hr_top5: {
      player_name: string
      team: string
      HR: number | string
      RBI?: number
      OPS?: number | string
    }[]
    era_top5?: {
      player_name: string
      team: string
      ERA?: number | string
      PA?: number
    }[]
    war_top5?: {
      player_name: string
      team: string
      WAR?: number | string
    }[]
  }
}

function getDefaultSeasonByKstDate() {
  const seasonStart = "2026-03-28"
  const todayKst = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
  return todayKst >= seasonStart ? 2026 : 2025
}

export default async function HomePage() {
  const season = getDefaultSeasonByKstDate()
  const now = new Date()
  const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`

  let standings: StandingsResponse = { as_of_date: null, rows: [] }
  let games: GamesResponse = { date: null, rows: [] }
  let summary: HomeSummaryResponse = { leaderboards: { avg_top5: [], ops_top5: [], hr_top5: [], era_top5: [], war_top5: [] } }

  try {
    ;[standings, games, summary] = await Promise.all([
      fetchJson<StandingsResponse>("/standings", { season }),
      fetchJson<GamesResponse>("/games", { season, date: yyyymmdd, limit: 5 }),
      fetchJson<HomeSummaryResponse>("/home/summary", { season }),
    ])
  } catch (error) {
    console.error("Failed to load home data:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="mb-8 rounded-xl border border-border bg-card px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-xs font-mono font-medium uppercase tracking-wider text-primary">{season} KBO Regular Season</span>
              </div>
              <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">KBO Sabermetrics and AI Analysis</h1>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Explore KBO player stats with sabermetric context and AI projections in one place.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary px-4 py-2 text-center">
                <p className="text-xs text-muted-foreground">Games</p>
                <p className="text-xl font-mono font-bold text-foreground">460</p>
              </div>
              <div className="rounded-lg bg-secondary px-4 py-2 text-center">
                <p className="text-xs text-muted-foreground">Players</p>
                <p className="text-xl font-mono font-bold text-foreground">520</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <LeaderboardMini summary={summary} />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-1">
            <StandingsTable rows={standings.rows} asOfDate={standings.as_of_date} />
            <RecentGames rows={games.rows} date={games.date} />
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">KBOstats - KBO data analysis platform</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="cursor-pointer transition-colors hover:text-foreground">Glossary</span>
            <span className="cursor-pointer transition-colors hover:text-foreground">Data Sources</span>
            <span className="cursor-pointer transition-colors hover:text-foreground">Report Issue</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
