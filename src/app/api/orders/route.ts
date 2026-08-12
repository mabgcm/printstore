import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/admin";
import { getPrintifyOrders, type PrintifyOrder } from "@/lib/printify/client";

export const dynamic = "force-dynamic";

function publicOrder(order: PrintifyOrder) {
  return {
    id: order.id,
    displayId: order.external_id ?? order.app_order_id ?? order.id.slice(-8).toUpperCase(),
    status: order.status,
    createdAt: order.created_at,
    fulfilledAt: order.fulfilled_at ?? null,
    total: order.total_price + order.total_shipping + order.total_tax,
    items: order.line_items.map((item) => ({
      title: item.metadata?.title ?? "Printstore product",
      variant: item.metadata?.variant_label ?? "",
      quantity: item.quantity,
      status: item.status,
    })),
    shipments: (order.shipments ?? []).map((shipment) => ({
      carrier: shipment.carrier,
      number: shipment.number,
      url: shipment.url,
      deliveredAt: shipment.delivered_at ?? null,
    })),
  };
}

export async function GET(request: Request) {
  try {
    const user = await verifyFirebaseToken(request);
    if (!user?.email) return NextResponse.json({ error: "Your session could not be verified. Sign out and sign in again." }, { status: 401 });
    const email = user.email.trim().toLowerCase();
    const matches: PrintifyOrder[] = [];
    let page = 1;
    let lastPage = 1;
    do {
      const response = await getPrintifyOrders(page);
      lastPage = Math.min(response.last_page || 1, 10);
      matches.push(...response.data.filter((order) => order.address_to?.email?.trim().toLowerCase() === email));
      page += 1;
    } while (page <= lastPage);
    matches.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    return NextResponse.json({ orders: matches.map(publicOrder) });
  } catch (reason) {
    console.error("[api/orders] live order lookup failed", reason);
    return NextResponse.json({ error: "Live order status is temporarily unavailable." }, { status: 502 });
  }
}
