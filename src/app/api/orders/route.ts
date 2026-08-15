import { NextResponse } from "next/server";
import { adminFirestore, verifyFirebaseToken } from "@/lib/firebase/admin";
import { getPrintifyOrders, type PrintifyOrder } from "@/lib/printify/client";
import { stripe } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

function publicOrder(order: PrintifyOrder) {
  return {
    source: "printify",
    id: order.id,
    displayId: order.external_id ?? order.app_order_id ?? order.id.slice(-8).toUpperCase(),
    status: order.status,
    createdAt: order.created_at,
    fulfilledAt: order.fulfilled_at ?? null,
    total: order.total_price + order.total_shipping + order.total_tax,
    items: order.line_items.map((item) => ({
      productId: item.product_id,
      title: item.metadata?.title ?? "Printstore product",
      variant: item.metadata?.variant_label ?? "",
      quantity: item.quantity,
      status: item.status,
      image: "",
      unitAmount: null,
    })),
    subtotal: order.total_price,
    shippingTotal: order.total_shipping,
    taxTotal: order.total_tax,
    paymentStatus: null,
    address: null,
    shipments: (order.shipments ?? []).map((shipment) => ({
      carrier: shipment.carrier,
      number: shipment.number,
      url: shipment.url,
      deliveredAt: shipment.delivered_at ?? null,
    })),
  };
}

function dateValue(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : new Date().toISOString();
}

async function checkoutOrders(userId: string) {
  const database = adminFirestore();
  const snapshot = await database.collection("orders").where("userId", "==", userId).limit(100).get();
  const documents = await Promise.all(snapshot.docs.map(async (document) => {
    let order = document.data();
    if ((order.status === "pending_payment" || order.status === "processing_payment") && typeof order.stripeCheckoutSessionId === "string") {
      try {
        const session = await stripe().checkout.sessions.retrieve(order.stripeCheckoutSessionId);
        if (session.payment_status === "paid") {
          const update = { status: "paid", paymentStatus: session.payment_status, stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null, stripeCustomerId: typeof session.customer === "string" ? session.customer : null, amountSubtotal: session.amount_subtotal, amountTotal: session.amount_total, totalDetails: session.total_details, paidAt: new Date(), updatedAt: new Date() };
          await document.ref.set(update, { merge: true });
          order = { ...order, ...update };
        }
      } catch (reason) {
        console.error("[api/orders] Stripe payment reconciliation failed", { orderId: document.id, reason });
      }
    }
    return { id: document.id, data: order };
  }));

  return documents.map(({ id, data: order }) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const totalDetails = order.totalDetails && typeof order.totalDetails === "object" ? order.totalDetails as { amount_tax?: number } : null;
    return {
      source: "checkout", id, displayId: `PS-${id.slice(-8).toUpperCase()}`,
      status: typeof order.status === "string" ? order.status : "order_received", paymentStatus: typeof order.paymentStatus === "string" ? order.paymentStatus : null,
      createdAt: dateValue(order.createdAt), fulfilledAt: null,
      subtotal: typeof order.amountSubtotal === "number" ? order.amountSubtotal : order.subtotal ?? 0, shippingTotal: order.shippingTotal ?? 0, taxTotal: totalDetails?.amount_tax ?? 0,
      total: typeof order.amountTotal === "number" ? order.amountTotal : order.total ?? 0, address: order.submittedAddress ?? null,
      items: items.map((item: Record<string, unknown>) => ({ productId: typeof item.productId === "string" ? item.productId : "", title: typeof item.title === "string" ? item.title : "Printstore product", variant: typeof item.variantTitle === "string" ? item.variantTitle : "", quantity: typeof item.quantity === "number" ? item.quantity : 1, status: typeof order.status === "string" ? order.status : "order_received", image: typeof item.image === "string" ? item.image : "", unitAmount: typeof item.unitAmount === "number" ? item.unitAmount : null })),
      shipments: Array.isArray(order.shipments) ? order.shipments : [],
    };
  });
}

export async function GET(request: Request) {
  try {
    const user = await verifyFirebaseToken(request);
    if (!user?.email) return NextResponse.json({ error: "Your session could not be verified. Sign out and sign in again." }, { status: 401 });
    const email = user.email.trim().toLowerCase();
    const savedOrders = await checkoutOrders(user.uid);
    const matches: PrintifyOrder[] = [];
    let page = 1;
    let lastPage = 1;
    try {
      do {
        const response = await getPrintifyOrders(page);
        lastPage = Math.min(response.last_page || 1, 10);
        matches.push(...response.data.filter((order) => order.address_to?.email?.trim().toLowerCase() === email));
        page += 1;
      } while (page <= lastPage);
    } catch (reason) {
      console.error("[api/orders] Printify order lookup failed; returning checkout orders", reason);
    }
    const orders = [...savedOrders, ...matches.map(publicOrder)].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return NextResponse.json({ orders });
  } catch (reason) {
    console.error("[api/orders] live order lookup failed", reason);
    return NextResponse.json({ error: "Live order status is temporarily unavailable." }, { status: 502 });
  }
}
