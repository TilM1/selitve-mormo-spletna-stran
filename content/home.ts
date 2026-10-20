// Slovenian copy for the homepage. Edit text here without touching layout code.

export const hero = {
  headline: "Nikoli več v avtopralnico.",
  sub: "Pridemo na dom ali v službo in poskrbimo, da je tvoj avto vedno čist.",
  primary: "Izberi paket",
  secondary: "Kako deluje",
  call: "Pokliči nas",
  enquiry: "Pošlji povpraševanje",
};

export const oldVsNew = {
  headline: "Zakaj bi svoj čas preživljal v avtopralnici?",
  oldLabel: "Stari način",
  oldSteps: ["Vožnja", "Vrsta", "Pranje", "Čakanje", "Vožnja domov"],
  newLabel: "Naš način",
  newSteps: ["Parkiraš", "Nadaljuješ z dnevom", "Čist avto"],
  closing: "Mi pridemo do tebe.",
  closingSub: "Doma, pred službo ali na dogovorjeni lokaciji.",
};

export const howItWorks = {
  headline: "Ti parkiraš. Mi operemo.",
  steps: [
    { title: "Izberi paket", text: "Poveš nam, kaj voziš in kje parkiraš." },
    { title: "Izberi termin", text: "Vsak mesec te spomnimo. Termin izbereš v pol minute." },
    { title: "Mi pridemo", text: "Doma ali v službi. Ti nadaljuješ s svojim dnevom." },
  ],
  link: "Poglej pakete",
};

export const beforeAfter = {
  headline: "Zjutraj umazan. Popoldne čist.",
  before: "Prej",
  after: "Potem",
  hint: "Povleci in primerjaj",
  beforeAlt: "Avto, poškropljen z blatom, na dovozu pred hišo",
  afterAlt: "Isti avto, čist in sijoč, na dovozu pred hišo",
};

export const plansCopy = {
  headline: "Vedno čist avto. Brez čakanja.",
  sub: "Mesečna naročnina. Mi pridemo, ti nadaljuješ s svojim dnevom.",
  sizeLabel: "Kaj voziš?",
  perMonth: "na mesec",
  popular: "Najbolj priljubljen",
  includedTitle: "V vsakem obisku",
  premiumPending: "Dodatne ugodnosti še pripravljamo.",
  visits: (n: number) => (n === 1 ? "1 obisk na mesec" : `${n} obiska na mesec`),
  cta: (name: string) => `Izberi ${name}`,
};

export const reset = {
  headline: "Prvi obisk je temeljit.",
  text: "Ob prvem obisku avto spravimo na naš standard. Od takrat ga samo še vzdržujemo.",
  first: "Prvi obisk",
  next: "Vsak naslednji obisk",
  from: "od",
  nextNote: (plan: string) => `z naročnino ${plan}`,
};

export const addonsCopy = {
  headline: "Ta mesec rabiš malo več?",
  note: "Dodaš jih ob rezervaciji termina.",
};

export const occasionsCopy = {
  headline: "Posebna priložnost?",
  sub: "Nadgradnje za mesece, ko mora biti avto še malo bolj urejen.",
  note: "Na voljo ob rezervaciji termina.",
};

export const why = {
  headline: "Ročno. Brez avtomatskih krtač.",
  points: [
    { title: "Ročno pranje", text: "Vsak avto operemo ročno, s čisto rokavico in svežo peno." },
    { title: "Pri tebi", text: "Vso opremo pripeljemo s seboj. Od tebe ne potrebujemo ničesar." },
    { title: "Vsakič enako", text: "Isti postopek in isti standard ob vsakem obisku." },
  ],
  note: "Krtače v avtomatskih pralnicah lahko na laku pustijo drobne praske. Pri ročnem pranju se jim izognemo.",
};

export const fleet = {
  headline: "Vozni park, ki je vedno čist.",
  text: "Avtomobile očistimo na vašem parkirišču, med delovnim časom. En dogovor, en račun.",
  cta: "Pošlji povpraševanje",
};

export const reviews = {
  headline: "Kaj pravijo naročniki.",
  items: [] as { quote: string; name: string; car: string }[],
};

export const faq = {
  headline: "Pogosta vprašanja",
  areaTitle: "Kje delamo",
  items: [
    {
      q: "Ali moram biti zraven?",
      a: "Ne. Dovolj je, da je avto dostopen. Za čiščenje notranjosti se vnaprej dogovorimo, kako pridemo do ključa.",
    },
    {
      q: "Ali potrebujete vodo ali elektriko?",
      a: "Ne. Vse, kar potrebujemo, pripeljemo s seboj.",
    },
    {
      q: "Kje lahko očistite avto?",
      a: "Doma, pred službo ali na drugi dogovorjeni lokaciji v Ljubljani z okolico.",
    },
    {
      q: "Kako izberem termin?",
      a: "Vsak mesec te spomnimo, ti pa izbereš termin, ki ti ustreza.",
    },
    {
      q: "Kaj je začetno čiščenje?",
      a: "Prvi obisk je temeljitejši, da avto spravimo na naš standard. Potem ga z rednimi obiski samo vzdržujemo.",
    },
    {
      q: "Imam večji avto. Je cena drugačna?",
      a: "Da. Za SUV ali karavan je doplačilo 15 € na obisk, za XL vozila in vozila s sedmimi sedeži 25 € na obisk.",
    },
  ],
};

export const finalCta = {
  headline: "Naslednje pranje? Že urejeno.",
  cta: "Izberi paket",
};
