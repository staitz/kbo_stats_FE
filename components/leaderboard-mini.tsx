"use client"

import { TrendingUp, Trophy } from "lucide-react"

type LeaderRow = {
  player_name: string
  team: string
  PA?: number
  H?: number
  HR?: number | string
  RBI?: number
  AVG?: number | string
  OPS?: number | string
  ERA?: number | string
  WAR?: number | string
}

type Summary = {
  leaderboards: {
    avg_top5?: LeaderRow[]
    hr_top5?: LeaderRow[]
    era_top5?: LeaderRow[]
    war_top5?: LeaderRow[]
  }
}

function formatTo3(value: number | string | undefined) {
  if (value === null || value === undefined) return "-"
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n.toFixed(3) : String(value)
}

function LeaderCard({
  title,
  icon,
  items,
}: {
  title: string
  icon: React.ReactNode
  items: { rank: number; name: string; team: string; value: string; sub?: string }[]
}) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {items.length === 0 && (
          <div className="px-4 py-3 text-xs text-muted-foreground">데이터 준비 중</div>
        )}
        {items.map((item) => (
          <div key={`${title}-${item.rank}-${item.name}`} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-5 text-center text-xs font-mono font-bold">{item.rank}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.team}</span>
              </div>
              {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
            </div>
            <span className="text-sm font-mono font-bold text-primary">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LeaderboardMini({ summary }: { summary: Summary }) {
  const avgLeaders = (summary.leaderboards.avg_top5 ?? []).map((p, i) => ({
    rank: i + 1,
    name: p.player_name,
    team: p.team,
    value: formatTo3(p.AVG),
    sub: `${p.H ?? "-"}H / ${p.PA ?? "-"}PA`,
  }))

  const hrLeaders = (summary.leaderboards.hr_top5 ?? []).map((p, i) => ({
    rank: i + 1,
    name: p.player_name,
    team: p.team,
    value: String(p.HR ?? "-"),
    sub: `${p.RBI ?? "-"}RBI / ${formatTo3(p.OPS)} OPS`,
  }))

  const eraLeaders = (summary.leaderboards.era_top5 ?? []).map((p, i) => ({
    rank: i + 1,
    name: p.player_name,
    team: p.team,
    value: String(p.ERA ?? "-"),
    sub: p.PA ? `${p.PA}IP` : undefined,
  }))

  const warLeaders = (summary.leaderboards.war_top5 ?? []).map((p, i) => ({
    rank: i + 1,
    name: p.player_name,
    team: p.team,
    value: String(p.WAR ?? "-"),
  }))

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <LeaderCard title="타율 TOP 5" icon={<Trophy className="h-4 w-4 text-primary" />} items={avgLeaders} />
      <LeaderCard title="홈런 TOP 5" icon={<Trophy className="h-4 w-4 text-kbo-highlight" />} items={hrLeaders} />
      <LeaderCard title="ERA TOP 5" icon={<TrendingUp className="h-4 w-4 text-chart-2" />} items={eraLeaders} />
      <LeaderCard title="WAR TOP 5" icon={<TrendingUp className="h-4 w-4 text-primary" />} items={warLeaders} />
    </div>
  )
}
