import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="text-xl font-bold text-green-600">JednoJedi</span>
        <Link
          href="/login"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          Prijavi se
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Planiraj obroke.<br />
          <span className="text-green-600">Kontroliši troškove.</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
          JednoJedi generiše personalizovane nedeljne planove ishrane sa realnim cenama
          srpskog tržišta – prilagođene tvojim fitnes ciljevima i budžetu.
        </p>
        <Link
          href="/login"
          className="inline-block bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition"
        >
          Počni besplatno →
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <div className="text-center p-6 rounded-2xl bg-green-50">
          <div className="text-4xl mb-4">🥗</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalizovani jelovnik</h3>
          <p className="text-gray-500 text-sm">
            Nedeljni, dnevni ili jedan obrok – prilagođen tvojim ciljevima i preferencijama.
          </p>
        </div>
        <div className="text-center p-6 rounded-2xl bg-blue-50">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Realne cene</h3>
          <p className="text-gray-500 text-sm">
            Cene namirnica sa srpskog tržišta. Tačna lista za kupovinu sa ukupnim troškom.
          </p>
        </div>
        <div className="text-center p-6 rounded-2xl bg-purple-50">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Fitnes ciljevi</h3>
          <p className="text-gray-500 text-sm">
            Mršavljenje, masa ili održavanje – makroi i kalorije prilagođeni tebi.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-100">
        © 2026 JednoJedi. Napravljeno za srpsko tržište.
      </footer>
    </main>
  )
}
