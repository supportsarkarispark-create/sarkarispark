import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sarkari Admit Card 2026 - Download Hall Ticket & Call Letter",
  description:
    "Direct download links for official government exam admit cards, hall tickets, city intimation slips, and exam day instructions.",
  keywords: [
    "sarkari admit card",
    "download hall ticket",
    "SSC admit card download",
    "Railway exam city intimation",
    "call letter download",
  ],
  alternates: {
    canonical: "/admitcards",
  },
}

export default function AdmitCardsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
