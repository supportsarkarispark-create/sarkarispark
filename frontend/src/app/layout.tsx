import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sarkarispark.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sarkari Spark - Government Exam Mock Tests, Latest Jobs & Results",
    template: "%s | Sarkari Spark",
  },
  description:
    "India's leading government exam preparation platform. Free & Premium Mock Tests for SSC CGL, GD, CHSL, Railway RRB NTPC, Group D, Banking IBPS PO, State Police & Teaching Exams with All-India Rank, Latest Jobs, Admit Card & Result updates.",
  keywords: [
    "Sarkari Spark",
    "sarkari exam mock test",
    "free test series online",
    "SSC CGL mock test",
    "SSC GD online test",
    "Railway RRB NTPC mock test",
    "Railway Group D test series",
    "Banking IBPS PO clerk test series",
    "State Police exam test series",
    "sarkari result",
    "latest sarkari naukri 2026",
    "sarkari admit card",
    "bilingual mock tests hindi english",
    "all india rank test series",
  ],
  authors: [{ name: "Sarkari Spark Team", url: siteUrl }],
  creator: "Sarkari Spark",
  publisher: "Sarkari Spark",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "Sarkari Spark - Government Exam Preparation & Test Series",
    description:
      "Prepare for SSC, Railway, Banking, Teaching & State exams with India's best mock tests, instant solutions, and real-time All India Rank.",
    siteName: "Sarkari Spark",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sarkari Spark - Government Exam Preparation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sarkari Spark - Government Exam Preparation Platform",
    description:
      "Prepare for SSC, Railway, Banking, Teaching & State exams with India's best mock tests, instant solutions, and real-time All India Rank.",
    images: ["/og-image.jpg"],
    creator: "@SarkariSpark",
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${siteUrl}/#organization`,
        name: "Sarkari Spark",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description:
          "Online test series and preparation platform for Indian government competitive exams.",
        sameAs: [
          "https://t.me/sarkarispark",
          "https://youtube.com/@sarkarispark",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Sarkari Spark",
        description:
          "Government Exam Mock Tests, Test Series, Latest Govt Jobs, Results & Admit Cards",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/exams?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
