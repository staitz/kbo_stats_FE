"use client"

import { useLang, tr } from "@/components/lang-context"
import { GlossaryDialog } from "@/components/glossary-dialog"
import { DataSourcesDialog } from "@/components/data-sources-dialog"

export function SiteFooter() {
  const { lang } = useLang()

  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
        <p className="text-xs text-muted-foreground">{tr("home.footer", lang)}</p>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <GlossaryDialog>
            <span className="cursor-pointer transition-colors hover:text-foreground">{tr("home.glossary", lang)}</span>
          </GlossaryDialog>
          <DataSourcesDialog>
            <span className="cursor-pointer transition-colors hover:text-foreground">{tr("home.dataSources", lang)}</span>
          </DataSourcesDialog>
          <span className="cursor-default text-muted-foreground">{tr("home.reportIssue", lang)}</span>
        </div>
      </div>
    </footer>
  )
}
