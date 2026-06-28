import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'

export default function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) {
    return <div className="w-16 h-8" />
  }
  const points = data.map((v, i) => ({ i, v }))
  const color = positive ? '#00c805' : '#ff5000'

  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
