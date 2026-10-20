import { FoamEdge } from "@/components/motion/FoamEdge";
import { Addons } from "@/components/site/sections/Addons";
import { BeforeAfterSection } from "@/components/site/sections/BeforeAfterSection";
import { Faq } from "@/components/site/sections/Faq";
import { FinalCta } from "@/components/site/sections/FinalCta";
import { Fleet } from "@/components/site/sections/Fleet";
import { Hero } from "@/components/site/sections/Hero";
import { HowItWorks } from "@/components/site/sections/HowItWorks";
import { InitialReset } from "@/components/site/sections/InitialReset";
import { Occasions } from "@/components/site/sections/Occasions";
import { OldVsNew } from "@/components/site/sections/OldVsNew";
import { Plans } from "@/components/site/sections/Plans";
import { Reviews } from "@/components/site/sections/Reviews";
import { WhyHand } from "@/components/site/sections/WhyHand";
import { faq } from "@/content/home";

// The homepage. Each section is its own file; reorder or remove them here.
export default function HomePage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };

  return (
    <>
      {/* 01: stays pinned while the rest of the page scrolls over it */}
      <Hero />

      <div className="page-body">
        <span id="hero-end" className="absolute left-0 top-0 h-px w-px" aria-hidden="true" />

        {/* Foam pass: a band of foam leads the page up over the video */}
        <FoamEdge tone="pink" seed={7} />
        <OldVsNew />
        <HowItWorks />
        <BeforeAfterSection />

        {/* The wash: from the dark half of the page into the clean half */}
        <div className="bg-graphite">
          <FoamEdge tone="pale" seed={31} />
        </div>
        <Plans />
        <InitialReset />
        <Addons />
        <Occasions />
        <WhyHand />
        <Fleet />
        <Reviews />
        <Faq />

        {/* Final rinse */}
        <div className="bg-fog">
          <FoamEdge tone="water" seed={53} />
        </div>
        <FinalCta />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
