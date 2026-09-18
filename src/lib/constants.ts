import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  LocationIcon,
  TikTokIcon,
} from "@/components/hero/social-icons";

export const IS_PHASE_2 = false;

export const heroLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/lighthouseisb",
    icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/lighthouse.isb",
    icon: InstagramIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/light-house-islamabad",
    icon: LinkedinIcon,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@light.house.isb",
    icon: TikTokIcon,
  },
  { label: "Location", href: "/contact#showrooms", icon: LocationIcon },
];

export const marqueeText = [
  "Pendant Lights",
  "Chandeliers",
  "Wall Lights",
  "Ceiling Lights",
  "Track Lights",
  "Spot Lights",
  "Outdoor Lights",
];

export const dummyCategories = [
  {
    id: "pendant-lights",
    title: "Pendant Lights",
    items: 69,
    href: "/categories/pendant-lights",
  },
  {
    id: "floor-lamps",
    title: "Floor Lamps",
    items: 41,
    href: "/categories/floor-lamps",
  },
  {
    id: "wall-lights",
    title: "Wall lights",
    items: 29,
    href: "/categories/wall-lights",
  },
  {
    id: "chandeliers",
    title: "Chandeliers",
    items: 19,
    href: "/categories/chandeliers",
  },
];

export const dummyProducts = [
  {
    id: "aurora-brass-desk-lamp",
    title: "Aurora Brass Desk Lamp",
    price: "Rs. 18,900",
  },
  {
    id: "marble-aura-table-lamp",
    title: "Marble Aura Table Lamp",
    price: "Rs. 16,900",
  },
  {
    id: "luna-arc-floor-lamp",
    title: "Luna Arc Floor Lamp",
    price: "Rs. 28,900",
  },
  {
    id: "elysian-feather-floor-lamp",
    title: "Elysian Feather Floor Lamp",
    price: "Rs. 34,900",
  },
  {
    id: "aurora-brass-desk-lamp-alt",
    title: "Aurora Brass Desk Lamp",
    price: "Rs. 18,900",
  },
  {
    id: "crystal-bloom-table-lamp",
    title: "Crystal Bloom Table Lamp",
    price: "Rs. 22,900",
  },
];

export const dummyProjects = [
  {
    id: "the-oak-residence",
    title: "The Oak Residence",
    subtitle: "Residential Lighting Design",
    link: "/projects/oak-residence",
    image: "/projects/oak-residence.png",
  },
  {
    id: "aurora-penthouse",
    title: "Aurora Penthouse",
    subtitle: "Luxury Apartment Lighting",
    link: "/projects/aurora-penthouse",
    image: "/projects/aurora-penthouse.png",
  },
  {
    id: "skyline-bedroom",
    title: "Skyline Bedroom",
    subtitle: "Bedroom Lighting Design",
    link: "/projects/skyline-bedroom",
    image: "/projects/skyline-bedroom.png",
  },
];

export const clients = [
  {
    id: "client-001",
    name: "Behbud Hospital",
    imageURL: "/clients/behbud-hospital.png",
  },
  {
    id: "client-002",
    name: "Eighteen Society",
    imageURL: "/clients/eighteen-society.png",
  },
  {
    id: "client-003",
    name: "Islamabad Club",
    imageURL: "/clients/islamabad-club.png",
  },
  {
    id: "client-004",
    name: "Marriot Hotel",
    imageURL: "/clients/marriot.png",
  },
  {
    id: "client-005",
    name: "Taj Residencia",
    imageURL: "/clients/taj-residencia.png",
  },
  {
    id: "client-006",
    name: "Zeeta Mall",
    imageURL: "/clients/zeeta-mall.png",
  },
  {
    id: "client-007",
    name: "Faisal Hills",
    imageURL: "/clients/faisal-hills.png",
  },
  // {
  //   id: "client-008",
  //   name: "Unilever",
  //   imageURL: "https://cdn.simpleicons.org/unilever",
  // },
  // {
  //   id: "client-009",
  //   name: "McDonald's",
  //   imageURL: "https://cdn.simpleicons.org/mcdonalds",
  // },
  // {
  //   id: "client-010",
  //   name: "Marriott",
  //   imageURL: "https://cdn.simpleicons.org/marriott",
  // },
];

export const featuredBlogs = [
  {
    category: "INTERIOR DESIGN",
    title: "How to Choose the Perfect Pendant Light for Every Room",
    description:
      "Discover how size, placement and style can transform kitchens, dining areas and living spaces with the...",
    readTime: "5 min read",
    imageUrl: "/blogs/1.png",
  },
  {
    category: "BUYING GUIDE",
    title: "7 Common Lighting Mistakes and How to Avoid Them",
    description:
      "From incorrect fixture sizing to poor layering, learn the most common lighting mistakes and simple...",
    readTime: "5 min read",
    imageUrl: "/blogs/2.png",
  },
  {
    category: "LIGHTING TRENDS",
    title: "Top Modern Lighting Trends Transforming Homes in 2026",
    description:
      "Explore the latest trends in luxury lighting, warm ambient tones and statement fixtures that are...",
    readTime: "5 min read",
    imageUrl: "/blogs/3.png",
  },
];

export const footerNav = [
  {
    heading: "Products",
    links: [
      { label: "Pendant Lights", href: "/category/pendant-lights" },
      { label: "Chandeliers", href: "/category/chandeliers" },
      { label: "Wall Lights", href: "/category/wall-lights" },
      { label: "Commercial Lights", href: "/category/commercial" },
      { label: "Gate & Garden Lights", href: "/category/outdoor" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Projects", href: "/projects" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Blog", href: "/blogs" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms and Conditions", href: "/terms" },
      { label: "FAQs", href: "/faqs" },
      { label: "Shipping and Return", href: "/shipping" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "Islamabad, Pakistan", href: "" },
      { label: "+92 21 3456 7890", href: "tel:+922134567890" },
      { label: "+92 300 1234 567", href: "https://wa.me/923001234567" },
      { label: "hello@lighthouse.pk", href: "mailto:hello@lighthouse.pk" },
      { label: "Mon-Sat \u2022 9AM-7PM", href: "" },
    ],
  },
];

export const aboutStats = [
  { value: "180+", label: "PROJECTS DELIVERED" },
  { value: "98%", label: "CLIENT SATISFACTION" },
  { value: "40+", label: "CITIES SERVED" },
  { value: "08", label: "YEARS OF PRACTICE" },
];

export const howWeWork = [
  {
    number: "01",
    title: "Craftsmanship First",
    description:
      "Every fixture we source is held to a single standard — would we put it in our own home? If not, it doesn't reach a client's.",
  },
  {
    number: "02",
    title: "Light as Architecture",
    description:
      "We treat lighting as a structural element, not a finish. The conversation starts at floor plan stage, not after the walls are painted.",
  },
  {
    number: "03",
    title: "Honest Advice",
    description:
      "We recommend what's right for the space, not what's most expensive. Our reputation is built on rooms that still look good in ten years.",
  },
  {
    number: "04",
    title: "End-to-End Service",
    description:
      "From brief through installation and aftercare — one team, one point of contact, no handoffs that lose detail.",
  },
];

export const ceoMessage = {
  name: "Raja Abdul Ghaffar",
  role: "CEO @ lighthouse",
  image: "/ceo.webp",
  message: [
    "Raja Abdul Ghaffar is the CEO and founder of the newly emerging Lighthouse that was established in 2018. Mr Ghaffar is a highly qualified and learned person with 26 years of experience in the lighting business. As the leader of Lighthouse, he leads all the design, engineering, and manufacturing of the lighting products. Since the inception of Lighthouse after 26 years of his untiring service in the lighting sector, he has finally pooled in all his previous knowledge and experience to bring a new wave of innovative high-potential products.",
    "Mr Ghaffar is a visionary and a person with highly noticeable 26 years of experience in this industry offering excellent services.Now he has embarked on this mission to offer cost- effective, international- standard and efficient lighting products.Lighthouse has the privilege to produce world - class lighting products while following all international standards.",
    "Mr Ghaffar has proved his worth in all his previous 26 years of experience and now as the CEO of Lighthouse that he and his company has all the potential to bring much-needed change and lighting products to the market. Mr Ghaffar has personally focused his energies on establishing a state-of-the-art company while offering a chance to the consumer to experience the real future of lighting products.",
  ],
};

export const teamMembers = [
  {
    name: "Tariq Mahmood",
    role: "FOUNDER & PRINCIPAL DESIGNER",
    image: "/team/tariq.png",
  },
  {
    name: "Zara Ahmed",
    role: "LEAD OF RESIDENTIAL DESIGN",
    image: "/team/zara.png",
  },
  {
    name: "Hamza Rauf",
    role: "COMMERCIAL PROJECTS DIRECTOR",
    image: "/team/hamza.png",
  },
  {
    name: "Sara Khan",
    role: "CLIENT RELATIONS LEAD",
    image: "/team/sara.png",
  },
];

export const contactInfo = {
  hotline: "+92 21 3456 7890",
  sms: "+92 300 1234 567",
  email: "hello@lighthouse.pk",
};

export const socialLinks = [
  { name: "Facebook", url: "https://www.facebook.com/lighthouseisb" },
  { name: "Instagram", url: "https://www.instagram.com/lighthouse.isb" },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/light-house-islamabad",
  },
  { name: "TikTok", url: "https://www.tiktok.com/@light.house.isb" },
];

export const showrooms = [
  {
    id: "blue-area",
    label: "Blue Area, Islamabad",
    address:
      "Shop 1, Bilal Plaza, Blue, Area G 7/3 Blue Area, Islamabad, 44000, Pakistan",
    embedUrl:
      "https://maps.google.com/maps?q=33.716574,73.0698142&t=&z=17&ie=UTF8&iwloc=&output=embed",
  },
];

export const BLOG_CATEGORIES = [
  { label: "Design Guide", value: "design-guide" },
  { label: "Trends", value: "trends" },
  { label: "Project Spotlight", value: "project-spotlight" },
  { label: "Buying Guide", value: "buying-guide" },
  { label: "Installation Tips", value: "installation-tips" },
  { label: "Showroom News", value: "showroom-news" },
  { label: "Sustainability", value: "sustainability" },
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]["value"];

export const PROJECT_CATEGORIES = [
  { label: "Residential", value: "residential" },
  { label: "Commercial", value: "commercial" },
  { label: "Hospitality", value: "hospitality" },
  { label: "Office", value: "office" },
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]["value"];

export const partners = [
  {
    id: "partner-001",
    name: "Opple",
    imageURL: "/brands/opple-logo.png",
  },
  {
    id: "partner-002",
    name: "Philips",
    imageURL: "/partners/philips.png",
  },
  {
    id: "partner-003",
    name: "Panasonic",
    imageURL: "/partners/panasonic.png",
  },
  {
    id: "partner-004",
    name: "OSRAM",
    imageURL: "/partners/osram.png",
  },
];
