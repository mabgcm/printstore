"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { emptyAddress, getCustomerProfile, saveCustomerProfile, type CustomerAddress, type CustomerProfile } from "@/lib/firebase/customer";
import { useAuth, useCart } from "@/components/providers";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal } = useCart();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [address, setAddress] = useState<CustomerAddress>(() => emptyAddress());
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [saveAddress, setSaveAddress] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    void getCustomerProfile(user.uid, user.email ?? "").then((data) => {
      if (!active) return;
      setProfile(data);
      const preferred = data.addresses.find((item) => item.isDefault) ?? data.addresses[0];
      if (preferred) { setAddress(preferred); setSelectedAddressId(preferred.id); setSaveAddress(false); }
      else if (data.displayName) { const [firstName, ...lastName] = data.displayName.split(" "); setAddress((current) => ({ ...current, firstName, lastName: lastName.join(" "), phone: data.phone })); }
    }).catch((reason) => {
      console.error("[checkout] profile load failed", reason);
      if (active) setProfile({ displayName: "", phone: "", email: user.email ?? "", marketingConsent: false, addresses: [] });
    });
    return () => { active = false; };
  }, [user]);

  function selectSavedAddress(id: string) {
    setSelectedAddressId(id);
    if (id === "new") { const next = emptyAddress(); if (profile?.displayName) { const [firstName, ...lastName] = profile.displayName.split(" "); next.firstName = firstName; next.lastName = lastName.join(" "); next.phone = profile.phone; } setAddress(next); setSaveAddress(true); return; }
    const saved = profile?.addresses.find((item) => item.id === id); if (saved) { setAddress(saved); setSaveAddress(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); if (!user || !profile) return; setBusy(true); setError("");
    try {
      if (selectedAddressId === "new" && saveAddress) {
        const saved = { ...address, isDefault: profile.addresses.length === 0 };
        const next = { ...profile, addresses: [...profile.addresses, saved] };
        await saveCustomerProfile(user.uid, next); setProfile(next); setSelectedAddressId(saved.id);
      }
      const token = await user.getIdToken();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ items: items.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })), address }),
      });
      const responseText = await response.text();
      let data: { url?: string; error?: string } = {};
      if (responseText) {
        try {
          data = JSON.parse(responseText) as { url?: string; error?: string };
        } catch {
          console.error("[checkout] non-JSON response", { status: response.status, contentType: response.headers.get("content-type") });
        }
      }
      if (!responseText) throw new Error(`Checkout server returned an empty response (${response.status}). Restart the development server and try again.`);
      if (!response.ok || !data.url) throw new Error(data.error ?? "Checkout could not be started.");
      window.location.assign(data.url);
    } catch (reason) {
      console.error("[checkout] payment start failed", reason);
      setError(reason instanceof Error ? reason.message : "Checkout could not be started. Please try again.");
    } finally { setBusy(false); }
  }

  if (authLoading || (user && !profile)) return <main className="min-h-[70vh] px-6 py-20 text-center">Loading checkout…</main>;
  if (!user) return <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-6 py-16"><div className="w-full rounded-[2rem] bg-white p-9 text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Checkout</p><h1 className="mt-3 text-3xl font-black">Sign in to complete your purchase</h1><p className="mt-4 leading-7 text-black/55">Your cart is saved. Sign in or create an account, and we&apos;ll bring you right back here.</p><div className="mt-8 grid grid-cols-2 gap-3"><Link href="/login?next=/checkout" className="rounded-full bg-emerald-700 px-5 py-3 font-bold text-white">Sign in</Link><Link href="/register?next=/checkout" className="rounded-full border border-black px-5 py-3 font-bold">Create account</Link></div></div></main>;
  if (!items.length) return <main className="min-h-[70vh] px-6 py-24 text-center"><h1 className="text-3xl font-black">Your cart is empty</h1><Link href="/#shop" className="mt-5 inline-flex rounded-full bg-emerald-700 px-6 py-3 font-bold text-white">Shop now</Link></main>;

  return <main className="checkout-page"><h1>Checkout</h1>{error && <p className="checkout-error" role="alert">{error}</p>}<form onSubmit={submit} className="checkout-layout"><section className="checkout-address"><header><div><small>Delivery</small><h2>Contact & shipping</h2></div><Link href="/account">Manage addresses</Link></header><p className="checkout-email">Signed in as {user.email}</p>{profile && profile.addresses.length > 0 && <label className="checkout-address-select">Saved address<select value={selectedAddressId} onChange={(event) => selectSavedAddress(event.target.value)}>{profile.addresses.map((item) => <option value={item.id} key={item.id}>{item.label}{item.isDefault ? " — Default" : ""}</option>)}<option value="new">Use a new address</option></select></label>}<div className="checkout-fields"><CheckoutField label="First name" value={address.firstName} onChange={(value) => setAddress({ ...address, firstName: value })} autoComplete="given-name" /><CheckoutField label="Last name" value={address.lastName} onChange={(value) => setAddress({ ...address, lastName: value })} autoComplete="family-name" /><CheckoutField label="Phone" type="tel" value={address.phone} onChange={(value) => setAddress({ ...address, phone: value })} autoComplete="tel" /><div className="wide"><CheckoutField label="Address" value={address.address1} onChange={(value) => setAddress({ ...address, address1: value })} autoComplete="address-line1" /></div><div className="wide"><CheckoutField label="Apartment, suite, etc." required={false} value={address.address2} onChange={(value) => setAddress({ ...address, address2: value })} autoComplete="address-line2" /></div><CheckoutField label="City" value={address.city} onChange={(value) => setAddress({ ...address, city: value })} autoComplete="address-level2" /><CheckoutField label="Province / State" value={address.region} onChange={(value) => setAddress({ ...address, region: value })} autoComplete="address-level1" /><CheckoutField label="Postal / ZIP code" value={address.postalCode} onChange={(value) => setAddress({ ...address, postalCode: value.toUpperCase() })} autoComplete="postal-code" /><label>Country<select required value={address.country} onChange={(event) => setAddress({ ...address, country: event.target.value as "CA" | "US" })} autoComplete="country"><option value="CA">Canada</option><option value="US">United States</option></select></label></div>{selectedAddressId === "new" && <label className="checkout-save"><input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} /> Save this address to my account</label>}</section><aside className="checkout-summary"><h2>Order summary</h2><div>{items.map((item) => <p key={`${item.productId}-${item.variantId}`}><span>{item.quantity} × {item.title}</span><strong>${((item.price * item.quantity) / 100).toFixed(2)}</strong></p>)}</div><footer><span>Subtotal</span><strong>${(subtotal / 100).toFixed(2)}</strong></footer><small>Secure payment, shipping, and applicable taxes are calculated by Stripe.</small><button disabled={busy}>{busy ? "Opening secure checkout…" : "Continue to secure payment"}</button></aside></form></main>;
}

function CheckoutField({ label, value, onChange, autoComplete, type = "text", required = true }: { label: string; value: string; onChange: (value: string) => void; autoComplete: string; type?: string; required?: boolean }) { return <label>{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} /></label>; }
