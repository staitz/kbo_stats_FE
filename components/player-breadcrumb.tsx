"use client"

import Link from "next/link"
import { useLang, tr } from "@/components/lang-context"
import { formatPlayerName } from "@/lib/romanize"

export function PlayerBreadcrumb({ playerName, playersHref = "/players" }: { playerName: string; playersHref?: string }) {
  const { lang } = useLang()
  return (
    <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link href="/" className="transition-colors hover:text-foreground">
        {tr("player.home", lang)}
      </Link>
      <span>/</span>
      <Link href={playersHref} className="transition-colors hover:text-foreground">
        {tr("player.players", lang)}
      </Link>
      <span>/</span>
      <span className="text-foreground">{formatPlayerName(playerName, lang)}</span>
    </nav>
  )
}
