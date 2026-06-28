import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'

export default function PortfolioChart({
  data,
  positive,
}: {
  data: { t: string; v: number }[]
  positive: boolean
}) {
  const color = positive ? '#00c805' : '#ff5000'

  if (!data || data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-rh-muted text-sm">
        No chart data yet
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <defs>
            <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill="url(#portfolioFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
