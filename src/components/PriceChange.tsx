export default function PriceChange({
  value,
  percent,
  label,
  size = 'sm',
}: {
  value: number
  percent: number
  label?: string
  size?: 'sm' | 'md'
}) {
  const positive = value >= 0
  const color = positive ? 'text-rh-green' : 'text-rh-red'
  const arrow = positive ? '▲' : '▼'
  const textSize = size === 'md' ? 'text-base' : 'text-sm'

  return (
    <span className={`${color} ${textSize}`}>
      {arrow} ${Math.abs(value).toFixed(2)} ({Math.abs(percent).toFixed(2)}%){label ? ` ${label}` : ''}
    </span>
  )
}
