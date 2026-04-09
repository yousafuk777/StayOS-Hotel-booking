import Link from 'next/link'

export default function RoomsPage() {
  return (
    <main className="min-h-screen bg-lightBg">
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black mb-6">Rooms & Suites</h1>
          <p className="max-w-3xl text-lg md:text-xl text-white/80 mb-8">
            Explore premium stays with elevated amenities, flexible booking, and stunning design.
          </p>
          <Link href="/" className="inline-flex rounded-full bg-white px-7 py-3 text-primary-700 font-semibold shadow-lg transition hover:bg-gray-100">
            Back to Home
          </Link>
        </div>
      </section>

      <section className="px-6 py-20 max-w-7xl mx-auto grid gap-8 lg:grid-cols-3">
        {[
          { title: 'Royal Suite', price: '$520 / night', desc: 'Expansive views, private lounge, premium service.' },
          { title: 'Ocean View Room', price: '$390 / night', desc: 'Wake up to the sea with a spacious balcony and modern comforts.' },
          { title: 'Urban Deluxe', price: '$280 / night', desc: 'Contemporary city suite with a cozy workspace and luxury bathroom.' }
        ].map((room, index) => (
          <article key={room.title} className="glass-card rounded-[2rem] p-8 border border-brandBorder shadow-lg hover:-translate-y-1 transition-transform">
            <div className="mb-5 text-4xl">🛏️</div>
            <h2 className="text-2xl font-bold mb-3 text-darkText">{room.title}</h2>
            <p className="text-mutedText mb-6 leading-relaxed">{room.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-primary-700">{room.price}</span>
              <Link href="/register" className="btn-primary rounded-full px-5 py-3 text-sm font-semibold">
                Reserve Now
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
