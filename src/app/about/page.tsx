import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Our Made-to-Order Design Studio", description: "Learn how Can Print Store creates original products on demand with specialist print partners, reducing unnecessary inventory.", alternates: { canonical: "/about" } };

export default function AboutPage() { return <main className="mx-auto min-h-[65vh] max-w-3xl px-6 py-20"><p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Our story</p><h1 className="mt-4 text-5xl font-black tracking-tight">Good design, made responsibly.</h1><div className="mt-8 space-y-5 text-lg leading-8 text-black/60"><p>Can Print Store creates expressive everyday pieces without mass-producing inventory. Every item is made only after you order it.</p><p>We partner with specialist print providers to bring together durable products, quality printing, and thoughtful design.</p></div></main>; }
