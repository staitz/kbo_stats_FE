"use client"

import { Brain } from "lucide-react"

import { useLang, tr } from "@/components/lang-context"

type PredictionData = {
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

type SummaryCard = {
  key: string
  label: string
  value: string
}

function toNum(value: unknown): number {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

function toRate(value: unknown, digits = 3): string {
  return toNum(value).toFixed(digits)
}

function toPercent(value: unknown): string {
  return `${(toNum(value) * 100).toFixed(1)}%`
}

function buildHitterCards(prediction: PredictionData, lang: "ko" | "en"): SummaryCard[] {
  return [
    { key: "ops", label: tr("ai.predictedOps", lang), value: toRate(prediction.predicted_ops_final) },
    { key: "hr", label: tr("ai.predictedHr", lang), value: String(Math.round(toNum(prediction.predicted_hr_final))) },
    { key: "war", label: tr("ai.predictedWar", lang), value: toNum(prediction.predicted_war_final).toFixed(1) },
    { key: "hits", label: tr("ai.predictedHits", lang), value: String(Math.round(toNum(prediction.predicted_hits_final))) },
    { key: "rbi", label: tr("ai.predictedRbi", lang), value: String(Math.round(toNum(prediction.predicted_rbi_final))) },
    {
      key: "gg",
      label: tr("ai.goldenGloveProb", lang),
      value: toPercent(prediction.golden_glove_probability),
    },
    { key: "mvp", label: tr("ai.mvpProb", lang), value: toPercent(prediction.mvp_probability) },
  ]
}

function buildPitcherCards(prediction: PredictionData, lang: "ko" | "en"): SummaryCard[] {
  return [
    { key: "era",  label: tr("ai.predictedEra",  lang), value: toRate(prediction.predicted_era_final) },
    { key: "whip", label: tr("ai.predictedWhip", lang), value: toRate(prediction.predicted_whip_final) },
    { key: "k9",   label: tr("ai.predictedK9",   lang), value: toRate(prediction.predicted_k9_final, 2) },
    { key: "wins", label: tr("ai.predictedWins", lang), value: String(Math.round(toNum(prediction.predicted_wins_final))) },
    { key: "so",   label: tr("ai.predictedSo",   lang), value: String(Math.round(toNum(prediction.predicted_so_final))) },
    {
      key: "gg",
      label: tr("ai.goldenGloveProb", lang),
      value: toPercent(prediction.golden_glove_probability),
    },
    { key: "mvp", label: tr("ai.mvpProb", lang), value: toPercent(prediction.mvp_probability) },
  ]
}

export function PredictionSummary({
  prediction,
  playerType = "hitter",
}: {
  prediction?: PredictionData | null
  playerType?: "hitter" | "pitcher"
}) {
  const { lang } = useLang()

  if (!prediction) {
    return (
      <div className="rounded-lg border border-primary/20 bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{tr("ai.title", lang)}</h3>
            <p className="text-xs text-muted-foreground">{tr("ai.noData", lang)}</p>
          </div>
        </div>
      </div>
    )
  }

  const confidenceRaw = toNum(prediction.confidence_score)
  const confidencePct = confidenceRaw <= 1 ? Math.round(confidenceRaw * 100) : Math.round(confidenceRaw)
  const cards = playerType === "pitcher" ? buildPitcherCards(prediction, lang) : buildHitterCards(prediction, lang)

  return (
    <div className="rounded-lg border border-primary/20 bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground">{tr("ai.title", lang)}</h3>
      <p className="mt-2 text-xs text-muted-foreground">
        {tr("ai.asOf", lang)}: {prediction.as_of_date || "-"} / {tr("ai.confidence", lang)}: {confidencePct}% ({prediction.confidence_level || "N/A"})
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.key} className="group rounded-md bg-secondary/50 px-3 py-2 transition-colors hover:bg-secondary">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="text-lg font-mono font-semibold text-foreground transition-colors group-hover:text-primary">
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{tr("ai.modelSource", lang)}: {prediction.model_source || "-"}</p>
    </div>
  )
}
