export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 lg:px-16">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <span className="text-xl font-black tracking-tight">PRINTSTORE</span>
        <span className="rounded-full border border-black/15 px-4 py-2 text-sm">Coming soon</span>
      </nav>

      <section className="mx-auto flex min-h-[78vh] max-w-6xl items-center">
        <div className="max-w-3xl py-20">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">
            Print on demand
          </p>
          <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-7xl">
            Turn your idea into something worth wearing.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-black/65">
            Original prints, thoughtfully selected products, and production that starts only when you order.
          </p>
          <a
            href="mailto:hello@printstore.local"
            className="mt-9 inline-flex rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800"
          >
            Keep me posted
          </a>
        </div>
      </section>
    </main>
  );
}
