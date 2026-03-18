"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type Lang = "ko" | "en"

const LANG_KEY = "kbo_ui_lang"

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangContextValue>({ lang: "ko", setLang: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko")

  // localStorage에서 초기값 로드 (hydration 후)
  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === "ko" || saved === "en") setLangState(saved)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem(LANG_KEY, l)
    document.documentElement.lang = l
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}

// ─── 전체 앱 텍스트 번역 사전 ───────────────────────────────────────

export const t: Record<string, Record<Lang, string>> = {
  // Navigation
  "nav.home":    { ko: "홈",   en: "Home" },
  "nav.players": { ko: "선수", en: "Players" },
  "nav.teams":   { ko: "팀",   en: "Teams" },

  // Header UI
  "search.placeholder": { ko: "선수, 팀 검색...", en: "Search player or team..." },
  "ui.menu":     { ko: "메뉴",   en: "Menu" },
  "ui.theme":    { ko: "테마",   en: "Theme" },
  "ui.language": { ko: "언어",   en: "Language" },
  "ui.dark":     { ko: "다크",   en: "Dark" },
  "ui.light":    { ko: "라이트", en: "Light" },

  // Home page
  "home.season":       { ko: "KBO 정규시즌", en: "KBO Regular Season" },
  "home.title":        { ko: "KBO 세이버메트릭스 & AI 분석", en: "KBO Sabermetrics and AI Analysis" },
  "home.subtitle":     { ko: "선수별 세이버메트릭스 지표와 AI 예측을 한 곳에서 확인하세요.", en: "Explore KBO player stats with sabermetric context and AI projections in one place." },
  "home.games":        { ko: "경기",      en: "Games" },
  "home.players":      { ko: "선수",      en: "Players" },
  "home.standings":    { ko: "순위표",    en: "Standings" },
  "home.leaderboard":  { ko: "리더보드",  en: "Leaderboard" },
  "home.recentGames":  { ko: "최근 경기", en: "Recent Games" },
  "home.footer":       { ko: "KBOstats - KBO 데이터 분석 플랫폼", en: "KBOstats - KBO data analysis platform" },
  "home.glossary":     { ko: "용어집",    en: "Glossary" },
  "home.dataSources":  { ko: "데이터 출처", en: "Data Sources" },
  "home.reportIssue":  { ko: "오류 제보", en: "Report Issue" },

  // Players page
  "players.title":       { ko: "선수",               en: "Players" },
  "players.subtitle":    { ko: "KBO 타자/투수 기록을 시즌별로 확인합니다.", en: "Browse KBO hitter and pitcher stats by season." },
  "players.hitters":     { ko: "타자",                en: "Hitters" },
  "players.pitchers":    { ko: "투수",                en: "Pitchers" },
  "players.searchPlaceholder": { ko: "선수명 또는 팀 검색", en: "Search name or team" },
  "players.allTeams":    { ko: "전체 팀",             en: "All Teams" },
  "players.regulation":  { ko: "규정타석",            en: "Min PA" },
  "players.loading":     { ko: "데이터를 불러오는 중...", en: "Loading data..." },
  "players.rank":        { ko: "#",  en: "#" },
  "players.player":      { ko: "선수", en: "Player" },
  "players.team":        { ko: "팀",   en: "Team" },

  // Team page
  "team.rank":         { ko: "순위",   en: "Rank" },
  "team.winPct":       { ko: "승률",   en: "Win%" },
  "team.gb":           { ko: "GB",     en: "GB" },
  "team.streak":       { ko: "연속",   en: "Streak" },
  "team.roster":       { ko: "주요 타자", en: "Key Hitters" },
  "team.schedule":     { ko: "일정 / 결과", en: "Schedule" },
  "team.h2h":          { ko: "상대 전적", en: "Head-to-Head" },
  "team.opsLeaders":   { ko: "OPS 리더", en: "OPS Leaders" },
  "team.hrLeaders":    { ko: "홈런 리더", en: "HR Leaders" },
  "team.scheduleLoading": { ko: "일정 로딩 중...", en: "Loading schedule..." },
  "team.scheduleError":   { ko: "일정을 불러오지 못했습니다.", en: "Failed to load schedule." },
  "team.noData":       { ko: "일정 데이터가 없습니다.", en: "No schedule data." },
  "team.home":         { ko: "홈",     en: "Home" },
  "team.away":         { ko: "원정",   en: "Away" },
  "team.win":          { ko: "승",     en: "W" },
  "team.loss":         { ko: "패",     en: "L" },
  "team.draw":         { ko: "무",     en: "D" },
  "team.scheduled":    { ko: "예정",     en: "TBD" },
  "team.status.cancelled":    { ko: "취소",     en: "Cancelled" },
  "team.status.suspended":    { ko: "중단",     en: "Suspended" },
  "team.status.unknown":      { ko: "상태 미확인", en: "Status Unknown" },
  "team.status.missingResult":{ ko: "결과 누락", en: "Result Missing" },
  "team.opp":          { ko: "상대",   en: "Opp" },
  "team.wins":         { ko: "승",     en: "W" },
  "team.losses":       { ko: "패",     en: "L" },
  "team.draws":        { ko: "무",     en: "D" },
  "team.runsFor":      { ko: "득점",   en: "RS" },
  "team.runsAgainst":  { ko: "실점",   en: "RA" },
  "team.h2hPct":       { ko: "승률",   en: "Win%" },

  // Leaderboard labels
  "lb.avg":        { ko: "타율 TOP 5",  en: "AVG TOP 5" },
  "lb.hr":         { ko: "홈런 TOP 5", en: "HR TOP 5" },
  "lb.era":        { ko: "ERA TOP 5",  en: "ERA TOP 5" },
  "lb.war":        { ko: "WAR TOP 5",  en: "WAR TOP 5" },
  "lb.noData":     { ko: "데이터 준비 중", en: "No data yet" },
  "lb.ops":        { ko: "OPS TOP 5",  en: "OPS TOP 5" },

  // Standings
  "standings.title":   { ko: "2026 시즌 순위", en: "2026 Season Standings" },
  "standings.team":    { ko: "팀",  en: "Team" },
  "standings.w":       { ko: "승",  en: "W" },
  "standings.d":       { ko: "무",  en: "D" },
  "standings.l":       { ko: "패",  en: "L" },

  // Common
  "common.loading":          { ko: "로딩 중...", en: "Loading..." },
  "common.error":            { ko: "오류",      en: "Error" },
  "common.season":           { ko: "시즌",      en: "Season" },
  "common.home":             { ko: "홈",        en: "Home" },

  // Error messages
  "standings.loadError":     { ko: "순위를 불러오지 못했습니다.",     en: "Failed to load standings." },
  "roster.loadError":        { ko: "팀 리더보드를 불러오지 못했습니다.", en: "Failed to load roster." },
  "h2h.loadError":           { ko: "상대 전적을 불러오지 못했습니다.", en: "Failed to load head-to-head." },
  "players.loadError":       { ko: "데이터를 불러오는 중...",         en: "Loading data..." },
  "players.loadFail":        { ko: "선수 데이터 요청 실패",           en: "Failed to load player data" },
  "recentGames.title":       { ko: "오늘의 경기",                     en: "Today's Games" },

  // Player detail page
  "player.home":             { ko: "홈",          en: "Home" },
  "player.players":          { ko: "선수",        en: "Players" },
  "player.notFound":         { ko: "선수 상세 데이터 없음", en: "Player Not Found" },
  "player.notFoundMsg":      { ko: "선수의 상세 데이터를 찾을 수 없습니다.", en: "No detail data found for this player." },
  "player.noSeasonData":     { ko: "시즌 데이터 없음", en: "No Season Data" },
  "player.noSeasonDataMsg":  { ko: "선수의 시즌 기록이 아직 없습니다.", en: "No season record available yet." },
  "player.hitter":           { ko: "타자",        en: "Hitter" },
  "player.pitcher":          { ko: "투수",        en: "Pitcher" },
  "player.pitcherVizNA":     { ko: "투수 시각화 데이터 준비 중", en: "Pitcher visualization coming soon" },
  "player.pitcherStatsTitle": { ko: "시즌 기록",  en: "Season Stats" },
  "player.season":           { ko: "시즌",        en: "Season" },
  "player.team":             { ko: "팀",          en: "Team" },
  "ai.title":                { ko: "AI 성적 예측", en: "AI Projection" },
  "ai.noData":               { ko: "해당 선수의 AI 예측 데이터가 아직 없습니다.", en: "No AI prediction data available for this player." },
  "ai.asOf":                 { ko: "기준일",      en: "As of" },
  "ai.confidence":           { ko: "신뢰도",      en: "Confidence" },
  "ai.predictedOps":         { ko: "예측 OPS",    en: "Proj. OPS" },
  "ai.predictedHr":          { ko: "예측 HR",     en: "Proj. HR" },
  "ai.predictedWar":         { ko: "예측 WAR",    en: "Proj. WAR" },
  "ai.predictedHits":        { ko: "예상 안타",    en: "Proj. H" },
  "ai.predictedRbi":         { ko: "예상 타점",    en: "Proj. RBI" },
  "ai.goldenGloveProb":      { ko: "골든글러브 확률", en: "Golden Glove" },
  "ai.mvpProb":              { ko: "MVP 확률",     en: "MVP Odds" },
  "ai.modelSource":          { ko: "모델 소스",   en: "Model" },
  "ai.predictedEra":         { ko: "예측 평자",   en: "Proj. ERA" },
  "ai.predictedWhip":        { ko: "예측 WHIP",   en: "Proj. WHIP" },
  "ai.predictedK9":          { ko: "예측 K/9",    en: "Proj. K/9" },
  "ai.predictedWins":        { ko: "예상 승수",   en: "Proj. W" },
  "ai.predictedSo":          { ko: "예상 삼진",   en: "Proj. SO" },
  "ai.predictedIp":          { ko: "예상 이닝",   en: "Proj. IP" },
  "chart.title":             { ko: "시각화",      en: "Visualization" },
  "chart.season":            { ko: "시즌",        en: "Season" },
  "chart.cumAvgOpsTitle":    { ko: "누적 타율 / OPS", en: "Cumulative AVG / OPS" },
  "chart.cumAvgOps":         { ko: "누적 타율 / OPS", en: "Cumulative AVG / OPS" },
  "chart.cumAvgOpsDesc":     { ko: "해당 달까지의 시즌 누적 성적", en: "Season-to-date stats through each month" },
  "chart.monthlyHr":         { ko: "월별 홈런",   en: "Monthly HR" },
  "chart.monthlyHrDesc":     { ko: "해당 달 동안 친 홈런 수", en: "Home runs hit during the month" },
  "chart.noData":            { ko: "시즌 월별 게임 로그 데이터가 없습니다.", en: "No monthly game log data for this season." },
  "chart.cumAvg":            { ko: "누적 타율",   en: "Cum. AVG" },
  "chart.cumOps":            { ko: "누적 OPS",    en: "Cum. OPS" },
}

/** 번역 헬퍼 */
export function tr(key: string, lang: Lang): string {
  return t[key]?.[lang] ?? key
}
