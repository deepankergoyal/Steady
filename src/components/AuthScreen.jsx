import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }

  async function handleSignUp() {
    setError('')
    setInfo('')
    if (!email || !password) {
      setError('Enter an email and password first.')
      return
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    if (!data.session) {
      setInfo('Check your email to confirm your account, then sign in.')
    }
  }

  return (
    <div className="wrap auth-screen">
      <header>
        <p className="eyebrow">a quiet record</p>
        <h1>Steady</h1>
        <p className="sub">Sign in to sync your habits across every device.</p>
      </header>

      <form className="auth-form" onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          minLength={6}
          required
        />
        <div className="auth-actions">
          <button type="submit">Sign in</button>
          <button type="button" onClick={handleSignUp}>
            Create account
          </button>
        </div>
        {(error || info) && (
          <p className="auth-error" style={info ? { color: 'var(--thread)' } : undefined}>
            {error || info}
          </p>
        )}
      </form>
    </div>
  )
}
