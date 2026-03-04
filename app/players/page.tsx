"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { topHitters, topPitchers, teams } from "@/lib/mock-data"
import type { PlayerBase, HitterSeason, PitcherSeason } from "@/lib/mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Search, Crown, Filter, LayoutGrid, TableIcon, TrendingUp, User, ArrowRight } from "lucide-react"

import { fetchJson } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

// We no longer use local mock data
const allPitchers = [...topPitchers]

type ViewMode = "card" | "table"
type TeamFilter = "all" | string

const hitterSortFields = ["OPS", "AVG", "HR", "RBI", "OBP", "SLG", "H"] as const
const pitcherSortFields = ["ERA", "W", "SO", "WAR", "WHIP", "K9", "FIP", "SV"] as const

interface HitterRow {
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

interface LeaderboardResponse {
  season: number
  metric: string
  effective_min_pa: number
  min_pa_policy: string
  team: string | null
  total: number
  limit: number
  offset: number
  rows: HitterRow[]
}

const decimalMetrics = new Set(["AVG", "OBP", "SLG", "OPS"])

function formatHitterMetric(value: number, metric: string) {
  if (decimalMetrics.has(metric)) return Number(value).toFixed(3)
  return String(Math.round(Number(value)))
}



export default function PlayersPage() {
  const [search, setSearch] = useState("")
  const [teamFilter, setTeamFilter] = useState<TeamFilter>("all")
  const [season, setSeason] = useState("2025")
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [hitterSort, setHitterSort] = useState<string>("OPS")
  const [pitcherSort, setPitcherSort] = useState<string>("ERA")
  const [showRegulation, setShowRegulation] = useState(true)

  const { data: leadboardData, isLoading: hitsLoading } = useQuery<LeaderboardResponse>({
    queryKey: ["leaderboard", season, teamFilter, showRegulation, hitterSort],
    queryFn: () => fetchJson(`/leaderboard?season=${season}${teamFilter !== "all" ? `&team=${teamFilter}` : ""}&metric=${hitterSort}${showRegulation ? "" : "&min_pa=0"}&limit=30`),
  })

  console.log("Leaderboard Data:", leadboardData);

  // Filter out by search client-side for now
  const filteredHitters = useMemo(() => {
    if (!leadboardData?.rows) return []
    const raw = leadboardData.rows
    if (!search.trim()) return raw
    return raw.filter(p => p.player_name.includes(search) || p.team.includes(search))
  }, [leadboardData, search])

  const filteredPitchers = useMemo(() => {
    const filtered = allPitchers.filter((p) => {
      const matchSearch = p.name.includes(search) || p.team.includes(search)
      const matchTeam = teamFilter === "all" || p.team === teamFilter
      return matchSearch && matchTeam
    })
    return [...filtered].sort((a, b) => {
      const aVal = parseFloat(a.stats[pitcherSort as keyof typeof a.stats] as string) || 0
      const bVal = parseFloat(b.stats[pitcherSort as keyof typeof b.stats] as string) || 0
      if (pitcherSort === "ERA" || pitcherSort === "WHIP" || pitcherSort === "FIP") return aVal - bVal
      return bVal - aVal
    })
  }, [search, teamFilter, pitcherSort])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">선수 / 랭킹</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              KBO 리그 선수 기록 및 부문별 랭킹 -- 선수를 클릭하면 AI 예측을 확인할 수 있습니다
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Season */}
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
            {/* Regulation */}
            <div className="hidden items-center gap-2 sm:flex">
              <Switch checked={showRegulation} onCheckedChange={setShowRegulation} id="regulation" />
              <label htmlFor="regulation" className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
                규정 이닝/타석
              </label>
            </div>
            {/* View Toggle */}
            <div className="flex items-center rounded-md border border-border">
              <button
                onClick={() => setViewMode("table")}
                className={`flex h-8 w-8 items-center justify-center rounded-l-md transition-colors ${
                  viewMode === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="테이블 보기"
              >
                <TableIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`flex h-8 w-8 items-center justify-center rounded-r-md transition-colors ${
                  viewMode === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label="카드 보기"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="선수명, 팀 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-secondary pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="h-9 rounded-lg border border-border bg-secondary px-3 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">전체 팀</option>
            <option value="KIA">KIA</option>
            <option value="LG">LG</option>
            <option value="KT">KT</option>
            <option value="NC">NC</option>
            <option value="SSG">SSG</option>
            <option value="두산">두산</option>
            <option value="롯데">롯데</option>
            <option value="삼성">삼성</option>
            <option value="키움">키움</option>
            <option value="한화">한화</option>
          </select>
        </div>

        {/* Tabs: Hitters / Pitchers */}
        <Tabs defaultValue="hitters">
          <TabsList className="bg-secondary">
            <TabsTrigger value="hitters">타자</TabsTrigger>
            <TabsTrigger value="pitchers">투수</TabsTrigger>
          </TabsList>

          {/* ===== HITTERS TAB ===== */}
          <TabsContent value="hitters" className="mt-4">
            {/* Sort Chips */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {hitterSortFields.map((field) => (
                <button
                  key={field}
                  onClick={() => setHitterSort(field)}
                  className={`rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
                    hitterSort === field
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>

            {hitsLoading ? (
              <div className="py-20 text-center text-muted-foreground flex items-center justify-center gap-2">
                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"/>
                 데이터를 불러오는 중입니다...
              </div>
            ) : viewMode === "table" ? (
              <HitterTable hitters={filteredHitters} sortField={hitterSort} />
            ) : (
              <PlayerCardGrid
                players={filteredHitters.map((h) => ({
                  id: h.player_name,
                  name: h.player_name,
                  team: h.team,
                  position: "타자",
                  number: 0,
                  teamColor: "#666",
                  type: "hitter" as const,
                  mainStat: formatHitterMetric(Number(h[hitterSort as keyof HitterRow] ?? 0), hitterSort),
                  mainStatLabel: hitterSort,
                  war: "N/A", // DB does not have WAR natively
                }))}
              />
            )}
          </TabsContent>

          {/* ===== PITCHERS TAB ===== */}
          <TabsContent value="pitchers" className="mt-4">
            {/* Sort Chips */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {pitcherSortFields.map((field) => (
                <button
                  key={field}
                  onClick={() => setPitcherSort(field)}
                  className={`rounded-md px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
                    pitcherSort === field
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>

            {viewMode === "table" ? (
              <PitcherTable pitchers={filteredPitchers} sortField={pitcherSort} />
            ) : (
              <PlayerCardGrid
                players={filteredPitchers.map((p) => ({
                  ...p,
                  type: "pitcher" as const,
                  mainStat: p.stats.ERA,
                  mainStatLabel: "ERA",
                  war: p.stats.WAR,
                }))}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Info Banner */}
        <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            각 선수를 클릭하면 상세 기록과 함께 <span className="text-primary font-medium">AI 성적 예측</span>을 확인할 수 있습니다.
          </p>
        </div>
      </main>
    </div>
  )
}

/* ─── Sub-components ──────────────────────────────────────────────── */

function HitterTable({ hitters, sortField }: { hitters: HitterRow[]; sortField: string }) {
  const highlight = (field: string) =>
    sortField === field ? "font-bold text-primary" : "text-foreground"

  return (
    <div className="rounded-lg border border-border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="w-10 text-center text-xs text-muted-foreground">#</TableHead>
            <TableHead className="text-xs text-muted-foreground">선수</TableHead>
            <TableHead className="text-xs text-muted-foreground">팀</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">G</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">PA</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "AVG" ? "font-semibold text-primary" : "text-muted-foreground"}`}>AVG</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "HR" ? "font-semibold text-primary" : "text-muted-foreground"}`}>HR</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "RBI" ? "font-semibold text-primary" : "text-muted-foreground"}`}>RBI</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "OBP" ? "font-semibold text-primary" : "text-muted-foreground"}`}>OBP</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "SLG" ? "font-semibold text-primary" : "text-muted-foreground"}`}>SLG</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "OPS" ? "font-semibold text-primary" : "text-muted-foreground"}`}>OPS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hitters.map((h, i) => (
            <TableRow key={h.player_name + h.team} className="border-border hover:bg-secondary/50 transition-colors">
              <TableCell className="text-center">
                {i < 3 ? (
                  <Crown className={`mx-auto h-4 w-4 ${i === 0 ? "text-kbo-highlight" : i === 1 ? "text-muted-foreground" : "text-kbo-danger"}`} />
                ) : (
                  <span className="text-xs font-mono text-muted-foreground">{i + 1}</span>
                )}
              </TableCell>
              <TableCell>
                <Link href={`/player/${encodeURIComponent(h.player_name)}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  {h.player_name}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{h.team}</span>
                </div>
              </TableCell>
              <TableCell className="text-center text-sm font-mono text-muted-foreground">{h.games}</TableCell>
              <TableCell className="text-center text-sm font-mono text-muted-foreground">{h.PA}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${highlight("AVG")}`}>{Number(h.AVG).toFixed(3)}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${sortField === "HR" ? "font-bold text-primary" : "text-kbo-highlight"}`}>{h.HR}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${highlight("RBI")}`}>{h.RBI}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${highlight("OBP")}`}>{Number(h.OBP).toFixed(3)}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${highlight("SLG")}`}>{Number(h.SLG).toFixed(3)}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${highlight("OPS")}`}>{Number(h.OPS).toFixed(3)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function PitcherTable({ pitchers, sortField }: { pitchers: (PlayerBase & { stats: PitcherSeason })[]; sortField: string }) {
  const highlight = (field: string) =>
    sortField === field ? "font-bold text-primary" : "text-foreground"

  return (
    <div className="rounded-lg border border-border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="w-10 text-center text-xs text-muted-foreground">#</TableHead>
            <TableHead className="text-xs text-muted-foreground">선수</TableHead>
            <TableHead className="text-xs text-muted-foreground">팀</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">G</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "W" ? "font-semibold text-primary" : "text-muted-foreground"}`}>W-L</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "SV" ? "font-semibold text-primary" : "text-muted-foreground"}`}>SV</TableHead>
            <TableHead className="text-center text-xs text-muted-foreground">IP</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "ERA" ? "font-semibold text-primary" : "text-muted-foreground"}`}>ERA</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "WHIP" ? "font-semibold text-primary" : "text-muted-foreground"}`}>WHIP</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "K9" ? "font-semibold text-primary" : "text-muted-foreground"}`}>K/9</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "SO" ? "font-semibold text-primary" : "text-muted-foreground"}`}>SO</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "FIP" ? "font-semibold text-primary" : "text-muted-foreground"}`}>FIP</TableHead>
            <TableHead className={`text-center text-xs ${sortField === "WAR" ? "font-semibold text-primary" : "text-muted-foreground"}`}>WAR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pitchers.map((p, i) => (
            <TableRow key={p.id} className="border-border hover:bg-secondary/50 transition-colors">
              <TableCell className="text-center">
                {i < 3 ? (
                  <Crown className={`mx-auto h-4 w-4 ${i === 0 ? "text-kbo-highlight" : i === 1 ? "text-muted-foreground" : "text-kbo-danger"}`} />
                ) : (
                  <span className="text-xs font-mono text-muted-foreground">{i + 1}</span>
                )}
              </TableCell>
              <TableCell>
                <Link href={`/player/${p.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  {p.name}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.teamColor }} />
                  <span className="text-xs text-muted-foreground">{p.team}</span>
                </div>
              </TableCell>
              <TableCell className="text-center text-sm font-mono text-muted-foreground">{p.stats.G}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${highlight("W")}`}>{p.stats.W}-{p.stats.L}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${highlight("SV")}`}>{p.stats.SV}</TableCell>
              <TableCell className="text-center text-sm font-mono text-muted-foreground">{p.stats.IP}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${highlight("ERA")}`}>{p.stats.ERA}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${highlight("WHIP")}`}>{p.stats.WHIP}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${sortField === "K9" ? "font-bold text-primary" : "text-kbo-highlight"}`}>{p.stats.K9}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${highlight("SO")}`}>{p.stats.SO}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${highlight("FIP")}`}>{p.stats.FIP}</TableCell>
              <TableCell className={`text-center text-sm font-mono ${sortField === "WAR" ? "font-bold text-primary" : "font-semibold text-primary"}`}>{p.stats.WAR}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function PlayerCardGrid({ players }: {
  players: (Pick<PlayerBase, "id" | "name" | "team" | "position" | "number" | "teamColor"> & { type: "hitter" | "pitcher"; mainStat: string | number; mainStatLabel: string; war: string })[]
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player, i) => (
        <Link
          key={player.id}
          href={`/player/${player.id}`}
          className="group relative rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/40 hover:bg-kbo-surface-hover"
        >
          {/* Rank Badge */}
          {i < 3 && (
            <div className={`absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              i === 0 ? "bg-kbo-highlight/20 text-kbo-highlight" : i === 1 ? "bg-muted text-muted-foreground" : "bg-kbo-danger/20 text-kbo-danger"
            }`}>
              {i + 1}
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground truncate">{player.name}</h3>
                <Badge variant="outline" className="shrink-0 text-[10px] font-mono border-border text-muted-foreground">
                  #{player.number}
                </Badge>
              </div>
              <div className="mt-0.5 flex items-center gap-2">
                <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: player.teamColor, color: "#fff" }}>
                  {player.team}
                </Badge>
                <span className="text-xs text-muted-foreground">{player.position}</span>
              </div>
              <div className="mt-2.5 flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground">{player.mainStatLabel}</p>
                  <p className="text-lg font-mono font-bold text-foreground">{player.mainStat}</p>
                </div>
                {/* 
                  Database does not have WAR natively
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <p className="text-[10px] text-primary">WAR</p>
                    <p className="text-lg font-mono font-bold text-primary">{player.war}</p>
                  </div>
                */}
                <div className="ml-auto flex items-center gap-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
