"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLang, tr } from "@/components/lang-context"
import { ScrollArea } from "@/components/ui/scroll-area"

export function GlossaryDialog({ children }: { children: React.ReactNode }) {
  const { lang } = useLang()

  const playerTerms = [
    { term: "AVG", desc: lang === "ko" ? "타율(Batting Average): 안타 / 타수" : "Batting Average: Hits / At Bats" },
    { term: "OPS", desc: lang === "ko" ? "출루율 + 장타율(On-Base Plus Slugging)" : "On-Base Plus Slugging" },
    { term: "H", desc: lang === "ko" ? "안타 (Hits)" : "Hits" },
    { term: "HR", desc: lang === "ko" ? "홈런 (Home Runs)" : "Home Runs" },
    { term: "RBI", desc: lang === "ko" ? "타점(Runs Batted In)" : "Runs Batted In" },
    { term: "OBP", desc: lang === "ko" ? "출루율(On-Base Percentage): (H + BB + HBP) / (AB + BB + HBP + SF)" : "On-Base Percentage: (H + BB + HBP) / (AB + BB + HBP + SF)" },
    { term: "SLG", desc: lang === "ko" ? "장타율(Slugging Percentage): 총루타 / 타수" : "Slugging Percentage: Total Bases / At Bats" },
  ]

  const teamTerms = [
    { term: "PCT", desc: lang === "ko" ? "승률 (Winning Percentage): 승 / (승 + 패)" : "Winning Percentage: Wins / (Wins + Losses)" },
    { term: "GB", desc: lang === "ko" ? "게임차 (Games Behind): 1위와의 경기 차이" : "Games Behind from 1st place" },
    { term: "Streak", desc: lang === "ko" ? "연승/연패 (Winning/Losing Streak)" : "Winning/Losing Streak" },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tr("home.glossary", lang)}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-4">
              <h3 className="border-b pb-1 text-sm font-bold text-foreground">{lang === "ko" ? "팀 스탯 (Team)" : "Team Stats"}</h3>
              <div className="flex flex-col gap-4">
                {teamTerms.map((term) => (
                  <div key={term.term} className="flex flex-col gap-1">
                    <span className="text-sm font-bold font-mono text-primary">{term.term}</span>
                    <span className="text-sm text-muted-foreground">{term.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h3 className="border-b pb-1 text-sm font-bold text-foreground">{lang === "ko" ? "타자 스탯 (Hitter)" : "Hitter Stats"}</h3>
              <div className="flex flex-col gap-4">
                {playerTerms.map((term) => (
                  <div key={term.term} className="flex flex-col gap-1">
                    <span className="text-sm font-bold font-mono text-primary">{term.term}</span>
                    <span className="text-sm text-muted-foreground">{term.desc}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
