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
  openGraph: {
    title: "Eduschol",
    description:
      "One calm operating system for every part of your school, with an AI layer that works from real records.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} ${instrument.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
