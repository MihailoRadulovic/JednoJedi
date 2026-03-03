'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

const isDev = process.env.NODE_ENV !== 'production'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDevLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await signIn('credentials', { email, callbackUrl: '/dashboard' })
  }

  return (
    <main className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-green-100 opacity-40 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-100 opacity-30 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-[#DDD4C8] p-9 text-center">
          {/* Logo mark */}
          <div className="w-14 h-14 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <span className="text-2xl">🥗</span>
          </div>

          <h1 className="font-serif text-2xl font-bold text-[#1A1210] mb-2">JednoJedi</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Prijavi se da pristupiš svom planu ishrane
          </p>

          {!isDev && (
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full flex items-center justify-center gap-3 border border-[#DDD4C8] rounded-xl px-4 py-3 text-[#3E2E20] font-semibold hover:bg-[#FAF8F3] hover:border-[#C4B8A8] transition-all text-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Nastavi sa Google
            </button>
          )}

          {isDev && (
            <form onSubmit={handleDevLogin} className="space-y-3 text-left">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
                <span className="text-amber-500 text-xs">⚡</span>
                <p className="text-xs text-amber-700 font-semibold">Dev login – unesi bilo koji email</p>
              </div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tvoj@email.com"
                required
                className="w-full border border-[#DDD4C8] rounded-xl px-4 py-3 text-sm text-[#1A1210] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-[#FAF8F3] transition-all"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-green-700 text-white rounded-xl px-4 py-3 text-sm font-semibold hover:bg-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Prijavljivanje...
                  </span>
                ) : 'Prijavi se'}
              </button>
            </form>
          )}

          <p className="text-xs text-gray-400 mt-7 leading-relaxed">
            Prijavom prihvataš uslove korišćenja i politiku privatnosti.
          </p>
        </div>

        {/* Back to landing */}
        <div className="text-center mt-5">
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition">
            ← Nazad na početnu
          </a>
        </div>
      </div>
    </main>
  )
}
