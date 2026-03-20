import { SiteHeader } from "@/components/site-header"
import { StandingsTable } from "@/components/standings-table"
import { LeaderboardMini } from "@/components/leaderboard-mini"
import { RecentGames } from "@/components/recent-games"
import { HomeContent } from "@/components/home-content"
import { fetchJson } from "@/lib/api"
import { getDefaultSeasonYearByKst } from "@/lib/season"

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
      player_type?: "hitter" | "pitcher"
      player_name: string
      team: string
      PA?: number
      OUTS?: number
      WAR?: number | string
    }[]
  }
  totals?: {
    players: number
    teams: number
    total_hr: number
    total_pa: number
    total_games: number
  }
}

export default async function HomePage() {
  const season = getDefaultSeasonYearByKst()
  const now = new Date()
  const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`

  let standings: StandingsResponse = { as_of_date: null, rows: [] }
  let games: GamesResponse = { date: null, rows: [] }
  let summary: HomeSummaryResponse = { leaderboards: { avg_top5: [], ops_top5: [], hr_top5: [], era_top5: [], war_top5: [] }, totals: { players: 0, teams: 0, total_hr: 0, total_pa: 0, total_games: 0 } }

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
      <HomeContent season={season} standings={standings} games={games} summary={summary} />
    </div>
  )
}
