import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      height: true,
      weight: true,
      birthYear: true,
      region: true,
      mode: true,
    },
  })

  if (!user) redirect('/login')

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Podešavanja profila</h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">Ažuriraj svoje fizičke podatke i preferencije.</p>
      </div>

      {/* Account info (read-only) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="avatar" className="w-14 h-14 rounded-full ring-2 ring-gray-200" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          )}
          <div>
            <div className="font-bold text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500 font-medium">{user.email}</div>
            <div className="text-xs text-gray-400 mt-0.5 font-medium">Google nalog</div>
          </div>
        </div>
      </div>

      <SettingsForm
        initialValues={{
          height: user.height ?? undefined,
          weight: user.weight ?? undefined,
          birthYear: user.birthYear ?? undefined,
          region: user.region ?? 'Beograd',
          mode: user.mode,
        }}
      />
    </div>
  )
}
