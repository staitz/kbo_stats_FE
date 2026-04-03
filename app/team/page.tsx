"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { CalendarDays, Swords, Trophy, Users } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchJson } from "@/lib/api"
import { useLang, tr } from "@/components/lang-context"
import { formatPlayerName } from "@/lib/romanize"
import { getDefaultSeasonStringByKst } from "@/lib/season"

type StandingsRow = {
  rank: number
  team: string
  wins: number
  losses: number
  draws: number
  win_pct: number | string
  gb: number | string | null
  streak?: string | null
}

type StandingsResponse = {
  requested_season: number
  effective_season: number | null
  as_of_date: string | null
  mode: string
  rows: StandingsRow[]
  available_seasons?: number[]
}

type LeaderRow = {
  player_name: string
  birth_date?: string | null
  PA: number
  H: number
  HR: number
  RBI: number
  OPS: number
}

type PitcherLeaderRow = {
  player_name: string
  games: number
  W: number
  L: number
  SV: number
  HLD: number
  IP: number
  ERA: number
  WHIP: number
  K9: number
}

type TeamDetailResponse = {
  season: number
  team: string
  leaders: {
    ops_top10: LeaderRow[]
    hr_top10: LeaderRow[]
    era_top10: PitcherLeaderRow[]
    k9_top10: PitcherLeaderRow[]
  }
  recent_games: {
    game_date: string
    game_id: string
    opp_team: string
    team_score: number
    opp_score: number
    result: "W" | "L" | "D"
  }[]
  h2h: {
    opp_team: string
    wins: number
    losses: number
    draws: number
    runs_for: number
    runs_against: number
  }[]
}

type TeamScheduleResponse = {
  season: number
  team: string
  count: number
  rows: {
    game_date: string
    game_id: string | null
    away_team: string
    home_team: string
    game_time: string | null
    stadium: string | null
    status: string | null
    status_category: "scheduled" | "cancelled" | "suspended" | "finished" | "unknown"
    result_state: "played" | "not_played" | "missing_result"
    is_home: boolean
    opp_team: string
    result: "W" | "L" | "D" | null
    team_score: number | null
    opp_score: number | null
  }[]
}

const TEAM_OPTIONS = ["KIA", "LG", "KT", "NC", "SSG", "두산", "롯데", "삼성", "키움", "한화"] as const

function formatPct(value: number | string) {
  if (typeof value === "number") return value.toFixed(3)
  return value
}

function formatDate(yyyymmdd: string) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd
  return `${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6, 8)}`
}

function formatKoreanDate(dateStr: string | null | undefined) {
  if (!dateStr || dateStr === "-") return ""
  const parts = dateStr.split("-")
  if (parts.length === 3) {
    return `${parts[0]}년 ${parseInt(parts[1], 10)}월 ${parseInt(parts[2], 10)}일`
  }
  return dateStr
}

/** "N연승" → "NW", "N연패" → "NL" 형태로 영어 변환 */
function localizeStreak(streak: string | null | undefined, lang: "ko" | "en"): string {
  if (!streak) return "-"
  if (lang === "ko") return streak
  const m = streak.match(/^(\d+)(연승|연패|연무)$/)
  if (m) {
    const type = m[2] === "연승" ? "W" : m[2] === "연패" ? "L" : "D"
    return `${m[1]}${type}`
  }
  return streak
}

export default function TeamPage() {
  const { lang } = useLang()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [requestedSeason, setRequestedSeason] = useState(getDefaultSeasonStringByKst)
  const [selectedTeam, setSelectedTeam] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("all")
  const requestedTeam = (searchParams.get("team") || "").trim()

  const standingsQuery = useQuery<StandingsResponse>({
    queryKey: ["standings", requestedSeason],
    queryFn: () => fetchJson("/standings", { season: requestedSeason }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const effectiveSeason = standingsQuery.data?.effective_season ?? Number(requestedSeason)
  const standingsTeams = standingsQuery.data?.rows ?? []
  // Always include the current KST default season in the dropdown (not just requestedSeason)
  const defaultSeason = getDefaultSeasonStringByKst()
  const rawAvailable = standingsQuery.data?.available_seasons?.map(String) ?? []
  const seasonOptions = rawAvailable.includes(defaultSeason)
    ? rawAvailable
    : [defaultSeason, ...rawAvailable]
  // True when user selected the new season but DB hasn't been populated yet
  const isNewSeasonNoData =
    Number(requestedSeason) > effectiveSeason &&
    !standingsQuery.isLoading
  const teams = standingsTeams.length
    ? standingsTeams.map((row) => row.team)
    : [...TEAM_OPTIONS]

  // Prefer the explicit query-string team; otherwise fall back to the top-ranked team.
  useEffect(() => {
    if (!standingsTeams.length) return

    if (requestedTeam && standingsTeams.some((row) => row.team === requestedTeam)) {
      if (selectedTeam !== requestedTeam) {
        setSelectedTeam(requestedTeam)
      }
      return
    }

    const topTeam = standingsTeams[0]?.team
    if (topTeam && (!selectedTeam || !standingsTeams.map((row) => row.team).includes(selectedTeam))) {
      setSelectedTeam(topTeam)
    }
  }, [requestedTeam, selectedTeam, standingsTeams])

  useEffect(() => {
    if (!selectedTeam) return
    if (searchParams.get("team") === selectedTeam) return

    const params = new URLSearchParams(searchParams.toString())
    params.set("team", selectedTeam)
    router.replace(`/team?${params.toString()}`, { scroll: false })
  }, [router, searchParams, selectedTeam])

  const selectedStanding = useMemo(
    () => standingsTeams.find((t) => t.team === selectedTeam) ?? null,
    [standingsTeams, selectedTeam]
  )

  const teamDetailQuery = useQuery<TeamDetailResponse>({
    queryKey: ["team-detail", selectedTeam, effectiveSeason],
    queryFn: () => fetchJson(`/teams/${encodeURIComponent(selectedTeam)}`, { season: effectiveSeason }),
    enabled: Boolean(selectedTeam) && Boolean(effectiveSeason),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const teamScheduleQuery = useQuery<TeamScheduleResponse>({
    queryKey: ["team-schedule", selectedTeam, effectiveSeason],
    queryFn: () => fetchJson(`/teams/${encodeURIComponent(selectedTeam)}/schedule`, { season: effectiveSeason, limit: 300 }),
    enabled: Boolean(selectedTeam) && Boolean(effectiveSeason),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const availableMonths = useMemo(() => {
    const rows = teamScheduleQuery.data?.rows ?? []
    const set = new Set<string>()
    rows.forEach((row) => {
      if (row.game_date && row.game_date.length >= 6) set.add(row.game_date.slice(0, 6))
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [teamScheduleQuery.data?.rows])

  const filteredScheduleRows = useMemo(() => {
    const rows = teamScheduleQuery.data?.rows ?? []
    if (selectedMonth === "all") return rows
    return rows.filter((row) => row.game_date?.startsWith(selectedMonth))
  }, [teamScheduleQuery.data?.rows, selectedMonth])

  useEffect(() => {
    if (selectedMonth === "all") return
    if (!availableMonths.includes(selectedMonth)) {
      setSelectedMonth("all")
    }
  }, [availableMonths, selectedMonth])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            {tr("nav.home", lang)}
          </Link>
          <span>/</span>
          <span className="text-foreground">{tr("nav.teams", lang)}</span>
        </nav>

        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{selectedTeam || "팀"}</h1>
            <p className="text-xs text-muted-foreground">
              {lang === "en"
                ? `Season ${requestedSeason} / Effective ${effectiveSeason || "-"}`
                : `요청 시즌 ${requestedSeason} / 반영 시즌 ${effectiveSeason || "-"}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={requestedSeason} onValueChange={setRequestedSeason}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {seasonOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
        </div>

        {standingsQuery.isLoading ? (
          <div className="mb-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">{tr("common.loading", lang)}</div>
        ) : standingsQuery.isError ? (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {tr("standings.loadError", lang)}
          </div>
        ) : isNewSeasonNoData ? (
          <div className="mb-6 rounded-lg border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {lang === "ko" ? "데이터 준비 중" : "Data not available yet"}
            </p>
          </div>
        ) : (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">{tr("team.rank", lang)}</p>
              <p className="text-2xl font-mono font-bold text-foreground">{selectedStanding?.rank ?? "-"}</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">{tr("team.winPct", lang)}</p>
              <p className="text-2xl font-mono font-bold text-foreground">
                {selectedStanding ? formatPct(selectedStanding.win_pct) : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">GB</p>
              <p className="text-2xl font-mono font-bold text-foreground">{selectedStanding?.gb ?? "-"}</p>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">{tr("team.streak", lang)}</p>
              <p className="text-2xl font-mono font-bold text-foreground">{localizeStreak(selectedStanding?.streak, lang)}</p>
            </div>
          </div>
        )}

        {!isNewSeasonNoData && (
        <Tabs defaultValue="roster">
          <TabsList className="bg-secondary">
            <TabsTrigger value="roster" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {tr("team.roster", lang)}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {tr("team.schedule", lang)}
            </TabsTrigger>
            <TabsTrigger value="h2h" className="gap-1.5">
              <Swords className="h-3.5 w-3.5" />
              {tr("team.h2h", lang)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="mt-4">
            {teamDetailQuery.isLoading ? (
              <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">{tr("common.loading", lang)}</div>
            ) : teamDetailQuery.isError ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                {tr("roster.loadError", lang)}
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <Trophy className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">{tr("team.opsLeaders", lang)}</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs">{tr("players.player", lang)}</TableHead>
                        <TableHead className="text-center text-xs">PA</TableHead>
                        <TableHead className="text-center text-xs">OPS</TableHead>
                        <TableHead className="text-center text-xs">HR</TableHead>
                        <TableHead className="text-center text-xs">RBI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(teamDetailQuery.data?.leaders.ops_top10 ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            {lang === "en" ? "No data available." : "데이터가 없습니다."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        (teamDetailQuery.data?.leaders.ops_top10 ?? []).map((row, idx) => (
                          <TableRow key={`${row.player_name}-${idx}`} className="border-border">
                            <TableCell className="text-sm">
                              <Link
                                href={`/player/${encodeURIComponent(`${row.player_name}_${selectedTeam}`)}?player_type=hitter`}
                                className="hover:text-primary hover:underline"
                              >
                                {formatPlayerName(row.player_name, lang)}
                              </Link>
                            </TableCell>
                            <TableCell className="text-center text-sm font-mono">{row.PA}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{Number(row.OPS || 0).toFixed(3)}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{row.HR}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{row.RBI}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <Trophy className="h-4 w-4 text-chart-2" />
                    <h3 className="text-sm font-semibold text-foreground">{tr("team.hrLeaders", lang)}</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs">{tr("players.player", lang)}</TableHead>
                        <TableHead className="text-center text-xs">PA</TableHead>
                        <TableHead className="text-center text-xs">HR</TableHead>
                        <TableHead className="text-center text-xs">RBI</TableHead>
                        <TableHead className="text-center text-xs">OPS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(teamDetailQuery.data?.leaders.hr_top10 ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            {lang === "en" ? "No data available." : "데이터가 없습니다."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        (teamDetailQuery.data?.leaders.hr_top10 ?? []).map((row, idx) => (
                          <TableRow key={`${row.player_name}-${idx}`} className="border-border">
                            <TableCell className="text-sm">
                              <Link
                                href={`/player/${encodeURIComponent(`${row.player_name}_${selectedTeam}`)}?player_type=hitter`}
                                className="hover:text-primary hover:underline"
                              >
                                {formatPlayerName(row.player_name, lang)}
                              </Link>
                            </TableCell>
                            <TableCell className="text-center text-sm font-mono">{row.PA}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{row.HR}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{row.RBI}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{Number(row.OPS || 0).toFixed(3)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* ERA 리더 */}
                <div className="rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <Trophy className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {lang === "ko" ? "ERA 리더" : "ERA Leaders"}
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs">{tr("players.player", lang)}</TableHead>
                        <TableHead className="text-center text-xs">IP</TableHead>
                        <TableHead className="text-center text-xs">W</TableHead>
                        <TableHead className="text-center text-xs">L</TableHead>
                        <TableHead className="text-center text-xs">SV</TableHead>
                        <TableHead className="text-center text-xs">ERA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(teamDetailQuery.data?.leaders.era_top10 ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            {lang === "en" ? "No data available." : "데이터가 없습니다."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        (teamDetailQuery.data?.leaders.era_top10 ?? []).map((row, idx) => (
                          <TableRow key={`era-${row.player_name}-${idx}`} className="border-border">
                            <TableCell className="text-sm">
                              <Link
                                href={`/player/${encodeURIComponent(`${row.player_name}_${selectedTeam}`)}?player_type=pitcher`}
                                className="hover:text-primary hover:underline"
                              >
                                {formatPlayerName(row.player_name, lang)}
                              </Link>
                            </TableCell>
                            <TableCell className="text-center text-sm font-mono">{Number(row.IP || 0).toFixed(1)}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{row.W}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{row.L}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{row.SV}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{Number(row.ERA || 0).toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* K/9 리더 */}
                <div className="rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                    <Trophy className="h-4 w-4 text-chart-2" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {lang === "ko" ? "K/9 리더" : "K/9 Leaders"}
                    </h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs">{tr("players.player", lang)}</TableHead>
                        <TableHead className="text-center text-xs">IP</TableHead>
                        <TableHead className="text-center text-xs">W</TableHead>
                        <TableHead className="text-center text-xs">L</TableHead>
                        <TableHead className="text-center text-xs">SV</TableHead>
                        <TableHead className="text-center text-xs">K/9</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(teamDetailQuery.data?.leaders.k9_top10 ?? []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            {lang === "en" ? "No data available." : "데이터가 없습니다."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        (teamDetailQuery.data?.leaders.k9_top10 ?? []).map((row, idx) => (
                          <TableRow key={`k9-${row.player_name}-${idx}`} className="border-border">
                            <TableCell className="text-sm">
                              <Link
                                href={`/player/${encodeURIComponent(`${row.player_name}_${selectedTeam}`)}?player_type=pitcher`}
                                className="hover:text-primary hover:underline"
                              >
                                {formatPlayerName(row.player_name, lang)}
                              </Link>
                            </TableCell>
                            <TableCell className="text-center text-sm font-mono">{Number(row.IP || 0).toFixed(1)}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{row.W}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{row.L}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{row.SV}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{Number(row.K9 || 0).toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            {teamScheduleQuery.isLoading ? (
              <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">{tr("team.scheduleLoading", lang)}</div>
            ) : teamScheduleQuery.isError ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                {tr("team.scheduleError", lang)}
              </div>
            ) : (
              <ScheduleCalendar
                rows={teamScheduleQuery.data?.rows ?? []}
                availableMonths={availableMonths}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                lang={lang}
              />
            )}
          </TabsContent>

          <TabsContent value="h2h" className="mt-4">
            {teamDetailQuery.isLoading ? (
              <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">{tr("common.loading", lang)}</div>
            ) : teamDetailQuery.isError ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                {tr("h2h.loadError", lang)}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs">{tr("team.opp", lang)}</TableHead>
                      <TableHead className="text-center text-xs">{tr("team.wins", lang)}</TableHead>
                      <TableHead className="text-center text-xs">{tr("team.losses", lang)}</TableHead>
                      <TableHead className="text-center text-xs">{tr("team.draws", lang)}</TableHead>
                      <TableHead className="text-center text-xs">{tr("team.runsFor", lang)}</TableHead>
                      <TableHead className="text-center text-xs">{tr("team.runsAgainst", lang)}</TableHead>
                      <TableHead className="text-center text-xs">{tr("team.h2hPct", lang)}</TableHead>
                    </TableRow>
                  </TableHeader>
                   <TableBody>
                     {(teamDetailQuery.data?.h2h ?? []).length === 0 ? (
                       <TableRow>
                         <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                           {lang === "en" ? "No data available." : "데이터가 없습니다."}
                         </TableCell>
                       </TableRow>
                     ) : (
                       [...(teamDetailQuery.data?.h2h ?? [])].sort((a, b) => {
                         if (b.wins !== a.wins) return b.wins - a.wins
                         return a.opp_team.localeCompare(b.opp_team, "ko")
                       }).map((row) => {
                         const total = row.wins + row.losses
                         const pct = total > 0 ? (row.wins / total).toFixed(3) : "-"
                         return (
                           <TableRow key={row.opp_team} className="border-border">
                             <TableCell className="text-sm">{row.opp_team}</TableCell>
                             <TableCell className="text-center text-sm font-mono">{row.wins}</TableCell>
                             <TableCell className="text-center text-sm font-mono">{row.losses}</TableCell>
                             <TableCell className="text-center text-sm font-mono">{row.draws}</TableCell>
                             <TableCell className="text-center text-sm font-mono">{row.runs_for}</TableCell>
                             <TableCell className="text-center text-sm font-mono">{row.runs_against}</TableCell>
                             <TableCell className="text-center text-sm font-mono">{pct}</TableCell>
                           </TableRow>
                         )
                       })
                     )}
                   </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
        )}
      </main>
    </div>
  )
}

// ──────────────────────────────────────────
//  Schedule Calendar Component
// ──────────────────────────────────────────

type ScheduleRow = TeamScheduleResponse["rows"][number]

const DAY_LABELS_KO = ["일", "월", "화", "수", "목", "금", "토"]
const DAY_LABELS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function ScheduleCalendar({
  rows,
  availableMonths,
  selectedMonth,
  onMonthChange,
  lang,
}: {
  rows: ScheduleRow[]
  availableMonths: string[]
  selectedMonth: string
  onMonthChange: (m: string) => void
  lang: import("@/components/lang-context").Lang
}) {
  // 기본 월 = 가장 최근 월
  const activeMonth = selectedMonth !== "all" ? selectedMonth : availableMonths[0] ?? ""

  // 해당 월에 해당하는 경기 목록
  const monthRows = rows.filter((r) => r.game_date?.startsWith(activeMonth))

  // game_date → row 맵 (같은 날 더블헤더 대비 배열)
  const dayMap = useMemo(() => {
    const map = new Map<string, ScheduleRow[]>()
    for (const row of monthRows) {
      const day = row.game_date?.slice(6, 8) ?? ""
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(row)
    }
    return map
  }, [monthRows])

  if (!activeMonth) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {tr("team.noData", lang)}
      </div>
    )
  }

  const year = parseInt(activeMonth.slice(0, 4), 10)
  const month = parseInt(activeMonth.slice(4, 6), 10)
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDow = new Date(year, month - 1, 1).getDay() // 0=일

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* 월 탭 네비게이션 */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-3 py-2">
        {availableMonths.map((m) => (
          <button
            key={m}
            onClick={() => onMonthChange(m)}
            className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              m === activeMonth
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {lang === "en" ? `${m.slice(4, 6)}M` : `${m.slice(4, 6)}월`}
          </button>
        ))}
      </div>

      {/* 캘린더 헤더 (요일) */}
      <div className="grid grid-cols-7 border-b border-border">
        {(lang === "en" ? DAY_LABELS_EN : DAY_LABELS_KO).map((d, i) => (
          <div
            key={d}
            className={`py-2 text-center text-xs font-medium ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-muted-foreground"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 캘린더 날짜 그리드 */}
      <div className="grid grid-cols-7">
        {/* 첫 날 이전 빈 셀 */}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-border/30 p-1" />
        ))}

        {/* 날짜 셀 */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dayStr = String(day).padStart(2, "0")
          const games = dayMap.get(dayStr) ?? []
          const dow = (firstDow + day - 1) % 7

          return (
            <div
              key={day}
              className={`min-h-[80px] border-b border-r border-border/30 p-1.5 ${
                games.length === 0 ? "bg-transparent" : ""
              }`}
            >
              {/* 날짜 숫자 */}
              <p
                className={`mb-1 text-xs font-mono font-medium ${
                  dow === 0 ? "text-red-400" : dow === 6 ? "text-blue-400" : "text-muted-foreground"
                }`}
              >
                {day}
              </p>

              {/* 경기 정보 */}
              {games.map((game, gi) => {
                const hasResult = game.result !== null
                const sc = game.status_category ?? "unknown"

                // Background color based on outcome or status
                const bgClass = hasResult
                  ? game.result === "W"
                    ? "bg-primary/10 border border-primary/30"
                    : game.result === "L"
                    ? "bg-red-500/10 border border-red-500/20"
                    : "bg-secondary border border-border"
                  : sc === "cancelled"
                  ? "border border-dashed border-muted-foreground/30 opacity-60"
                  : sc === "suspended"
                  ? "border border-dashed border-amber-500/40 bg-amber-500/5"
                  : "border border-dashed border-border"

                // Label to show when there is no result
                const noResultLabel = () => {
                  if (sc === "cancelled")      return tr("team.status.cancelled", lang)
                  if (sc === "suspended")      return tr("team.status.suspended", lang)
                  if (sc === "finished")       return tr("team.status.missingResult", lang)
                  if (sc === "unknown")        return game.game_time ? game.game_time.slice(0, 5) : tr("team.status.unknown", lang)
                  // scheduled
                  return game.game_time ? game.game_time.slice(0, 5) : tr("team.scheduled", lang)
                }

                return (
                  <div key={gi} className={`mb-1 rounded p-1 ${bgClass}`}>
                    {/* 상대팀 + 홈/원정 */}
                    <p className="flex items-center gap-1 truncate text-[10px] font-medium text-foreground leading-tight">
                      <span className={`shrink-0 rounded px-1 py-px text-[9px] font-bold leading-none ${game.is_home ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        {game.is_home ? (lang === "en" ? "H" : "홈") : (lang === "en" ? "A" : "원정")}
                      </span>
                      <span className="truncate">{game.opp_team}</span>
                    </p>
                    {/* 결과 */}
                    {hasResult ? (
                      <p
                        className={`text-[10px] font-mono font-bold leading-tight ${
                          game.result === "W"
                            ? "text-primary"
                            : game.result === "L"
                            ? "text-red-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {game.result === "W" ? tr("team.win", lang) : game.result === "L" ? tr("team.loss", lang) : tr("team.draw", lang)}{" "}
                        {game.team_score}-{game.opp_score}
                      </p>
                    ) : (
                      <p className={`text-[10px] leading-tight ${
                        sc === "cancelled" || sc === "suspended"
                          ? "text-muted-foreground/70"
                          : sc === "finished"
                          ? "text-amber-400"
                          : "text-muted-foreground"
                      }`}>
                        {noResultLabel()}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
