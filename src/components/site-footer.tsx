import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-[#17231c] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-3 sm:px-10 lg:px-16">
        <div><p className="text-xl font-black">PRINTSTORE</p><p className="mt-3 max-w-xs text-sm leading-6 text-white/60">Thoughtful designs, made to order with less waste.</p></div>
        <div><p className="font-bold">Customer care</p><div className="mt-3 flex flex-col gap-2 text-sm text-white/65"><Link href="/faq">FAQ</Link><Link href="/shipping">Shipping & returns</Link><Link href="mailto:hello@printstore.local">Contact</Link></div></div>
        <div><p className="font-bold">Company</p><div className="mt-3 flex flex-col gap-2 text-sm text-white/65"><Link href="/about">About us</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div>
      </div>
      <p className="border-t border-white/10 px-6 py-5 text-center text-xs text-white/45">© {new Date().getFullYear()} Printstore. All rights reserved.</p>
    </footer>
  );
}
