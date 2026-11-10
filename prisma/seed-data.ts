/**
 * DEVELOPMENT seed content — fictional people and organizations.
 * Khmer text is sample content and should be reviewed by a native speaker.
 */
type T = Record<string, string | null | undefined>;

export const LOCATIONS = [
  { slug: "cambodia", type: "COUNTRY", name: "Cambodia", nameKm: "កម្ពុជា", parent: null },
  { slug: "phnom-penh", type: "PROVINCE", name: "Phnom Penh", nameKm: "ភ្នំពេញ", parent: "cambodia" },
  { slug: "siem-reap", type: "PROVINCE", name: "Siem Reap", nameKm: "សៀមរាប", parent: "cambodia" },
  { slug: "battambang", type: "PROVINCE", name: "Battambang", nameKm: "បាត់ដំបង", parent: "cambodia" },
  { slug: "kampot", type: "PROVINCE", name: "Kampot", nameKm: "កំពត", parent: "cambodia" },
  { slug: "preah-sihanouk", type: "PROVINCE", name: "Preah Sihanouk", nameKm: "ព្រះសីហនុ", parent: "cambodia" },
  { slug: "united-states", type: "COUNTRY", name: "United States", nameKm: "សហរដ្ឋអាមេរិក", parent: null },
  { slug: "long-beach", type: "CITY", name: "Long Beach", nameKm: "ឡុងប៊ិច", parent: "united-states" },
  { slug: "france", type: "COUNTRY", name: "France", nameKm: "បារាំង", parent: null },
  { slug: "paris", type: "CITY", name: "Paris", nameKm: "ប៉ារីស", parent: "france" },
  { slug: "australia", type: "COUNTRY", name: "Australia", nameKm: "អូស្ត្រាលី", parent: null },
  { slug: "melbourne", type: "CITY", name: "Melbourne", nameKm: "មែលប៊ន", parent: "australia" },
] as const;

export const CATEGORIES = [
  // Industries
  { type: "INDUSTRY", slug: "technology", name: "Technology", nameKm: "បច្ចេកវិទ្យា", featured: true },
  { type: "INDUSTRY", slug: "agriculture", name: "Agriculture", nameKm: "កសិកម្ម", featured: true },
  { type: "INDUSTRY", slug: "education", name: "Education", nameKm: "អប់រំ", featured: true },
  { type: "INDUSTRY", slug: "health", name: "Health", nameKm: "សុខាភិបាល", featured: true },
  { type: "INDUSTRY", slug: "arts-culture", name: "Arts & Culture", nameKm: "សិល្បៈ និងវប្បធម៌", featured: true },
  { type: "INDUSTRY", slug: "finance", name: "Finance", nameKm: "ហិរញ្ញវត្ថុ", featured: true },
  {
    type: "INDUSTRY",
    slug: "tourism",
    name: "Tourism & Hospitality",
    nameKm: "ទេសចរណ៍ និងបដិសណ្ឋារកិច្ច",
    featured: false,
  },
  { type: "INDUSTRY", slug: "social-enterprise", name: "Social Enterprise", nameKm: "សហគ្រាសសង្គម", featured: false },
  // People
  { type: "PEOPLE", slug: "entrepreneurs", name: "Entrepreneurs", nameKm: "សហគ្រិន", featured: true },
  {
    type: "PEOPLE",
    slug: "artists",
    name: "Artists & Creatives",
    nameKm: "សិល្បករ និងអ្នកច្នៃប្រឌិត",
    featured: false,
  },
  {
    type: "PEOPLE",
    slug: "researchers",
    name: "Researchers & Academics",
    nameKm: "អ្នកស្រាវជ្រាវ និងអ្នកសិក្សា",
    featured: false,
  },
  { type: "PEOPLE", slug: "community-leaders", name: "Community Leaders", nameKm: "មេដឹកនាំសហគមន៍", featured: false },
  {
    type: "PEOPLE",
    slug: "returnees",
    name: "Diaspora Returnees",
    nameKm: "ជនកម្ពុជាវិលត្រឡប់មកស្រុកវិញ",
    featured: false,
  },
  // Organizations
  { type: "ORGANIZATION", slug: "companies", name: "Companies", nameKm: "ក្រុមហ៊ុន", featured: false },
  { type: "ORGANIZATION", slug: "ngos", name: "NGOs", nameKm: "អង្គការមិនមែនរដ្ឋាភិបាល", featured: false },
  { type: "ORGANIZATION", slug: "associations", name: "Associations", nameKm: "សមាគម", featured: false },
  {
    type: "ORGANIZATION",
    slug: "education-institutions",
    name: "Education Institutions",
    nameKm: "គ្រឹះស្ថានអប់រំ",
    featured: false,
  },
  // Articles
  {
    type: "ARTICLE",
    slug: "interviews",
    name: "Profiles & Interviews",
    nameKm: "ប្រវត្តិរូប និងបទសម្ភាសន៍",
    featured: false,
  },
  { type: "ARTICLE", slug: "business", name: "Business", nameKm: "ពាណិជ្ជកម្ម", featured: false },
  { type: "ARTICLE", slug: "culture", name: "Culture", nameKm: "វប្បធម៌", featured: false },
  { type: "ARTICLE", slug: "community", name: "Community", nameKm: "សហគមន៍", featured: false },
  { type: "ARTICLE", slug: "guides", name: "Guides", nameKm: "មគ្គុទ្ទេសក៍", featured: false },
] as const;

export const TAGS = [
  { slug: "startups", name: "Startups", nameKm: "ស្តាតអាប់" },
  { slug: "diaspora", name: "Diaspora", nameKm: "ជនកម្ពុជានៅក្រៅប្រទេស" },
  { slug: "women-in-leadership", name: "Women in leadership", nameKm: "ស្ត្រីក្នុងភាពជាអ្នកដឹកនាំ" },
  { slug: "education", name: "Education", nameKm: "ការអប់រំ" },
  { slug: "agritech", name: "Agritech", nameKm: "បច្ចេកវិទ្យាកសិកម្ម" },
  { slug: "heritage", name: "Heritage", nameKm: "បេតិកភណ្ឌ" },
  { slug: "climate", name: "Climate", nameKm: "អាកាសធាតុ" },
  { slug: "youth", name: "Youth", nameKm: "យុវជន" },
  { slug: "health", name: "Health", nameKm: "សុខភាព" },
] as const;

export const SKILLS = [
  { slug: "software-engineering", name: "Software Engineering", nameKm: "វិស្វកម្មកម្មវិធី" },
  { slug: "product-management", name: "Product Management", nameKm: "ការគ្រប់គ្រងផលិតផល" },
  { slug: "data-science", name: "Data Science", nameKm: "វិទ្យាសាស្ត្រទិន្នន័យ" },
  { slug: "agronomy", name: "Agronomy", nameKm: "កសិវិទ្យា" },
  { slug: "public-health", name: "Public Health", nameKm: "សុខភាពសាធារណៈ" },
  { slug: "classical-dance", name: "Classical Dance", nameKm: "របាំបុរាណ" },
  { slug: "architecture", name: "Architecture", nameKm: "ស្ថាបត្យកម្ម" },
  { slug: "finance", name: "Finance", nameKm: "ហិរញ្ញវត្ថុ" },
  { slug: "marketing", name: "Marketing", nameKm: "ទីផ្សារ" },
  { slug: "teaching", name: "Teaching", nameKm: "ការបង្រៀន" },
  { slug: "photography", name: "Photography", nameKm: "ការថតរូប" },
  { slug: "renewable-energy", name: "Renewable Energy", nameKm: "ថាមពលកកើតឡើងវិញ" },
  { slug: "community-organizing", name: "Community Organizing", nameKm: "ការរៀបចំសហគមន៍" },
  { slug: "leadership", name: "Leadership", nameKm: "ភាពជាអ្នកដឹកនាំ" },
] as const;

export type SeedPerson = {
  slug: string;
  status: "PUBLISHED" | "DRAFT";
  featured: boolean;
  location: string;
  industry: string;
  category: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  en: T & { name: string };
  km?: T & { name: string };
  skills: string[];
  education: { institution: string; degree?: string; field?: string; startYear?: number; endYear?: number }[];
  experience: {
    title: string;
    organizationName: string;
    org?: string;
    startYear?: number;
    endYear?: number;
    description?: string;
  }[];
};

export const PEOPLE: SeedPerson[] = [
  {
    slug: "sokha-chan",
    status: "PUBLISHED",
    featured: true,
    location: "phnom-penh",
    industry: "technology",
    category: "entrepreneurs",
    websiteUrl: "https://example.com/sokha-chan",
    linkedinUrl: "https://www.linkedin.com/in/example-sokha",
    en: {
      name: "Sokha Chan",
      headline: "Founder & CEO, Mekong Solar",
      bio: "Sokha Chan founded Mekong Solar in 2016 to bring affordable, reliable electricity to rural households across Cambodia.\n\nTrained as an electrical engineer in Phnom Penh and Singapore, she now leads a team of 80 people installing solar micro-grids in more than 200 villages.",
    },
    km: {
      name: "ចាន់ សុខា",
      headline: "ស្ថាបនិក និងនាយកប្រតិបត្តិ មេគង្គសូឡា",
      bio: "ចាន់ សុខា បានបង្កើតក្រុមហ៊ុនមេគង្គសូឡានៅឆ្នាំ ២០១៦ ដើម្បីផ្តល់អគ្គិសនីដែលមានតម្លៃសមរម្យ និងអាចទុកចិត្តបានដល់គ្រួសារនៅតាមជនបទទូទាំងកម្ពុជា។",
    },
    skills: ["renewable-energy", "leadership", "product-management"],
    education: [
      {
        institution: "Institute of Technology of Cambodia",
        degree: "BSc",
        field: "Electrical Engineering",
        startYear: 2006,
        endYear: 2010,
      },
      {
        institution: "National University of Singapore",
        degree: "MSc",
        field: "Energy Systems",
        startYear: 2012,
        endYear: 2014,
      },
    ],
    experience: [
      { title: "Founder & CEO", organizationName: "Mekong Solar", org: "mekong-solar", startYear: 2016 },
      { title: "Project Engineer", organizationName: "Regional Energy Consultancy", startYear: 2014, endYear: 2016 },
    ],
  },
  {
    slug: "dara-keo",
    status: "PUBLISHED",
    featured: true,
    location: "phnom-penh",
    industry: "education",
    category: "entrepreneurs",
    websiteUrl: "https://example.com/dara-keo",
    en: {
      name: "Dara Keo",
      headline: "Software engineer and founder of KhmerCode Academy",
      bio: "Dara Keo teaches programming in Khmer to thousands of young Cambodians through KhmerCode Academy.\n\nBefore returning to Phnom Penh he spent six years as a backend engineer at technology companies in Seoul.",
    },
    km: {
      name: "កែវ ដារ៉ា",
      headline: "វិស្វករកម្មវិធី និងស្ថាបនិកសាលាខ្មែរកូដ",
      bio: "កែវ ដារ៉ា បង្រៀនការសរសេរកម្មវិធីជាភាសាខ្មែរដល់យុវជនកម្ពុជារាប់ពាន់នាក់ តាមរយៈសាលាខ្មែរកូដ។",
    },
    skills: ["software-engineering", "teaching", "leadership"],
    education: [
      {
        institution: "Royal University of Phnom Penh",
        degree: "BSc",
        field: "Computer Science",
        startYear: 2008,
        endYear: 2012,
      },
    ],
    experience: [
      { title: "Founder", organizationName: "KhmerCode Academy", org: "khmercode-academy", startYear: 2019 },
      { title: "Backend Engineer", organizationName: "Seoul-based technology company", startYear: 2013, endYear: 2019 },
    ],
  },
  {
    slug: "sreymom-pich",
    status: "PUBLISHED",
    featured: true,
    location: "siem-reap",
    industry: "arts-culture",
    category: "artists",
    facebookUrl: "https://www.facebook.com/example.sreymom",
    en: {
      name: "Sreymom Pich",
      headline: "Classical dancer and choreographer",
      bio: "Sreymom Pich has performed Cambodian classical dance on stages in Asia, Europe and North America.\n\nAs artistic director of the Apsara Arts Collective she trains the next generation of dancers and creates new works rooted in tradition.",
    },
    km: {
      name: "ពេជ្រ ស្រីមុំ",
      headline: "អ្នករបាំបុរាណ និងអ្នករចនារបាំ",
      bio: "ពេជ្រ ស្រីមុំ បានសម្តែងរបាំបុរាណខ្មែរនៅលើឆាកក្នុងទ្វីបអាស៊ី អឺរ៉ុប និងអាមេរិកខាងជើង។",
    },
    skills: ["classical-dance", "teaching"],
    education: [
      {
        institution: "Royal University of Fine Arts",
        degree: "BA",
        field: "Choreographic Arts",
        startYear: 2005,
        endYear: 2009,
      },
    ],
    experience: [
      {
        title: "Artistic Director",
        organizationName: "Apsara Arts Collective",
        org: "apsara-arts-collective",
        startYear: 2015,
      },
    ],
  },
  {
    slug: "vannak-heng",
    status: "PUBLISHED",
    featured: false,
    location: "battambang",
    industry: "agriculture",
    category: "researchers",
    en: {
      name: "Vannak Heng",
      headline: "Agronomist researching climate-resilient rice",
      bio: "Vannak Heng leads field trials of drought-tolerant rice varieties with farming cooperatives in north-western Cambodia.",
    },
    km: { name: "ហេង វណ្ណៈ", headline: "អ្នកកសិវិទ្យាស្រាវជ្រាវស្រូវធន់នឹងអាកាសធាតុ", bio: null },
    skills: ["agronomy", "data-science"],
    education: [
      {
        institution: "Royal University of Agriculture",
        degree: "PhD",
        field: "Plant Science",
        startYear: 2011,
        endYear: 2016,
      },
    ],
    experience: [
      {
        title: "Lead Agronomist",
        organizationName: "Golden Rice Research Center",
        org: "golden-rice-research-center",
        startYear: 2017,
      },
    ],
  },
  {
    slug: "bopha-lim",
    status: "PUBLISHED",
    featured: true,
    location: "phnom-penh",
    industry: "health",
    category: "community-leaders",
    en: {
      name: "Dr. Bopha Lim",
      headline: "Public health physician",
      bio: "Dr. Bopha Lim trains village health volunteers and has helped expand maternal-health services in four provinces.",
    },
    km: {
      name: "វេជ្ជបណ្ឌិត លឹម បុប្ផា",
      headline: "វេជ្ជបណ្ឌិតសុខភាពសាធារណៈ",
      bio: "វេជ្ជបណ្ឌិត លឹម បុប្ផា បណ្តុះបណ្តាលអ្នកស្ម័គ្រចិត្តសុខភាពភូមិ។",
    },
    skills: ["public-health", "leadership"],
    education: [{ institution: "University of Health Sciences", degree: "MD", startYear: 2003, endYear: 2010 }],
    experience: [
      {
        title: "Medical Director",
        organizationName: "Healthy Villages Cambodia",
        org: "healthy-villages-cambodia",
        startYear: 2018,
      },
    ],
  },
  {
    slug: "rithy-sok",
    status: "PUBLISHED",
    featured: false,
    location: "phnom-penh",
    industry: "arts-culture",
    category: "returnees",
    en: {
      name: "Rithy Sok",
      headline: "Architect who returned from Paris",
      bio: "After twelve years in Paris, Rithy Sok moved back to Phnom Penh to design public buildings that respond to the tropical climate.",
    },
    skills: ["architecture"],
    education: [
      {
        institution: "École nationale supérieure d'architecture",
        degree: "Master",
        field: "Architecture",
        startYear: 2009,
        endYear: 2014,
      },
    ],
    experience: [
      { title: "Design Advisor", organizationName: "Mekong Solar", org: "mekong-solar", startYear: 2021 },
      { title: "Architect", organizationName: "Paris architecture studio", startYear: 2014, endYear: 2021 },
    ],
  },
  {
    slug: "chenda-ouk",
    status: "PUBLISHED",
    featured: false,
    location: "melbourne",
    industry: "technology",
    category: "returnees",
    linkedinUrl: "https://www.linkedin.com/in/example-chenda",
    en: {
      name: "Chenda Ouk",
      headline: "Data scientist in Melbourne",
      bio: "Chenda Ouk builds forecasting models for a logistics company and volunteers as data lead for the Cambodian Diaspora Network.",
    },
    km: { name: "អ៊ុក ចិន្តា", headline: "អ្នកវិទ្យាសាស្ត្រទិន្នន័យនៅទីក្រុងមែលប៊ន", bio: null },
    skills: ["data-science", "software-engineering"],
    education: [
      { institution: "University of Melbourne", degree: "MSc", field: "Data Science", startYear: 2015, endYear: 2017 },
    ],
    experience: [{ title: "Senior Data Scientist", organizationName: "Logistics company", startYear: 2018 }],
  },
  {
    slug: "piseth-nhem",
    status: "PUBLISHED",
    featured: false,
    location: "phnom-penh",
    industry: "finance",
    category: "entrepreneurs",
    en: {
      name: "Piseth Nhem",
      headline: "Co-founder & CEO, Riel Pay",
      bio: "Piseth Nhem co-founded Riel Pay, a mobile payments app used by small merchants in markets across Cambodia.",
    },
    km: { name: "ញ៉ែម ពិសិដ្ឋ", headline: "សហស្ថាបនិក និងនាយកប្រតិបត្តិ រៀលផេ", bio: null },
    skills: ["finance", "product-management", "marketing"],
    education: [{ institution: "National University of Management", degree: "MBA", startYear: 2012, endYear: 2014 }],
    experience: [{ title: "Co-founder & CEO", organizationName: "Riel Pay", org: "riel-pay", startYear: 2020 }],
  },
  {
    slug: "kanha-meas",
    status: "PUBLISHED",
    featured: false,
    location: "kampot",
    industry: "arts-culture",
    category: "artists",
    en: {
      name: "Kanha Meas",
      headline: "Documentary photographer",
      bio: "Kanha Meas photographs everyday life along Cambodia's coast and rivers. Her work has been exhibited in Phnom Penh and Bangkok.",
    },
    skills: ["photography"],
    education: [],
    experience: [
      {
        title: "Photographer",
        organizationName: "Apsara Arts Collective",
        org: "apsara-arts-collective",
        startYear: 2019,
      },
    ],
  },
  {
    slug: "sophal-yim",
    status: "PUBLISHED",
    featured: false,
    location: "long-beach",
    industry: "social-enterprise",
    category: "community-leaders",
    en: {
      name: "Sophal Yim",
      headline: "Executive Director, Cambodian Diaspora Network",
      bio: "Sophal Yim connects Cambodian-American families in Long Beach with language classes, mentoring and opportunities in Cambodia.",
    },
    km: { name: "យឹម សុផល", headline: "នាយកប្រតិបត្តិ បណ្តាញជនកម្ពុជានៅក្រៅប្រទេស", bio: null },
    skills: ["community-organizing", "leadership"],
    education: [
      {
        institution: "California State University, Long Beach",
        degree: "BA",
        field: "Sociology",
        startYear: 2004,
        endYear: 2008,
      },
    ],
    experience: [
      {
        title: "Executive Director",
        organizationName: "Cambodian Diaspora Network",
        org: "cambodian-diaspora-network",
        startYear: 2016,
      },
    ],
  },
  {
    slug: "malis-touch",
    status: "PUBLISHED",
    featured: false,
    location: "siem-reap",
    industry: "education",
    category: "community-leaders",
    en: {
      name: "Malis Touch",
      headline: "Director, Bright Futures Learning Center",
      bio: "Malis Touch runs free after-school English and computer classes for 400 children in Siem Reap province.",
    },
    km: { name: "ទូច ម្លិះ", headline: "នាយិកា មជ្ឈមណ្ឌលសិក្សាអនាគតភ្លឺស្វាង", bio: null },
    skills: ["teaching", "leadership"],
    education: [
      {
        institution: "Royal University of Phnom Penh",
        degree: "BEd",
        field: "English",
        startYear: 2007,
        endYear: 2011,
      },
    ],
    experience: [
      {
        title: "Director",
        organizationName: "Bright Futures Learning Center",
        org: "bright-futures-learning-center",
        startYear: 2014,
      },
    ],
  },
  {
    slug: "vuthy-chea",
    status: "DRAFT", // unpublished example: must not appear publicly
    featured: false,
    location: "kampot",
    industry: "tourism",
    category: "entrepreneurs",
    en: {
      name: "Vuthy Chea",
      headline: "Eco-tourism entrepreneur (draft profile)",
      bio: "Draft profile awaiting review.",
    },
    skills: ["marketing"],
    education: [],
    experience: [],
  },
];

export type SeedOrg = {
  slug: string;
  status: "PUBLISHED" | "DRAFT";
  featured: boolean;
  location: string;
  industry: string;
  category: string;
  foundedYear?: number;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  facebookUrl?: string;
  en: T & { name: string };
  km?: T & { name: string };
  members: { person: string; role: string; key: boolean }[];
};

export const ORGANIZATIONS: SeedOrg[] = [
  {
    slug: "mekong-solar",
    status: "PUBLISHED",
    featured: true,
    location: "phnom-penh",
    industry: "technology",
    category: "companies",
    foundedYear: 2016,
    websiteUrl: "https://example.com/mekong-solar",
    email: "hello@example.com",
    en: {
      name: "Mekong Solar",
      tagline: "Clean, affordable power for rural Cambodia",
      description:
        "Mekong Solar designs, installs and maintains solar micro-grids for villages that are not connected to the national grid.",
      mission: "Give every rural household access to reliable, affordable electricity.",
      vision: "A Cambodia where no village is left in the dark.",
      activities: "Solar micro-grid installation\nPay-as-you-go home solar kits\nTraining local technicians",
      address: "Street 240, Daun Penh, Phnom Penh",
    },
    km: {
      name: "មេគង្គសូឡា",
      tagline: "ថាមពលស្អាត និងមានតម្លៃសមរម្យសម្រាប់ជនបទកម្ពុជា",
      description:
        "មេគង្គសូឡា រចនា តម្លើង និងថែទាំប្រព័ន្ធអគ្គិសនីពន្លឺព្រះអាទិត្យខ្នាតតូចសម្រាប់ភូមិដែលមិនទាន់មានបណ្តាញអគ្គិសនីជាតិ។",
      mission: "ផ្តល់អគ្គិសនីដែលអាចទុកចិត្តបាន និងមានតម្លៃសមរម្យដល់គ្រប់គ្រួសារនៅជនបទ។",
      vision: null,
      activities: "តម្លើងប្រព័ន្ធអគ្គិសនីពន្លឺព្រះអាទិត្យ\nបណ្តុះបណ្តាលអ្នកបច្ចេកទេសក្នុងតំបន់",
      address: "ផ្លូវ ២៤០ ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ",
    },
    members: [
      { person: "sokha-chan", role: "Founder & CEO", key: true },
      { person: "rithy-sok", role: "Design Advisor", key: false },
    ],
  },
  {
    slug: "khmercode-academy",
    status: "PUBLISHED",
    featured: true,
    location: "phnom-penh",
    industry: "education",
    category: "education-institutions",
    foundedYear: 2019,
    websiteUrl: "https://example.com/khmercode",
    en: {
      name: "KhmerCode Academy",
      tagline: "Learn to code in Khmer",
      description:
        "KhmerCode Academy offers free and low-cost programming courses taught in Khmer, online and in Phnom Penh.",
      mission: "Make software careers accessible to every young Cambodian.",
      activities: "Online Khmer-language coding courses\nWeekend bootcamps\nCareer mentoring",
    },
    km: {
      name: "សាលាខ្មែរកូដ",
      tagline: "រៀនសរសេរកម្មវិធីជាភាសាខ្មែរ",
      description:
        "សាលាខ្មែរកូដ ផ្តល់វគ្គសិក្សាសរសេរកម្មវិធីជាភាសាខ្មែរ ដោយឥតគិតថ្លៃ ឬតម្លៃទាប ទាំងតាមអនឡាញ និងនៅភ្នំពេញ។",
    },
    members: [{ person: "dara-keo", role: "Founder", key: true }],
  },
  {
    slug: "apsara-arts-collective",
    status: "PUBLISHED",
    featured: true,
    location: "siem-reap",
    industry: "arts-culture",
    category: "associations",
    foundedYear: 2012,
    facebookUrl: "https://www.facebook.com/example.apsara",
    en: {
      name: "Apsara Arts Collective",
      tagline: "Keeping Cambodian classical dance alive",
      description:
        "A community of dancers, musicians and artists who teach, perform and document Cambodian classical arts.",
      mission: "Preserve and renew Cambodia's performing-arts heritage.",
      activities: "Weekly dance classes for children\nPublic performances\nArchive of traditional repertoire",
    },
    km: { name: "សមូហភាពសិល្បៈអប្សរា", tagline: "ថែរក្សារបាំបុរាណខ្មែរ", description: null },
    members: [
      { person: "sreymom-pich", role: "Artistic Director", key: true },
      { person: "kanha-meas", role: "Photographer", key: false },
    ],
  },
  {
    slug: "golden-rice-research-center",
    status: "PUBLISHED",
    featured: false,
    location: "battambang",
    industry: "agriculture",
    category: "ngos",
    foundedYear: 2010,
    en: {
      name: "Golden Rice Research Center",
      tagline: "Climate-smart farming research",
      description:
        "An independent research center working with farmer cooperatives on resilient rice varieties and water management.",
      activities: "Field trials\nFarmer training\nSeed bank",
    },
    km: { name: "មជ្ឈមណ្ឌលស្រាវជ្រាវស្រូវមាស", tagline: "ការស្រាវជ្រាវកសិកម្មឆ្លាតវៃនឹងអាកាសធាតុ", description: null },
    members: [{ person: "vannak-heng", role: "Lead Agronomist", key: true }],
  },
  {
    slug: "healthy-villages-cambodia",
    status: "PUBLISHED",
    featured: true,
    location: "phnom-penh",
    industry: "health",
    category: "ngos",
    foundedYear: 2008,
    en: {
      name: "Healthy Villages Cambodia",
      tagline: "Community health, village by village",
      description:
        "Healthy Villages Cambodia trains and supports village health volunteers in maternal care, nutrition and hygiene.",
      mission: "Bring basic health care within walking distance of every family.",
      activities: "Village health volunteer training\nMobile clinics\nNutrition programs",
    },
    km: {
      name: "ភូមិសុខភាពកម្ពុជា",
      tagline: "សុខភាពសហគមន៍ ពីភូមិមួយទៅភូមិមួយ",
      description: "ភូមិសុខភាពកម្ពុជា បណ្តុះបណ្តាល និងគាំទ្រអ្នកស្ម័គ្រចិត្តសុខភាពភូមិ។",
    },
    members: [{ person: "bopha-lim", role: "Medical Director", key: true }],
  },
  {
    slug: "riel-pay",
    status: "PUBLISHED",
    featured: false,
    location: "phnom-penh",
    industry: "finance",
    category: "companies",
    foundedYear: 2020,
    en: {
      name: "Riel Pay",
      tagline: "Simple mobile payments for small merchants",
      description: "Riel Pay lets market vendors accept QR payments in riel and dollars and track their daily sales.",
    },
    km: { name: "រៀលផេ", tagline: "ការទូទាត់តាមទូរស័ព្ទដ៏សាមញ្ញសម្រាប់អាជីវករខ្នាតតូច", description: null },
    members: [{ person: "piseth-nhem", role: "Co-founder & CEO", key: true }],
  },
  {
    slug: "cambodian-diaspora-network",
    status: "PUBLISHED",
    featured: false,
    location: "long-beach",
    industry: "social-enterprise",
    category: "associations",
    foundedYear: 2016,
    en: {
      name: "Cambodian Diaspora Network",
      tagline: "Connecting Cambodians around the world",
      description:
        "A volunteer-run network linking Cambodian communities abroad with each other and with opportunities at home.",
      activities: "Khmer language classes\nMentoring program\nAnnual diaspora summit",
    },
    km: { name: "បណ្តាញជនកម្ពុជានៅក្រៅប្រទេស", tagline: "តភ្ជាប់ជនកម្ពុជាទូទាំងពិភពលោក", description: null },
    members: [
      { person: "sophal-yim", role: "Executive Director", key: true },
      { person: "chenda-ouk", role: "Volunteer Data Lead", key: false },
    ],
  },
  {
    slug: "bright-futures-learning-center",
    status: "PUBLISHED",
    featured: false,
    location: "siem-reap",
    industry: "education",
    category: "ngos",
    foundedYear: 2014,
    en: {
      name: "Bright Futures Learning Center",
      tagline: "Free after-school learning in Siem Reap",
      description:
        "Bright Futures offers free English, computer and life-skills classes to children from low-income families.",
    },
    km: { name: "មជ្ឈមណ្ឌលសិក្សាអនាគតភ្លឺស្វាង", tagline: null, description: null },
    members: [{ person: "malis-touch", role: "Director", key: true }],
  },
];

export type SeedArticle = {
  slug: string;
  status: "PUBLISHED" | "DRAFT";
  featured: boolean;
  category: string;
  author?: string;
  publishedAt: string;
  tags: string[];
  people: string[];
  orgs: string[];
  en: T & { title: string; body: string };
  km?: T & { title: string; body: string };
};

export const ARTICLES: SeedArticle[] = [
  {
    slug: "how-mekong-solar-is-lighting-up-rural-cambodia",
    status: "PUBLISHED",
    featured: true,
    category: "business",
    author: "chenda-ouk",
    publishedAt: "2026-10-28",
    tags: ["startups", "climate"],
    people: ["sokha-chan"],
    orgs: ["mekong-solar"],
    en: {
      title: "How Mekong Solar is lighting up rural Cambodia",
      excerpt:
        "Ten years after its founding, Mekong Solar powers more than 200 villages. Founder Sokha Chan explains what it took.",
      body: 'When Sokha Chan visited her grandmother\'s village in 2015, the only light after dark came from kerosene lamps.\n\n## Starting small\n\nMekong Solar began with a single micro-grid serving 40 households. Today the company operates in **eight provinces**.\n\n- Pay-as-you-go pricing keeps costs low\n- Local technicians handle maintenance\n- Every installation is monitored remotely\n\n> "Electricity changes how children study and how families earn a living."\n\nThe company now plans to expand into solar-powered water pumps for farmers.',
    },
    km: {
      title: "របៀបដែលមេគង្គសូឡាកំពុងបំភ្លឺជនបទកម្ពុជា",
      excerpt: "ដប់ឆ្នាំបន្ទាប់ពីការបង្កើត មេគង្គសូឡាផ្គត់ផ្គង់អគ្គិសនីដល់ភូមិជាង ២០០។",
      body: "នៅពេលដែល ចាន់ សុខា ទៅលេងភូមិរបស់ជីដូនគាត់នៅឆ្នាំ ២០១៥ ពន្លឺតែមួយគត់នៅពេលយប់គឺចង្កៀងប្រេងកាត។\n\nសព្វថ្ងៃ ក្រុមហ៊ុនមេគង្គសូឡា ដំណើរការនៅក្នុងខេត្តចំនួនប្រាំបី។",
    },
  },
  {
    slug: "keeping-apsara-alive-sreymom-pich",
    status: "PUBLISHED",
    featured: true,
    category: "interviews",
    publishedAt: "2026-10-20",
    tags: ["heritage", "women-in-leadership"],
    people: ["sreymom-pich", "kanha-meas"],
    orgs: ["apsara-arts-collective"],
    en: {
      title: "Keeping Apsara alive: a conversation with Sreymom Pich",
      excerpt: "The choreographer talks about tradition, innovation and training the next generation of dancers.",
      body: 'Sreymom Pich began dancing at the age of seven.\n\n## Tradition and change\n\n"Classical dance is a living language," she says. "If we only repeat, it will slowly disappear. If we change too much, it is no longer ours."\n\nThe Apsara Arts Collective now teaches more than 120 children every week.',
    },
    km: {
      title: "ថែរក្សាអប្សរា៖ ការសន្ទនាជាមួយ ពេជ្រ ស្រីមុំ",
      excerpt: "អ្នករចនារបាំនិយាយអំពីប្រពៃណី ការច្នៃប្រឌិត និងការបណ្តុះបណ្តាលអ្នករបាំជំនាន់ក្រោយ។",
      body: "ពេជ្រ ស្រីមុំ បានចាប់ផ្តើមរាំតាំងពីអាយុប្រាំពីរឆ្នាំ។\n\nសមូហភាពសិល្បៈអប្សរា បច្ចុប្បន្នបង្រៀនកុមារជាង ១២០ នាក់ជារៀងរាល់សប្តាហ៍។",
    },
  },
  {
    slug: "coming-home-returnees-in-phnom-penh",
    status: "PUBLISHED",
    featured: false,
    category: "community",
    author: "sophal-yim",
    publishedAt: "2026-10-12",
    tags: ["diaspora"],
    people: ["rithy-sok", "dara-keo"],
    orgs: ["cambodian-diaspora-network"],
    en: {
      title: "Coming home: returnees on rebuilding life in Phnom Penh",
      excerpt: "An architect and a software engineer share what surprised them most after moving back.",
      body: "More Cambodians who grew up or studied abroad are choosing to return.\n\n## What helped\n\n- Finding a community of other returnees\n- Learning how local businesses work\n- Patience with paperwork\n\nRithy Sok, who spent twelve years in Paris, says the hardest part was not the climate but rebuilding a professional network.",
    },
  },
  {
    slug: "guide-to-cambodias-startup-ecosystem",
    status: "PUBLISHED",
    featured: false,
    category: "guides",
    author: "piseth-nhem",
    publishedAt: "2026-09-30",
    tags: ["startups", "youth"],
    people: ["piseth-nhem", "sokha-chan"],
    orgs: ["riel-pay", "khmercode-academy"],
    en: {
      title: "A beginner's guide to Cambodia's startup ecosystem",
      excerpt:
        "Accelerators, funding, talent and regulation — where to start if you want to build a company in Cambodia.",
      body: "Cambodia's startup scene has grown quickly over the last decade.\n\n## Where to begin\n\n1. Meet other founders at community events\n2. Talk to customers before building\n3. Understand company registration early\n\nRead our profiles of [Riel Pay](/organizations/riel-pay) and [Mekong Solar](/organizations/mekong-solar) for real examples.",
    },
    km: {
      title: "មគ្គុទ្ទេសក៍សម្រាប់អ្នកចាប់ផ្តើមអំពីប្រព័ន្ធស្តាតអាប់នៅកម្ពុជា",
      excerpt: "កន្លែងដែលត្រូវចាប់ផ្តើម ប្រសិនបើអ្នកចង់បង្កើតក្រុមហ៊ុននៅកម្ពុជា។",
      body: "វិស័យស្តាតអាប់នៅកម្ពុជាបានរីកចម្រើនយ៉ាងឆាប់រហ័សក្នុងរយៈពេលមួយទសវត្សរ៍ចុងក្រោយនេះ។",
    },
  },
  {
    slug: "climate-smart-rice-lessons-from-battambang",
    status: "PUBLISHED",
    featured: false,
    category: "business",
    author: "vannak-heng",
    publishedAt: "2026-09-18",
    tags: ["agritech", "climate"],
    people: ["vannak-heng"],
    orgs: ["golden-rice-research-center"],
    en: {
      title: "Climate-smart rice: lessons from Battambang",
      excerpt: "Three seasons of field trials show how drought-tolerant varieties can protect farmers' incomes.",
      body: "Rice farmers in Battambang have faced shorter, less predictable rainy seasons.\n\nTrials led by the Golden Rice Research Center found that drought-tolerant varieties kept yields stable in two of three dry years.",
    },
    km: {
      title: "ស្រូវឆ្លាតវៃនឹងអាកាសធាតុ៖ មេរៀនពីបាត់ដំបង",
      excerpt: "ការពិសោធន៍រយៈពេលបីរដូវបង្ហាញពីរបៀបដែលពូជស្រូវធន់នឹងគ្រោះរាំងស្ងួតអាចការពារប្រាក់ចំណូលកសិករ។",
      body: "កសិករដាំស្រូវនៅបាត់ដំបងបានជួបប្រទះរដូវវស្សាដែលខ្លី និងពិបាកទស្សន៍ទាយ។",
    },
  },
  {
    slug: "village-health-volunteers-on-the-front-line",
    status: "PUBLISHED",
    featured: false,
    category: "community",
    publishedAt: "2026-09-02",
    tags: ["health", "women-in-leadership"],
    people: ["bopha-lim"],
    orgs: ["healthy-villages-cambodia"],
    en: {
      title: "Village health volunteers on the front line",
      excerpt: "How a network of trained volunteers is improving maternal health in rural provinces.",
      body: "Healthy Villages Cambodia has trained more than 1,500 village health volunteers since 2008.\n\nDr. Bopha Lim says the volunteers are trusted because they are neighbours first.",
    },
  },
  {
    slug: "teaching-code-in-khmer",
    status: "PUBLISHED",
    featured: false,
    category: "interviews",
    publishedAt: "2026-08-21",
    tags: ["education", "youth"],
    people: ["dara-keo"],
    orgs: ["khmercode-academy"],
    en: {
      title: "Teaching code in Khmer",
      excerpt: "Why Dara Keo believes young Cambodians learn programming faster in their own language.",
      body: "Most programming tutorials are in English. Dara Keo wanted to change that.\n\nKhmerCode Academy's courses now have more than 20,000 registered learners.",
    },
    km: {
      title: "បង្រៀនសរសេរកម្មវិធីជាភាសាខ្មែរ",
      excerpt: "ហេតុអ្វីបានជា កែវ ដារ៉ា ជឿថាយុវជនកម្ពុជារៀនសរសេរកម្មវិធីបានលឿនជាងតាមរយៈភាសាកំណើត។",
      body: "មេរៀនសរសេរកម្មវិធីភាគច្រើនជាភាសាអង់គ្លេស។ កែវ ដារ៉ា ចង់ផ្លាស់ប្តូររឿងនេះ។",
    },
  },
  {
    slug: "diaspora-investment-trends-draft",
    status: "DRAFT", // unpublished example
    featured: false,
    category: "business",
    publishedAt: "2026-11-01",
    tags: ["diaspora"],
    people: [],
    orgs: [],
    en: { title: "Diaspora investment trends (draft)", excerpt: "Draft article.", body: "Work in progress." },
  },
];
