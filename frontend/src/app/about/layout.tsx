import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us - Our Mission & Vision",
  description:
    "Learn about Sarkari Spark, our mission to empower millions of government exam aspirants across India with affordable, high-quality test series and career guidance.",
  alternates: {
    canonical: "/about",
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
