import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Printstore | You design it, we make it",
  description: "A print-on-demand store bringing original designs to quality products.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><Providers><SiteHeader />{children}<SiteFooter /></Providers></body>
    </html>
  );
}
