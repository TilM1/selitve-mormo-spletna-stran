import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

// One variable family with weight and width axes: wide and heavy for display, normal for text.
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Mormo.si | Pranje avta na domu, Ljubljana",
    template: "%s | Mormo.si",
  },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "sl_SI",
    siteName: site.name,
    title: "Mormo.si | Nikoli več v avtopralnico",
    description: site.description,
    images: [{ url: "/img/clean.jpg", width: 1920, height: 1080, alt: "Čist avto na dovozu, v ozadju kombi Mormo.si" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#111416",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
