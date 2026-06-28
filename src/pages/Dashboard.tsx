import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { PortfolioSnapshot } from '../lib/types'
import PortfolioChart from '../components/PortfolioChart'
import PriceChange from '../components/PriceChange'
import WatchlistPanel from '../components/WatchlistPanel'

const RANGES = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL']

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null)
  const [range, setRange] = useState('1D')

  useEffect(() => {
    supabase
      .from('portfolio_snapshot')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => setPortfolio(data as PortfolioSnapshot))
  }, [])

  const positive = (portfolio?.today_change ?? 0) >= 0

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      <div>
        <p className="text-rh-muted text-sm mb-1">Agentic ▾</p>
        <h1 className="text-4xl font-medium mb-1">
          ${portfolio?.equity.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '—'}
        </h1>
        {portfolio && (
          <div className="flex flex-col gap-0.5 mb-4">
            <PriceChange value={portfolio.today_change} percent={portfolio.today_change_percent} label="Today" />
            {portfolio.after_hours_change !== null && (
              <PriceChange
                value={portfolio.after_hours_change}
                percent={portfolio.after_hours_change_percent ?? 0}
                label="After-hours"
              />
            )}
          </div>
        )}

        <PortfolioChart data={portfolio?.chart ?? []} positive={positive} />

        <div className="flex gap-4 mt-3 text-sm text-rh-muted border-b border-rh-border pb-3">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={r === range ? 'text-white border-b-2 border-rh-green pb-1' : 'hover:text-white'}
            >
              {r}
            </button>
          ))}
        </div>

        {portfolio && (
          <p className="text-rh-muted text-xs mt-3">
            Last updated {new Date(portfolio.updated_at).toLocaleTimeString()}
          </p>
        )}
      </div>

      <div>
        <WatchlistPanel />
      </div>
    </div>
  )
}
