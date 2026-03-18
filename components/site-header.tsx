"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Search, X } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { useLang, tr } from "@/components/lang-context"
import { fetchJson } from "@/lib/api"
import { formatPlayerName, formatTeamName } from "@/lib/romanize"

type SearchRow = {
  player_id: string
  player_name: string
  team: string
  AVG?: number | string
  HR?: number | string
  OPS?: number | string
  player_type?: "hitter" | "pitcher"
  _type?: "player" | "team" // 팀 결과는 _type: "team"
}

const TEAMS: { name: string; aliases: string[] }[] = [
  { name: "KIA", aliases: ["kia", "기아"] },
  { name: "LG", aliases: ["lg"] },
  { name: "KT", aliases: ["kt"] },
  { name: "NC", aliases: ["nc"] },
  { name: "SSG", aliases: ["ssg", "쓱", "신세계"] },
  { name: "두산", aliases: ["두산", "doosan"] },
  { name: "롯데", aliases: ["롯데", "lotte"] },
  { name: "삼성", aliases: ["삼성", "samsung"] },
  { name: "키움", aliases: ["키움", "kiwoom"] },
  { name: "한화", aliases: ["한화", "hanwha"] },
]

function matchTeams(query: string): SearchRow[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return TEAMS
    .filter((t) => t.name.toLowerCase().includes(q) || t.aliases.some((a) => a.includes(q)))
    .map((t) => ({ player_id: "", player_name: t.name, team: t.name, _type: "team" as const }))
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { lang, setLang } = useLang()

  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchRow[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setDropdownOpen(false)
      return
    }

    setIsSearching(true)
    const teamHits = matchTeams(debouncedQuery)

    fetchJson<{ rows: SearchRow[] }>("/players/search", { q: debouncedQuery, limit: 6 })
      .then((data) => {
        const playerHits = (data.rows ?? []).map((row) => ({ ...row, _type: "player" as const }))
        setResults([...teamHits, ...playerHits])
        setDropdownOpen(true)
      })
      .catch(() => {
        setResults(teamHits)
        setDropdownOpen(teamHits.length > 0)
      })
      .finally(() => setIsSearching(false))
  }, [debouncedQuery])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    function handleMenuClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleMenuClickOutside)
    return () => document.removeEventListener("mousedown", handleMenuClickOutside)
  }, [])

  function handleSelect(row: SearchRow) {
    setQuery("")
    setDropdownOpen(false)
    if (row._type === "team") {
      router.push(`/team?team=${encodeURIComponent(row.team)}`)
    } else if (row.player_type === "pitcher") {
      router.push(`/player/${encodeURIComponent(row.player_id || row.player_name)}?player_type=pitcher`)
    } else {
      router.push(`/player/${encodeURIComponent(row.player_id || row.player_name)}`)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0])
    }
    if (e.key === "Escape") {
      setDropdownOpen(false)
    }
  }

  const navItems = useMemo(
    () => [
      { label: tr("nav.home", lang), href: "/" },
      { label: tr("nav.players", lang), href: "/players" },
      { label: tr("nav.teams", lang), href: "/team" },
    ],
    [lang],
  )

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/icon.png" alt="KBOstats logo" width={32} height={32} className="rounded-md" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            KBO<span className="font-mono text-primary">stats</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute bottom-0 left-1/2 h-0.5 w-4/5 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 justify-center px-1">
          <div className="relative w-full max-w-md" ref={searchRef}>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={tr("search.placeholder", lang)}
              className="h-8 w-full rounded-md border border-border bg-secondary py-0 pr-8 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("")
                  setDropdownOpen(false)
                }}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                {isSearching ? (
                  <div className="px-4 py-3 text-xs text-muted-foreground">
                    {lang === "en" ? "Searching..." : "검색 중..."}
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-muted-foreground">
                    {lang === "en" ? "No results found." : "검색 결과가 없습니다."}
                  </div>
                ) : (
                  <ul>
                    {results.map((row, idx) => (
                      <li key={row._type === "team" ? `team-${row.team}` : (row.player_id || row.player_name) + idx}>
                        <button
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary"
                          onMouseDown={() => handleSelect(row)}
                        >
                          {row._type === "team" ? (
                            <>
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-primary/20 text-[10px] font-bold text-primary shrink-0">T</span>
                              <div className="min-w-0 flex-1">
                                <span className="text-sm font-medium text-foreground">{formatTeamName(row.player_name, lang)}</span>
                                <span className="ml-2 text-xs text-muted-foreground">{lang === "en" ? "Team" : "팀"}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-secondary text-[10px] font-bold text-muted-foreground shrink-0">
                                {row.player_type === "pitcher" ? "P" : "H"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className="text-sm font-medium text-foreground">{formatPlayerName(row.player_name, lang)}</span>
                                <span className="ml-2 text-xs text-muted-foreground">{formatTeamName(row.team, lang)}</span>
                              </div>
                              {row.player_type === "pitcher" ? (
                                <span className="text-xs text-muted-foreground">{lang === "en" ? "Pitcher" : "투수"}</span>
                              ) : (
                                <div className="flex gap-3 text-xs font-mono text-muted-foreground shrink-0">
                                  {row.AVG !== undefined && <span>AVG {Number.isFinite(Number(row.AVG)) ? Number(row.AVG).toFixed(3) : "-"}</span>}
                                  {row.HR !== undefined && <span>HR {String(row.HR ?? "-")}</span>}
                                  {row.OPS !== undefined && <span>OPS {Number.isFinite(Number(row.OPS)) ? Number(row.OPS).toFixed(3) : "-"}</span>}
                                </div>
                              )}
                            </>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="relative flex shrink-0 items-center" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="sr-only">{tr("ui.menu", lang)}</span>
          </Button>

          {menuOpen && (
            <div className="absolute top-10 right-0 w-64 rounded-lg border border-border bg-card p-3 shadow-xl">
              <div className="mb-3 md:hidden">
                <p className="mb-2 text-xs font-medium text-muted-foreground">{tr("ui.menu", lang)}</p>
                <div className="grid grid-cols-3 gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`rounded-md px-2 py-1.5 text-center text-xs ${
                        isActive(item.href) ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">{tr("ui.theme", lang)}</p>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setTheme("light")}
                    className={`rounded-md px-2 py-1.5 text-xs ${
                      theme === "light" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {tr("ui.light", lang)}
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`rounded-md px-2 py-1.5 text-xs ${
                      theme === "dark" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {tr("ui.dark", lang)}
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">{tr("ui.language", lang)}</p>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setLang("ko")}
                    className={`rounded-md px-2 py-1.5 text-xs ${
                      lang === "ko" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    한국어
                  </button>
                  <button
                    onClick={() => setLang("en")}
                    className={`rounded-md px-2 py-1.5 text-xs ${
                      lang === "en" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
