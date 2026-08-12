import Image from "next/image";
import Link from "next/link";
import { getPrintifyProducts } from "@/lib/printify/client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getPrintifyProducts().catch(() => []);
  return <main>
    <section className="overflow-hidden px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div><p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">Designed with intention</p><h1 className="mt-5 text-6xl font-black leading-[0.92] tracking-[-0.055em] sm:text-7xl">Wear something that means something.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-black/60">Original designs on thoughtfully selected products. Made only when you order, so there is less waste and more purpose.</p><Link href="#shop" className="mt-9 inline-flex rounded-full bg-emerald-700 px-7 py-3.5 font-bold text-white">Shop the collection</Link></div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] bg-[#dce5dc]">{products[0]?.images[0] ? <Image src={(products[0].images.find((item) => item.is_default) ?? products[0].images[0]).src} alt={products[0].title} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" priority /> : <div className="absolute inset-0 flex items-center justify-center text-8xl">✦</div>}</div>
      </div>
    </section>

    <section className="border-y border-black/10 bg-white px-6 py-7"><div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 text-center text-sm font-bold sm:grid-cols-3"><span>Made to order</span><span>Secure customer accounts</span><span>Quality production partners</span></div></section>

    <section id="shop" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 sm:px-10 lg:px-16">
      <div className="flex items-end justify-between gap-6"><div><p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-700">The collection</p><h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Fresh from the studio</h2></div><span className="text-sm text-black/50">{products.length} products</span></div>
      {products.length ? <div className="mt-10 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => { const image = product.images.find((item) => item.is_default) ?? product.images[0]; const variants = product.variants.filter((item) => item.is_enabled && item.is_available); const price = variants.length ? Math.min(...variants.map((item) => item.price)) / 100 : null; const customizable = product.tags.some((tag) => /personalization|customi[sz]/i.test(tag)); return <Link href={`/products/${product.id}`} key={product.id} className="group"><div className="relative aspect-square overflow-hidden rounded-3xl bg-white">{image && <Image src={image.src} alt={product.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />}{customizable && <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-2 text-xs font-bold shadow-sm">Personalize it</span>}</div><div className="mt-4 flex items-start justify-between gap-4"><div><h3 className="font-bold">{product.title}</h3><p className="mt-1 text-sm text-black/45">{customizable ? "Personalization available" : "Made to order"}</p></div>{price !== null && <span className="shrink-0 text-sm font-semibold">From ${price.toFixed(2)}</span>}</div></Link>; })}</div> : <div className="mt-10 rounded-3xl bg-white p-12 text-center text-black/55">New products are on the way.</div>}
    </section>

    <section className="bg-[#dce5dc] px-6 py-24 sm:px-10 lg:px-16"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">Why made to order?</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">No warehouse full of forgotten products.</h2></div><div className="grid gap-8 sm:grid-cols-2"><div><p className="text-3xl font-black">01</p><h3 className="mt-3 font-bold">Less overproduction</h3><p className="mt-2 leading-7 text-black/55">Production begins after your purchase instead of predicting demand.</p></div><div><p className="text-3xl font-black">02</p><h3 className="mt-3 font-bold">More creative freedom</h3><p className="mt-2 leading-7 text-black/55">Small-run ideas can exist without filling shelves or becoming waste.</p></div></div></div></section>

    <section className="px-6 py-24 text-center"><div className="mx-auto max-w-2xl"><h2 className="text-4xl font-black tracking-tight">Stay close to the studio.</h2><p className="mt-4 text-black/55">New designs, product drops, and occasional notes. No noise.</p><a href="mailto:hello@printstore.local?subject=Join%20the%20Printstore%20list" className="mt-7 inline-flex rounded-full border border-black px-7 py-3 font-bold">Join the list</a></div></section>
  </main>;
}
