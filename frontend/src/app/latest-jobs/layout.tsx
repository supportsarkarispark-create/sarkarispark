import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Latest Government Jobs 2026 - Sarkari Naukri Alerts & Notifications",
  description:
    "Find all new government job vacancies, online application links, eligibility criteria, age limits, and exam dates for Central & State Government recruitments.",
  keywords: [
    "sarkari naukri 2026",
    "latest govt jobs online",
    "free job alerts",
    "SSC recruitment 2026",
    "Railway vacancy 2026",
    "bank jobs recruitment",
  ],
  alternates: {
    canonical: "/latest-jobs",
  },
}

export default function LatestJobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
