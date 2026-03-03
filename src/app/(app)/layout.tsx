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
        <nav className="bg-white border-b border-gray-100 px-6 py-4 relative">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="text-xl font-bold text-green-600">
              JednoJedi
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Dashboard
              </Link>
              <Link href="/plans" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Planovi
              </Link>
              <Link href="/plan/new" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Novi plan
              </Link>
              <Link href="/recipes" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Recepti
              </Link>
              <Link href="/favorites" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Omiljeni
              </Link>
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full" />
                )}
                <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-900 transition">
                  Podešavanja
                </Link>
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

        <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
