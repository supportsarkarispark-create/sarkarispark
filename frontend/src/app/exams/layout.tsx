import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Government Exam Mock Tests & Online Test Series 2026",
  description:
    "Explore latest TCS & NTA pattern online mock tests for SSC CGL, CHSL, GD, Railway RRB NTPC, Group D, Banking IBPS/SBI, Teaching, Police & State exams.",
  keywords: [
    "online mock test",
    "free government exam mock test",
    "SSC CGL test series",
    "RRB NTPC online mock test",
    "IBPS PO mock test free",
    "state exam test papers",
  ],
  alternates: {
    canonical: "/exams",
  },
}

export default function ExamsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
