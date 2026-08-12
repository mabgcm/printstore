import Image from "next/image";
import { getPrintifyProducts } from "@/lib/printify/client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getPrintifyProducts().catch(() => []);

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

      {products.length > 0 && (
        <section className="mx-auto max-w-6xl pb-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">The collection</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Fresh from the studio</h2>
            </div>
            <span className="text-sm text-black/55">{products.length} products</span>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const image = product.images.find((item) => item.is_default) ?? product.images[0];
              const prices = product.variants.filter((variant) => variant.is_enabled).map((variant) => variant.price);
              const startingPrice = prices.length ? Math.min(...prices) / 100 : null;

              return (
                <article key={product.id}>
                  <div className="relative aspect-square overflow-hidden rounded-3xl bg-white">
                    {image && (
                      <Image src={image.src} alt={product.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <h3 className="font-bold">{product.title}</h3>
                    {startingPrice !== null && <span className="shrink-0 text-sm">From ${(startingPrice).toFixed(2)}</span>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
