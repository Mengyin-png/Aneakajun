/**
 * DEVELOPMENT seed: journeys, guidance articles, journey forms, homepage.
 *
 * Guidance is deliberately general. It points readers to official sources
 * instead of stating fees, durations or legal requirements, and every article
 * is seeded as NOT YET REVIEWED (lastReviewedAt = null) so the site shows a
 * warning until an editor checks it against its sources and marks it reviewed.
 * Khmer text is sample content and must be reviewed by a native speaker.
 */

export const SOURCES = {
  evisa: { title: "Cambodia e-Visa (official)", publisher: "Kingdom of Cambodia", url: "https://www.evisa.gov.kh" },
  immigration: {
    title: "General Department of Immigration",
    publisher: "Ministry of Interior",
    url: "https://www.immigration.gov.kh",
  },
  mfaic: {
    title: "Ministry of Foreign Affairs and International Cooperation",
    publisher: "Kingdom of Cambodia",
    url: "https://www.mfaic.gov.kh",
  },
  mlvt: {
    title: "Ministry of Labour and Vocational Training",
    publisher: "Kingdom of Cambodia",
    url: "https://www.mlvt.gov.kh",
  },
  cdc: {
    title: "Council for the Development of Cambodia (CDC)",
    publisher: "Kingdom of Cambodia",
    url: "https://www.cdc.gov.kh",
  },
  moc: {
    title: "Online Business Registration",
    publisher: "Ministry of Commerce",
    url: "https://www.businessregistration.moc.gov.kh",
  },
  gdt: {
    title: "General Department of Taxation",
    publisher: "Ministry of Economy and Finance",
    url: "https://www.tax.gov.kh",
  },
  ukAdvice: {
    title: "Cambodia travel advice: local laws and customs",
    publisher: "UK Foreign, Commonwealth & Development Office (updated 19 March 2026)",
    url: "https://www.gov.uk/foreign-travel-advice/cambodia/local-laws-and-customs",
  },
} as const;

type SourceKey = keyof typeof SOURCES;

export const JOURNEYS = [
  {
    key: "live",
    title: "Live in Cambodia",
    titleKm: "រស់នៅក្នុងប្រទេសកម្ពុជា",
    verb: "Live",
    verbKm: "រស់នៅ",
    description: "Practical guidance on visas and residency, housing, healthcare, getting around and everyday life.",
    descriptionKm:
      "មគ្គុទ្ទេសក៍ជាក់ស្តែងអំពីទិដ្ឋាការ និងការស្នាក់នៅ លំនៅដ្ឋាន សុខាភិបាល ការធ្វើដំណើរ និងជីវិតប្រចាំថ្ងៃ។",
    icon: "home",
    accentColor: "#09786a",
  },
  {
    key: "visit",
    title: "Visit Cambodia",
    titleKm: "ទស្សនាប្រទេសកម្ពុជា",
    verb: "Visit",
    verbKm: "ទស្សនា",
    description: "Prepare for your trip: entry requirements, local laws and etiquette, transport and staying safe.",
    descriptionKm:
      "រៀបចំសម្រាប់ដំណើររបស់អ្នក៖ លក្ខខណ្ឌចូលប្រទេស ច្បាប់ និងទំនៀមទម្លាប់ក្នុងស្រុក ការធ្វើដំណើរ និងសុវត្ថិភាព។",
    icon: "compass",
    accentColor: "#b8730a",
  },
  {
    key: "business",
    title: "Do business in Cambodia",
    titleKm: "ធ្វើអាជីវកម្មនៅប្រទេសកម្ពុជា",
    verb: "Do business",
    verbKm: "ធ្វើអាជីវកម្ម",
    description: "Starting a company, registration, investment, taxes and the local business environment.",
    descriptionKm: "ការចាប់ផ្តើមក្រុមហ៊ុន ការចុះបញ្ជី ការវិនិយោគ ពន្ធ និងបរិយាកាសអាជីវកម្មក្នុងស្រុក។",
    icon: "briefcase",
    accentColor: "#2f4b9c",
  },
] as const;

type Section = { heading: string; headingKm?: string; kind?: "CONTENT" | "NOTE" | "WARNING"; body: string };

export type SeedGuidance = {
  journey: "live" | "visit" | "business";
  slug: string;
  featured: boolean;
  title: string;
  titleKm: string;
  summary: string;
  summaryKm: string;
  nextSteps: string;
  sections: Section[];
  sources: SourceKey[];
};

const CHECK_OFFICIAL =
  "Rules, fees and processing times change. Always confirm the current requirements with the official sources listed at the end of this guide before you apply or travel.";

export const GUIDANCE: SeedGuidance[] = [
  // ───────────── LIVE ─────────────
  {
    journey: "live",
    slug: "living-in-cambodia-overview",
    featured: true,
    title: "Living in Cambodia: an overview",
    titleKm: "ការរស់នៅក្នុងប្រទេសកម្ពុជា៖ ទិដ្ឋភាពទូទៅ",
    summary: "What everyday life looks like, from neighbourhoods and climate to healthcare, transport and community.",
    summaryKm: "ជីវិតប្រចាំថ្ងៃមានលក្ខណៈយ៉ាងណា ចាប់ពីសង្កាត់ និងអាកាសធាតុ រហូតដល់សុខាភិបាល ការធ្វើដំណើរ និងសហគមន៍។",
    nextSteps: "Tell us about your plans and we will point you to the right guidance and contacts.",
    sources: ["immigration", "mfaic"],
    sections: [
      {
        heading: "Where people settle",
        headingKm: "កន្លែងដែលមនុស្សតាំងទីលំនៅ",
        body: "Most newcomers start in **Phnom Penh**, the capital and commercial centre, where international schools, hospitals and services are concentrated. **Siem Reap** offers a slower pace close to the Angkor temples, while coastal towns such as **Kampot** and **Kep** attract people looking for a quieter lifestyle.\n\nVisit before committing to a long lease: neighbourhoods within the same city can feel very different in traffic, noise and access to services.",
      },
      {
        heading: "Climate and seasons",
        headingKm: "អាកាសធាតុ និងរដូវ",
        body: "Cambodia is tropical and warm all year. There is a rainy season and a dry season, and the hottest weeks come just before the rains. Plan moves, renovations and long road trips with the seasons in mind, and expect some flooding on low-lying roads during heavy rain.",
      },
      {
        heading: "Healthcare",
        headingKm: "សុខាភិបាល",
        body: "Phnom Penh and Siem Reap have private clinics and hospitals used by residents and visitors; facilities outside the main cities are more limited. Many residents keep comprehensive international health insurance that includes medical evacuation.\n\n- Register with a clinic soon after you arrive\n- Keep copies of prescriptions and your medical history\n- Check what your insurance covers before you need it",
      },
      {
        heading: "Getting around",
        headingKm: "ការធ្វើដំណើរ",
        body: "In the cities, ride-hailing apps for tuk-tuks and cars are widely used and show the price upfront. Many residents buy or rent a motorbike; if you do, check the licensing rules that apply to you, always wear a helmet and make sure your insurance covers riding.\n\nBuses and minivans connect the main towns, and domestic flights link Phnom Penh and Siem Reap.",
      },
      {
        heading: "Money and banking",
        headingKm: "ប្រាក់ និងធនាគារ",
        body: "Both the Cambodian riel and the US dollar are used in everyday life, and mobile payment apps and QR payments are common. Opening a local bank account usually requires your passport and a valid visa; requirements vary by bank, so ask the bank directly what documents they need.",
      },
      {
        heading: "Culture and community",
        headingKm: "វប្បធម៌ និងសហគមន៍",
        body: "Cambodians place importance on politeness, calm communication and respect for elders and monks. Learning a few words of Khmer goes a long way. Community groups, professional associations and diaspora networks are good ways to build a network quickly; see the [organization directory](/organizations) for some of them.",
      },
      { heading: "Before you rely on this guide", kind: "NOTE", body: CHECK_OFFICIAL },
    ],
  },
  {
    journey: "live",
    slug: "visas-and-residency",
    featured: true,
    title: "Visas and residency: where to start",
    titleKm: "ទិដ្ឋាការ និងការស្នាក់នៅ៖ ចាប់ផ្តើមពីណា",
    summary:
      "How to find the right visa for a longer stay, extensions and work permits, and which official bodies are responsible.",
    summaryKm:
      "របៀបស្វែងរកទិដ្ឋាការត្រឹមត្រូវសម្រាប់ការស្នាក់នៅយូរ ការពន្យារ និងប័ណ្ណការងារ និងស្ថាប័នផ្លូវការដែលទទួលខុសត្រូវ។",
    nextSteps:
      "Share your nationality, timeline and reason for moving, and we will help you work out which questions to ask the authorities.",
    sources: ["evisa", "immigration", "mfaic", "mlvt"],
    sections: [
      {
        heading: "Which authority does what",
        headingKm: "ស្ថាប័នណាធ្វើអ្វី",
        body: "Visa policy and consular services sit with the **Ministry of Foreign Affairs and International Cooperation**. Entry, stay and visa extensions inside Cambodia are handled by the **General Department of Immigration**. If you plan to work, the **Ministry of Labour and Vocational Training** is responsible for work permits for foreign nationals.",
      },
      {
        heading: "Choosing a visa category",
        headingKm: "ការជ្រើសរើសប្រភេទទិដ្ឋាការ",
        body: "The visa you need depends on why you are coming: tourism, business, work, study or family. A tourist visa is not intended for living or working in Cambodia. Check the categories, eligibility and costs on the official e-Visa portal or with a Cambodian embassy before you travel, because what you enter on can affect what you can extend to later.",
      },
      {
        heading: "Extensions",
        headingKm: "ការពន្យារពេល",
        body: "Longer stays are usually arranged by extending a visa from inside the country. Extension options, durations and documents differ by category and change from time to time. Many residents use a licensed agent; if you do, ask for official receipts and keep copies of every page of your passport.",
      },
      {
        heading: "Working legally",
        headingKm: "ការធ្វើការដោយស្របច្បាប់",
        body: "Foreign nationals who work in Cambodia generally need a work permit and an employment card in addition to the right visa. Responsibilities are often shared between you and your employer. Confirm the current process with the Ministry of Labour before you start work.",
      },
      {
        heading: "Keep your documents in order",
        headingKm: "រក្សាឯកសាររបស់អ្នកឱ្យមានសណ្តាប់ធ្នាប់",
        body: "- Track your visa expiry date and start renewals early\n- Keep digital and paper copies of your passport and visa pages\n- Keep receipts for every official payment\n- Register your address where required by your landlord or local authorities",
      },
      { heading: "This is general information, not legal advice", kind: "WARNING", body: CHECK_OFFICIAL },
    ],
  },
  {
    journey: "live",
    slug: "finding-housing",
    featured: false,
    title: "Finding a place to live",
    titleKm: "ការស្វែងរកកន្លែងស្នាក់នៅ",
    summary: "Apartments, houses and serviced flats; viewing tips, leases, deposits and utilities.",
    summaryKm: "អាផាតមិន ផ្ទះ និងបន្ទប់មានសេវាកម្ម គន្លឹះមើលផ្ទះ កិច្ចសន្យាជួល ប្រាក់កក់ និងឧបករណ៍ប្រើប្រាស់។",
    nextSteps: "Describe what you need and we can share neighbourhood guidance.",
    sources: ["immigration"],
    sections: [
      {
        heading: "Types of housing",
        headingKm: "ប្រភេទលំនៅដ្ឋាន",
        body: "Options range from serviced apartments with cleaning and security, to unserviced apartments in modern buildings, to traditional shophouses and villas. Serviced apartments are convenient for the first months while you learn the city.",
      },
      {
        heading: "Viewing a property",
        headingKm: "ការមើលផ្ទះ",
        body: "Visit at different times of day to check traffic and noise. Test water pressure, air-conditioning and internet speed, ask how flooding is handled in the rainy season, and check backup power and security arrangements.",
      },
      {
        heading: "Leases and deposits",
        headingKm: "កិច្ចសន្យាជួល និងប្រាក់កក់",
        body: "Get the lease in writing, in a language you understand, and keep a copy. Make sure it states the rent, deposit, notice period, what is included and who pays for repairs. Photograph the property's condition when you move in and out.",
      },
      {
        heading: "Utilities and internet",
        headingKm: "ឧបករណ៍ប្រើប្រាស់ និងអ៊ីនធឺណិត",
        body: "Ask whether electricity and water are billed at the official rate or a building rate, and who arranges internet. Fibre internet is available in most urban areas.",
      },
      {
        heading: "A note on agents",
        kind: "NOTE",
        body: "Agents can save time, but they are usually paid by the landlord. Compare a few properties and never pay a deposit before you have seen the property and the lease.",
      },
    ],
  },

  // ───────────── VISIT ─────────────
  {
    journey: "visit",
    slug: "tourist-visas-and-entry",
    featured: true,
    title: "Tourist visas and entry requirements",
    titleKm: "ទិដ្ឋាការទេសចរ និងលក្ខខណ្ឌចូលប្រទេស",
    summary: "How to check whether you need a visa, where to apply officially, and what to prepare before you fly.",
    summaryKm: "របៀបពិនិត្យថាតើអ្នកត្រូវការទិដ្ឋាការឬទេ កន្លែងដាក់ពាក្យផ្លូវការ និងអ្វីដែលត្រូវរៀបចំមុនពេលធ្វើដំណើរ។",
    nextSteps: "Planning a trip? Tell us your dates and interests and we will share relevant guidance.",
    sources: ["evisa", "immigration", "mfaic", "ukAdvice"],
    sections: [
      {
        heading: "Check whether you need a visa",
        headingKm: "ពិនិត្យថាតើអ្នកត្រូវការទិដ្ឋាការឬទេ",
        body: "Visa requirements depend on your nationality. Some nationalities can visit without a visa for a limited period; most visitors need a tourist visa. Check your own situation with the Ministry of Foreign Affairs or a Cambodian embassy before you book.",
      },
      {
        heading: "Apply through official channels",
        headingKm: "ដាក់ពាក្យតាមបណ្តាញផ្លូវការ",
        body: "Tourist e-Visas can be applied for online through the **official Cambodia e-Visa portal** (evisa.gov.kh). Be careful of look-alike websites that charge extra fees; check the web address before you pay.",
      },
      {
        heading: "Passport and documents",
        headingKm: "លិខិតឆ្លងដែន និងឯកសារ",
        body: "Make sure your passport has enough validity remaining and blank pages for your trip; check the exact rule that applies to you. Carry printed copies of your visa, accommodation booking and return or onward ticket. Keep a copy of your passport photo page separate from the passport itself.",
      },
      {
        heading: "Arriving",
        headingKm: "ការមកដល់",
        body: "Follow the instructions of immigration officers and complete any arrival forms requested. Only use official counters and keep the receipts for any fees you pay.",
      },
      {
        heading: "Staying longer than planned",
        headingKm: "ការស្នាក់នៅយូរជាងគម្រោង",
        body: "If you want to stay longer, ask the General Department of Immigration (or a licensed agent) about extensions **before** your permitted stay ends. Overstaying can lead to fines and other consequences.",
      },
      { heading: "This is general information, not legal advice", kind: "WARNING", body: CHECK_OFFICIAL },
    ],
  },
  {
    journey: "visit",
    slug: "laws-and-etiquette-for-visitors",
    featured: true,
    title: "Laws and etiquette for visitors",
    titleKm: "ច្បាប់ និងសុជីវធម៌សម្រាប់ភ្ញៀវទេសចរ",
    summary:
      "Points visitors are advised to know, as summarised from official travel advice, plus everyday etiquette at temples and with monks.",
    summaryKm:
      "ចំណុចដែលភ្ញៀវទេសចរគួរដឹង ដោយសង្ខេបពីដំបូន្មានធ្វើដំណើរផ្លូវការ រួមទាំងសុជីវធម៌ប្រចាំថ្ងៃនៅវត្តអារាម និងជាមួយព្រះសង្ឃ។",
    nextSteps: "Have a question about your trip? Send it to us using the form.",
    sources: ["ukAdvice", "mfaic"],
    sections: [
      {
        heading: "About this guide",
        headingKm: "អំពីមគ្គុទ្ទេសក៍នេះ",
        kind: "NOTE",
        body: "The legal points below summarise the UK government's published travel advice for Cambodia (updated 19 March 2026). They are not a complete statement of Cambodian law. Your own government's travel advice and the Cambodian authorities are the authoritative sources.",
      },
      {
        heading: "Illegal drugs",
        headingKm: "គ្រឿងញៀនខុសច្បាប់",
        body: "According to the UK travel advice, possession, trafficking and manufacture of illegal drugs, **including cannabis**, are serious offences with severe penalties, up to life imprisonment. Transit baggage is scanned, and police may raid venues popular with foreigners and test for drug use.",
      },
      {
        heading: "Temples and religious sites",
        headingKm: "ប្រាសាទ និងទីតាំងសាសនា",
        body: "Authorities have issued an official code of conduct for visitors to Angkor Wat and other religious sites. Entry may be refused if you wear skirts or shorts above the knee, and shoulders should be covered. Remove shoes and hats where asked, and keep your voice low.",
      },
      {
        heading: "Photography",
        headingKm: "ការថតរូប",
        body: "Never take photographs on or near military sites. Ask before photographing people, especially monks and religious figures. The UK advice also notes that permission must be requested in advance for scientific research, surveys, or extensive photography or filming.",
      },
      {
        heading: "Identification",
        headingKm: "អត្តសញ្ញាណ",
        body: "The UK advice notes that carrying a copy of your passport photo page can be useful, even though it is not a legal requirement.",
      },
      {
        heading: "Everyday etiquette",
        headingKm: "សុជីវធម៌ប្រចាំថ្ងៃ",
        body: "- Greet people with the *sampeah* (palms together) when it is offered to you\n- Women should avoid touching monks or handing items directly to them\n- Avoid touching people's heads and pointing your feet at people or images of the Buddha\n- Public displays of anger or affection are uncommon; calm, polite communication is valued",
      },
      { heading: "Check before you travel", kind: "WARNING", body: CHECK_OFFICIAL },
    ],
  },
  {
    journey: "visit",
    slug: "getting-around-and-staying-safe",
    featured: false,
    title: "Getting around and staying safe",
    titleKm: "ការធ្វើដំណើរ និងរក្សាសុវត្ថិភាព",
    summary: "Transport options, road safety, health and practical tips for a smooth trip.",
    summaryKm: "ជម្រើសនៃការធ្វើដំណើរ សុវត្ថិភាពចរាចរណ៍ សុខភាព និងគន្លឹះជាក់ស្តែងសម្រាប់ដំណើរកម្សាន្តដ៏រលូន។",
    nextSteps: "Tell us where you are going and we will suggest relevant guidance.",
    sources: ["ukAdvice"],
    sections: [
      {
        heading: "Transport",
        headingKm: "ការដឹកជញ្ជូន",
        body: "Ride-hailing apps for tuk-tuks and cars are common in cities and show the fare upfront. Buses, minivans and domestic flights connect the main destinations. Agree the price before using a street tuk-tuk.",
      },
      {
        heading: "Road safety",
        headingKm: "សុវត្ថិភាពចរាចរណ៍",
        body: "Traffic can be chaotic. If you ride a motorbike, wear a helmet, check that your licence and insurance cover you, and avoid riding at night outside the cities.",
      },
      {
        heading: "Health",
        headingKm: "សុខភាព",
        body: "Get travel health advice well before your trip, bring enough of any regular medication, drink bottled or filtered water, and protect yourself from mosquitoes. Buy travel insurance that covers medical treatment and evacuation.",
      },
      {
        heading: "Money and valuables",
        headingKm: "ប្រាក់ និងរបស់មានតម្លៃ",
        body: "US dollars and riel are both used. Keep valuables out of sight, especially on tuk-tuks and motorbikes, where bag snatching can happen.",
      },
      {
        heading: "Remote areas",
        headingKm: "តំបន់ដាច់ស្រយាល",
        body: "Phone and internet coverage can be poor on islands and in remote areas, and tourist sites may have few safety signs. Tell someone your plans and stay on marked paths.",
      },
    ],
  },

  // ───────────── BUSINESS ─────────────
  {
    journey: "business",
    slug: "starting-a-business",
    featured: true,
    title: "Starting a business in Cambodia",
    titleKm: "ការចាប់ផ្តើមអាជីវកម្មនៅប្រទេសកម្ពុជា",
    summary: "The main steps and the official bodies involved in registering and setting up a company.",
    summaryKm: "ជំហានសំខាន់ៗ និងស្ថាប័នផ្លូវការដែលពាក់ព័ន្ធក្នុងការចុះបញ្ជី និងបង្កើតក្រុមហ៊ុន។",
    nextSteps: "Tell us about your business idea and timeline so we can share relevant guidance and contacts.",
    sources: ["moc", "gdt", "cdc", "mlvt"],
    sections: [
      {
        heading: "Choose a business structure",
        headingKm: "ជ្រើសរើសទម្រង់អាជីវកម្ម",
        body: "Common options include a sole proprietorship, a partnership, a private limited company, or a branch or representative office of a foreign company. Each has different liability, ownership and reporting implications. Some sectors have restrictions on foreign ownership, so check before choosing a structure.",
      },
      {
        heading: "Register your company",
        headingKm: "ចុះបញ្ជីក្រុមហ៊ុនរបស់អ្នក",
        body: "Company registration is done through the **Ministry of Commerce's Online Business Registration** system. The system also links to other registrations required to start operating. Prepare company names, shareholder and director details, and a registered address in advance.",
      },
      {
        heading: "Tax registration",
        headingKm: "ការចុះបញ្ជីពន្ធ",
        body: "Businesses must register with the **General Department of Taxation**. Tax obligations depend on your structure, size and activities. Engage a qualified local accountant early.",
      },
      {
        heading: "Licences and sector rules",
        headingKm: "អាជ្ញាប័ណ្ណ និងច្បាប់តាមវិស័យ",
        body: "Many activities need additional licences from the relevant ministry, for example in food, tourism, education, health or finance. Ask the relevant ministry, or a local adviser, which licences apply to your activity before you start trading.",
      },
      {
        heading: "Investment incentives",
        headingKm: "ការលើកទឹកចិត្តការវិនិយោគ",
        body: "Larger projects may be eligible for incentives as a Qualified Investment Project through the **Council for the Development of Cambodia (CDC)**. Eligibility and incentives are set out by the CDC; check its official guidance.",
      },
      {
        heading: "Hiring staff",
        headingKm: "ការជួលបុគ្គលិក",
        body: "Employers have obligations under the labour law, including registration and work permits for foreign employees. See the Ministry of Labour and Vocational Training for current requirements.",
      },
      { heading: "This is general information, not legal or financial advice", kind: "WARNING", body: CHECK_OFFICIAL },
    ],
  },
  {
    journey: "business",
    slug: "taxes-and-compliance",
    featured: false,
    title: "Taxes and compliance basics",
    titleKm: "មូលដ្ឋានគ្រឹះនៃពន្ធ និងការអនុលោមភាព",
    summary: "An orientation to tax registration, filing and record-keeping, and where to find authoritative rules.",
    summaryKm: "ការណែនាំអំពីការចុះបញ្ជីពន្ធ ការដាក់លិខិតប្រកាស និងការរក្សាកំណត់ត្រា និងកន្លែងស្វែងរកច្បាប់ផ្លូវការ។",
    nextSteps: "Have specific questions? Send them with the business form.",
    sources: ["gdt", "moc"],
    sections: [
      {
        heading: "Where the rules come from",
        headingKm: "ប្រភពនៃច្បាប់",
        body: "Tax law and procedures are published by the **General Department of Taxation (GDT)**, part of the Ministry of Economy and Finance. Rates, thresholds and filing deadlines change, so rely on the GDT's current publications rather than older summaries.",
      },
      {
        heading: "Registering and filing",
        headingKm: "ការចុះបញ្ជី និងការដាក់លិខិតប្រកាស",
        body: "Once registered, businesses file regular tax returns. The GDT provides online services for registration and e-filing. Diarise every deadline and keep proof of submission.",
      },
      {
        heading: "Record-keeping",
        headingKm: "ការរក្សាកំណត់ត្រា",
        body: "Keep complete accounting records, invoices and receipts, in the format and language required. Good records make audits and investor due diligence far easier.",
      },
      {
        heading: "Getting help",
        headingKm: "ការទទួលបានជំនួយ",
        body: "Use a licensed local accounting or tax firm, especially in your first year. Ask for a written scope of work and fee estimate.",
      },
      { heading: "This is general information, not tax advice", kind: "WARNING", body: CHECK_OFFICIAL },
    ],
  },
  {
    journey: "business",
    slug: "business-environment",
    featured: false,
    title: "Understanding the business environment",
    titleKm: "ការយល់ដឹងអំពីបរិយាកាសអាជីវកម្ម",
    summary: "Sectors, partnerships, networks and practical habits that help new businesses succeed.",
    summaryKm: "វិស័យ ភាពជាដៃគូ បណ្តាញ និងទម្លាប់ជាក់ស្តែងដែលជួយអាជីវកម្មថ្មីឱ្យជោគជ័យ។",
    nextSteps: "Looking for partners? Browse the directory or tell us what you need.",
    sources: ["cdc", "moc"],
    sections: [
      {
        heading: "Growing sectors",
        headingKm: "វិស័យកំពុងរីកចម្រើន",
        body: "Agriculture and agri-processing, tourism and hospitality, construction, manufacturing, digital services and renewable energy are among the sectors attracting investment. Read the CDC's sector information for official priorities.",
      },
      {
        heading: "Relationships matter",
        headingKm: "ទំនាក់ទំនងមានសារៈសំខាន់",
        body: "Business in Cambodia often relies on trusted relationships. Take time to meet partners in person, follow up politely, and be patient with decision-making.",
      },
      {
        heading: "Networks and associations",
        headingKm: "បណ្តាញ និងសមាគម",
        body: "Chambers of commerce, business associations and diaspora networks are good sources of introductions and practical advice. Explore the [organization directory](/organizations) and [people directory](/people).",
      },
      {
        heading: "Due diligence",
        headingKm: "ការត្រួតពិនិត្យដោយយកចិត្តទុកដាក់",
        body: "Verify company registrations, land titles and licences through official channels before signing agreements, and have contracts reviewed by a qualified local lawyer.",
      },
    ],
  },
];

type FieldSeed = {
  key: string;
  type: "TEXT" | "EMAIL" | "NUMBER" | "DATE" | "TEXTAREA" | "SELECT" | "CHECKBOX" | "RADIO";
  label: string;
  labelKm?: string;
  required?: boolean;
  options?: { value: string; label: string; labelKm?: string }[];
  validation?: { minLength?: number; maxLength?: number; min?: number; max?: number };
  helpText?: string;
};

const common = (country = "Current country"): FieldSeed[] => [
  {
    key: "full_name",
    type: "TEXT",
    label: "Full name",
    labelKm: "ឈ្មោះពេញ",
    required: true,
    validation: { maxLength: 120 },
  },
  { key: "email", type: "EMAIL", label: "Email", labelKm: "អ៊ីមែល", required: true },
  {
    key: "nationality",
    type: "TEXT",
    label: "Nationality",
    labelKm: "សញ្ជាតិ",
    required: true,
    validation: { maxLength: 80 },
  },
  {
    key: "current_country",
    type: "TEXT",
    label: country,
    labelKm: "ប្រទេសបច្ចុប្បន្ន",
    required: true,
    validation: { maxLength: 80 },
  },
];

const opts = (pairs: [string, string, string?][]) =>
  pairs.map(([value, label, labelKm]) => ({ value, label, labelKm }));

export const FORMS: {
  id: string;
  journey: "live" | "visit" | "business";
  title: string;
  titleKm: string;
  description: string;
  descriptionKm: string;
  submitLabel: string;
  fields: FieldSeed[];
}[] = [
  {
    id: "form-live",
    journey: "live",
    title: "Plan your move to Cambodia",
    titleKm: "រៀបចំការផ្លាស់មកកម្ពុជា",
    description: "Tell us about your plans. Our team reviews every submission and will follow up by email.",
    descriptionKm: "ប្រាប់យើងអំពីផែនការរបស់អ្នក។ ក្រុមការងាររបស់យើងពិនិត្យរាល់ការដាក់ស្នើ ហើយនឹងទាក់ទងតាមអ៊ីមែល។",
    submitLabel: "Send my plans",
    fields: [
      ...common(),
      { key: "arrival_date", type: "DATE", label: "Intended arrival date", labelKm: "កាលបរិច្ឆេទមកដល់" },
      {
        key: "duration",
        type: "SELECT",
        label: "Expected duration in Cambodia",
        labelKm: "រយៈពេលរំពឹងទុក",
        required: true,
        options: opts([
          ["lt6m", "Less than 6 months"],
          ["6-12m", "6–12 months"],
          ["1-3y", "1–3 years"],
          ["3y-plus", "More than 3 years"],
          ["unsure", "Not sure yet"],
        ]),
      },
      {
        key: "reason",
        type: "RADIO",
        label: "Main reason for relocating",
        labelKm: "មូលហេតុចម្បងនៃការផ្លាស់ទីលំនៅ",
        required: true,
        options: opts([
          ["work", "Work"],
          ["family", "Family"],
          ["retirement", "Retirement"],
          ["study", "Study"],
          ["business", "Starting a business"],
          ["other", "Other"],
        ]),
      },
      {
        key: "housing",
        type: "CHECKBOX",
        label: "Housing requirements",
        labelKm: "តម្រូវការលំនៅដ្ឋាន",
        options: opts([
          ["serviced", "Serviced apartment"],
          ["apartment", "Apartment"],
          ["house", "House"],
          ["near_school", "Near international schools"],
          ["pets", "Pet friendly"],
        ]),
      },
      {
        key: "concerns",
        type: "TEXTAREA",
        label: "Biggest concerns",
        labelKm: "កង្វល់ធំបំផុត",
        validation: { maxLength: 2000 },
      },
      {
        key: "additional",
        type: "TEXTAREA",
        label: "Additional information",
        labelKm: "ព័ត៌មានបន្ថែម",
        validation: { maxLength: 2000 },
      },
    ],
  },
  {
    id: "form-visit",
    journey: "visit",
    title: "Plan your visit",
    titleKm: "រៀបចំដំណើរទស្សនកិច្ច",
    description: "Share your trip details and questions. We review each request and reply by email.",
    descriptionKm: "ចែករំលែកព័ត៌មានលម្អិត និងសំណួរអំពីដំណើររបស់អ្នក។ យើងពិនិត្យសំណើនីមួយៗ ហើយឆ្លើយតបតាមអ៊ីមែល។",
    submitLabel: "Send my trip details",
    fields: [
      ...common(),
      {
        key: "arrival_date",
        type: "DATE",
        label: "Planned arrival date",
        labelKm: "កាលបរិច្ឆេទមកដល់គ្រោងទុក",
        required: true,
      },
      {
        key: "length_of_stay",
        type: "NUMBER",
        label: "Length of stay (days)",
        labelKm: "រយៈពេលស្នាក់នៅ (ថ្ងៃ)",
        required: true,
        validation: { min: 1, max: 365 },
      },
      {
        key: "visitors",
        type: "NUMBER",
        label: "Number of visitors",
        labelKm: "ចំនួនភ្ញៀវ",
        required: true,
        validation: { min: 1, max: 50 },
      },
      {
        key: "purpose",
        type: "SELECT",
        label: "Main purpose of visit",
        labelKm: "គោលបំណងចម្បងនៃការទស្សនា",
        required: true,
        options: opts([
          ["holiday", "Holiday"],
          ["family", "Visiting family"],
          ["heritage", "Culture and heritage"],
          ["business", "Business trip"],
          ["volunteering", "Volunteering"],
          ["other", "Other"],
        ]),
      },
      {
        key: "places",
        type: "CHECKBOX",
        label: "Places of interest",
        labelKm: "ទីកន្លែងដែលចាប់អារម្មណ៍",
        options: opts([
          ["phnom_penh", "Phnom Penh"],
          ["siem_reap", "Siem Reap and Angkor"],
          ["coast", "Kampot, Kep and the coast"],
          ["islands", "Islands"],
          ["battambang", "Battambang"],
          ["north_east", "Mondulkiri and Ratanakiri"],
        ]),
      },
      {
        key: "questions",
        type: "TEXTAREA",
        label: "Questions or concerns",
        labelKm: "សំណួរ ឬកង្វល់",
        validation: { maxLength: 2000 },
      },
    ],
  },
  {
    id: "form-business",
    journey: "business",
    title: "Tell us about your business plans",
    titleKm: "ប្រាប់យើងអំពីផែនការអាជីវកម្មរបស់អ្នក",
    description:
      "We review every submission and follow up with relevant guidance and contacts. This is not legal or financial advice.",
    descriptionKm: "យើងពិនិត្យរាល់ការដាក់ស្នើ ហើយទាក់ទងមកវិញជាមួយមគ្គុទ្ទេសក៍ និងទំនាក់ទំនងពាក់ព័ន្ធ។",
    submitLabel: "Send my business plans",
    fields: [
      ...common(),
      {
        key: "business_type",
        type: "SELECT",
        label: "Business type",
        labelKm: "ប្រភេទអាជីវកម្ម",
        required: true,
        options: opts([
          ["new_company", "New company"],
          ["branch", "Branch of an existing company"],
          ["rep_office", "Representative office"],
          ["sole", "Sole proprietorship"],
          ["partnership", "Partnership"],
          ["unsure", "Not sure yet"],
        ]),
      },
      {
        key: "industry",
        type: "TEXT",
        label: "Industry",
        labelKm: "វិស័យ",
        required: true,
        validation: { maxLength: 120 },
      },
      {
        key: "investment_range",
        type: "SELECT",
        label: "Planned investment range (USD)",
        labelKm: "ទំហំការវិនិយោគគ្រោងទុក (ដុល្លារ)",
        options: opts([
          ["lt50k", "Under 50,000"],
          ["50-250k", "50,000–250,000"],
          ["250k-1m", "250,000–1 million"],
          ["1m-plus", "Over 1 million"],
          ["undisclosed", "Prefer not to say"],
        ]),
      },
      {
        key: "location",
        type: "TEXT",
        label: "Intended business location",
        labelKm: "ទីតាំងអាជីវកម្មគ្រោងទុក",
        validation: { maxLength: 120 },
      },
      {
        key: "timeline",
        type: "RADIO",
        label: "Expected starting timeline",
        labelKm: "ពេលវេលាចាប់ផ្តើមរំពឹងទុក",
        required: true,
        options: opts([
          ["0-3m", "Within 3 months"],
          ["3-6m", "3–6 months"],
          ["6-12m", "6–12 months"],
          ["12m-plus", "More than a year"],
        ]),
      },
      {
        key: "questions",
        type: "TEXTAREA",
        label: "Main business questions",
        labelKm: "សំណួរអាជីវកម្មសំខាន់ៗ",
        required: true,
        validation: { minLength: 10, maxLength: 3000 },
      },
    ],
  },
];

export const HOMEPAGE = {
  heroPrefix: "I want to",
  heroPrefixKm: "ខ្ញុំចង់",
  heroSuffix: "in Cambodia.",
  heroSuffixKm: "នៅប្រទេសកម្ពុជា។",
  heroSubtitle:
    "Clear, trustworthy guidance for living, visiting and doing business, plus the people and organizations who can help.",
  heroSubtitleKm:
    "មគ្គុទ្ទេសក៍ច្បាស់លាស់ និងគួរឱ្យទុកចិត្ត សម្រាប់ការរស់នៅ ការទស្សនា និងការធ្វើអាជីវកម្ម រួមទាំងបុគ្គល និងអង្គការដែលអាចជួយបាន។",
  ctaLabel: "Learn more",
  ctaLabelKm: "ស្វែងយល់បន្ថែម",
  sections: [
    { key: "journeys", enabled: true },
    { key: "guidance", enabled: true },
    { key: "directory", enabled: true },
    { key: "articles", enabled: true },
    { key: "resources", enabled: true },
    { key: "cta", enabled: true },
  ],
  resources: [
    {
      title: "Cambodia e-Visa (official)",
      titleKm: "ទិដ្ឋាការអេឡិចត្រូនិក (ផ្លូវការ)",
      url: SOURCES.evisa.url,
      description: "Apply for a tourist e-Visa online.",
      descriptionKm: "ដាក់ពាក្យសុំទិដ្ឋាការទេសចរតាមអនឡាញ។",
    },
    {
      title: "General Department of Immigration",
      titleKm: "អគ្គនាយកដ្ឋានអន្តោប្រវេសន៍",
      url: SOURCES.immigration.url,
      description: "Entry, stay and visa extensions.",
      descriptionKm: "ការចូល ការស្នាក់នៅ និងការពន្យារទិដ្ឋាការ។",
    },
    {
      title: "Online Business Registration",
      titleKm: "ការចុះបញ្ជីអាជីវកម្មតាមអនឡាញ",
      url: SOURCES.moc.url,
      description: "Ministry of Commerce company registration.",
      descriptionKm: "ការចុះបញ្ជីក្រុមហ៊ុននៃក្រសួងពាណិជ្ជកម្ម។",
    },
    {
      title: "Council for the Development of Cambodia",
      titleKm: "ក្រុមប្រឹក្សាអភិវឌ្ឍន៍កម្ពុជា",
      url: SOURCES.cdc.url,
      description: "Investment information and incentives.",
      descriptionKm: "ព័ត៌មាន និងការលើកទឹកចិត្តការវិនិយោគ។",
    },
    {
      title: "General Department of Taxation",
      titleKm: "អគ្គនាយកដ្ឋានពន្ធដារ",
      url: SOURCES.gdt.url,
      description: "Tax registration and e-filing.",
      descriptionKm: "ការចុះបញ្ជីពន្ធ និងការដាក់លិខិតប្រកាសតាមអេឡិចត្រូនិក។",
    },
  ],
};
