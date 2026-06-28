import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Mover = {
  id: number
  category: string
  symbol: string
  price: number | null
  change_percent: number | null
}

type Earning = {
  id: number
  symbol: string
  report_date: string
  timing: string | null
  eps_estimate: number | null
}

type Scan = {
  id: string
  title: string
  results: unknown[]
}

const PILLS = ['Gainers', 'Losers', 'Earnings', 'Scans']

export default function Discover() {
  const navigate = useNavigate()
  const [movers, setMovers] = useState<Mover[]>([])
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [scans, setScans] = useState<Scan[]>([])
  const [pill, setPill] = useState('Gainers')

  useEffect(() => {
    supabase
      .from('market_movers')
      .select('*')
      .order('position', { ascending: true })
      .then(({ data }) => setMovers((data as Mover[]) ?? []))

    supabase
      .from('earnings_calendar')
      .select('*')
      .order('report_date', { ascending: true })
      .then(({ data }) => setEarnings((data as Earning[]) ?? []))

    supabase
      .from('saved_scans')
      .select('*')
      .then(({ data }) => setScans((data as Scan[]) ?? []))
  }, [])

  const gainers = movers.filter((m) => m.category === 'gainer')
  const losers = movers.filter((m) => m.category === 'loser')

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-2xl font-medium mb-4">Discover</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {PILLS.map((p) => (
          <button
            key={p}
            onClick={() => setPill(p)}
            className={
              p === pill
                ? 'bg-white text-black text-sm rounded-full px-4 py-1.5 whitespace-nowrap'
                : 'bg-rh-surface text-rh-muted text-sm rounded-full px-4 py-1.5 whitespace-nowrap hover:text-white'
            }
          >
            {p}
          </button>
        ))}
      </div>

      {pill === 'Gainers' && <MoverList movers={gainers} onClick={(s) => navigate(`/stock/${s}`)} empty="No gainer data yet" />}
      {pill === 'Losers' && <MoverList movers={losers} onClick={(s) => navigate(`/stock/${s}`)} empty="No loser data yet" />}

      {pill === 'Earnings' && (
        <div className="divide-y divide-rh-border border-t border-rh-border">
          {earnings.length === 0 && <p className="text-rh-muted text-sm py-6 text-center">No upcoming earnings yet</p>}
          {earnings.map((e) => (
            <button
              key={e.id}
              onClick={() => navigate(`/stock/${e.symbol}`)}
              className="w-full flex items-center justify-between py-3 text-left hover:bg-rh-surface/50 px-1"
            >
              <div>
                <p className="font-medium">{e.symbol}</p>
                <p className="text-rh-muted text-xs">
                  {new Date(e.report_date + 'T00:00:00').toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  · {e.timing === 'am' ? 'Before open' : e.timing === 'pm' ? 'After close' : 'Time TBD'}
                </p>
              </div>
              <p className="text-rh-muted text-sm">
                {e.eps_estimate !== null ? `Est. EPS $${e.eps_estimate.toFixed(2)}` : '—'}
              </p>
            </button>
          ))}
        </div>
      )}

      {pill === 'Scans' && (
        <div className="divide-y divide-rh-border border-t border-rh-border">
          {scans.length === 0 && <p className="text-rh-muted text-sm py-6 text-center">No saved scans yet</p>}
          {scans.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-3 px-1">
              <p className="font-medium">{s.title}</p>
              <p className="text-rh-muted text-xs">{(s.results as unknown[])?.length ?? 0} matches</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MoverList({
  movers,
  onClick,
  empty,
}: {
  movers: Mover[]
  onClick: (symbol: string) => void
  empty: string
}) {
  if (movers.length === 0) {
    return <p className="text-rh-muted text-sm py-6 text-center">{empty}</p>
  }

  return (
    <div className="divide-y divide-rh-border border-t border-rh-border">
      {movers.map((m) => {
        const positive = (m.change_percent ?? 0) >= 0
        return (
          <button
            key={m.id}
            onClick={() => onClick(m.symbol)}
            className="w-full flex items-center justify-between py-3 text-left hover:bg-rh-surface/50 px-1"
          >
            <p className="font-medium">{m.symbol}</p>
            <div className="text-right">
              <p>${m.price?.toFixed(2) ?? '—'}</p>
              <p className={positive ? 'text-rh-green text-xs' : 'text-rh-red text-xs'}>
                {positive ? '▲' : '▼'} {Math.abs(m.change_percent ?? 0).toFixed(2)}%
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
