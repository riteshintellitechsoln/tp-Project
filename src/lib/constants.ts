import type { CompanySize, BookFormat } from "@prisma/client";

export const APP_NAME = "TradeHub";

// NOTE: Book Categories live in the `Category` table (see prisma/schema.prisma)
// and are seeded in Module 4 (Database) — they're managed content, not a
// static constant, since Admins can add/rename/reorder them.
// The lists below are NOT admin-managed; they back <select> options on the
// Lead Form (Module 14) and are cheap to keep as code since changing them
// is a deploy, not a content edit.

export const SALUTATIONS = ["Mr", "Ms", "Mrs", "Dr"] as const;
export type Salutation = (typeof SALUTATIONS)[number];

export const DEPARTMENTS = [
  "IT / Engineering",
  "Finance",
  "Human Resources",
  "Marketing",
  "Sales",
  "Operations",
  "Customer Support",
  "Legal",
  "Procurement",
  "Research & Development",
  "Executive / C-Suite",
  "Other",
] as const;

export const INDUSTRIES = [
  "Information Technology",
  "Healthcare",
  "Finance & Banking",
  "Manufacturing",
  "Retail & E-commerce",
  "Education",
  "Government",
  "Telecommunications",
  "Media & Entertainment",
  "Real Estate",
  "Construction",
  "Transportation & Logistics",
  "Energy & Utilities",
  "Hospitality & Travel",
  "Non-profit",
  "Professional Services",
  "Automotive",
  "Agriculture",
  "Pharmaceuticals",
  "Insurance",
  "Other",
] as const;

// Labels mapped to the CompanySize enum in prisma/schema.prisma — keep both
// in sync if this ever changes.
export const COMPANY_SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
  { value: "SIZE_1_10", label: "1 – 10 employees" },
  { value: "SIZE_11_50", label: "11 – 50 employees" },
  { value: "SIZE_51_200", label: "51 – 200 employees" },
  { value: "SIZE_201_500", label: "201 – 500 employees" },
  { value: "SIZE_501_1000", label: "501 – 1,000 employees" },
  { value: "SIZE_1001_5000", label: "1,001 – 5,000 employees" },
  { value: "SIZE_5001_10000", label: "5,001 – 10,000 employees" },
  { value: "SIZE_10000_PLUS", label: "10,000+ employees" },
];

// Used by the Category page's filter bar (Module 10) and, later, the Admin
// book form (Module 16).
export const BOOK_FORMAT_OPTIONS: { value: BookFormat; label: string }[] = [
  { value: "EBOOK", label: "Ebook" },
  { value: "WHITEPAPER", label: "Whitepaper" },
  { value: "REPORT", label: "Report" },
  { value: "CASE_STUDY", label: "Case Study" },
  { value: "GUIDE", label: "Guide" },
  { value: "DATASHEET", label: "Datasheet" },
  { value: "WEBINAR", label: "Webinar" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "title", label: "Title A–Z" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

// Used by the Lead Form's Country selector (Module 14). State/City are kept
// as free-text inputs rather than dependent dropdowns — building accurate
// state/province lists for every country here would be a lot of data for
// marginal benefit, and free text works everywhere in the world, not just
// the handful of countries with a clean admin-division dataset.
export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina",
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
  "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Costa Rica", "Croatia", "Cuba",
  "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany",
  "Ghana", "Greece", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras",
  "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iraq",
  "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan", "Laos",
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru",
  "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saudi Arabia", "Senegal", "Serbia", "Singapore", "Slovakia",
  "Slovenia", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Yemen", "Zambia",
  "Zimbabwe", "Other",
] as const;
