import Link from 'next/link'

const FEATURES = [
  { emoji: '🥗', title: 'Personalizovani jelovnik', desc: 'Nedeljni, dnevni ili jedan obrok – prilagodjen ciljevima, budzetu i broju osoba.', bg: 'bg-green-50' },
  { emoji: '💰', title: 'Realne cene namirnica', desc: 'Cene sa srpskog trzista. Lista za kupovinu sa tacnim troskom po kategorijama.', bg: 'bg-blue-50' },
  { emoji: '🎯', title: 'Fitnes ciljevi', desc: 'Mrsavljenje, masa ili odrzavanje. TDEE kalkulacija po tvojim podacima.', bg: 'bg-purple-50' },
  { emoji: '🔄', title: 'Zamena obroka', desc: 'Ne svida ti se recept? Jednim klikom zameni ga alternativom istog tipa.', bg: 'bg-orange-50' },
  { emoji: '📊', title: 'Pracenje tezine', desc: 'Grafikon napretka i dnevni kalorijski cilj vidljivi na dashboardu.', bg: 'bg-pink-50' },
  { emoji: '🛒', title: 'Shopping lista', desc: 'Interaktivna lista namirnica sa checkboxovima, pamti stanje.', bg: 'bg-yellow-50' },
]

const STEPS = [
  { n: '1', title: 'Unesi podatke', desc: 'Visina, tezina, godina i cilj – samo jednom.' },
  { n: '2', title: 'Generisi plan', desc: 'Izaberi tip plana, broj osoba i budzet.' },
  { n: '3', title: 'Kuvaj i kupuj', desc: 'Prati obroke, menjaj recepte, cekiraj listu.' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-green-600">JednoJedi</span>
        <Link href="/login" className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition">
          Prijavi se
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          Napravljeno za srpsko trziste
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
          Planiranje ishrane<br />
          <span className="text-green-600">koje zaista radi.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Automatski nedeljni plan obroka sa cenama sa srpskog trzista.
          Znas unapred koliko ces potrositi do dinara.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="inline-block bg-green-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-green-700 transition shadow-sm">
            Pocni besplatno →
          </Link>
          <a href="#kako-radi" className="inline-block border border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-base font-medium hover:bg-gray-50 transition">
            Kako radi?
          </a>
        </div>
      </section>

      {/* Mock preview */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <div className="text-lg font-bold text-gray-900">2.140</div>
              <div className="text-xs text-gray-400 mt-0.5">kcal/dan</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <div className="text-lg font-bold text-gray-900">142g</div>
              <div className="text-xs text-gray-400 mt-0.5">protein/dan</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <div className="text-lg font-bold text-green-600">4.850</div>
              <div className="text-xs text-gray-400 mt-0.5">RSD ukupno</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div>
              <div className="flex justify-between px-4 py-2 bg-gray-50">
                <span className="text-xs font-semibold text-gray-700">Ponedeljak</span>
                <span className="text-xs text-gray-400">2180 kcal</span>
              </div>
              <div className="px-4 py-2 space-y-1.5">
                <div className="flex items-center gap-2"><span className="text-xs text-green-600 w-14 shrink-0">Dorucak</span><span className="text-xs text-gray-700">Ovsena kasa sa bananom</span></div>
                <div className="flex items-center gap-2"><span className="text-xs text-green-600 w-14 shrink-0">Uzina</span><span className="text-xs text-gray-700">Svjezi sir sa orasima</span></div>
                <div className="flex items-center gap-2"><span className="text-xs text-green-600 w-14 shrink-0">Rucak</span><span className="text-xs text-gray-700">Pilece prsa sa brokolijem</span></div>
                <div className="flex items-center gap-2"><span className="text-xs text-green-600 w-14 shrink-0">Vecera</span><span className="text-xs text-gray-700">Spanac sa jajima</span></div>
              </div>
            </div>
            <div className="border-t border-gray-100">
              <div className="flex justify-between px-4 py-2 bg-gray-50">
                <span className="text-xs font-semibold text-gray-700">Utorak</span>
                <span className="text-xs text-gray-400">2090 kcal</span>
              </div>
              <div className="px-4 py-2 space-y-1.5">
                <div className="flex items-center gap-2"><span className="text-xs text-green-600 w-14 shrink-0">Dorucak</span><span className="text-xs text-gray-700">Kajgana sa povrcem</span></div>
                <div className="flex items-center gap-2"><span className="text-xs text-green-600 w-14 shrink-0">Uzina</span><span className="text-xs text-gray-700">Jabuka sa kikiriki puterom</span></div>
                <div className="flex items-center gap-2"><span className="text-xs text-green-600 w-14 shrink-0">Rucak</span><span className="text-xs text-gray-700">Pirinac sa piletinom i povrcem</span></div>
                <div className="flex items-center gap-2"><span className="text-xs text-green-600 w-14 shrink-0">Vecera</span><span className="text-xs text-gray-700">Grcka salata sa feta sirom</span></div>
              </div>
            </div>
            <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400 text-center">+ jos 5 dana plana...</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-600 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center text-white">
          <div><div className="text-4xl font-extrabold">27+</div><div className="text-green-100 text-sm mt-1">Recepata</div></div>
          <div><div className="text-4xl font-extrabold">45+</div><div className="text-green-100 text-sm mt-1">Namirnica sa cenama</div></div>
          <div><div className="text-4xl font-extrabold">3</div><div className="text-green-100 text-sm mt-1">Tipa plana</div></div>
        </div>
      </section>

      {/* Kako radi */}
      <section id="kako-radi" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">Kako radi?</h2>
        <p className="text-gray-500 text-center mb-12 text-lg">Tri koraka do kompletnog nedeljnog jelovnika.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map(s => (
            <div key={s.n} className="text-center">
              <div className="w-14 h-14 bg-green-100 text-green-700 font-bold text-2xl rounded-2xl flex items-center justify-center mx-auto mb-4">{s.n}</div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{s.title}</h3>
              <p className="text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">Sve sto ti treba</h2>
          <p className="text-gray-500 text-center mb-12 text-lg">Kompletno resenje za planiranje ishrane.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className={`${f.bg} rounded-2xl p-6`}>
                <div className="text-3xl mb-3">{f.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Spreman/a da pocnes?</h2>
        <p className="text-gray-500 mb-8 text-lg">Besplatno. Nema kartica. Pocni za 2 minuta.</p>
        <Link href="/login" className="inline-block bg-green-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition">
          Kreiraj nalog →
        </Link>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        © 2026 JednoJedi · Napravljeno za srpsko trziste
      </footer>
    </main>
  )
}
