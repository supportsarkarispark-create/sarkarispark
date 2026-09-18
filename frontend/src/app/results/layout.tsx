import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sarkari Result 2026 - Check Exam Results, Cutoff Marks & Merit List",
  description:
    "Check official government exam results, scorecards, answer keys, cutoff marks, and merit lists for all Central & State government competitive exams.",
  keywords: [
    "sarkari result",
    "government exam result 2026",
    "SSC CGL result",
    "Railway RRB result",
    "exam cutoff marks",
    "merit list pdf",
  ],
  alternates: {
    canonical: "/results",
  },
}

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
