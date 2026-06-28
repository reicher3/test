import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Watchlist, WatchlistItem } from '../lib/types'
import Sparkline from './Sparkline'

export default function WatchlistPanel() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([])
  const [items, setItems] = useState<Record<string, WatchlistItem[]>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('watchlists')
      .select('*')
      .order('position')
      .then(({ data }) => {
        setWatchlists(data ?? [])
        if (data?.length) setExpanded({ [data[0].id]: true })
      })

    supabase
      .from('watchlist_items')
      .select('*')
      .order('position')
      .then(({ data }) => {
        const grouped: Record<string, WatchlistItem[]> = {}
        for (const item of data ?? []) {
          grouped[item.watchlist_id] = grouped[item.watchlist_id] || []
          grouped[item.watchlist_id].push(item as WatchlistItem)
        }
        setItems(grouped)
      })
  }, [])

  return (
    <div className="bg-rh-surface border border-rh-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-rh-border">
        <h2 className="font-medium">Lists</h2>
        <span className="text-rh-muted text-xl leading-none">+</span>
      </div>

      {watchlists.map((wl) => (
        <div key={wl.id} className="border-b border-rh-border last:border-b-0">
          <button
            onClick={() => setExpanded((e) => ({ ...e, [wl.id]: !e[wl.id] }))}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5"
          >
            <span className="flex items-center gap-2 text-sm">
              <span>{wl.icon_emoji}</span>
              {wl.display_name}
            </span>
            <span className="text-rh-muted text-xs">{expanded[wl.id] ? '▾' : '▸'}</span>
          </button>

          {expanded[wl.id] &&
            (items[wl.id] ?? []).map((item) => {
              const positive = (item.change_percent ?? 0) >= 0
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/stock/${item.symbol}`)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 text-left"
                >
                  <span className="font-medium text-sm">{item.symbol}</span>
                  <Sparkline data={item.spark as unknown as number[]} positive={positive} />
                  <div className="text-right">
                    <div className="text-sm">${item.price?.toFixed(2) ?? '—'}</div>
                    <div className={`text-xs ${positive ? 'text-rh-green' : 'text-rh-red'}`}>
                      {positive ? '+' : ''}
                      {item.change_percent?.toFixed(2) ?? '0.00'}%
                    </div>
                  </div>
                </button>
              )
            })}
        </div>
      ))}
    </div>
  )
}
