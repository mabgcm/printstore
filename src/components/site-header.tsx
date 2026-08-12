"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import { useAuth, useCart } from "@/components/providers";

export function SiteHeader() {
  const { user, loading } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f6f4ef]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-4 sm:px-10 lg:px-16">
        <Link href="/" className="text-xl font-black tracking-tight">PRINTSTORE</Link>
        <nav className="flex items-center gap-4 text-sm font-semibold sm:gap-6">
          <Link href="/#shop">Shop</Link>
          <Link href="/about" className="hidden sm:inline">About</Link>
          <Link href="/faq" className="hidden sm:inline">FAQ</Link>
          {!loading && (user ? (
            <button onClick={() => signOut(firebaseAuth())} className="cursor-pointer">Sign out</button>
          ) : <Link href="/login">Sign in</Link>)}
          <Link href="/cart" className="rounded-full bg-black px-4 py-2 text-white">Cart ({count})</Link>
        </nav>
      </div>
    </header>
  );
}
