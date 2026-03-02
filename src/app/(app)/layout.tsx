import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/sign-out-button'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-green-600">
            JednoJedi
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Dashboard
            </Link>
            <Link href="/plans" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Planovi
            </Link>
            <Link href="/plan/new" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Novi plan
            </Link>
            <div className="flex items-center gap-3">
              {session.user?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full" />
              )}
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
