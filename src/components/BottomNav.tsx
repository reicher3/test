import { NavLink } from 'react-router-dom'

const ITEMS = [
  { label: 'Home', to: '/', icon: '🏠' },
  { label: 'Discover', to: '/discover', icon: '🔎' },
  { label: 'Orders', to: '/orders', icon: '🧾' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-black border-t border-rh-border flex justify-around py-2 z-20">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs gap-0.5 px-3 py-1 ${
              isActive ? 'text-white' : 'text-rh-muted'
            }`
          }
        >
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
