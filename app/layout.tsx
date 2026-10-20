import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { site } from "@/config/site";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CallBar } from "@/components/site/CallBar";
import { ScrollState } from "@/components/site/ScrollState";
import { JsonLd } from "@/components/site/JsonLd";
import { organizationSchema } from "@/lib/schema";
import "./globals.css";

// One variable family with weight and width axes: wide and heavy for display, normal width for text.
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Selitveni servis Ljubljana | Selitve in prevozi | Mormo",
    template: "%s | Mormo",
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    images: [{ url: "/img/ekipa-prenos-kavca.jpg", width: 2048, height: 1360, alt: "Ekipa Selitve Mormo nese kavč do kombija" }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#111416",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl" className={archivo.variable}>
      <body>
        <a href="#vsebina" className="skip-link">
          Na vsebino
        </a>
        <Nav />
        <main id="vsebina">{children}</main>
        <Footer />
        <CallBar />
        <ScrollState />
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
