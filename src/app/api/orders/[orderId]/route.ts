import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/admin";
import { getPrintifyOrder } from "@/lib/printify/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: RouteContext<"/api/orders/[orderId]">) {
  const user = await verifyFirebaseToken(request);
  if (!user?.email) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });

  const { orderId } = await context.params;
  try {
    const order = await getPrintifyOrder(orderId);
    if (order.address_to?.email?.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({
      id: order.id,
      status: order.status,
      shipments: order.shipments ?? [],
      fulfilledAt: order.fulfilled_at ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
}
