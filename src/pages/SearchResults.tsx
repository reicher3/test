import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Result = {
  symbol: string
  display_name: string | null
  price: number | null
  change_percent: number | null
}

export default function SearchResults() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') ?? ''
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    supabase
      .from('symbol_details')
      .select('symbol, display_name, price, change_percent')
      .or(`symbol.ilike.%${q}%,display_name.ilike.%${q}%`)
      .order('symbol', { ascending: true })
      .limit(25)
      .then(({ data }) => {
        setResults((data as Result[]) ?? [])
        setLoading(false)
      })
  }, [q])

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-2xl font-medium mb-4">Search results for "{q}"</h1>

      {loading && <p className="text-rh-muted text-sm py-6 text-center">Searching…</p>}

      {!loading && results.length === 0 && (
        <div className="text-center py-10">
          <p className="text-rh-muted text-sm mb-4">No matches for "{q}"</p>
          <button
            onClick={() => navigate(`/stock/${encodeURIComponent(q.trim().toUpperCase())}`)}
            className="text-rh-green underline text-sm"
          >
            Go to {q.trim().toUpperCase()} anyway
          </button>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="divide-y divide-rh-border border-t border-rh-border">
          {results.map((r) => {
            const positive = (r.change_percent ?? 0) >= 0
            return (
              <button
                key={r.symbol}
                onClick={() => navigate(`/stock/${r.symbol}`)}
                className="w-full flex items-center justify-between py-3 text-left hover:bg-rh-surface/50 px-1"
              >
                <div>
                  <p className="font-medium">{r.symbol}</p>
                  <p className="text-rh-muted text-xs">{r.display_name ?? ''}</p>
                </div>
                <div className="text-right">
                  <p>${r.price?.toFixed(2) ?? '—'}</p>
                  <p className={positive ? 'text-rh-green text-xs' : 'text-rh-red text-xs'}>
                    {positive ? '▲' : '▼'} {Math.abs(r.change_percent ?? 0).toFixed(2)}%
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
