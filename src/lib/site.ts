/**
 * Single source of truth for the Eduschol brand, company and contact details.
 * The footer, legal pages and metadata read from here so the identity stays
 * consistent across the site.
 */
export const site = {
  name: "Eduschol",
  domain: "eduschol.online",
  url: "https://www.eduschol.online",
  tagline: "The AI-native operating system for schools",
  description:
    "Eduschol runs admissions, attendance, results, CBT, fees, staff and parent communication in one workspace. Every AI answer is grounded in the records the school already keeps.",
  company: "Eduschol", // "Ivents",
  companyLine: "Eduschol", // "Eduschol is a product of Ivents.",
  email: "hello@eduschol.online",
  supportEmail: "support@eduschol.online",
  phone: "+234 802 451 9080",
  address: "18 Adeola Odeku Street, Victoria Island, Lagos",
  location: "Victoria Island, Lagos, Nigeria",
  lastUpdated: "4 November 2026",
} as const;
