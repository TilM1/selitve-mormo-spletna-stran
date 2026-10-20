// Service pages. One page per distinct search intent; smaller intents (room, cellar, garage)
// live as sections on the closest page so they do not compete with each other.

import type { PhotoKey } from "./photos";

export type InquiryService = "selitev" | "prevoz" | "odvoz";

export type Service = {
  slug: string;
  name: string; // short name, used in cards, nav and breadcrumbs
  card: string; // one-line description for the homepage grid
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string; // answers the main question first
  inquiry: InquiryService;
  includes: string[];
  suitedFor: string[];
  steps: { title: string; text: string }[];
  priceFactors: string[];
  prepare: string[];
  sections?: { id: string; h2: string; paragraphs: string[] }[];
  faq: { q: string; a: string }[];
  related: string[];
  serviceType: string; // schema.org Service.serviceType
  photo?: PhotoKey;
};

export const services: Service[] = [
  {
    slug: "selitev-stanovanja",
    name: "Selitev stanovanja",
    card: "Od garsonjere do hiše. Prenesemo, zaščitimo, prepeljemo in postavimo na novem naslovu.",
    metaTitle: "Selitev stanovanja Ljubljana | Selitve stanovanj in hiš",
    metaDescription:
      "Selitev stanovanja v Ljubljani in okolici: prenašanje, zaščita pohištva, prevoz in razlaganje. Tudi selitev sobe, kleti ali garaže. Pošljite povpraševanje.",
    h1: "Selitev stanovanja v Ljubljani in okolici",
    lead:
      "Pridemo na vaš naslov, stvari znesemo iz stanovanja, jih zaščitimo, naložimo in prepeljemo na novo lokacijo, kjer jih razložimo in postavimo, kamor želite. Selimo cela stanovanja in hiše, pa tudi samo eno sobo, klet ali garažo.",
    inquiry: "selitev",
    includes: [
      "Prenašanje pohištva, škatel in bele tehnike po stopnišču ali z dvigalom",
      "Zaščita pohištva in občutljivih predmetov pred prevozom",
      "Razstavljanje in sestavljanje pohištva, kjer je potrebno",
      "Nalaganje, prevoz in razlaganje na novem naslovu",
      "Postavitev stvari v prostore, ki jih določite",
    ],
    suitedFor: [
      "Selitev iz najemniškega v svoje stanovanje",
      "Študentske selitve in selitve ene sobe",
      "Selitve družin s celotno opremo stanovanja ali hiše",
      "Praznjenje kleti, podstrešja ali garaže ob selitvi",
    ],
    steps: [
      { title: "Povpraševanje", text: "Opišete, kaj selite, od kod in kam. Lahko pokličete ali izpolnite obrazec." },
      { title: "Ponudba in termin", text: "Ponudbo pripravimo na podlagi vaših podatkov. Pri večjih selitvah se dogovorimo za ogled." },
      { title: "Dan selitve", text: "Pridemo ob dogovorjeni uri, zaščitimo stvari, prenesemo in naložimo." },
      { title: "Novo stanovanje", text: "Razložimo, prenesemo v prostore in sestavimo, kar smo razstavili." },
    ],
    priceFactors: [
      "Količina stvari in število večjih kosov pohištva",
      "Nadstropje, dvigalo in dolžina poti od vrat do vozila",
      "Razdalja med naslovoma",
      "Razstavljanje in sestavljanje pohištva",
      "Dodatne storitve, na primer odvoz stvari, ki jih ne selite",
    ],
    prepare: [
      "Manjše stvari zložite v zaprte škatle in jih označite po prostorih.",
      "Izpraznite predale in omare, ki jih bomo prenašali.",
      "Hladilnik in zamrzovalnik odmrznite dan prej.",
      "Preverite, kje lahko ustavimo vozilo na obeh naslovih.",
      "Dragocenosti in dokumente prepeljite sami.",
    ],
    sections: [
      {
        id: "selitev-sobe",
        h2: "Selitev sobe",
        paragraphs: [
          "Ne selite celega stanovanja? Prepeljemo tudi samo eno sobo: posteljo, omaro, pisalno mizo in nekaj škatel. Takšne selitve so pogoste pri študentih, pri selitvi k partnerju ali ko se kdo odseli od staršev.",
          "Pri manjši selitvi je največ dela pogosto s stopniščem in z razstavljanjem pohištva, zato v povpraševanju napišite nadstropje in ali je v stavbi dvigalo.",
        ],
      },
      {
        id: "selitev-kleti-in-garaze",
        h2: "Selitev kleti in garaže",
        paragraphs: [
          "Klet in garaža sta polni stvari, ki jih je težko prenašati: orodje, kolesa, gume, police, vrtno pohištvo in škatle, ki se niso odprle že leta. Prepeljemo jih na novo lokacijo ali pa, če se jih želite znebiti, poskrbimo tudi za odvoz krame.",
          "Pred selitvijo je dobro razvrstiti, kaj gre z vami in kaj ne. Tako prevažamo manj in selitev je hitreje končana.",
        ],
      },
    ],
    faq: [
      {
        q: "Ali lahko preselite samo eno sobo?",
        a: "Da. Selimo tudi posamezne sobe, na primer študentsko sobo ali opremo ene spalnice. V povpraševanju naštejte večje kose in napišite nadstropje.",
      },
      {
        q: "Ali razstavite in sestavite pohištvo?",
        a: "Da, pohištvo, ki ga ni mogoče varno prenesti v enem kosu, razstavimo in ga na novem naslovu sestavimo. Povejte nam vnaprej, za katere kose gre.",
      },
      {
        q: "Ali moram biti prisoten med selitvijo?",
        a: "Priporočamo, da ste prisotni vsaj ob začetku in na novem naslovu, da pokažete, kam gredo stvari. Če to ni mogoče, se dogovorimo za osebo, ki vas zastopa.",
      },
    ],
    related: ["prevoz-pohistva", "pomoc-pri-selitvi", "odvoz-krame"],
    serviceType: "Selitev stanovanja",
    photo: "teamWrapping",
  },
  {
    slug: "selitev-pisarn",
    name: "Selitev pisarn",
    card: "Mize, omare, računalniki in arhiv. Selitev pripravimo tako, da delo stoji čim manj časa.",
    metaTitle: "Selitev pisarn Ljubljana | Selitev poslovnih prostorov",
    metaDescription:
      "Selitev pisarn in pisarniških prostorov v Ljubljani in po Sloveniji. Prenos pisarniškega pohištva, opreme in arhiva po dogovorjenem načrtu. Pošljite povpraševanje.",
    h1: "Selitev pisarn in poslovnih prostorov",
    lead:
      "Preselimo pisarniško pohištvo, računalniško opremo, arhiv in ostalo opremo iz starih v nove poslovne prostore. Pred selitvijo skupaj pripravimo načrt, da veste, kdaj se kaj seli in koliko časa bo delo zaradi selitve stalo.",
    inquiry: "selitev",
    includes: [
      "Prenos pisarniških miz, stolov, omar in polic",
      "Prevoz računalnikov, monitorjev in tiskalnikov v zaščiti",
      "Prenos arhiva in dokumentacije v zaprtih škatlah",
      "Razstavljanje in sestavljanje pisarniškega pohištva",
      "Selitev po delih ali zunaj delovnega časa po dogovoru",
    ],
    suitedFor: [
      "Manjša podjetja in samostojni podjetniki, ki menjajo pisarno",
      "Selitev oddelka v drugo nadstropje ali drugo stavbo",
      "Ordinacije, studii in prodajni prostori",
      "Društva in organizacije s pisarniško opremo",
    ],
    steps: [
      { title: "Načrt", text: "Dogovorimo se, kaj se seli, v kakšnem vrstnem redu in kdaj prostori niso v uporabi." },
      { title: "Priprava", text: "Zaposleni zložijo osebne stvari in dokumente v označene škatle, opremo pripravimo za prevoz." },
      { title: "Selitev", text: "Prenesemo, naložimo in prepeljemo. Večjo pisarno lahko selimo v več delih." },
      { title: "Postavitev", text: "Na novi lokaciji postavimo pohištvo in opremo po tlorisu ali vaših navodilih." },
    ],
    priceFactors: [
      "Število delovnih mest in količina pohištva",
      "Količina arhiva in opreme",
      "Dostop do obeh lokacij: dvigalo, nakladalna rampa, parkiranje",
      "Termin, na primer selitev ob vikendu ali zvečer",
      "Razdalja med lokacijama",
    ],
    prepare: [
      "Določite osebo, ki koordinira selitev in odgovarja na vprašanja.",
      "Pripravite tloris novih prostorov z označenimi mesti za pohištvo.",
      "Škatle označite z imenom oddelka ali številko pisarne.",
      "Računalnike izklopite in kable zložite skupaj z napravo.",
      "Preverite pravila stavbe glede uporabe dvigala in parkiranja.",
    ],
    sections: [
      {
        id: "selitev-pisarniskih-prostorov",
        h2: "Kako zmanjšamo čas, ko pisarna ne deluje",
        paragraphs: [
          "Pri selitvi pisarne je najdražji čas, ko ekipa ne more delati. Zato selitev pogosto razdelimo: najprej arhiv in stvari, ki jih vsak dan ne potrebujete, nazadnje delovna mesta.",
          "Če je mogoče, selimo ob koncu tedna ali po delovnem času, da v ponedeljek začnete v novih prostorih. Termin uskladimo z vami in z upravnikom stavbe.",
        ],
      },
    ],
    faq: [
      {
        q: "Ali lahko pisarno preselite ob vikendu?",
        a: "Termin ob vikendu ali zvečer je mogoč po dogovoru. Napišite ga v povpraševanje, da ga upoštevamo v ponudbi.",
      },
      {
        q: "Kdo zapakira dokumente in osebne stvari?",
        a: "Običajno jih zaposleni zložijo sami, ker vedo, kaj spada skupaj. Mi poskrbimo za prenos, prevoz in postavitev pohištva in opreme.",
      },
    ],
    related: ["selitev-skladisca", "prevoz-pohistva", "odvoz-krame"],
    serviceType: "Selitev pisarn",
  },
  {
    slug: "selitev-skladisca",
    name: "Selitev skladišča",
    card: "Police, palete, zaloga in orodje. Preselimo urejeno, da na novi lokaciji vse hitro najdete.",
    metaTitle: "Selitev skladišča | Prevoz zaloge, polic in palet",
    metaDescription:
      "Selitev skladišča ali delavnice: prenos zaloge, polic, palet in opreme na novo lokacijo po dogovorjenem načrtu. Ljubljana in Slovenija. Pošljite povpraševanje.",
    h1: "Selitev skladišča in delavnice",
    lead:
      "Preselimo zalogo, police, palete, orodje in opremo skladišča ali delavnice na novo lokacijo. Selitev pripravimo po delih, da veste, kaj je že na novi lokaciji in kaj še čaka.",
    inquiry: "selitev",
    includes: [
      "Prevoz blaga na paletah in v škatlah",
      "Razstavljanje, prevoz in ponovna postavitev polic",
      "Prenos orodja in delavniške opreme",
      "Selitev v več vožnjah po dogovorjenem vrstnem redu",
    ],
    suitedFor: [
      "Spletne trgovine, ki menjajo skladišče",
      "Obrtniki, ki selijo delavnico",
      "Podjetja z manjšim skladiščem ali priročnim skladiščem",
      "Praznjenje skladiščnega prostora ob koncu najema",
    ],
    steps: [
      { title: "Popis", text: "Ocenimo količino blaga, število palet in polic ter posebnosti, kot so težki kosi." },
      { title: "Vrstni red", text: "Določimo, kaj gre prvo, da lahko na novi lokaciji začnete postavljati police." },
      { title: "Prevoz", text: "Prevažamo po delih in sproti označujemo, kaj je že preseljeno." },
      { title: "Postavitev", text: "Police sestavimo na novih mestih, blago zložimo po vaših navodilih." },
    ],
    priceFactors: [
      "Količina blaga in število palet",
      "Število in vrsta polic, ki jih je treba razstaviti",
      "Teža posameznih kosov in dostop z vozilom",
      "Število voženj in razdalja",
    ],
    prepare: [
      "Pripravite seznam palet in polic ali nam pošljite fotografije.",
      "Blago, ki ni na paletah, zložite v enake, zaprte škatle.",
      "Na novi lokaciji označite, kam pridejo police.",
      "Povejte nam za kose, težje od običajnega, in za opremo, ki potrebuje posebno ravnanje.",
    ],
    faq: [
      {
        q: "Ali lahko prepeljete blago na paletah?",
        a: "Da. Za ponudbo potrebujemo število palet, približne mere in težo ter podatek, kako se palete nalagajo na obeh lokacijah.",
      },
      {
        q: "Ali skladišče selite v več dneh?",
        a: "Pri večji količini je selitev v več dneh ali več vožnjah običajna. Vrstni red pripravimo skupaj, da delo pri vas teče naprej.",
      },
    ],
    related: ["prevoz-blaga", "selitev-pisarn", "odvoz-krame"],
    serviceType: "Selitev skladišča",
    photo: "yard",
  },
  {
    slug: "prevoz-pohistva",
    name: "Prevoz pohištva",
    card: "En kavč, nova omara ali bela tehnika. Prevzamemo, prinesemo in odnesemo po stopnicah.",
    metaTitle: "Prevoz pohištva Ljubljana | Prevoz kavča, omare, bele tehnike",
    metaDescription:
      "Prevoz pohištva in bele tehnike po Ljubljani in Sloveniji. Prevzem iz trgovine ali od prodajalca, prenos do stanovanja, po želji tudi sestava. Pokličite nas.",
    h1: "Prevoz pohištva in bele tehnike",
    lead:
      "Ne selite se, potrebujete pa prevoz enega ali nekaj kosov pohištva? Prevzamemo kavč, omaro, posteljo, hladilnik ali pralni stroj v trgovini, pri prodajalcu ali pri vas in ga prinesemo na novi naslov, tudi v nadstropje.",
    inquiry: "prevoz",
    includes: [
      "Prevzem v trgovini, skladišču ali pri zasebnem prodajalcu",
      "Prenos po stopnišču do želenega prostora",
      "Zaščita pohištva med prevozom",
      "Razstavljanje in sestavljanje po dogovoru",
    ],
    suitedFor: [
      "Pohištvo, kupljeno v trgovini brez dostave do stanovanja",
      "Rabljeno pohištvo, kupljeno prek oglasov",
      "Prevoz bele tehnike: hladilnik, pralni ali pomivalni stroj",
      "Prevoz posameznih kosov k sorodnikom ali v vikend",
    ],
    steps: [
      { title: "Pošljite podatke", text: "Kaj prevažamo, približne mere in od kod do kod. Fotografija zelo pomaga." },
      { title: "Termin", text: "Dogovorimo se za uro prevzema in dostave." },
      { title: "Prevoz", text: "Pohištvo prevzamemo, zaščitimo, naložimo in prepeljemo." },
      { title: "Dostava", text: "Prinesemo do prostora, kjer ga želite, in po dogovoru sestavimo." },
    ],
    priceFactors: [
      "Število in velikost kosov",
      "Nadstropje in dvigalo na obeh naslovih",
      "Razdalja",
      "Razstavljanje ali sestavljanje",
    ],
    prepare: [
      "Izmerite kos pohištva in vrata ali stopnišče, skozi katera mora.",
      "Pri nakupu prek oglasa preverite, ali je kos že razstavljen.",
      "Pralni stroj naj bo izpraznjen in odklopljen od vode.",
      "Pripravite prost prehod do mesta, kamor pohištvo prinesemo.",
    ],
    faq: [
      {
        q: "Ali lahko naročim samo prevoz pohištva?",
        a: "Da. Prevažamo tudi posamezne kose pohištva in belo tehniko brez selitve. Pošljite, kaj in od kod do kod prevažamo.",
      },
      {
        q: "Ali pohištvo prinesete v stanovanje?",
        a: "Da, pohištvo prinesemo do prostora, ki ga določite. Napišite nadstropje in ali je v stavbi dvigalo.",
      },
    ],
    related: ["selitev-stanovanja", "pomoc-pri-selitvi", "odvoz-krame"],
    serviceType: "Prevoz pohištva",
    photo: "teamSofa",
  },
  {
    slug: "pomoc-pri-selitvi",
    name: "Pomoč pri selitvi",
    card: "Imate svoj kombi ali najeto vozilo? Pridemo nositi, razstavljati in nalagati.",
    metaTitle: "Pomoč pri selitvi | Prenašanje, nalaganje, montaža pohištva",
    metaDescription:
      "Pomoč pri selitvi v Ljubljani in okolici: prenašanje pohištva, nalaganje vozila, razstavljanje in sestavljanje pohištva. Tudi brez našega prevoza. Pokličite.",
    h1: "Pomoč pri selitvi: prenašanje, nalaganje in montaža",
    lead:
      "Če prevoz urejate sami, vam pomagamo s fizičnim delom: prenašamo pohištvo in škatle, naložimo ali razložimo vozilo, razstavimo in sestavimo pohištvo. Pomagamo lahko na enem ali na obeh naslovih.",
    inquiry: "selitev",
    includes: [
      "Prenašanje pohištva, škatel in bele tehnike",
      "Nalaganje in razlaganje vašega ali najetega vozila",
      "Montaža in demontaža pohištva",
      "Premik težkih kosov znotraj stanovanja ali hiše",
    ],
    suitedFor: [
      "Selitve, pri katerih imate prevoz že urejen",
      "Premik pohištva med prostori ali nadstropji",
      "Pomoč pri razlaganju dostave",
      "Starejše, ki potrebujejo pomoč pri težjih kosih",
    ],
    steps: [
      { title: "Opišite delo", text: "Kaj je treba prenesti, kje in koliko ljudi pričakujete, da bo potrebnih." },
      { title: "Dogovor", text: "Potrdimo termin in obseg dela." },
      { title: "Delo", text: "Pridemo ob dogovorjeni uri in opravimo dogovorjeno." },
    ],
    priceFactors: [
      "Obseg dela in število ljudi",
      "Nadstropje in dostop",
      "Montaža ali demontaža pohištva",
      "Ali pomagamo na enem ali na obeh naslovih",
    ],
    prepare: [
      "Imejte vozilo na mestu ob dogovorjeni uri.",
      "Škatle naj bodo zaprte in dovolj trdne za prenašanje.",
      "Pripravite navodila za sestavo pohištva, če jih imate.",
    ],
    faq: [
      {
        q: "Ali pomagate tudi pri prenašanju pohištva?",
        a: "Da. Prenašanje, nalaganje in montaža pohištva so del naših storitev, tudi kadar prevoza ne opravimo mi.",
      },
      {
        q: "Ali montirate pohištvo iz trgovine?",
        a: "Sestavimo pohištvo, ki ga selimo ali prevažamo. Za sestavo novega pohištva nam vnaprej povejte, za kateri kos gre.",
      },
    ],
    related: ["selitev-stanovanja", "prevoz-pohistva", "prevoz-blaga"],
    serviceType: "Pomoč pri selitvi",
    photo: "teamLoading",
  },
  {
    slug: "prevoz-blaga",
    name: "Prevoz blaga",
    card: "Material, palete in oprema. Prevozi po Ljubljani, Sloveniji in po dogovoru tudi v tujino.",
    metaTitle: "Prevoz blaga in materiala | Prevoz palet po Sloveniji",
    metaDescription:
      "Prevoz blaga, gradbenega materiala in palet po Ljubljani in Sloveniji, mednarodni prevozi po dogovoru. Pošljite povpraševanje s količino in lokacijama.",
    h1: "Prevoz blaga, materiala in palet",
    lead:
      "Prepeljemo material, blago na paletah, opremo in drug tovor po Ljubljani in Sloveniji, v tujino po dogovoru. Za ponudbo potrebujemo vrsto tovora, približno količino ali težo in obe lokaciji.",
    inquiry: "prevoz",
    includes: [
      "Prevoz gradbenega materiala do gradbišča ali hiše",
      "Prevoz blaga na paletah",
      "Prevoz opreme za dogodke, sejme in trgovine",
      "Mednarodni prevozi po dogovoru",
    ],
    suitedFor: [
      "Obrtniki in gradbinci",
      "Podjetja z občasnimi prevozi",
      "Posamezniki, ki prenavljajo",
      "Prireditve in sejmi",
    ],
    steps: [
      { title: "Podatki o tovoru", text: "Vrsta, količina, mere ali teža ter način nakladanja." },
      { title: "Ponudba", text: "Pripravimo ponudbo in potrdimo termin." },
      { title: "Prevoz", text: "Naložimo, prepeljemo in razložimo, kot smo se dogovorili." },
    ],
    priceFactors: [
      "Vrsta in količina tovora",
      "Teža in mere ter s tem primerno vozilo",
      "Razdalja in število voženj",
      "Nakladanje in razkladanje: ročno ali z viličarjem na lokaciji",
    ],
    prepare: [
      "Pripravite podatke o teži in merah tovora.",
      "Povejte nam, ali je na lokaciji viličar ali rampa.",
      "Tovor naj bo pripravljen in zavarovan za nakladanje.",
    ],
    sections: [
      {
        id: "prevoz-materiala-in-palet",
        h2: "Prevoz materiala in palet",
        paragraphs: [
          "Pri prevozu materiala je teža pomembnejša od prostornine. Vreče, ploščice ali les so lahko majhni po obsegu, a težki, zato v povpraševanje napišite tudi približno težo.",
          "Palete prepeljemo, ko vemo njihovo število, mere in težo ter kako se na obeh lokacijah nakladajo in razkladajo.",
        ],
      },
    ],
    faq: [
      {
        q: "Ali opravljate prevoze tudi v tujino?",
        a: "Mednarodne prevoze opravimo po dogovoru. Pošljite začetno in končno lokacijo ter opis tovora, pa vam odgovorimo.",
      },
      {
        q: "Koliko tovora lahko prepeljete naenkrat?",
        a: "Odvisno od vozila in teže tovora. Vedno prevažamo v okviru dovoljene nosilnosti vozila, zato potrebujemo podatke o teži.",
      },
    ],
    related: ["selitev-skladisca", "prevoz-motorjev", "prevoz-pohistva"],
    serviceType: "Prevoz blaga",
    photo: "forklift",
  },
  {
    slug: "prevoz-motorjev",
    name: "Prevoz motorjev",
    card: "Motor do servisa, od prodajalca ali na novo lokacijo. Način nakladanja dogovorimo vnaprej.",
    metaTitle: "Prevoz motorja | Prevoz motorjev po Sloveniji",
    metaDescription:
      "Prevoz motorja do servisa, od prodajalca ali ob selitvi. Ljubljana in Slovenija. Pošljite znamko, model in lokaciji, način nakladanja dogovorimo vnaprej.",
    h1: "Prevoz motorja",
    lead:
      "Motor prepeljemo do servisa, od prodajalca po nakupu, ob selitvi ali kadar ga ne morete peljati sami. Pred prevozom se dogovorimo o nakladanju in pritrditvi, da motor potuje varno.",
    inquiry: "prevoz",
    includes: [
      "Prevzem motorja na vašem naslovu, pri prodajalcu ali v servisu",
      "Nakladanje, pritrditev in prevoz",
      "Dostava na dogovorjeni naslov",
    ],
    suitedFor: [
      "Nakup rabljenega motorja v drugem kraju",
      "Prevoz do servisa ali na tehnični pregled",
      "Motor, ki ni vozen",
      "Selitev, pri kateri gre motor zraven",
    ],
    steps: [
      { title: "Podatki", text: "Znamka, model, ali je motor vozen in obe lokaciji." },
      { title: "Dogovor", text: "Potrdimo termin ter način nakladanja in pritrditve." },
      { title: "Prevoz", text: "Motor naložimo, pritrdimo, prepeljemo in razložimo." },
    ],
    priceFactors: ["Razdalja", "Ali je motor vozen", "Dostop na obeh lokacijah", "Ali gre prevoz skupaj s selitvijo"],
    prepare: [
      "Povejte nam znamko, model in ali motor deluje.",
      "Odstranite stvari, ki bi lahko odpadle med prevozom.",
      "Ključe in dokumente imejte pri roki ob prevzemu.",
    ],
    faq: [
      {
        q: "Ali lahko prepeljete motor?",
        a: "Da. Pošljite znamko in model, ali je motor vozen ter od kod in kam ga peljemo. Način nakladanja in pritrditve dogovorimo pred prevozom.",
      },
      {
        q: "Ali prepeljete tudi motor, ki ne vozi?",
        a: "Napišite nam to v povpraševanje. Ali in kako ga naložimo, je odvisno od stanja motorja in dostopa, zato se o tem dogovorimo vnaprej.",
      },
    ],
    related: ["prevoz-blaga", "selitev-stanovanja", "prevoz-pohistva"],
    serviceType: "Prevoz motorjev",
  },
  {
    slug: "odvoz-krame",
    name: "Odvoz krame",
    card: "Staro pohištvo, kosovni in gradbeni odpadki. Znesemo, naložimo in odpeljemo.",
    metaTitle: "Odvoz krame Ljubljana | Odvoz starega pohištva in odpadkov",
    metaDescription:
      "Odvoz krame, starega pohištva, bele tehnike in gradbenih odpadkov v Ljubljani in okolici. Znesemo iz stanovanja, kleti ali podstrešja in odpeljemo. Pokličite.",
    h1: "Odvoz krame in starega pohištva",
    lead:
      "Znesemo staro pohištvo, belo tehniko, kramo iz kleti ali podstrešja in gradbene odpadke, jih naložimo in odpeljemo. Kaj odvažamo in kam, se dogovorimo vnaprej.",
    inquiry: "odvoz",
    includes: [
      "Iznos stvari iz stanovanja, kleti, podstrešja ali garaže",
      "Odvoz starega pohištva in bele tehnike",
      "Odvoz gradbenih odpadkov po prenovi",
      "Odvoz stvari, ki ostanejo po selitvi",
    ],
    suitedFor: [
      "Praznjenje stanovanja pred prodajo ali oddajo",
      "Čiščenje kleti in podstrešja",
      "Odpadki po prenovi kopalnice ali kuhinje",
      "Stvari, ki ob selitvi ne gredo z vami",
    ],
    steps: [
      { title: "Opis", text: "Kaj odvažamo, približna količina in kje so stvari. Fotografije pomagajo." },
      { title: "Ponudba", text: "Pripravimo ponudbo in potrdimo termin." },
      { title: "Odvoz", text: "Znesemo, naložimo in odpeljemo." },
    ],
    priceFactors: [
      "Količina in vrsta odpadkov",
      "Nadstropje in dolžina poti do vozila",
      "Razstavljanje večjih kosov",
      "Vrsta odpadkov, na primer gradbeni odpadki ali bela tehnika",
    ],
    prepare: [
      "Ločite stvari, ki jih odpeljemo, od tistih, ki ostanejo.",
      "Pošljite fotografije prostora ali kupa.",
      "Gradbene odpadke zberite na enem mestu, če je mogoče.",
    ],
    faq: [
      {
        q: "Kaj vse odpeljete?",
        a: "Staro pohištvo, belo tehniko, kramo iz kleti ali podstrešja in gradbene odpadke. Za posebne odpadke, kot so barve ali kemikalije, nas vprašajte vnaprej.",
      },
      {
        q: "Ali lahko odvoz združim s selitvijo?",
        a: "Da. Stvari, ki jih ne selite, lahko odpeljemo isti dan. Napišite to v povpraševanje.",
      },
    ],
    related: ["selitev-stanovanja", "selitev-skladisca", "pomoc-pri-selitvi"],
    serviceType: "Odvoz krame",
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
