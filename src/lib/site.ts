/**
 * Single source of truth for the Eduschol brand, company and contact details.
 * The footer, legal pages and metadata read from here so the identity stays
 * consistent across the site.
 */
export const site = {
  name: "Eduschol",
  domain: "eduschol.xyz",
  url: "https://eduschol.xyz",
  tagline: "The AI-native operating system for schools",
  description:
    "Eduschol runs admissions, attendance, results, CBT, fees, staff and parent communication in one workspace. Every AI answer is grounded in the records the school already keeps.",
  company: "Ivents",
  companyLine: "Eduschol is a product of Ivents.",
  email: "hello@eduschol.xyz",
  supportEmail: "support@eduschol.xyz",
  phone: "+234 802 451 9080",
  address: "18 Adeola Odeku Street, Victoria Island, Lagos",
  location: "Victoria Island, Lagos, Nigeria",
  lastUpdated: "4 November 2026",
} as const;
