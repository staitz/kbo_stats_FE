"use client"

import Link from "next/link"
import { TrendingUp, Trophy, ChevronRight } from "lucide-react"

import { useLang, tr } from "@/components/lang-context"
import { formatPlayerName, formatTeamName } from "@/lib/romanize"

type LeaderRow = {
  player_type?: "hitter" | "pitcher"
  player_name: string
  team: string
  PA?: number
  OUTS?: number
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
  noDataText,
  href,
}: {
  title: string
  icon: React.ReactNode
  items: { rank: number; name: string; team: string; value: string; sub?: string; playerHref?: string }[]
  noDataText: string
  href?: string
}) {
  const headerContent = (
    <div className={`flex items-center justify-between border-b border-border px-4 py-3 ${href ? "transition-colors hover:bg-secondary/40" : ""}`}>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {href && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  )

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {href ? (
        <Link href={href} className="block group">
          {headerContent}
        </Link>
      ) : (
        headerContent
      )}
      <div className="divide-y divide-border">
        {items.length === 0 && <div className="px-4 py-3 text-xs text-muted-foreground">{noDataText}</div>}
        {items.map((item) => {
          const inner = (
            <div className="flex w-full items-center gap-3 px-4 py-3 min-h-[64px]">
              <span className="w-5 text-center text-xs font-mono font-bold">{item.rank}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.team}</span>
                </div>
                {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
              </div>
              <span className="text-sm font-mono font-bold text-primary">{item.value}</span>
            </div>
          )

          return item.playerHref ? (
            <Link
              key={`${title}-${item.rank}-${item.name}`}
              href={item.playerHref}
              className="block transition-colors hover:bg-secondary/60"
            >
              {inner}
            </Link>
          ) : (
            <div key={`${title}-${item.rank}-${item.name}`} className="block">
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LeaderboardMini({ summary }: { summary: Summary }) {
  const { lang } = useLang()

  const avgLeaders = (summary.leaderboards.avg_top5 ?? []).map((p, i) => ({
    rank: i + 1,
    name: formatPlayerName(p.player_name, lang),
    team: formatTeamName(p.team, lang),
    value: formatTo3(p.AVG),
    sub: `${p.H ?? "-"} ${tr("stat.h", lang)} / ${p.PA ?? "-"} ${tr("stat.pa", lang)}`,
    playerHref: `/player/${encodeURIComponent(`${p.player_name}_${p.team}`)}`,
  }))

  const hrLeaders = (summary.leaderboards.hr_top5 ?? []).map((p, i) => ({
    rank: i + 1,
    name: formatPlayerName(p.player_name, lang),
    team: formatTeamName(p.team, lang),
    value: String(p.HR ?? "-"),
    sub: `${p.RBI ?? "-"} ${tr("stat.rbi", lang)} / OPS ${formatTo3(p.OPS)}`,
    playerHref: `/player/${encodeURIComponent(`${p.player_name}_${p.team}`)}`,
  }))

  const eraLeaders = (summary.leaderboards.era_top5 ?? []).map((p, i) => ({
    rank: i + 1,
    name: formatPlayerName(p.player_name, lang),
    team: formatTeamName(p.team, lang),
    value: String(p.ERA ?? "-"),
    sub: p.OUTS ? `${(Number(p.OUTS) / 3).toFixed(1)} IP` : undefined,
    playerHref: `/player/${encodeURIComponent(`${p.player_name}_${p.team}`)}?player_type=pitcher`,
  }))

  const warLeaders = (summary.leaderboards.war_top5 ?? []).map((p, i) => ({
    rank: i + 1,
    name: formatPlayerName(p.player_name, lang),
    team: formatTeamName(p.team, lang),
    value: String(p.WAR ?? "-"),
    sub:
      p.player_type === "pitcher"
        ? p.OUTS ? `${(Number(p.OUTS) / 3).toFixed(1)} IP` : undefined
        : p.PA ? `${p.PA} ${tr("stat.pa", lang)}` : undefined,
    playerHref:
      p.player_type === "pitcher"
        ? `/player/${encodeURIComponent(`${p.player_name}_${p.team}`)}?player_type=pitcher`
        : `/player/${encodeURIComponent(`${p.player_name}_${p.team}`)}`,
  }))

  const noDataText = tr("lb.noData", lang)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <LeaderCard
        title={tr("lb.avg", lang)}
        icon={<Trophy className="h-4 w-4 text-primary" />}
        items={avgLeaders}
        noDataText={noDataText}
        href="/players?tab=hitters&sort=AVG"
      />
      <LeaderCard
        title={tr("lb.hr", lang)}
        icon={<Trophy className="h-4 w-4 text-kbo-highlight" />}
        items={hrLeaders}
        noDataText={noDataText}
        href="/players?tab=hitters&sort=HR"
      />
      <LeaderCard
        title={tr("lb.era", lang)}
        icon={<TrendingUp className="h-4 w-4 text-primary" />}
        items={eraLeaders}
        noDataText={noDataText}
        href="/players?tab=pitchers&sort=ERA"
      />
      <LeaderCard
        title={tr("lb.war", lang)}
        icon={<TrendingUp className="h-4 w-4 text-primary" />}
        items={warLeaders}
        noDataText={noDataText}
        href="/players"
      />
    </div>
  )
}
