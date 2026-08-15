import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service", description: "Can Print Store terms for using the website and purchasing made-to-order products.", alternates: { canonical: "/terms" } };
export default function TermsPage() { return <main className="mx-auto min-h-[65vh] max-w-3xl px-6 py-20"><h1 className="text-5xl font-black">Terms of service</h1><p className="mt-8 leading-7 text-black/60">These storefront terms are a draft and must be reviewed for your business jurisdiction before accepting paid orders.</p></main>; }
