import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Can Print Store handles customer account, order and payment information.", alternates: { canonical: "/privacy" } };
export default function PrivacyPage() { return <main className="mx-auto min-h-[65vh] max-w-3xl px-6 py-20"><h1 className="text-5xl font-black">Privacy policy</h1><p className="mt-8 leading-7 text-black/60">We use Firebase Authentication to manage customer accounts. Order and payment processing policies will be finalized before checkout is activated. Contact us for access or deletion requests.</p></main>; }
