// Every photo on the site. `ai: true` marks images generated (Higgsfield, GPT Image) from real photos
// of our team and vehicles; they carry a visible label, as the EU AI Act (Art. 50) requires for
// generated images of real people.

export type Photo = { src: string; alt: string; width: number; height: number; ai?: boolean };

export const photos = {
  teamPortrait: {
    src: "/img/ekipa-portret.jpg",
    alt: "Dva člana ekipe Selitve Mormo v temno modrih majicah stojita pred kombijem in tovornim vozilom",
    width: 1792,
    height: 2240,
    ai: true,
  },
  teamSofa: {
    src: "/img/ekipa-prenos-kavca.jpg",
    alt: "Ekipa nese kavč, zaščiten s folijo in odejo, iz bloka do odprtega kombija",
    width: 2048,
    height: 1360,
    ai: true,
  },
  teamLoading: {
    src: "/img/ekipa-nalaganje-tovornjaka.jpg",
    alt: "Ekipa nalaga škatle v tovorno vozilo s ponjavo in tovor pritrjuje s trakom",
    width: 2048,
    height: 1360,
    ai: true,
  },
  teamWrapping: {
    src: "/img/ekipa-zascita-televizorja.jpg",
    alt: "Ekipa v stanovanju zavija televizor v folijo z mehurčki in zaščitno odejo",
    width: 2048,
    height: 1360,
    ai: true,
  },
  crafter: {
    src: "/img/vozilo-vw-crafter.jpg",
    alt: "Naš bel kombi Volkswagen Crafter na parkirišču",
    width: 2000,
    height: 1125,
  },
  iveco: {
    src: "/img/vozilo-iveco-daily.jpg",
    alt: "Naše tovorno vozilo Iveco Daily s ponjavo, pogled s strani",
    width: 2000,
    height: 1500,
  },
  forklift: {
    src: "/img/prevoz-lesa-viljuskar.jpg",
    alt: "Nakladanje lesa z viličarjem na naše tovorno vozilo Iveco Daily z odprto ponjavo",
    width: 2000,
    height: 1500,
  },
  yard: {
    src: "/img/vozila-dvorisce.jpg",
    alt: "Kombi Volkswagen Crafter in tovorno vozilo Iveco Daily na dvorišču",
    width: 2000,
    height: 1500,
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

export const AI_LABEL = "Fotografija ustvarjena z UI na podlagi pravih fotografij naše ekipe.";
