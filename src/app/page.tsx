import Link from 'next/link'

const FEATURES = [
  { emoji: '🥗', title: 'Personalizovani jelovnik', desc: 'Nedeljni, dnevni ili jedan obrok – prilagođen ciljevima, budžetu i broju osoba.', accent: 'border-l-green-600' },
  { emoji: '💰', title: 'Realne cene namirnica', desc: 'Cene sa srpskog tržišta. Lista za kupovinu sa tačnim troškom po kategorijama.', accent: 'border-l-amber-600' },
  { emoji: '🎯', title: 'Fitnes ciljevi', desc: 'Mršavljenje, masa ili održavanje. TDEE kalkulacija po tvojim podacima.', accent: 'border-l-blue-600' },
  { emoji: '🔄', title: 'Zamena obroka', desc: 'Ne sviđa ti se recept? Jednim klikom zameni ga alternativom istog tipa.', accent: 'border-l-orange-500' },
  { emoji: '📊', title: 'Praćenje težine', desc: 'Grafikon napretka i dnevni kalorijski cilj vidljivi na dashboardu.', accent: 'border-l-purple-600' },
  { emoji: '🛒', title: 'Shopping lista', desc: 'Interaktivna lista namirnica sa checkboxovima, pamti stanje.', accent: 'border-l-green-600' },
]

const STEPS = [
  { n: '01', title: 'Unesi podatke', desc: 'Visina, težina, godina i cilj – samo jednom.' },
  { n: '02', title: 'Generiši plan', desc: 'Izaberi tip plana, broj osoba i budžet.' },
  { n: '03', title: 'Kuvaj i kupuj', desc: 'Prati obroke, menjaj recepte, čekiraj listu.' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F3] text-[#1A1210]">
      {/* Nav */}
      <nav className="sticky top-0 z-10 bg-[#FAF8F3]/90 backdrop-blur border-b border-[#DDD4C8] flex items-center justify-between px-6 py-0 h-14">
        <span className="font-serif text-lg font-bold text-green-700 tracking-tight">JednoJedi</span>
        <Link
          href="/login"
          className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-all shadow-sm"
        >
          Prijavi se
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block"></span>
            Napravljeno za srpsko tržište
          </span>

          <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#1A1210] mb-6 leading-[1.05] tracking-tight">
            Planiranje<br />
            ishrane{' '}
            <em className="not-italic text-green-700">koje<br />zaista radi.</em>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-xl leading-relaxed">
            Automatski nedeljni plan obroka sa cenama sa srpskog tržišta.
            Znaš unapred koliko ćeš potrošiti do dinara.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-green-700 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-green-800 transition-all shadow-md hover:shadow-lg"
            >
              Počni besplatno
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="#kako-radi"
              className="inline-flex items-center justify-center border border-[#DDD4C8] text-gray-700 px-8 py-4 rounded-xl text-base font-medium hover:bg-white hover:border-[#C4B8A8] transition-all"
            >
              Kako radi?
            </a>
          </div>
        </div>
      </section>

      {/* Mock preview */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-white border border-[#DDD4C8] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          {/* Mini top bar */}
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[#F0E8DC]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-300"></div>
            <span className="ml-3 text-xs text-gray-400 font-medium">JednoJedi · Dashboard</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-[#FAF8F3] rounded-xl border border-[#F0E8DC] p-3 text-center">
              <div className="text-lg font-bold text-[#1A1210]">2.140</div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium">kcal/dan</div>
            </div>
            <div className="bg-[#FAF8F3] rounded-xl border border-[#F0E8DC] p-3 text-center">
              <div className="text-lg font-bold text-[#1A1210]">142g</div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium">protein/dan</div>
            </div>
            <div className="bg-[#FAF8F3] rounded-xl border border-[#F0E8DC] p-3 text-center">
              <div className="text-lg font-bold text-green-700">4.850</div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium">RSD ukupno</div>
            </div>
          </div>

          <div className="bg-[#FAF8F3] rounded-xl border border-[#F0E8DC] overflow-hidden">
            {[
              { day: 'Ponedeljak', kcal: '2180 kcal', meals: [
                { type: 'Doručak', name: 'Ovsena kaša sa bananom' },
                { type: 'Užina', name: 'Sveži sir sa orasima' },
                { type: 'Ručak', name: 'Pileća prsa sa brokolijem' },
                { type: 'Večera', name: 'Spanać sa jajima' },
              ]},
              { day: 'Utorak', kcal: '2090 kcal', meals: [
                { type: 'Doručak', name: 'Kajgana sa povrćem' },
                { type: 'Užina', name: 'Jabuka sa kikiriki puterom' },
                { type: 'Ručak', name: 'Pirinač sa piletinom i povrćem' },
                { type: 'Večera', name: 'Grčka salata sa feta sirom' },
              ]},
            ].map((day, i) => (
              <div key={day.day} className={i > 0 ? 'border-t border-[#F0E8DC]' : ''}>
                <div className="flex justify-between px-4 py-2.5 bg-white border-b border-[#F0E8DC]">
                  <span className="text-xs font-bold text-[#3E2E20]">{day.day}</span>
                  <span className="text-xs text-gray-400 font-medium">{day.kcal}</span>
                </div>
                <div className="px-4 py-2.5 space-y-2">
                  {day.meals.map(meal => (
                    <div key={meal.type} className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-green-700 w-14 shrink-0">{meal.type}</span>
                      <span className="text-xs text-gray-600">{meal.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="border-t border-[#F0E8DC] px-4 py-2.5 text-xs text-gray-400 text-center font-medium">
              + još 5 dana plana...
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-green-700 py-14">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="font-serif text-5xl font-bold">27+</div>
              <div className="text-green-200 text-sm mt-2 font-medium tracking-wide uppercase text-xs">Recepata</div>
            </div>
            <div>
              <div className="font-serif text-5xl font-bold">45+</div>
              <div className="text-green-200 text-sm mt-2 font-medium tracking-wide uppercase text-xs">Namirnica sa cenama</div>
            </div>
            <div>
              <div className="font-serif text-5xl font-bold">3</div>
              <div className="text-green-200 text-sm mt-2 font-medium tracking-wide uppercase text-xs">Tipa plana</div>
            </div>
          </div>
        </div>
      </section>

      {/* Kako radi */}
      <section id="kako-radi" className="max-w-5xl mx-auto px-6 py-24">
        <div className="mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-green-700 mb-3">Proces</p>
          <h2 className="font-serif text-4xl font-bold text-[#1A1210] mb-4">Kako radi?</h2>
          <p className="text-gray-500 text-lg max-w-xl">Tri koraka do kompletnog nedeljnog jelovnika.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-px bg-[#DDD4C8] -translate-x-5"></div>
              )}
              <div className="font-serif text-6xl font-bold text-[#F0E8DC] mb-4 leading-none select-none">{s.n}</div>
              <h3 className="font-serif text-xl font-bold text-[#1A1210] mb-2">{s.title}</h3>
              <p className="text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-[#DDD4C8] py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-green-700 mb-3">Mogućnosti</p>
            <h2 className="font-serif text-4xl font-bold text-[#1A1210] mb-4">Sve što ti treba</h2>
            <p className="text-gray-500 text-lg max-w-xl">Kompletno rešenje za planiranje ishrane.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className={`bg-[#FAF8F3] rounded-xl p-6 border-l-4 ${f.accent} border border-[#F0E8DC] hover:shadow-sm transition-all`}
              >
                <div className="text-2xl mb-4">{f.emoji}</div>
                <h3 className="font-semibold text-[#1A1210] mb-2 text-base">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-4xl font-bold mb-4 text-[#1A1210]">Spreman/a da počneš?</h2>
        <p className="text-gray-500 mb-10 text-lg">Besplatno. Nema kartica. Počni za 2 minuta.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-green-700 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-green-800 transition-all shadow-md hover:shadow-lg"
        >
          Kreiraj nalog
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </section>

      <footer className="border-t border-[#DDD4C8] py-8 text-center text-gray-400 text-sm">
        © 2026 JednoJedi · Napravljeno za srpsko tržište
      </footer>
    </main>
  )
}
