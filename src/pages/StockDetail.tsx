import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PortfolioChart from '../components/PortfolioChart'
import PriceChange from '../components/PriceChange'

type SymbolDetails = {
  symbol: string
  display_name: string | null
  price: number | null
  change_percent: number | null
  previous_close: number | null
  market_cap: number | null
  pe_ratio: number | null
  high_52w: number | null
  low_52w: number | null
  volume: number | null
  historicals: Record<string, { t: string; v: number }[]>
  updated_at: string
}

const RANGES = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL']

function fmtBig(n: number | null) {
  if (n === null) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return `$${n.toLocaleString()}`
}

export default function StockDetail() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const [details, setDetails] = useState<SymbolDetails | null>(null)
  const [range, setRange] = useState('1D')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!symbol) return
    supabase
      .from('symbol_details')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setDetails(data as SymbolDetails)
      })
  }, [symbol])

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-lg mb-2">We don't have data for {symbol} yet.</p>
        <p className="text-rh-muted text-sm mb-6">
          It'll show up here after the next data refresh.
        </p>
        <button onClick={() => navigate(-1)} className="text-rh-green underline text-sm">
          Go back
        </button>
      </div>
    )
  }

  const positive = (details?.change_percent ?? 0) >= 0
  const chart = details?.historicals?.[range] ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
      <button onClick={() => navigate(-1)} className="text-rh-muted text-sm mb-4">
        ← Back
      </button>

      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-2xl font-medium">{details?.symbol ?? symbol}</h1>
          <p className="text-rh-muted text-sm">{details?.display_name ?? ''}</p>
        </div>
        <button className="bg-rh-green text-black font-medium rounded-full px-5 py-2 text-sm hover:opacity-90">
          Trade
        </button>
      </div>

      <h2 className="text-3xl font-medium mt-4 mb-1">
        ${details?.price?.toFixed(2) ?? '—'}
      </h2>
      {details && (
        <PriceChange
          value={(details.price ?? 0) - (details.previous_close ?? 0)}
          percent={details.change_percent ?? 0}
          label="Today"
        />
      )}

      <div className="mt-4">
        <PortfolioChart data={chart} positive={positive} />
      </div>

      <div className="flex gap-4 mt-3 text-sm text-rh-muted border-b border-rh-border pb-4">
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

      <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
        <Stat label="Market Cap" value={fmtBig(details?.market_cap ?? null)} />
        <Stat label="P/E Ratio" value={details?.pe_ratio?.toFixed(1) ?? '—'} />
        <Stat label="52-Week High" value={`$${details?.high_52w?.toFixed(2) ?? '—'}`} />
        <Stat label="52-Week Low" value={`$${details?.low_52w?.toFixed(2) ?? '—'}`} />
        <Stat label="Volume" value={details?.volume?.toLocaleString() ?? '—'} />
        <Stat
          label="Updated"
          value={details ? new Date(details.updated_at).toLocaleTimeString() : '—'}
        />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-rh-border pb-3">
      <p className="text-rh-muted text-xs mb-1">{label}</p>
      <p>{value}</p>
    </div>
  )
}
