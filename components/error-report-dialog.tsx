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
  const [tab, setTab] = useState("overview")
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
          tab,
          issue_type: issueType,
          message,
          reported_url: pathname || "",
        }),
      })
      setStatusMsg(lang === "ko" ? "성공적으로 접수되었습니다. 감사합니다!" : "Report submitted successfully. Thank you!")
      setTimeout(() => {
        setOpen(false)
        setStatusMsg("")
        setMessage("")
      }, 2000)
    } catch (error) {
      console.error("Failed to submit error report", error)
      setStatusMsg(lang === "ko" ? "전송에 실패했습니다. 잠시 후 다시 시도해주세요." : "Failed to submit. Please try again later.")
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
              {lang === "ko" ? "발생 페이지" : "Page"}
            </label>
            <select
              value={page}
              onChange={(e) => setPage(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="home">Home</option>
              <option value="players">Players</option>
              <option value="player_detail">Player Detail</option>
              <option value="team">Team</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              {lang === "ko" ? "관련 탭" : "Tab"}
            </label>
            <select
              value={tab}
              onChange={(e) => setTab(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="overview">Overview</option>
              <option value="hitters">Hitters</option>
              <option value="pitchers">Pitchers</option>
              <option value="schedule">Schedule</option>
              <option value="h2h">Head to Head</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              {lang === "ko" ? "오류 유형" : "Issue Type"}
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="wrong_stat">{lang === "ko" ? "잘못된 통계/기록" : "Wrong Stats"}</option>
              <option value="missing_data">{lang === "ko" ? "누락된 데이터" : "Missing Data"}</option>
              <option value="translation_issue">{lang === "ko" ? "번역 오탈자/어색함" : "Translation Issue"}</option>
              <option value="ui_bug">{lang === "ko" ? "화면/UI 깨짐" : "UI Bug"}</option>
              <option value="other">{lang === "ko" ? "기타 건의사항" : "Other"}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              {lang === "ko" ? "상세 내용" : "Details"}
            </label>
            <Textarea
              className="resize-none"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={lang === "ko" ? "오류 내용을 상세히 적어주시면 수정에 큰 도움이 됩니다." : "Please describe the issue in detail."}
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
              {lang === "ko" ? "취소" : "Cancel"}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (lang === "ko" ? "전송 중..." : "Submitting...") : (lang === "ko" ? "제보하기" : "Submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
