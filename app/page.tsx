import type { Metadata } from "next";
import { preload } from "react-dom";
import { Hero } from "@/components/home/Hero";
import { Checklist } from "@/components/home/Checklist";
import { ContactSection, Faq, Fleet, InquirySection, Process, Services, Tape, Team, WhyUs } from "@/components/home/Sections";
import { JsonLd } from "@/components/site/JsonLd";
import { faq } from "@/content/home";
import { faqSchema } from "@/lib/schema";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "Selitveni servis Ljubljana | Selitve in prevozi | Mormo" },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "Selitveni servis Ljubljana | Selitve Mormo", description: site.description },
};

export default function Home() {
  // The poster is the hero's first paint (and LCP candidate); the video itself is not preloaded.
  preload("/hero/selitve-hero-poster.webp", { as: "image", fetchPriority: "high" });
  return (
    <>
      <Hero />
      <InquirySection />
      <Tape />
      <Process />
      <Services />
      <WhyUs />
      <Team />
      <Fleet />
      <Checklist />
      <Faq items={faq} />
      <ContactSection />
      <JsonLd data={faqSchema(faq)} />
    </>
  );
}
