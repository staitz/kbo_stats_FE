"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { HitterSeason } from "@/lib/mock-data"
import { useLang } from "@/components/lang-context"
import { formatTeamName } from "@/lib/romanize"

export function PlayerStatsTable({ seasons }: { seasons: HitterSeason[] }) {
  const { lang } = useLang()
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">시즌별 기록</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs text-muted-foreground sticky left-0 bg-card z-10">시즌</TableHead>
              <TableHead className="text-xs text-muted-foreground sticky left-12 bg-card z-10">팀</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">경기</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">타석</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">타율</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">OPS</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">안타</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">홈런</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">타점</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">출루</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">장타</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">타수</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">2루타</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">3루타</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">도루</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">볼넷</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">삼진</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">WAR</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">wRC+</TableHead>
              <TableHead className="text-center text-xs text-muted-foreground">BABIP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seasons.map((s, idx) => (
              <TableRow key={`${s.season}-${s.team}-${idx}`} className="border-border hover:bg-secondary/50 transition-colors">
                <TableCell className="text-sm font-mono text-foreground sticky left-0 bg-card z-10">{s.season}</TableCell>
                <TableCell className="text-sm text-muted-foreground sticky left-12 bg-card z-10">{formatTeamName(s.team, lang)}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.G}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.PA}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.AVG}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.OPS}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.H}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.HR}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.RBI}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.OBP}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.SLG}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.AB}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s["2B"]}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s["3B"]}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.SB}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.BB}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.SO}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.WAR}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.wRC}</TableCell>
                <TableCell className="text-center text-sm font-mono text-foreground">{s.BABIP}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
