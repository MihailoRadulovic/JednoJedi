import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/sign-out-button'
import { ToastProvider } from '@/components/toast'
import { MobileNav } from '@/components/mobile-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-0 relative sticky top-0 z-40">
          <div className="max-w-5xl mx-auto flex items-center justify-between h-14">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="font-serif text-lg font-bold text-green-700 tracking-tight hover:text-green-600 transition-colors"
            >
              JednoJedi
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/plans', label: 'Planovi' },
                { href: '/plan/new', label: 'Novi plan' },
                { href: '/recipes', label: 'Recepti' },
                { href: '/favorites', label: 'Omiljeni' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all font-medium"
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-200">
                {session.user?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt="avatar"
                    className="w-7 h-7 rounded-full ring-2 ring-gray-200"
                  />
                )}
                <Link
                  href="/settings"
                  className="text-sm text-gray-500 hover:text-gray-900 transition font-medium"
                >
                  Podešavanja
                </Link>
                <span className="text-gray-300">·</span>
                <SignOutButton />
              </div>
            </div>

            {/* Mobile nav */}
            <MobileNav
              userImage={session.user?.image}
              userName={session.user?.name}
            />
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-4 md:px-6 py-7 md:py-9">
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
