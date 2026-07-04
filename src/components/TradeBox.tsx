import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function TradeBox({ symbol, price }: { symbol: string; price: number | null }) {
  const { profile, session } = useAuth()
  const [open, setOpen] = useState(false)
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const estimate = price && quantity ? price * Number(quantity) : null

  const submit = async () => {
    if (!session || !quantity || Number(quantity) <= 0) return
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.from('order_requests').insert({
      user_id: session.user.id,
      asset_type: 'equity',
      symbol,
      side,
      quantity: Number(quantity),
      order_type: 'market',
    })
    setSubmitting(false)
    if (error) {
      setError('Could not submit the order. Please try again.')
    } else {
      setDone(true)
      setQuantity('')
    }
  }

  if (!profile?.is_owner) {
    return (
      <button
        disabled
        title="Only the account owner can place trades"
        className="bg-rh-surface text-rh-muted font-medium rounded-full px-5 py-2 text-sm cursor-not-allowed"
      >
        Trade
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen(true)
          setDone(false)
          setError(null)
        }}
        className="bg-rh-green text-black font-medium rounded-full px-5 py-2 text-sm hover:opacity-90"
      >
        Trade
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-30" onClick={() => setOpen(false)}>
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
                <button onClick={() => setOpen(false)} className="text-sm underline">
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-4">{symbol}</h3>

                <div className="flex gap-2 mb-4">
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

                <label className="text-rh-muted text-xs mb-1 block">Shares</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full bg-rh-surface border border-rh-border rounded-lg px-3 py-2 mb-1 outline-none focus:border-rh-muted text-lg"
                />
                <p className="text-rh-muted text-xs mb-4">
                  {estimate !== null ? `Est. ${side === 'buy' ? 'cost' : 'proceeds'}: $${estimate.toFixed(2)}` : 'Market order'}
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
                  {submitting ? 'Submitting…' : `Review ${side === 'buy' ? 'Buy' : 'Sell'}`}
                </button>
                <button onClick={() => setOpen(false)} className="w-full text-center text-rh-muted text-sm mt-3">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
