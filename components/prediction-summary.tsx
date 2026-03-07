"use client"

import { Brain } from "lucide-react"
import { useLang, tr } from "@/components/lang-context"

type PredictionData = {
  predicted_hr_final?: number
  predicted_ops_final?: number
  confidence_score?: number
  confidence_level?: string
  model_source?: string
  as_of_date?: string
}

function toNum(value: unknown): number {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

function toRate(value: unknown): string {
  return toNum(value).toFixed(3)
}

export function PredictionSummary({ prediction }: { prediction?: PredictionData | null }) {
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

  return (
    <div className="rounded-lg border border-primary/20 bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground">{tr("ai.title", lang)}</h3>
      <p className="mt-2 text-xs text-muted-foreground">
        {tr("ai.asOf", lang)}: {prediction.as_of_date || "-"} / {tr("ai.confidence", lang)}: {confidencePct}% ({prediction.confidence_level || "N/A"})
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-sm">
        <div className="rounded-md bg-secondary/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">{tr("ai.predictedOps", lang)}</p>
          <p className="text-lg font-mono font-semibold text-foreground">{toRate(prediction.predicted_ops_final)}</p>
        </div>
        <div className="rounded-md bg-secondary/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">{tr("ai.predictedHr", lang)}</p>
          <p className="text-lg font-mono font-semibold text-foreground">{Math.round(toNum(prediction.predicted_hr_final))}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{tr("ai.modelSource", lang)}: {prediction.model_source || "-"}</p>
    </div>
  )
}
