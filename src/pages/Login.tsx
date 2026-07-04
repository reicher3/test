import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { session, profile, loading, signInWithGoogle, signOut } = useAuth()

  if (session && !loading && profile?.is_approved) {
    return <Navigate to="/" replace />
  }

  const showPendingState = session && !loading && profile && !profile.is_approved

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6">
      <div className="flex items-center gap-2 mb-10">
        <RocketIcon />
        <span className="text-2xl font-medium tracking-tight">Agentic Portfolio</span>
      </div>

      {showPendingState ? (
        <div className="text-center max-w-sm">
          <p className="text-lg mb-2">You're signed in, but not approved yet.</p>
          <p className="text-rh-muted text-sm mb-6">
            Signed in as {profile.email}. Ask the owner to approve this email.
          </p>
          <button
            onClick={signOut}
            className="text-sm text-rh-muted underline hover:text-white"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-3 bg-white text-black font-medium rounded-full px-6 py-3 hover:bg-gray-200 transition"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      )}
    </div>
  )
}

function RocketIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L9 9l-6 3 6 1 1 6 3-6 6-3-6-1-1-7z"
        fill="white"
      />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.07-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.55-1.84.86-3.06.86-2.36 0-4.36-1.6-5.07-3.74H.9v2.33C2.38 15.98 5.48 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.93 10.68A5.4 5.4 0 0 1 3.64 9c0-.58.1-1.15.29-1.68V4.99H.9A8.96 8.96 0 0 0 0 9c0 1.45.35 2.82.9 4.01l3.03-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.38 2.02.9 4.99l3.03 2.33C4.64 5.18 6.64 3.58 9 3.58z"
      />
    </svg>
  )
}
