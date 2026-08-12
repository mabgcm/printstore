"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers";

interface Variant { id: number; title: string; price: number }

export function AddToCart({ productId, title, image, variants, customizable }: { productId: string; title: string; image: string; variants: Variant[]; customizable: boolean }) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? 0);
  const [personalization, setPersonalization] = useState("");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();
  const selected = variants.find((item) => item.id === variantId);

  if (!selected) return <p className="rounded-2xl bg-red-50 p-4 text-red-700">This product is currently unavailable.</p>;

  function add(buyNow = false) {
    addItem({ productId, variantId: selected!.id, title, variantTitle: selected!.title, image, price: selected!.price, quantity: 1, personalization: personalization.trim() || undefined });
    setAdded(true);
    if (buyNow) router.push("/checkout");
  }

  return (
    <div className="mt-8">
      <label htmlFor="variant" className="text-sm font-bold">Choose an option</label>
      <select id="variant" value={variantId} onChange={(event) => setVariantId(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-black/15 bg-white px-4 py-3">
        {variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.title} — ${(variant.price / 100).toFixed(2)}</option>)}
      </select>
      {customizable && <div className="mt-5 rounded-2xl border border-emerald-700/25 bg-emerald-50 p-4">
        <label htmlFor="personalization" className="text-sm font-bold">Personalize it <span className="font-normal text-black/45">(optional)</span></label>
        <input id="personalization" value={personalization} onChange={(event) => setPersonalization(event.target.value)} maxLength={30} placeholder="Enter a name or short text" className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 outline-none focus:border-emerald-700" />
        <div className="mt-2 flex justify-between gap-4 text-xs text-black/45"><span>We’ll print exactly what you enter.</span><span>{personalization.length}/30</span></div>
      </div>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={() => add()} className="cursor-pointer rounded-full border border-black px-5 py-3 font-bold">{added ? "Added to cart" : "Add to cart"}</button>
        <button onClick={() => add(true)} className="cursor-pointer rounded-full bg-emerald-700 px-5 py-3 font-bold text-white">Buy now</button>
      </div>
    </div>
  );
}
