export type PortfolioSnapshot = {
  id: number
  equity: number
  today_change: number
  today_change_percent: number
  after_hours_change: number | null
  after_hours_change_percent: number | null
  chart: { t: string; v: number }[]
  chart_range: string
  updated_at: string
}

export type Watchlist = {
  id: string
  display_name: string
  icon_emoji: string | null
  position: number
}

export type WatchlistItem = {
  id: number
  watchlist_id: string
  symbol: string
  asset_type: string
  display_label: string | null
  position: number
  price: number | null
  change_percent: number | null
  spark: number[]
  updated_at: string
}
