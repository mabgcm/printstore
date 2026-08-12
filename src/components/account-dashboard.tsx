"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { sendEmailVerification, sendPasswordResetEmail, signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { emailActionSettings } from "@/lib/firebase/action-settings";
import { customerErrorMessage, emptyAddress, getCustomerProfile, normalizeDefaultAddress, saveCustomerProfile, type CustomerAddress, type CustomerProfile } from "@/lib/firebase/customer";
import { useAuth } from "@/components/providers";
import { OrderTracker } from "@/components/order-tracker";

const blankProfile = (email = ""): CustomerProfile => ({ displayName: "", phone: "", email, marketingConsent: false, addresses: [] });

export function AccountDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile>(blankProfile());
  const [editing, setEditing] = useState<CustomerAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [section, setSection] = useState<"profile" | "addresses" | "orders" | "security">("profile");

  useEffect(() => {
    if (!user) return;
    let active = true;
    void getCustomerProfile(user.uid, user.email ?? "").then((data) => { if (active) setProfile(data); }).catch(() => { if (active) setProfile(blankProfile(user.email ?? "")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault(); if (!user) return; setBusy(true); setNotice("");
    try { await saveCustomerProfile(user.uid, profile); setNotice("Your profile has been saved."); }
    catch (reason) { console.error("[account] profile save failed", reason); setNotice(customerErrorMessage(reason)); }
    finally { setBusy(false); }
  }
  async function saveAddress(event: FormEvent) {
    event.preventDefault(); if (!user || !editing) return; setBusy(true); setNotice("");
    const exists = profile.addresses.some((address) => address.id === editing.id);
    let addresses = exists ? profile.addresses.map((address) => address.id === editing.id ? editing : address) : [...profile.addresses, editing];
    if (!profile.addresses.length || editing.isDefault) addresses = normalizeDefaultAddress(addresses, editing.id);
    const next = { ...profile, addresses };
    try { await saveCustomerProfile(user.uid, next); setProfile(next); setEditing(null); setNotice("Address saved."); }
    catch (reason) { console.error("[account] address save failed", reason); setNotice(customerErrorMessage(reason)); }
    finally { setBusy(false); }
  }
  async function removeAddress(id: string) {
    if (!user) return; const remaining = profile.addresses.filter((address) => address.id !== id); const wasDefault = profile.addresses.find((address) => address.id === id)?.isDefault; const addresses = wasDefault && remaining[0] ? normalizeDefaultAddress(remaining, remaining[0].id) : remaining; const next = { ...profile, addresses }; try { await saveCustomerProfile(user.uid, next); setProfile(next); setNotice("Address removed."); } catch (reason) { console.error("[account] address removal failed", reason); setNotice(customerErrorMessage(reason)); }
  }
  async function makeDefault(id: string) { if (!user) return; const next = { ...profile, addresses: normalizeDefaultAddress(profile.addresses, id) }; try { await saveCustomerProfile(user.uid, next); setProfile(next); setNotice("Default address updated."); } catch (reason) { console.error("[account] default address failed", reason); setNotice(customerErrorMessage(reason)); } }

  if (authLoading) return <main className="account-page"><div className="account-loading">Loading your account…</div></main>;
  if (!user) return <main className="account-page"><div className="account-gate"><span>◎</span><h1>Your account, all together.</h1><p>Sign in to manage saved addresses, profile details and order history.</p><Link href="/login?next=/account" className="button button-dark">Sign in</Link></div></main>;
  if (loading) return <main className="account-page"><div className="account-loading">Loading your account…</div></main>;

  return <main className="account-page"><header className="account-hero"><div><p className="eyebrow"><span /> Customer account</p><h1>Welcome{profile.displayName ? `, ${profile.displayName.split(" ")[0]}` : " back"}.</h1><p>{user.email}</p></div><button onClick={() => signOut(firebaseAuth())}>Sign out</button></header>
    <div className="account-layout"><nav className="account-nav" aria-label="Account sections">{([['profile','Profile'],['addresses','Addresses'],['orders','Orders'],['security','Security']] as const).map(([id,label]) => <button className={section === id ? "active" : ""} onClick={() => setSection(id)} key={id}>{label}<span>→</span></button>)}</nav>
      <section className="account-content">{notice && <p className="account-notice" role="status">{notice}</p>}
        {section === "profile" && <form onSubmit={saveProfile} className="account-card"><div className="account-card-head"><div><small>Personal details</small><h2>Your profile</h2></div><span>Member since {new Intl.DateTimeFormat("en-CA", { month: "short", year: "numeric" }).format(user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date())}</span></div><div className="account-fields"><Field label="Full name" value={profile.displayName} onChange={(value) => setProfile({ ...profile, displayName: value })} autoComplete="name" /><Field label="Phone" type="tel" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} autoComplete="tel" /><Field label="Email" type="email" value={profile.email} disabled onChange={() => undefined} autoComplete="email" /></div><label className="account-check"><input type="checkbox" checked={profile.marketingConsent} onChange={(event) => setProfile({ ...profile, marketingConsent: event.target.checked })} /><span><strong>Studio notes</strong><small>Receive new collection news and occasional offers. You can opt out anytime.</small></span></label><button disabled={busy} className="account-save">{busy ? "Saving…" : "Save profile"}</button></form>}
        {section === "addresses" && <div className="account-card"><div className="account-card-head"><div><small>Address book</small><h2>Saved addresses</h2></div>{profile.addresses.length < 10 && <button onClick={() => setEditing(emptyAddress())}>+ Add address</button>}</div>{profile.addresses.length ? <div className="address-grid">{profile.addresses.map((address) => <article className={address.isDefault ? "default" : ""} key={address.id}>{address.isDefault && <b>Default</b>}<h3>{address.label}</h3><p>{address.firstName} {address.lastName}<br />{address.address1}{address.address2 ? <><br />{address.address2}</> : null}<br />{address.city}, {address.region} {address.postalCode}<br />{address.country === "CA" ? "Canada" : "United States"}</p><small>{address.phone}</small><footer><button onClick={() => setEditing(address)}>Edit</button>{!address.isDefault && <button onClick={() => void makeDefault(address.id)}>Make default</button>}<button onClick={() => void removeAddress(address.id)}>Remove</button></footer></article>)}</div> : <div className="account-empty"><span>⌂</span><h3>No saved addresses yet</h3><p>Add an address now for a faster checkout next time.</p><button onClick={() => setEditing(emptyAddress())}>Add your first address</button></div>}</div>}
        {section === "orders" && <div className="account-orders"><div className="account-card-head"><div><small>Purchase history</small><h2>Your orders</h2></div><Link href="/track-order">Open full tracker ↗</Link></div><OrderTracker /></div>}
        {section === "security" && <div className="account-card"><div className="account-card-head"><div><small>Account access</small><h2>Security</h2></div></div><div className="security-list"><div><span>{user.emailVerified ? "✓" : "!"}</span><p><strong>Email address</strong><small>{user.emailVerified ? "Your email is verified." : "Verify your email to strengthen account recovery."}</small></p>{!user.emailVerified && <button onClick={() => void sendEmailVerification(user, emailActionSettings("/account")).then(() => setNotice("Verification email sent.")).catch((reason) => setNotice(customerErrorMessage(reason)))}>Send verification</button>}</div><div><span>••</span><p><strong>Password</strong><small>We&apos;ll send a secure reset link to {user.email}.</small></p><button onClick={() => user.email && void sendPasswordResetEmail(firebaseAuth(), user.email, emailActionSettings("/login?reset=complete")).then(() => setNotice("Password reset email sent.")).catch((reason) => setNotice(customerErrorMessage(reason)))}>Reset password</button></div><div><span>↗</span><p><strong>Privacy request</strong><small>Request a copy or deletion of your account data.</small></p><a href={`mailto:hello@printstore.ca?subject=${encodeURIComponent("Privacy request for " + (user.email ?? "Printstore account"))}`}>Email privacy team</a></div></div></div>}
      </section></div>
    {editing && <div className="address-modal" role="dialog" aria-modal="true" aria-labelledby="address-title"><form onSubmit={saveAddress}><button type="button" className="modal-close" onClick={() => setEditing(null)} aria-label="Close">×</button><small>Address book</small><h2 id="address-title">{profile.addresses.some((address) => address.id === editing.id) ? "Edit address" : "Add an address"}</h2><div className="modal-fields"><Field label="Label" value={editing.label} onChange={(value) => setEditing({ ...editing, label: value })} autoComplete="off" /><Field label="First name" value={editing.firstName} onChange={(value) => setEditing({ ...editing, firstName: value })} autoComplete="given-name" required /><Field label="Last name" value={editing.lastName} onChange={(value) => setEditing({ ...editing, lastName: value })} autoComplete="family-name" required /><Field label="Phone" type="tel" value={editing.phone} onChange={(value) => setEditing({ ...editing, phone: value })} autoComplete="tel" required /><div className="wide"><Field label="Address" value={editing.address1} onChange={(value) => setEditing({ ...editing, address1: value })} autoComplete="address-line1" required /></div><div className="wide"><Field label="Apartment, suite, etc." value={editing.address2} onChange={(value) => setEditing({ ...editing, address2: value })} autoComplete="address-line2" /></div><Field label="City" value={editing.city} onChange={(value) => setEditing({ ...editing, city: value })} autoComplete="address-level2" required /><Field label="Province / State" value={editing.region} onChange={(value) => setEditing({ ...editing, region: value })} autoComplete="address-level1" required /><Field label="Postal / ZIP code" value={editing.postalCode} onChange={(value) => setEditing({ ...editing, postalCode: value.toUpperCase() })} autoComplete="postal-code" required /><label>Country<select value={editing.country} onChange={(event) => setEditing({ ...editing, country: event.target.value as "CA" | "US" })} autoComplete="country"><option value="CA">Canada</option><option value="US">United States</option></select></label></div><label className="account-check"><input type="checkbox" checked={editing.isDefault} onChange={(event) => setEditing({ ...editing, isDefault: event.target.checked })} /><span><strong>Use as default address</strong><small>This address will be selected automatically at checkout.</small></span></label><button disabled={busy} className="account-save">{busy ? "Saving…" : "Save address"}</button></form></div>}
  </main>;
}

function Field({ label, value, onChange, type = "text", autoComplete, required = false, disabled = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete: string; required?: boolean; disabled?: boolean }) { return <label>{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} required={required} disabled={disabled} /></label>; }
