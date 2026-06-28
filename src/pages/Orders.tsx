import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

type OrderRequest = {
  id: string
  asset_type: string
  symbol: string
  side: string
  quantity: number
  order_type: string
  limit_price: number | null
  status: string
  reject_reason: string | null
  robinhood_order_id: string | null
  created_at: string
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'text-rh-muted',
  submitted: 'text-rh-green',
  filled: 'text-rh-green',
  rejected: 'text-rh-red',
  cancelled: 'text-rh-muted',
}

export default function Orders() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [orders, setOrders] = useState<OrderRequest[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    supabase
      .from('order_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as OrderRequest[]) ?? [])
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
  }, [])

  const cancel = async (id: string) => {
    await supabase.from('order_requests').update({ status: 'cancelled' }).eq('id', id)
    load()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-2xl font-medium mb-4">Orders</h1>

      {!profile?.is_owner && (
        <p className="text-rh-muted text-sm mb-4">
          You're viewing the shared account's order history. Only the owner can place or cancel trades.
        </p>
      )}

      {!loading && orders.length === 0 && (
        <p className="text-rh-muted text-sm py-10 text-center">No orders yet</p>
      )}

      <div className="divide-y divide-rh-border border-t border-rh-border">
        {orders.map((o) => (
          <div key={o.id} className="flex items-center justify-between py-3">
            <button onClick={() => navigate(`/stock/${o.symbol}`)} className="text-left">
              <p className="font-medium">
                {o.side === 'buy' ? 'Buy' : 'Sell'} {o.symbol}
              </p>
              <p className="text-rh-muted text-xs">
                {o.quantity} {o.asset_type === 'equity' ? 'shares' : 'contracts'} ·{' '}
                {new Date(o.created_at).toLocaleString()}
              </p>
              {o.reject_reason && <p className="text-rh-red text-xs mt-0.5">{o.reject_reason}</p>}
            </button>
            <div className="flex items-center gap-3">
              <span className={`text-xs capitalize ${STATUS_COLOR[o.status] ?? 'text-rh-muted'}`}>
                {o.status}
              </span>
              {profile?.is_owner && o.status === 'pending' && (
                <button
                  onClick={() => cancel(o.id)}
                  className="text-rh-red text-xs underline"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
