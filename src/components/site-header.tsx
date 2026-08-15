"use client";

import Link from "next/link";
import { useAuth, useCart } from "@/components/providers";

interface SiteHeaderProps {
  categories: Array<{ slug: string; title: string }>;
}

export function SiteHeader({ categories }: SiteHeaderProps) {
  const { user, loading } = useAuth();
  const { count } = useCart();
  const primaryCategories = categories.slice(0, 4);
  const additionalCategories = categories.slice(4);
  return <>
    <div className="announcement"><p>Free shipping on orders $75+ <span>•</span> Made to order, worth the wait</p></div>
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Printstore home"><span>Print</span><i>store</i><b>✦</b></Link>
        <nav className="desktop-nav" aria-label="Main navigation"><Link href="/#shop">Shop all</Link>{primaryCategories.map((category) => <Link href={`/categories/${category.slug}`} key={category.slug}>{category.title}</Link>)}{additionalCategories.length > 0 && <details className="catalog-menu"><summary>More</summary><div>{additionalCategories.map((category) => <Link href={`/categories/${category.slug}`} key={category.slug}>{category.title}</Link>)}</div></details>}<Link href="/about">Our story</Link></nav>
        <nav className="utility-nav" aria-label="Account navigation">
          {!loading && <Link href={user ? "/account" : "/login"} aria-label={user ? "Open your account" : "Sign in to your account"}>Account</Link>}
          <Link href="/cart" className="cart-link" aria-label={`Shopping bag with ${count} items`}>Bag <span>{count}</span></Link>
          <details className="mobile-menu"><summary aria-label="Open menu">Menu</summary><div><Link href="/#shop">Shop all</Link>{categories.map((category) => <Link href={`/categories/${category.slug}`} key={category.slug}>{category.title}</Link>)}<Link href="/about">Our story</Link><Link href={user ? "/account" : "/login"}>Your account</Link><Link href="/track-order">Track an order</Link><Link href="/faq">FAQ</Link><Link href="/cart">Your bag ({count})</Link></div></details>
        </nav>
      </div>
    </header>
  </>;
}
