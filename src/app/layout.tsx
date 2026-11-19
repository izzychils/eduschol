import type { Metadata } from "next";
import { Inter, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eduschol.xyz"),
  title: "Eduschol. The operating system for schools that think ahead.",
  description:
    "Eduschol brings admissions, attendance, results, CBT, fees, staff, inventory and parent communication into one AI-native school platform that never invents a record.",
  icons: {
    icon: "/eduschol-logo.png",
    apple: "/eduschol-logo.png",
  },
  keywords: [
    "school management system",
    "AI school software",
    "CBT exams",
    "school fees",
    "report cards",
    "parent portal",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "Education software",
  authors: [{ name: "Eduschol" }],
  creator: "Eduschol",
  publisher: "Eduschol",
  applicationName: "Eduschol",
  openGraph: {
    title: "Eduschol: the operating system for schools that think ahead",
    description:
      "One calm operating system for every part of your school, with an AI layer that works from real records.",
    url: "https://eduschol.xyz",
    siteName: "Eduschol",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eduschol: the AI-native operating system for schools",
    description:
      "Admissions, attendance, results, CBT, fees, staff and parent communication in one workspace - with an AI layer grounded in real school records.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://eduschol.xyz/#organization",
      name: "Eduschol",
      url: "https://eduschol.xyz",
      email: "hello@eduschol.xyz",
      telephone: "+2348024519080",
      description:
        "Eduschol is a school management platform for Nigerian schools: admissions, attendance, results, CBT exams, fees, staff and parent communication.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "18 Adeola Odeku Street",
        addressLocality: "Victoria Island, Lagos",
        addressCountry: "NG",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://eduschol.xyz/#website",
      url: "https://eduschol.xyz",
      name: "Eduschol",
      publisher: { "@id": "https://eduschol.xyz/#organization" },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      name: "Eduschol",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "School management system",
      operatingSystem: "Web browser",
      url: "https://eduschol.xyz",
      description:
        "One AI-native school platform covering admissions, attendance, results, CBT, fees, staff records, inventory and parent communication.",
      featureList: [
        "Admissions and enrolment",
        "Attendance tracking",
        "Results and report cards",
        "CBT exams",
        "School fees and payments",
        "Staff records",
        "Parent communication",
        "AI assistant grounded in school records",
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} ${instrument.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
