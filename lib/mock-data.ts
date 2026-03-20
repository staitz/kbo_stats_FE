// Shared TypeScript shapes for UI data.

export interface Team {
  id: string
  name: string
  shortName: string
  wins: number
  losses: number
  draws: number
  pct: string
  gb: string
  streak: string
  last10: string
  color: string
}

export interface PlayerBase {
  id: string
  name: string
  team: string
  teamColor: string
  position: string
  number: number
  birthDate: string
  age: number
  hand: string
  height: number
  weight: number
  salary: string
  imageUrl?: string
}

export interface HitterSeason {
  season: number
  team: string
  G: number
  PA: number
  AB: number
  H: number
  "2B": number
  "3B": number
  HR: number
  RBI: number
  SB: number
  BB: number
  SO: number
  AVG: string
  OBP: string
  SLG: string
  OPS: string
  WAR: string
  wRC: string
  BABIP: string
}

export interface PitcherSeason {
  season: number
  team: string
  G: number
  W: number
  L: number
  SV: number
  HLD: number
  IP: string
  H: number
  ER: number
  BB: number
  SO: number
  ERA: string
  WHIP: string
  K9: string
  BB9: string
  FIP: string
  WAR: string
}

export interface AIPrediction {
  playerId: string
  targetSeason: number
  predictedWAR: string
  confidence: number
  predictedStats: Record<string, string>
  trend: "up" | "down" | "stable"
  summary: string
  riskFactors: string[]
  upside: string[]
}
