import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

type Contract = {
  id: string
  expiration_date: string
  strike_price: number
  option_type: 'call' | 'put'
  instrument_id: string
  bid_price: number | null
  ask_price: number | null
  mark_price: number | null
  implied_volatility: number | null
  delta: number | null
  open_interest: number | null
  volume: number | null
}

export default function OptionsChain({ symbol }: { symbol: string }) {
  const { profile, session } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [expiration, setExpiration] = useState<string | null>(null)
  const [selected, setSelected] = useState<Contract | null>(null)
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [positionEffect, setPositionEffect] = useState<'open' | 'close'>('open')
  const [quantity, setQuantity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('option_chain_snapshot')
      .select('*')
      .eq('underlying_symbol', symbol)
      .order('strike_price', { ascending: true })
      .then(({ data }) => {
        const rows = (data as Contract[]) ?? []
        setContracts(rows)
        if (rows.length > 0) setExpiration(rows[0].expiration_date)
      })
  }, [symbol])

  if (contracts.length === 0) return null

  const expirations = [...new Set(contracts.map((c) => c.expiration_date))]
  const strikes = [...new Set(contracts.filter((c) => c.expiration_date === expiration).map((c) => c.strike_price))].sort(
    (a, b) => a - b
  )

  const contractFor = (strike: number, type: 'call' | 'put') =>
    contracts.find((c) => c.expiration_date === expiration && c.strike_price === strike && c.option_type === type)

  const estimate =
    selected && quantity ? (selected.mark_price ?? 0) * Number(quantity) * 100 : null

  const submit = async () => {
    if (!session || !selected || !quantity || Number(quantity) <= 0) return
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.from('order_requests').insert({
      user_id: session.user.id,
      asset_type: 'option',
      symbol,
      side,
      quantity: Number(quantity),
      order_type: 'market',
      option_id: selected.instrument_id,
      option_side: side,
      position_effect: positionEffect,
    })
    setSubmitting(false)
    if (error) {
      setError('Could not submit the order. Please try again.')
    } else {
      setDone(true)
      setQuantity('')
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Options</h3>

      <div className="flex gap-3 overflow-x-auto pb-2 mb-3 text-sm">
        {expirations.map((exp) => (
          <button
            key={exp}
            onClick={() => {
              setExpiration(exp)
              setSelected(null)
              setDone(false)
            }}
            className={
              exp === expiration
                ? 'text-white border-b-2 border-rh-green pb-1 whitespace-nowrap'
                : 'text-rh-muted whitespace-nowrap'
            }
          >
            {exp}
          </button>
        ))}
      </div>

      <div className="border border-rh-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-3 text-xs text-rh-muted px-3 py-2 bg-rh-surface">
          <span>Call</span>
          <span className="text-center">Strike</span>
          <span className="text-right">Put</span>
        </div>
        <div className="divide-y divide-rh-border">
          {strikes.map((strike) => {
            const call = contractFor(strike, 'call')
            const put = contractFor(strike, 'put')
            return (
              <div key={strike} className="grid grid-cols-3 px-3 py-2 text-sm items-center">
                <button
                  disabled={!profile?.is_owner || !call}
                  onClick={() => {
                    if (call) {
                      setSelected(call)
                      setSide('buy')
                      setPositionEffect('open')
                      setDone(false)
                      setError(null)
                    }
                  }}
                  className={`text-left ${profile?.is_owner ? 'text-rh-green hover:underline' : 'text-rh-muted'}`}
                >
                  {call?.mark_price?.toFixed(2) ?? '—'}
                </button>
                <span className="text-center text-rh-muted">${strike}</span>
                <button
                  disabled={!profile?.is_owner || !put}
                  onClick={() => {
                    if (put) {
                      setSelected(put)
                      setSide('buy')
                      setPositionEffect('open')
                      setDone(false)
                      setError(null)
                    }
                  }}
                  className={`text-right ${profile?.is_owner ? 'text-rh-red hover:underline' : 'text-rh-muted'}`}
                >
                  {put?.mark_price?.toFixed(2) ?? '—'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {!profile?.is_owner && (
        <p className="text-rh-muted text-xs mt-2">Only the account owner can place option trades.</p>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-30"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-rh-bg w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl border border-rh-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="text-center py-4">
                <p className="text-rh-green text-lg mb-2">Order queued</p>
                <p className="text-rh-muted text-sm mb-6">
                  This will be submitted for real within a few minutes.
                </p>
                <button onClick={() => setSelected(null)} className="text-sm underline">
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-1">
                  {symbol} ${selected.strike_price} {selected.option_type === 'call' ? 'Call' : 'Put'}
                </h3>
                <p className="text-rh-muted text-xs mb-4">Exp {selected.expiration_date}</p>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setSide('buy')}
                    className={
                      side === 'buy'
                        ? 'flex-1 bg-rh-green text-black rounded-full py-2 text-sm font-medium'
                        : 'flex-1 bg-rh-surface text-rh-muted rounded-full py-2 text-sm'
                    }
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setSide('sell')}
                    className={
                      side === 'sell'
                        ? 'flex-1 bg-rh-red text-black rounded-full py-2 text-sm font-medium'
                        : 'flex-1 bg-rh-surface text-rh-muted rounded-full py-2 text-sm'
                    }
                  >
                    Sell
                  </button>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setPositionEffect('open')}
                    className={
                      positionEffect === 'open'
                        ? 'flex-1 bg-rh-surface text-white border border-rh-muted rounded-full py-2 text-xs'
                        : 'flex-1 bg-rh-surface text-rh-muted rounded-full py-2 text-xs'
                    }
                  >
                    Open
                  </button>
                  <button
                    onClick={() => setPositionEffect('close')}
                    className={
                      positionEffect === 'close'
                        ? 'flex-1 bg-rh-surface text-white border border-rh-muted rounded-full py-2 text-xs'
                        : 'flex-1 bg-rh-surface text-rh-muted rounded-full py-2 text-xs'
                    }
                  >
                    Close
                  </button>
                </div>

                <label className="text-rh-muted text-xs mb-1 block">Contracts</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full bg-rh-surface border border-rh-border rounded-lg px-3 py-2 mb-1 outline-none focus:border-rh-muted text-lg"
                />
                <p className="text-rh-muted text-xs mb-4">
                  {estimate !== null
                    ? `Est. ${side === 'buy' ? 'cost' : 'proceeds'}: $${estimate.toFixed(2)}`
                    : `Mark: $${selected.mark_price?.toFixed(2) ?? '—'} · Bid ${selected.bid_price?.toFixed(2) ?? '—'} / Ask ${selected.ask_price?.toFixed(2) ?? '—'}`}
                </p>

                {error && <p className="text-rh-red text-xs mb-3">{error}</p>}

                <button
                  onClick={submit}
                  disabled={submitting || !quantity || Number(quantity) <= 0}
                  className={
                    side === 'buy'
                      ? 'w-full bg-rh-green text-black font-medium rounded-full py-3 text-sm hover:opacity-90 disabled:opacity-50'
                      : 'w-full bg-rh-red text-black font-medium rounded-full py-3 text-sm hover:opacity-90 disabled:opacity-50'
                  }
                >
                  {submitting ? 'Submitting…' : `Review ${side === 'buy' ? 'Buy' : 'Sell'} to ${positionEffect === 'open' ? 'Open' : 'Close'}`}
                </button>
                <button onClick={() => setSelected(null)} className="w-full text-center text-rh-muted text-sm mt-3">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
