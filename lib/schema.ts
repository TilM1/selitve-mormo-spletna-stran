// JSON-LD builders. Only facts that are visible on the page and true: no ratings, prices,
// opening hours or street address (service-area business).

import { site } from "@/config/site";
import type { Service } from "@/content/services";

export const ORG_ID = `${site.url}/#organizacija`;
const WEBSITE_ID = `${site.url}/#spletna-stran`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MovingCompany",
        "@id": ORG_ID,
        name: site.name,
        url: `${site.url}/`,
        logo: `${site.url}/brand/selitve-mormo-stacked-light.svg`,
        image: [`${site.url}/img/vozila-dvorisce.jpg`, `${site.url}/img/vozilo-iveco-daily.jpg`],
        description: site.description,
        telephone: site.phone.e164,
        ...(site.email ? { email: site.email } : {}),
        ...(site.company ? { legalName: site.company.legalName, vatID: site.company.taxId } : {}),
        slogan: site.signature,
        areaServed: [
          ...site.areaServed.towns.map((t) => ({ "@type": "City", name: t })),
          { "@type": "Country", name: "Slovenija" },
        ],
        knowsLanguage: "sl",
        ...(site.social.length ? { sameAs: site.social.map((s) => s.url) } : {}),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${site.url}/`,
        name: site.name,
        inLanguage: "sl-SI",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${site.url}${it.path}`,
    })),
  };
}

export function serviceSchema(s: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.url}/${s.slug}#storitev`,
    name: s.name,
    serviceType: s.serviceType,
    description: s.lead,
    url: `${site.url}/${s.slug}`,
    provider: { "@id": ORG_ID },
    areaServed: [{ "@type": "City", name: "Ljubljana" }, { "@type": "Country", name: "Slovenija" }],
  };
}

export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
