import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { getPrintifyProduct } from "@/lib/printify/client";

interface Props { params: Promise<{ productId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = await getPrintifyProduct(productId).catch(() => null);
  return product ? { title: `${product.title} | Printstore`, description: product.description.replace(/<[^>]*>/g, " ").slice(0, 155) } : {};
}

export default async function ProductPage({ params }: Props) {
  const { productId } = await params;
  const product = await getPrintifyProduct(productId).catch(() => null);
  if (!product || !product.visible) notFound();
  const images = product.images;
  const mainImage = images.find((item) => item.is_default) ?? images[0];
  const variants = product.variants.filter((item) => item.is_enabled && item.is_available);
  const description = product.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const customizable = product.tags.some((tag) => /personalization|customi[sz]/i.test(tag));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-16">
      <Link href="/#shop" className="text-sm font-bold text-emerald-700">← Back to shop</Link>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {images.slice(0, 4).map((image, index) => <div key={`${image.src}-${index}`} className={`relative overflow-hidden rounded-3xl bg-white ${index === 0 ? "sm:col-span-2 aspect-[4/3]" : "aspect-square"}`}><Image src={image.src} alt={`${product.title} view ${index + 1}`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" priority={index === 0} /></div>)}
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Made to order</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{product.title}</h1>
          <p className="mt-5 text-lg font-bold">From ${variants.length ? (Math.min(...variants.map((item) => item.price)) / 100).toFixed(2) : "—"}</p>
          {customizable && <p className="mt-4 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-900">Personalization available</p>}
          <p className="mt-6 leading-7 text-black/60">{description}</p>
          <AddToCart productId={product.id} title={product.title} image={mainImage?.src ?? ""} variants={variants} customizable={customizable} />
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-black/10 pt-6 text-center text-xs font-bold"><span>Made to order</span><span>Secure checkout</span><span>Quality print</span></div>
        </div>
      </div>
    </main>
  );
}
