"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLang } from "@/components/lang-context"
import { formatTeamName } from "@/lib/romanize"

type PitcherRow = {
  season: number
  team: string
  role?: string
  games?: number
  W?: number
  L?: number
  SV?: number
  HLD?: number
  IP?: number
  ERA?: number
  WHIP?: number
  SO?: number
  K9?: number
  BB9?: number
}

function toIp(v: unknown) {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n.toFixed(1) : "0.0"
}

function toRate(v: unknown, d = 3) {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n.toFixed(d) : "-"
}

export function PitcherSeasonTable({ rows }: { rows: PitcherRow[] }) {
  const { lang } = useLang()
  const ko = lang === "ko"

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>{ko ? "시즌" : "Season"}</TableHead>
            <TableHead>{ko ? "팀" : "Team"}</TableHead>
            <TableHead className="text-center">{ko ? "보직" : "Role"}</TableHead>
            <TableHead className="text-center">{ko ? "경기" : "G"}</TableHead>
            <TableHead className="text-center">{ko ? "승-패" : "W-L"}</TableHead>
            <TableHead className="text-center">{ko ? "세이브" : "SV"}</TableHead>
            <TableHead className="text-center">{ko ? "홀드" : "HLD"}</TableHead>
            <TableHead className="text-center">{ko ? "이닝" : "IP"}</TableHead>
            <TableHead className="text-center">{ko ? "평자" : "ERA"}</TableHead>
            <TableHead className="text-center">WHIP</TableHead>
            <TableHead className="text-center">{ko ? "삼진" : "SO"}</TableHead>
            <TableHead className="text-center">K/9</TableHead>
            <TableHead className="text-center">BB/9</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.season}-${row.team}`} className="border-border">
              <TableCell>{row.season}</TableCell>
              <TableCell>{formatTeamName(row.team, lang)}</TableCell>
              <TableCell className="text-center">{row.role || "P"}</TableCell>
              <TableCell className="text-center">{row.games}</TableCell>
              <TableCell className="text-center">{row.W}-{row.L}</TableCell>
              <TableCell className="text-center">{row.SV}</TableCell>
              <TableCell className="text-center">{row.HLD}</TableCell>
              <TableCell className="text-center">{toIp(row.IP)}</TableCell>
              <TableCell className="text-center">{toRate(row.ERA)}</TableCell>
              <TableCell className="text-center">{toRate(row.WHIP)}</TableCell>
              <TableCell className="text-center">{row.SO}</TableCell>
              <TableCell className="text-center">{toRate(row.K9, 2)}</TableCell>
              <TableCell className="text-center">{toRate(row.BB9, 2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
