import type { ReactNode } from 'react'
import TopNav from './TopNav'
import BottomNav from './BottomNav'

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <main className="pb-20 md:pb-6">{children}</main>
      <BottomNav />
    </div>
  )
}
