'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from './sign-out-button'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/plans', label: 'Planovi' },
  { href: '/plan/new', label: 'Novi plan' },
  { href: '/recipes', label: 'Recepti' },
  { href: '/favorites', label: 'Omiljeni' },
  { href: '/settings', label: 'Podešavanja' },
]

type Props = { userImage?: string | null; userName?: string | null }

export function MobileNav({ userImage, userName }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="md:hidden" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="Meni"
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-50 px-4 py-3 space-y-0.5">
          {/* User info */}
          {(userImage || userName) && (
            <div className="flex items-center gap-3 px-3 py-3 mb-1 border-b border-gray-100">
              {userImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt="avatar" className="w-8 h-8 rounded-full ring-2 ring-gray-200" />
              )}
              <span className="text-sm font-semibold text-gray-800">{userName}</span>
            </div>
          )}

          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === link.href
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 mt-1 border-t border-gray-100">
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  )
}
