import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: { title: siteConfig.title, description: siteConfig.description, type: "website" },
  twitter: { card: "summary_large_image", title: siteConfig.title, description: siteConfig.description },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f6f2ea" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
