"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/providers";

interface TrackedOrder {
  source: "checkout" | "printify"; id: string; displayId: string; status: string; paymentStatus: string | null; createdAt: string; fulfilledAt: string | null; subtotal: number; shippingTotal: number; taxTotal: number; total: number;
  address: { firstName?: string; lastName?: string; address1?: string; address2?: string; city?: string; region?: string; postalCode?: string; country?: string; phone?: string } | null;
  items: Array<{ productId: string; title: string; variant: string; quantity: number; status: string; image: string; unitAmount: number | null }>;
  shipments: Array<{ carrier: string; number: string; url: string; deliveredAt: string | null }>;
}

const stages = ["Order received", "In production", "Shipped", "Delivered"];
function stageFor(order: TrackedOrder) {
  if (order.shipments.some((shipment) => shipment.deliveredAt) || /delivered/i.test(order.status)) return 3;
  if (order.shipments.length || /fulfilled|shipped/i.test(order.status)) return 2;
  if (/production/i.test(order.status) || order.items.some((item) => /production/i.test(item.status))) return 1;
  return 0;
}
function statusLabel(order: TrackedOrder) {
  if (/refund/i.test(order.status)) return "Refunded";
  if (/failed/i.test(order.status)) return "Payment failed";
  if (/expired/i.test(order.status)) return "Checkout expired";
  if (/cancel/i.test(order.status)) return "Cancelled";
  if (/paid/i.test(order.status)) return "Paid — order received";
  if (/pending_payment/i.test(order.status)) return "Awaiting payment confirmation";
  return stages[stageFor(order)];
}
function money(value: number) { return `$${(value / 100).toFixed(2)}`; }

export function OrderTracker() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const loadOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const body = await response.text();
      let data: { orders?: TrackedOrder[]; error?: string } = {};
      try { data = body ? JSON.parse(body) as typeof data : {}; }
      catch { data = { error: "The order service returned an invalid response. Please try again." }; }
      if (!response.ok) throw new Error(data.error ?? "Orders could not be loaded.");
      setOrders(data.orders ?? []);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Orders could not be loaded."); }
    finally { setLoading(false); }
  }, [user]);
  useEffect(() => {
    const task = window.setTimeout(() => void loadOrders(), 0);
    return () => window.clearTimeout(task);
  }, [loadOrders]);

  if (authLoading) return <div className="track-state">Loading your account…</div>;
  if (!user) return <div className="track-signin"><span aria-hidden="true">◎</span><h2>Sign in to see your orders</h2><p>We securely match your account email with your fulfilment records.</p><Link href="/login?next=/track-order" className="button button-dark">Sign in to track an order</Link></div>;
  const normalized = query.trim().toLowerCase();
  const visible = normalized ? orders.filter((order) => order.id.toLowerCase().includes(normalized) || order.displayId.toLowerCase().includes(normalized)) : orders;

  return <div className="tracker-shell">
    <div className="tracker-tools"><label htmlFor="order-search">Order number<input id="order-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your orders" /></label><button type="button" onClick={() => void loadOrders()} disabled={loading}>{loading ? "Checking…" : "Refresh status"}</button></div>
    {error && <p className="tracker-error" role="alert">{error}</p>}
    {!loading && !error && !visible.length && <div className="track-state"><h2>{orders.length ? "No matching order" : "No orders found"}</h2><p>{orders.length ? "Check the order number and try again." : `We couldn't find an order for ${user.email}.`}</p><Link href="/#shop" className="text-link">Explore the collection →</Link></div>}
    <div className="tracked-orders">{visible.map((order) => { const current = stageFor(order); const cancelled = /cancel/i.test(order.status); return <article className="tracked-order" key={order.id}>
      <header><div><p>Order {order.displayId}</p><h2>{statusLabel(order)}</h2><small>Placed {new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</small>{order.paymentStatus === "paid" && <em className="order-paid-badge">✓ Payment confirmed</em>}</div><strong>{money(order.total)} CAD</strong></header>
      {!cancelled && <ol className="tracking-progress">{stages.map((stage, index) => <li className={index <= current ? "complete" : ""} key={stage}><span>{index < current ? "✓" : index + 1}</span><b>{stage}</b></li>)}</ol>}
      <div className="tracked-order-grid"><section><h3>Items</h3>{order.items.map((item, index) => <div className="tracked-item detailed" key={`${item.productId}-${item.title}-${index}`}>{item.image ? <Image src={item.image} alt="" width={64} height={64} /> : <span>{item.quantity}×</span>}<p><strong>{item.title}</strong><small>{item.variant}</small><small>{item.quantity} × {item.unitAmount === null ? "Price included" : money(item.unitAmount)}</small></p>{item.unitAmount !== null && <b>{money(item.unitAmount * item.quantity)}</b>}</div>)}</section><section><h3>Delivery</h3>{order.address && <address className="order-address"><strong>{order.address.firstName} {order.address.lastName}</strong><span>{order.address.address1}</span>{order.address.address2 && <span>{order.address.address2}</span>}<span>{order.address.city}, {order.address.region} {order.address.postalCode}</span><span>{order.address.country === "CA" ? "Canada" : order.address.country === "US" ? "United States" : order.address.country}</span>{order.address.phone && <span>{order.address.phone}</span>}</address>}{order.shipments.length ? order.shipments.map((shipment) => <div className="shipment" key={`${shipment.carrier}-${shipment.number}`}><p><strong>{shipment.carrier || "Carrier"}</strong><span>{shipment.number}</span></p>{shipment.url && <a href={shipment.url} target="_blank" rel="noreferrer">Open carrier tracking ↗</a>}</div>) : <p className="shipment-pending">Tracking will appear here as soon as your parcel ships.</p>}</section></div>
      <dl className="order-totals"><div><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div><div><dt>Shipping</dt><dd>{order.shippingTotal ? money(order.shippingTotal) : "Free"}</dd></div><div><dt>Tax</dt><dd>{money(order.taxTotal)}</dd></div><div><dt>Total</dt><dd>{money(order.total)} CAD</dd></div></dl>
    </article>; })}</div>
  </div>;
}
