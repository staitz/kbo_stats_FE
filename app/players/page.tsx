"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Filter, LayoutGrid, Search, TableIcon } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { fetchJson } from "@/lib/api"
import { useLang, tr } from "@/components/lang-context"
import { formatPlayerName, formatTeamName } from "@/lib/romanize"
import { getDefaultSeasonStringByKst } from "@/lib/season"

type ViewMode = "card" | "table"
type TeamFilter = "all" | string
type PlayerTab = "hitters" | "pitchers"

type HitterRow = {
  player_id?: string
  team: string
  player_name: string
  games: number
  PA: number
  AB: number
  H: number
  HR: number
  RBI: number
  AVG: number
  OBP: number
  SLG: number
  OPS: number
}

type LeaderboardResponse = {
  season: number
  requested_season?: number
  effective_season?: number
  mode?: string
  player_type?: "hitter" | "pitcher"
  metric: string
  effective_min_pa?: number
  min_pa_policy?: string
  effective_min_ip?: number
  min_ip_policy?: string
  team: string | null
  total: number
  limit: number
  offset: number
  rows: HitterRow[]
  available_seasons?: number[]
}

type PitcherRow = {
  player_id?: string
  team: string
  player_name: string
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

type PitcherLeaderboardResponse = Omit<LeaderboardResponse, "rows" | "effective_min_pa" | "min_pa_policy"> & {
  rows: PitcherRow[]
}

const HITTER_SORT_FIELDS = ["AVG", "OPS", "H", "HR", "RBI", "OBP", "SLG"] as const
const PITCHER_SORT_FIELDS = ["ERA", "WHIP", "K9", "SO", "W", "SV", "HLD", "IP"] as const
const TEAM_OPTIONS = ["KIA", "LG", "KT", "NC", "SSG", "두산", "롯데", "삼성", "키움", "한화"] as const

const FIELD_LABEL: Record<"ko" | "en", Record<string, string>> = {
  ko: {
    AVG: "타율", OPS: "OPS", H: "안타", HR: "홈런", RBI: "타점", OBP: "출루율", SLG: "장타율",
    ERA: "평자", WHIP: "WHIP", K9: "K/9", SO: "삼진", W: "승", SV: "세이브", HLD: "홀드", IP: "이닝",
    games: "경기", PA: "타석", AB: "타수", role: "보직",
  },
  en: {
    AVG: "AVG", OPS: "OPS", H: "H", HR: "HR", RBI: "RBI", OBP: "OBP", SLG: "SLG",
    ERA: "ERA", WHIP: "WHIP", K9: "K/9", SO: "SO", W: "W", SV: "SV", HLD: "HLD", IP: "IP",
    games: "G", PA: "PA", AB: "AB", role: "Role",
  },
}

const DECIMAL_METRICS = new Set(["AVG", "OBP", "SLG", "OPS"])
const PLAYER_LIST_LIMIT = 50

function formatMetric(value: number, metric: string) {
  if (DECIMAL_METRICS.has(metric) || ["ERA", "WHIP", "K9", "BB9", "KBB"].includes(metric)) return Number(value || 0).toFixed(3)
  if (metric === "IP") return Number(value || 0).toFixed(1)
  return String(Math.round(Number(value || 0)))
}

export default function PlayersPage() {
  const { lang } = useLang()
  const router = useRouter()
  const pathname = usePathname()
  const [playerTab, setPlayerTab] = useState<PlayerTab>("pitchers")
  const [search, setSearch] = useState("")
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("all")
  const [season, setSeason] = useState(getDefaultSeasonStringByKst)
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [hitterSort, setHitterSort] = useState<string>("AVG")
  const [pitcherSort, setPitcherSort] = useState<string>("ERA")
  const [showHitterRegulation, setShowHitterRegulation] = useState(true)
  const [showPitcherRegulation, setShowPitcherRegulation] = useState(true)

  useEffect(() => {
    setSeason(getDefaultSeasonStringByKst())
  }, [])



  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    const sortParam = params.get("sort")

    if (tab === "hitters") {
      setPlayerTab("hitters")
      if (sortParam) setHitterSort(sortParam)
    } else if (tab === "pitchers") {
      setPlayerTab("pitchers")
      if (sortParam) setPitcherSort(sortParam)
    } else {
      updateTab("pitchers")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateTab(tab: PlayerTab) {
    setPlayerTab(tab)
    const params = new URLSearchParams(window.location.search)
    params.set("tab", tab)
    params.delete("sort")
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const showRegulation = playerTab === "pitchers" ? showPitcherRegulation : showHitterRegulation
  const regulationLabel = playerTab === "pitchers" ? (lang === "ko" ? "규정이닝" : "Min IP") : tr("players.regulation", lang)
  const regulationToggle = playerTab === "pitchers" ? setShowPitcherRegulation : setShowHitterRegulation
  const fieldLabel = FIELD_LABEL[lang]

  const { data: leaderboardData, isLoading, isError, error } = useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", "hitter", season, teamFilter, showHitterRegulation, hitterSort],
    queryFn: () =>
      fetchJson("/leaderboard", {
        season,
        player_type: "hitter",
        team: teamFilter !== "all" ? teamFilter : undefined,
        metric: hitterSort,
        min_pa: showHitterRegulation ? undefined : 0,
        limit: PLAYER_LIST_LIMIT,
      }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const { data: pitcherLeaderboardData, isLoading: isPitcherLoading, isError: isPitcherError, error: pitcherError } =
    useQuery<PitcherLeaderboardResponse>({
      queryKey: ["leaderboard", "pitcher", season, teamFilter, showPitcherRegulation, pitcherSort],
      queryFn: () =>
        fetchJson("/leaderboard", {
          season,
          player_type: "pitcher",
          team: teamFilter !== "all" ? teamFilter : undefined,
          metric: pitcherSort,
          min_ip: showPitcherRegulation ? undefined : 0,
          limit: PLAYER_LIST_LIMIT,
        }),
      placeholderData: keepPreviousData,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    })

  // DB에 데이터가 있는 시즌만 표시 (데이터 로드 전에는 현재 연도 1개)
  const seasonOptions = leaderboardData?.available_seasons?.map(String)
    ?? [String(Number(season))]

  const filteredHitters = useMemo(() => {
    const rows = leaderboardData?.rows ?? []
    if (!search.trim()) return rows
    return rows.filter((row) => row.player_name.includes(search) || row.team.includes(search))
  }, [leaderboardData, search])

  const filteredPitchers = useMemo(() => {
    const rows = pitcherLeaderboardData?.rows ?? []
    if (!search.trim()) return rows
    return rows.filter((row) => row.player_name.includes(search) || row.team.includes(search))
  }, [pitcherLeaderboardData, search])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tr("players.title", lang)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{tr("players.subtitle", lang)}</p>
            {leaderboardData?.mode === "PRESEASON_FALLBACK" && (
              <p className="mt-1 text-xs text-amber-500">
                {lang === "ko"
                  ? `요청 시즌 ${leaderboardData.requested_season} 데이터가 없어 ${leaderboardData.effective_season} 시즌을 표시 중입니다.`
                  : `No data for requested season ${leaderboardData.requested_season}; showing ${leaderboardData.effective_season} instead.`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="h-8 w-24 text-xs">
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

            <div className="hidden items-center gap-2 sm:flex">
              <Switch checked={showRegulation} onCheckedChange={regulationToggle} id="regulation" />
              <label htmlFor="regulation" className="cursor-pointer whitespace-nowrap text-xs text-muted-foreground">
                {regulationLabel}
              </label>
            </div>

            <div className="flex items-center rounded-md border border-border">
              <button
                onClick={() => setViewMode("table")}
                className={`flex h-8 w-8 items-center justify-center rounded-l-md transition-colors ${
                  viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Table view"
              >
                <TableIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`flex h-8 w-8 items-center justify-center rounded-r-md transition-colors ${
                  viewMode === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="Card view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={tr("players.searchPlaceholder", lang)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-secondary py-0 pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-secondary px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">{tr("players.allTeams", lang)}</option>
            {TEAM_OPTIONS.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        <Tabs value={playerTab} onValueChange={(value) => updateTab(value as PlayerTab)}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="pitchers">{tr("players.pitchers", lang)}</TabsTrigger>
            <TabsTrigger value="hitters">{tr("players.hitters", lang)}</TabsTrigger>
          </TabsList>

          <TabsContent value="pitchers" className="mt-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {PITCHER_SORT_FIELDS.map((field) => (
                <button
                  key={field}
                  onClick={() => setPitcherSort(field)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    pitcherSort === field
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fieldLabel[field] ?? field}
                </button>
              ))}
            </div>

            {isPitcherLoading ? (
              <div className="py-20 text-center text-sm text-muted-foreground">{tr("players.loadError", lang)}</div>
            ) : isPitcherError ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {tr("players.loadFail", lang)}: {pitcherError instanceof Error ? pitcherError.message : "unknown error"}
              </div>
            ) : viewMode === "table" ? (
              <PitcherTable pitchers={filteredPitchers} sortField={pitcherSort} season={season} lang={lang} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPitchers.map((p) => (
                  <Link
                    key={`${p.team}-${p.player_name}`}
                    href={`/player/${encodeURIComponent(`${p.player_name}_${p.team}`)}?season=${season}&player_type=pitcher`}
                    className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <p className="text-sm font-semibold text-foreground">{formatPlayerName(p.player_name, lang)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatTeamName(p.team, lang)}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{p.role || "P"}</p>
                    <p className="mt-3 text-xs text-muted-foreground">{fieldLabel[pitcherSort] ?? pitcherSort}</p>
                    <p className="text-lg font-bold text-primary">
                      {formatMetric(Number(p[pitcherSort as keyof PitcherRow] ?? 0), pitcherSort)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hitters" className="mt-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Filter className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {HITTER_SORT_FIELDS.map((field) => (
                <button
                  key={field}
                  onClick={() => setHitterSort(field)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    hitterSort === field
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fieldLabel[field] ?? field}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="py-20 text-center text-sm text-muted-foreground">{tr("players.loadError", lang)}</div>
            ) : isError ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {tr("players.loadFail", lang)}: {error instanceof Error ? error.message : "unknown error"}
              </div>
            ) : viewMode === "table" ? (
              <HitterTable hitters={filteredHitters} sortField={hitterSort} season={season} lang={lang} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredHitters.map((h) => (
                  <Link
                    key={`${h.team}-${h.player_name}`}
                    href={`/player/${encodeURIComponent(`${h.player_name}_${h.team}`)}?season=${season}`}
                    className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <p className="text-sm font-semibold text-foreground">{formatPlayerName(h.player_name, lang)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatTeamName(h.team, lang)}</p>
                    <p className="mt-3 text-xs text-muted-foreground">{fieldLabel[hitterSort] ?? hitterSort}</p>
                    <p className="text-lg font-bold text-primary">
                      {formatMetric(Number(h[hitterSort as keyof HitterRow] ?? 0), hitterSort)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

        </Tabs>
      </main>
    </div>
  )
}

function PitcherTable({ pitchers, sortField, season, lang }: { pitchers: PitcherRow[]; sortField: string; season: string; lang: import("@/components/lang-context").Lang }) {
  const fieldLabel = FIELD_LABEL[lang]
  const ALL_STAT_COLS: { key: keyof PitcherRow; label: string; decimal?: boolean }[] = [
    { key: "ERA", label: fieldLabel.ERA, decimal: true },
    { key: "WHIP", label: "WHIP", decimal: true },
    { key: "K9", label: "K/9", decimal: true },
    { key: "SO", label: fieldLabel.SO },
    { key: "W", label: fieldLabel.W },
    { key: "SV", label: fieldLabel.SV },
    { key: "HLD", label: fieldLabel.HLD },
    { key: "IP", label: fieldLabel.IP, decimal: true },
    { key: "games", label: fieldLabel.games },
    { key: "BB9", label: "BB/9", decimal: true },
    { key: "KBB", label: "K/BB", decimal: true },
  ]

  const orderedCols = [...ALL_STAT_COLS]
  const sortIdx = orderedCols.findIndex((c) => c.key === sortField)
  if (sortIdx > 0) {
    const [moved] = orderedCols.splice(sortIdx, 1)
    orderedCols.unshift(moved)
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-10 text-center text-xs">#</TableHead>
            <TableHead className="text-xs">{tr("players.player", lang)}</TableHead>
            <TableHead className="text-xs">{tr("players.team", lang)}</TableHead>
            <TableHead className="text-xs text-center">{fieldLabel.role}</TableHead>
            {orderedCols.map((col) => (
              <TableHead
                key={String(col.key)}
                className={`text-center text-xs ${col.key === sortField ? "font-semibold text-primary" : ""}`}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pitchers.map((p, i) => (
            <TableRow key={`${p.team}-${p.player_name}-${i}`} className="border-border">
              <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="text-sm font-medium">
                <Link href={`/player/${encodeURIComponent(`${p.player_name}_${p.team}`)}?season=${season}&player_type=pitcher`} className="hover:text-primary hover:underline underline-offset-2 transition-colors">
                  {formatPlayerName(p.player_name, lang)}
                </Link>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{formatTeamName(p.team, lang)}</TableCell>
              <TableCell className="text-center text-xs text-muted-foreground">{p.role || "P"}</TableCell>
              {orderedCols.map((col) => {
                const raw = p[col.key]
                const val = col.decimal ? Number(raw || 0).toFixed(col.key === "IP" ? 1 : 3) : String(raw ?? "-")
                return (
                  <TableCell
                    key={String(col.key)}
                    className={`text-center text-xs ${col.key === sortField ? "font-semibold text-primary" : ""}`}
                  >
                    {val}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function HitterTable({ hitters, sortField, season, lang }: { hitters: HitterRow[]; sortField: string; season: string; lang: import("@/components/lang-context").Lang }) {
  const fieldLabel = FIELD_LABEL[lang]
  // 모든 stat 컬럼 정의 (고정 앞 컬럼 제외)
  const ALL_STAT_COLS: { key: keyof HitterRow; label: string; decimal?: boolean }[] = [
    { key: "AVG", label: fieldLabel.AVG, decimal: true },
    { key: "HR", label: fieldLabel.HR },
    { key: "RBI", label: fieldLabel.RBI },
    { key: "OBP", label: fieldLabel.OBP, decimal: true },
    { key: "SLG", label: fieldLabel.SLG, decimal: true },
    { key: "OPS", label: "OPS", decimal: true },
    { key: "H", label: fieldLabel.H },
    { key: "games", label: fieldLabel.games },
    { key: "PA", label: fieldLabel.PA },
    { key: "AB", label: fieldLabel.AB },
  ]

  // 선택한 sortField를 맨 앞으로 이동
  const orderedCols = [...ALL_STAT_COLS]
  const sortIdx = orderedCols.findIndex((c) => c.key === sortField)
  if (sortIdx > 0) {
    const [moved] = orderedCols.splice(sortIdx, 1)
    orderedCols.unshift(moved)
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-10 text-center text-xs">#</TableHead>
            <TableHead className="text-xs">{tr("players.player", lang)}</TableHead>
            <TableHead className="text-xs">{tr("players.team", lang)}</TableHead>
            {orderedCols.map((col) => (
              <TableHead
                key={col.key}
                className={`text-center text-xs ${col.key === sortField ? "font-semibold text-primary" : ""}`}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {hitters.map((h, i) => (
            <TableRow key={`${h.team}-${h.player_name}-${i}`} className="border-border">
              <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="text-sm font-medium">
                <Link href={`/player/${encodeURIComponent(`${h.player_name}_${h.team}`)}?season=${season}`} className="hover:text-primary hover:underline underline-offset-2 transition-colors">
                  {formatPlayerName(h.player_name, lang)}
                </Link>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{formatTeamName(h.team, lang)}</TableCell>
              {orderedCols.map((col) => {
                const raw = h[col.key]
                const val = col.decimal
                  ? Number(raw || 0).toFixed(3)
                  : String(raw ?? "-")
                return (
                  <TableCell
                    key={col.key}
                    className={`text-center text-xs ${col.key === sortField ? "font-semibold text-primary" : ""}`}
                  >
                    {val}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
