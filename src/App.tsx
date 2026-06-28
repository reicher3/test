import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import StockDetail from './pages/StockDetail'
import Discover from './pages/Discover'
import Shell from './components/Shell'

function Protected({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-rh-muted">
        Loading…
      </div>
    )
  }

  if (!session || !profile?.is_approved) {
    return <Navigate to="/login" replace />
  }

  return <Shell>{children}</Shell>
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          {import.meta.env.DEV && (
            <Route path="/__preview" element={<Shell><Dashboard /></Shell>} />
          )}
          {import.meta.env.DEV && (
            <Route path="/__preview/stock/:symbol" element={<Shell><StockDetail /></Shell>} />
          )}
          {import.meta.env.DEV && (
            <Route path="/__preview/discover" element={<Shell><Discover /></Shell>} />
          )}
          <Route
            path="/"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/stock/:symbol"
            element={
              <Protected>
                <StockDetail />
              </Protected>
            }
          />
          <Route
            path="/discover"
            element={
              <Protected>
                <Discover />
              </Protected>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
