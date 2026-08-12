"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth, useCart } from "@/components/providers";

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items, subtotal } = useCart();
  const [submitted, setSubmitted] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSubmitted(true); }

  if (loading) return <main className="min-h-[70vh] px-6 py-20 text-center">Loading checkout…</main>;
  if (!user) return <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-6 py-16"><div className="w-full rounded-[2rem] bg-white p-9 text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Checkout</p><h1 className="mt-3 text-3xl font-black">Sign in to complete your purchase</h1><p className="mt-4 leading-7 text-black/55">Your cart is saved. Sign in or create an account, and we’ll bring you right back here.</p><div className="mt-8 grid grid-cols-2 gap-3"><Link href="/login?next=/checkout" className="rounded-full bg-emerald-700 px-5 py-3 font-bold text-white">Sign in</Link><Link href="/register?next=/checkout" className="rounded-full border border-black px-5 py-3 font-bold">Create account</Link></div></div></main>;
  if (!items.length) return <main className="min-h-[70vh] px-6 py-24 text-center"><h1 className="text-3xl font-black">Your cart is empty</h1><Link href="/#shop" className="mt-5 inline-flex rounded-full bg-emerald-700 px-6 py-3 font-bold text-white">Shop now</Link></main>;

  return <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:px-16"><h1 className="text-4xl font-black tracking-tight">Checkout</h1>{submitted ? <div className="mt-10 rounded-3xl bg-amber-50 p-8"><h2 className="text-2xl font-black">Payment setup required</h2><p className="mt-3 max-w-2xl leading-7 text-black/60">Your shipping details are valid, but card payment is not connected yet. Add Stripe before accepting real orders. No order or charge was created.</p></div> : <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]"><section className="rounded-3xl bg-white p-7 sm:p-9"><h2 className="text-xl font-black">Contact & shipping</h2><p className="mt-1 text-sm text-black/50">Signed in as {user.email}</p><div className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="First name" name="firstName" /><Field label="Last name" name="lastName" /><div className="sm:col-span-2"><Field label="Address" name="address" /></div><Field label="City" name="city" /><Field label="Province / State" name="region" /><Field label="Postal code" name="postalCode" /><label className="text-sm font-bold">Country<select required name="country" className="mt-2 w-full rounded-2xl border border-black/15 bg-white px-4 py-3 font-normal"><option value="CA">Canada</option><option value="US">United States</option></select></label></div></section><aside className="h-fit rounded-3xl bg-white p-7"><h2 className="text-xl font-black">Order summary</h2><div className="mt-5 space-y-3 text-sm">{items.map((item) => <div key={`${item.productId}-${item.variantId}`} className="flex justify-between gap-4"><span>{item.quantity} × {item.title}</span><span>${((item.price * item.quantity) / 100).toFixed(2)}</span></div>)}</div><div className="mt-6 flex justify-between border-t border-black/10 pt-5 text-lg"><strong>Subtotal</strong><strong>${(subtotal / 100).toFixed(2)}</strong></div><p className="mt-3 text-xs leading-5 text-black/45">Shipping and taxes calculated after payment integration.</p><button className="mt-6 w-full cursor-pointer rounded-full bg-emerald-700 px-5 py-3 font-bold text-white">Continue to payment</button></aside></form>}</main>;
}

function Field({ label, name }: { label: string; name: string }) { return <label className="text-sm font-bold">{label}<input required name={name} className="mt-2 w-full rounded-2xl border border-black/15 px-4 py-3 font-normal outline-none focus:border-emerald-700" /></label>; }
