import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap", style: ["normal", "italic"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://printstore.ca";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Printstore | Original, Made to Order", template: "%s | Printstore" },
  description: "Discover meaningful gifts, apparel and art prints. Original designs, premium materials and made-to-order production with less waste.",
  keywords: ["original gifts Canada", "made-to-order gifts", "graphic apparel", "art prints", "print on demand Canada", "unique gifts"],
  authors: [{ name: "Printstore" }],
  creator: "Printstore",
  publisher: "Printstore",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", locale: "en_CA", url: siteUrl, siteName: "Printstore", title: "Printstore | Original, Made to Order", description: "Original gifts, apparel and art prints—made to order, made to matter.", images: [{ url: "/og-printstore.png", width: 1200, height: 630, alt: "Printstore — original designs made to order." }] },
  twitter: { card: "summary_large_image", title: "Printstore | Original, Made to Order", description: "Original gifts, apparel and art prints—made to order, made to matter.", images: ["/og-printstore.png"] },
  category: "shopping",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-CA" className={`${sans.variable} ${serif.variable}`}><body><Providers><SiteHeader />{children}<SiteFooter /></Providers></body></html>;
}
