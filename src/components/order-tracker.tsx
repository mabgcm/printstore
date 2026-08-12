"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers";

interface TrackedOrder {
  id: string; displayId: string; status: string; createdAt: string; fulfilledAt: string | null; total: number;
  items: Array<{ title: string; variant: string; quantity: number; status: string }>;
  shipments: Array<{ carrier: string; number: string; url: string; deliveredAt: string | null }>;
}

const stages = ["Order received", "In production", "Shipped", "Delivered"];
function stageFor(order: TrackedOrder) {
  if (order.shipments.some((shipment) => shipment.deliveredAt) || /delivered/i.test(order.status)) return 3;
  if (order.shipments.length || /fulfilled|shipped/i.test(order.status)) return 2;
  if (/production/i.test(order.status) || order.items.some((item) => /production/i.test(item.status))) return 1;
  return 0;
}
function statusLabel(order: TrackedOrder) { return /cancel/i.test(order.status) ? "Cancelled" : stages[stageFor(order)]; }

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
    {!loading && !error && !visible.length && <div className="track-state"><h2>{orders.length ? "No matching order" : "No orders found"}</h2><p>{orders.length ? "Check the order number and try again." : `We couldn't find a Printify order for ${user.email}.`}</p><Link href="/#shop" className="text-link">Explore the collection →</Link></div>}
    <div className="tracked-orders">{visible.map((order) => { const current = stageFor(order); const cancelled = /cancel/i.test(order.status); return <article className="tracked-order" key={order.id}>
      <header><div><p>Order {order.displayId}</p><h2>{statusLabel(order)}</h2><small>Placed {new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(new Date(order.createdAt))}</small></div><strong>${(order.total / 100).toFixed(2)} CAD</strong></header>
      {!cancelled && <ol className="tracking-progress">{stages.map((stage, index) => <li className={index <= current ? "complete" : ""} key={stage}><span>{index < current ? "✓" : index + 1}</span><b>{stage}</b></li>)}</ol>}
      <div className="tracked-order-grid"><section><h3>Items</h3>{order.items.map((item, index) => <div className="tracked-item" key={`${item.title}-${index}`}><span>{item.quantity}×</span><p><strong>{item.title}</strong><small>{item.variant}</small></p></div>)}</section><section><h3>Delivery</h3>{order.shipments.length ? order.shipments.map((shipment) => <div className="shipment" key={`${shipment.carrier}-${shipment.number}`}><p><strong>{shipment.carrier || "Carrier"}</strong><span>{shipment.number}</span></p>{shipment.url && <a href={shipment.url} target="_blank" rel="noreferrer">Open carrier tracking ↗</a>}</div>) : <p className="shipment-pending">Tracking will appear here as soon as your parcel ships.</p>}</section></div>
    </article>; })}</div>
  </div>;
}
