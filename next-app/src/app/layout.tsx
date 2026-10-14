import type { Metadata, Viewport } from "next";
import { SiteEnhancements } from "@/components/SiteEnhancements";
import "./globals.css";
import "./admin.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Laboratoire L’Odyssey | Analyses médicales à Douala", template: "%s | Laboratoire L’Odyssey" },
  description: "Analyses médicales, consultation, échographie et biologie de la reproduction à Douala. Ouvert 7j/7 de 07h à 20h.",
  applicationName: "Laboratoire L’Odyssey",
  keywords: ["laboratoire médical Douala", "analyses médicales", "échographie Douala", "consultation médicale", "résultats laboratoire"],
  icons: { icon: "/images/logo.jpg", apple: "/images/logo.jpg" },
  manifest: "/manifest.webmanifest",
  openGraph: { type: "website", locale: "fr_FR", siteName: "Laboratoire L’Odyssey", images: [{ url: "/images/hero-img.jpg", width: 1536, height: 1024 }] },
  twitter: { card: "summary_large_image", images: ["/images/hero-img.jpg"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#19764b" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body><SiteEnhancements />{children}</body></html>;
}
