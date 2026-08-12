import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account-dashboard";

export const metadata: Metadata = { title: "My Account", description: "Manage your Printstore profile, saved addresses and orders.", robots: { index: false, follow: false } };
export default function AccountPage() { return <AccountDashboard />; }
