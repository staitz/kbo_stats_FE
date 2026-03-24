import { fetchJson } from "@/lib/api"
import { SiteHeader } from "@/components/site-header"
import { PlayerProfile } from "@/components/player-profile"
import { PlayerBreadcrumb } from "@/components/player-breadcrumb"
import { PlayerStatsTable } from "@/components/player-stats-table"
import { PlayerDetailSection } from "@/components/player-detail-section"
import { PitcherDetailSection } from "@/components/pitcher-detail-section"
import { PitcherSeasonTable } from "@/components/pitcher-season-table"
import { PredictionSummary } from "@/components/prediction-summary"
import type { HitterSeason, PlayerBase } from "@/lib/mock-data"

type HitterRow = {
  season: number
  team: string
  games: number
  PA: number
  AB: number
  H: number
  "2B": number
  "3B": number
  HR: number
  RBI: number
  BB: number
  SO: number
  SB: number
  AVG: number
  OBP: number
  SLG: number
  OPS: number
  WAR?: number
  wRC?: number
  BABIP?: number
}

type PitcherRow = {
  season: number
  team: string
  role: string
  games: number
  W: number
  L: number
  SV: number
  HLD: number
  IP: number
  OUTS: number
  H: number
  ER: number
  BB: number
  SO: number
  ERA: number
  WHIP: number
  K9: number
  BB9: number
  KBB: number
}

type HitterMonthlyRow = {
  month: string
  games: number
  PA: number
  AB: number
  H: number
  HR: number
  BB: number
  HBP?: number
  SF?: number
  TB_adj?: number
  AVG: number
  OBP: number
  SLG: number
  OPS: number
}

type PitcherMonthlyRow = {
  month: string
  team: string
  games: number
  W: number
  L: number
  SV: number
  HLD: number
  IP: number
  H: number
  ER: number
  BB: number
  SO: number
  ERA: number
  WHIP: number
  K9: number
  BB9: number
}

type PlayerPrediction = {
  role?: string
  predicted_hr_final?: number
  predicted_ops_final?: number
  predicted_war_final?: number
  predicted_hits_final?: number
  predicted_rbi_final?: number
  golden_glove_probability?: number
  mvp_probability?: number
  predicted_era_final?: number
  predicted_whip_final?: number
  predicted_k9_final?: number
  predicted_wins_final?: number
  predicted_so_final?: number
  predicted_ip_final?: number
  confidence_score?: number
  confidence_level?: string
  model_source?: string
  as_of_date?: string
}

type PlayerDetailResponse = {
  season: number
  player_type?: "hitter" | "pitcher"
  player_name: string
  player_id?: string
  profile?: {
    teams_in_season?: string[]
    birth_date?: string | null
    bats_throws?: string | null
  }
  season_rows?: HitterRow[] | PitcherRow[]
  season_by_year?: HitterRow[] | PitcherRow[]
  monthly_splits?: HitterMonthlyRow[] | PitcherMonthlyRow[]
  season_aggregate?: {
    OPS?: number
    team?: string
  } | null
  latest_prediction?: PlayerPrediction | null
}

const TEAM_COLORS: Record<string, string> = {
  KIA: "#EA0029",
  LG: "#C30452",
  KT: "#000000",
  NC: "#315288",
  SSG: "#CE0E2D",
  "두산": "#131230",
  "롯데": "#041E42",
  "삼성": "#074CA1",
  "키움": "#820024",
  "한화": "#FF6600",
}

function toNumber(value: unknown): number {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num : 0
}

function toRate(value: unknown): string {
  return toNumber(value).toFixed(3)
}

function mapHitterSeasonRows(rows: HitterRow[] = []): HitterSeason[] {
  return rows
    .map((row) => ({
      season: toNumber(row.season),
      team: String(row.team ?? "-"),
      G: toNumber(row.games),
      PA: toNumber(row.PA),
      AB: toNumber(row.AB),
      H: toNumber(row.H),
      "2B": toNumber(row["2B"]),
      "3B": toNumber(row["3B"]),
      HR: toNumber(row.HR),
      RBI: toNumber(row.RBI),
      SB: toNumber(row.SB),
      BB: toNumber(row.BB),
      SO: toNumber(row.SO),
      AVG: toRate(row.AVG),
      OBP: toRate(row.OBP),
      SLG: toRate(row.SLG),
      OPS: toRate(row.OPS),
      WAR: row.WAR !== undefined ? String(row.WAR) : "-",
      wRC: row.wRC !== undefined ? String(row.wRC) : "-",
      BABIP: row.BABIP !== undefined ? toRate(row.BABIP) : "-",
    }))
    .sort((a, b) => a.season - b.season)
}

function buildApiProfile(detail: PlayerDetailResponse): PlayerBase {
  const latest = detail.season_rows?.[0] as Partial<HitterRow & PitcherRow> | undefined
  const teams = detail.profile?.teams_in_season ?? []
  const teamLabel = teams.length > 0 ? teams.join(" / ") : String(latest?.team ?? "-")
  const pitcherRole = detail.player_type === "pitcher" ? String(latest?.role ?? "").trim() : ""
  const positionLabel = detail.player_type === "pitcher"
    ? (pitcherRole ? `Pitcher · ${pitcherRole}` : "Pitcher")
    : "Hitter"

  return {
    id: detail.player_id ?? `api-${detail.player_name}`,
    name: detail.player_name,
    team: teamLabel,
    teamColor: TEAM_COLORS[String(latest?.team ?? "")] ?? "#6b7280",
    position: positionLabel,
    number: 0,
    birthDate: detail.profile?.birth_date ?? "-",
    age: 0,
    hand: detail.profile?.bats_throws ?? "-",
    height: 0,
    weight: 0,
    salary: "-",
    imageUrl: undefined,
  }
}

function isApiNotFound(error: unknown): boolean {
  return error instanceof Error && error.message.includes("API 404")
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ season?: string; player_type?: string }> | { season?: string; player_type?: string }
}) {
  const [{ id }, qs] = await Promise.all([params, searchParams ? Promise.resolve(searchParams) : Promise.resolve({})])
  const decodedId = decodeURIComponent(id)
  const season = toNumber((qs as { season?: string }).season) || undefined
  const playerType = String((qs as { player_type?: string }).player_type || "")

  let detail: PlayerDetailResponse | null = null
  let notFound = false
  const fallbackPlayersHref = playerType === "pitcher" ? "/players?tab=pitchers" : "/players?tab=hitters"

  try {
    detail = await fetchJson<PlayerDetailResponse>(`/players/${encodeURIComponent(decodedId)}`, { season, player_type: playerType })
  } catch (error) {
    notFound = isApiNotFound(error)
    if (!notFound) throw error
  }

  if (!detail || notFound) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-4 py-6">
          <PlayerBreadcrumb playerName={decodedId} playersHref={fallbackPlayersHref} />
          <EmptyState title="Player details unavailable" body={`Could not find player data for "${decodedId}".`} />
        </main>
      </div>
    )
  }

  const profile = buildApiProfile(detail)
  const hitterSeasonHistory = mapHitterSeasonRows((detail.season_by_year || detail.season_rows || []) as HitterRow[])
  const pitcherSeasonHistory = ((detail.season_by_year || detail.season_rows || []) as PitcherRow[])
    .slice()
    .sort((a, b) => a.season - b.season)
  const availableSeasons = Array.from(
    new Set((detail.season_by_year || detail.season_rows || []).map((row) => Number(row.season))),
  )
    .filter(Boolean)
    .sort((a, b) => b - a)
  const playersHref = detail.player_type === "pitcher" ? "/players?tab=pitchers" : "/players?tab=hitters"

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <PlayerBreadcrumb playerName={detail.player_name} playersHref={playersHref} />

        <PlayerProfile player={profile} />

        {detail.player_type === "pitcher" ? (
          <>
            <section className="mt-6">
              <PredictionSummary prediction={detail.latest_prediction} playerType="pitcher" />
            </section>

            <PitcherDetailSection
              monthlyRows={(detail.monthly_splits || []) as PitcherMonthlyRow[]}
              selectedSeason={detail.season}
              availableSeasons={availableSeasons.length > 0 ? availableSeasons : [detail.season]}
            />

            <section className="mt-6">
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-foreground">Season Stats</h2>
                <p className="mt-1 text-sm text-muted-foreground">Season-by-season pitching totals.</p>
              </div>
              <PitcherSeasonTable rows={pitcherSeasonHistory} />
            </section>
          </>
        ) : (
          <>
            <section className="mt-6">
              <PredictionSummary prediction={detail.latest_prediction} playerType="hitter" />
            </section>

            <PlayerDetailSection
              playerName={detail.player_name}
              playerId={detail.player_id ?? detail.player_name}
              seasonHistory={hitterSeasonHistory.map((seasonRow) => ({
                season: Number(seasonRow.season),
                team: seasonRow.team,
                HR: Number(seasonRow.HR ?? 0),
                AVG: seasonRow.AVG,
                OPS: seasonRow.OPS,
                WAR: seasonRow.WAR,
              }))}
              monthlyRows={(detail.monthly_splits || []) as HitterMonthlyRow[]}
              selectedSeason={detail.season}
              availableSeasons={availableSeasons.length > 0 ? availableSeasons : [detail.season]}
            />

            <section className="mt-6">
              <PlayerStatsTable seasons={hitterSeasonHistory} />
            </section>
          </>
        )}
      </main>
    </div>
  )
}
