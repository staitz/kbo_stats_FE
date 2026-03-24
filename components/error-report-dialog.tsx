"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useLang, tr } from "@/components/lang-context"
import { fetchJson } from "@/lib/api"

export function ErrorReportDialog({ children }: { children: React.ReactNode }) {
  const { lang } = useLang()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState("")

  const [page, setPage] = useState("home")
  const [issueType, setIssueType] = useState("wrong_stat")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusMsg("")

    try {
      await fetchJson("/reports/", undefined, {
        method: "POST",
        body: JSON.stringify({
          page,
          issue_type: issueType,
          message,
          reported_url: pathname || "",
        }),
      })
      setStatusMsg(tr("report.success", lang))
      setTimeout(() => {
        setOpen(false)
        setStatusMsg("")
        setMessage("")
      }, 2000)
    } catch (error) {
      console.error("Failed to submit error report", error)
      setStatusMsg(tr("report.fail", lang))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tr("home.reportIssue", lang)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              {tr("report.page", lang)}
            </label>
            <select
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="rounded-md border border-border bg-background pl-3 pr-[120px] py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="home">{tr("report.page.home", lang)}</option>
              <option value="players">{tr("report.page.players", lang)}</option>
              <option value="player_detail">{tr("report.page.player_detail", lang)}</option>
              <option value="team">{tr("report.page.team", lang)}</option>
              <option value="other">{tr("report.page.other", lang)}</option>
            </select>
          </div>


          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              {tr("report.issueType", lang)}
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="rounded-md border border-border bg-background pl-3 pr-[120px] py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="wrong_stat">{tr("report.issueType.wrong_stat", lang)}</option>
              <option value="missing_data">{tr("report.issueType.missing_data", lang)}</option>
              <option value="translation_issue">{tr("report.issueType.translation_issue", lang)}</option>
              <option value="ui_bug">{tr("report.issueType.ui_bug", lang)}</option>
              <option value="other">{tr("report.issueType.other", lang)}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              {tr("report.message", lang)}
            </label>
            <Textarea
              className="resize-none"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={tr("report.messagePlaceholder", lang)}
              required
            />
          </div>

          {statusMsg && (
            <p className={`text-sm ${statusMsg.includes("실패") || statusMsg.includes("Failed") ? "text-destructive" : "text-primary"}`}>
              {statusMsg}
            </p>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {tr("report.cancel", lang)}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? tr("report.submitting", lang) : tr("report.submit", lang)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
