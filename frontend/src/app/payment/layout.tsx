import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pro Test Series Plans & Pricing - Instant Pass Activation",
  description:
    "Choose from Single Exam Pass, Custom Combo, and All Exams Pro Unlimited Pass. Get full TCS & NTA pattern mock tests, All-India Rank, and bilingual solutions at unbeatable prices.",
  keywords: [
    "Sarkari test series pass",
    "mock test subscription",
    "SSC mock test price",
    "railway exam test series discount",
    "government exam pass online",
  ],
  alternates: {
    canonical: "/payment",
  },
}

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
