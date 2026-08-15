import type { Metadata } from "next";
import Link from "next/link";
import { ClearPaidCart } from "@/components/clear-paid-cart";

export const metadata: Metadata = { title: "Order received", robots: { index: false, follow: false } };

export default function CheckoutSuccessPage() {
  return <main className="checkout-success"><ClearPaidCart /><span aria-hidden="true">✓</span><p>Payment received</p><h1>Thank you for your order.</h1><p>Your payment is being confirmed. We&apos;ll begin preparing your made-to-order items once confirmation is complete.</p><div><Link href="/account" className="button button-dark">View your account</Link><Link href="/#shop" className="text-link">Continue shopping →</Link></div></main>;
}
