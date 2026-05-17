'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      window.location.href = '/'
    } else {
      setError('Incorrect password. Try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-emerald-50/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-9 w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 items-center justify-center text-white shadow-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M12 2C8 6 4 9 4 14a8 8 0 0 0 16 0c0-5-4-8-8-12z" />
            </svg>
          </div>
          <h1 className="text-[20px] font-semibold text-slate-900 mt-4 tracking-tight">Lilypad CRM</h1>
          <p className="text-slate-500 text-[13px] mt-1">Sign in to access the pipeline</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 hover:border-slate-300 rounded-lg px-3 h-10 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-colors"
              placeholder="Enter team password"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-[12px] rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-10 text-[13px] font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
