import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const NAV_LINKS = [
  { label: 'Investing', to: '/' },
  { label: 'Discover', to: '/discover' },
  { label: 'Orders', to: '/orders' },
]

export default function TopNav() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="flex items-center gap-4 px-4 md:px-6 h-16 border-b border-rh-border bg-black sticky top-0 z-20">
      <Link to="/" className="shrink-0">
        <RocketIcon />
      </Link>

      <form onSubmit={onSearch} className="hidden sm:block flex-1 max-w-xs">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full bg-rh-surface border border-rh-border rounded-full px-4 py-2 text-sm outline-none focus:border-rh-muted"
        />
      </form>

      <nav className="hidden md:flex items-center gap-6 ml-auto text-sm text-rh-muted">
        {NAV_LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="hover:text-white whitespace-nowrap">
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto md:ml-4 flex items-center gap-3 text-sm">
        {profile?.is_owner && (
          <span className="hidden sm:inline text-rh-green text-xs border border-rh-green/40 rounded-full px-2 py-0.5">
            Owner
          </span>
        )}
        <button onClick={signOut} className="text-rh-muted hover:text-white whitespace-nowrap">
          Sign out
        </button>
      </div>
    </header>
  )
}

function RocketIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L9 9l-6 3 6 1 1 6 3-6 6-3-6-1-1-7z" fill="white" />
    </svg>
  )
}
