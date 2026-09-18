import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Online Computer & Govt Exam Preparation Courses | Sarkari Spark",
  description:
    "Learn computer skills, CCC, DCA, ADCA, typing tests, and competitive exam concepts with structured video courses, notes, and study material.",
  keywords: [
    "online computer courses",
    "CCC course online",
    "ADCA computer certificate",
    "government exam coaching online",
    "typing practice online",
  ],
  alternates: {
    canonical: "/courses",
  },
}

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
