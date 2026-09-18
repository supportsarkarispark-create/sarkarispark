import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) - Doubts & Answers",
  description:
    "Find answers to commonly asked questions regarding Sarkari Spark test series, subscriptions, device access, refund rules, and mock test features.",
  alternates: {
    canonical: "/faq",
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
