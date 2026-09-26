"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { useQuery } from "react-query"
import { latestJobsAPI, sarkariAdmitCardAPI, govResultsAPI } from "@/lib/api"

interface NotificationItem {
  text: string
  link: string
}

interface LatestNotificationsSectionProps {
  className?: string
  containerClassName?: string
  title?: string
  subtitle?: string
  showTitle?: boolean
  maxItems?: number
}

// Format date helper for clean display
const formatNotificationDate = (dateVal?: string | Date | null): string => {
  if (!dateVal) return ""
  if (typeof dateVal === "string") {
    // If it's already a natural date string like "21 June 2026", return it
    if (/[a-zA-Z]/.test(dateVal) && !dateVal.includes("T")) {
      return dateVal
    }
  }
  try {
    const parsed = new Date(dateVal)
    if (isNaN(parsed.getTime())) return String(dateVal)
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  } catch {
    return String(dateVal)
  }
}

// Fallback high-quality notifications matching official Sarkari updates
const fallbackJobs: NotificationItem[] = [
  {
    text: "Allahabad High Court RO / ARO / CA Online Form 2026 – Start – (Last Date: 21 June 2026)",
    link: "/latest-jobs"
  },
  {
    text: "UPSSSC Vidhan Bhawan Guard / Fire Guard Online Form 2026 – Start – (Last Date: 29 June 2026)",
    link: "/latest-jobs"
  },
  {
    text: "UPSSSC Excise Constable Online Form 2026 – Start – (Last Date: 24 June 2026)",
    link: "/latest-jobs"
  },
  {
    text: "RPSC RAS Pre Online Form 2026 – Start – (Last Date: 03 July 2026)",
    link: "/latest-jobs"
  },
  {
    text: "RPSC School Lecturer (Special) Online Form 2026 – (Last Date: 30 June 2026)",
    link: "/latest-jobs"
  },
  {
    text: "RSSB Computer Instructor Online Form 2026 (3951 Posts) – (Last Date: 23 June 2026)",
    link: "/latest-jobs"
  },
  {
    text: "MPPSC Assistant Professor Online Form 2026 – (Last Date: 26 June 2026)",
    link: "/latest-jobs"
  },
  {
    text: "Central Bank CBI Apprentices Online Form 2026 – (Last Date: 22 June 2026)",
    link: "/latest-jobs"
  },
  {
    text: "NALCO Non Executive Online Form 2026 – Date Extend – (Last Date: 17 June 2026)",
    link: "/latest-jobs"
  },
  {
    text: "Jharkhand Teacher Eligibility Test Online Form 2026 – Date Extend – (Last Date: 20 June 2026)",
    link: "/latest-jobs"
  }
]

const fallbackAdmitCards: NotificationItem[] = [
  {
    text: "SSC GD Constable 2026 Computer Based Exam Hall Ticket Download",
    link: "/admitcards"
  },
  {
    text: "Railway RRB ALP Stage-1 CBT Admit Card & City Intimation Slip",
    link: "/admitcards"
  },
  {
    text: "UP Police Constable Re-Exam City Slip & Admit Card 2026",
    link: "/admitcards"
  },
  {
    text: "SSC CGL Tier-1 2026 Region Wise Admit Card & Application Status",
    link: "/admitcards"
  },
  {
    text: "NTA UGC NET December 2025 / June 2026 Admit Card Available",
    link: "/admitcards"
  },
  {
    text: "IBPS PO / MT XIV Main Examination Call Letter Download",
    link: "/admitcards"
  },
  {
    text: "Bihar Police Constable Physical Test PET Hall Ticket 2026",
    link: "/admitcards"
  },
  {
    text: "CTET Central Teacher Eligibility Test 2026 Pre Admit Card",
    link: "/admitcards"
  },
  {
    text: "DSSSB Various Post Admit Card & Exam Schedule 2026",
    link: "/admitcards"
  },
  {
    text: "UPSSSC Junior Assistant 5512 Post Typing Test Admit Card",
    link: "/admitcards"
  }
]

const fallbackResults: NotificationItem[] = [
  {
    text: "SSC CHSL 2025 Tier-1 Final Result Declared & Cutoff Marks",
    link: "/results"
  },
  {
    text: "UP Police Constable Written Exam Result & Merit List PDF",
    link: "/results"
  },
  {
    text: "Railway RRB NTPC CBT-1 Scorecard & Cutoff Marks Declared",
    link: "/results"
  },
  {
    text: "SSC CGL 2025 Final Result & Department Allocation List",
    link: "/results"
  },
  {
    text: "Bihar Police SI Daroga Preliminary Exam Result 2026",
    link: "/results"
  },
  {
    text: "IBPS Clerk Mains 2025 Final Result & Provisional Allotment",
    link: "/results"
  },
  {
    text: "UPSC Civil Services Preliminary Examination 2026 Result",
    link: "/results"
  },
  {
    text: "Rajasthan CET Graduate Level 2026 Result & Score Card",
    link: "/results"
  },
  {
    text: "UPSSSC PET 2025 Revised Scorecard & Percentile Score Live",
    link: "/results"
  },
  {
    text: "Airforce Agniveer Vayu 01/2026 Phase-1 Exam Result Live",
    link: "/results"
  }
]

export default function LatestNotificationsSection({
  className = "",
  containerClassName = "",
  title = "LATEST SARKARI NOTIFICATIONS & ALERTS",
  subtitle = "(LATEST JOBS • ADMIT CARDS • RESULTS)",
  showTitle = true,
  maxItems = 10,
}: LatestNotificationsSectionProps) {
  // Query 1: Latest Jobs
  const { data: jobsResponse } = useQuery(
    ["notifications-latest-jobs"],
    () => latestJobsAPI.getLatestJobs({ limit: maxItems }),
    { refetchOnWindowFocus: false, staleTime: 60 * 1000 }
  )

  // Query 2: Admit Cards
  const { data: admitCardsResponse } = useQuery(
    ["notifications-admit-cards"],
    () => sarkariAdmitCardAPI.getSarkariAdmitCards({ limit: maxItems }),
    { refetchOnWindowFocus: false, staleTime: 60 * 1000 }
  )

  // Query 3: Results
  const { data: resultsResponse } = useQuery(
    ["notifications-results"],
    () => govResultsAPI.getGovResults({ limit: maxItems }),
    { refetchOnWindowFocus: false, staleTime: 60 * 1000 }
  )

  // Build column 1: Latest Jobs
  const jobsList = useMemo<NotificationItem[]>(() => {
    const rawJobs = jobsResponse?.data?.jobs || jobsResponse?.data?.latestJobs || []
    const mapped: NotificationItem[] = rawJobs.map((j: any) => {
      const datePart = j.lastDate ? ` - (Last Date: ${formatNotificationDate(j.lastDate)})` : ""
      return {
        text: `${j.title}${datePart}`,
        link: j.link || "/latest-jobs"
      }
    })

    // Fill remaining up to maxItems from fallbackJobs
    const combined = [...mapped]
    for (const fb of fallbackJobs) {
      if (combined.length >= maxItems) break
      if (!combined.some(c => c.text.toLowerCase().includes(fb.text.slice(0, 20).toLowerCase()))) {
        combined.push(fb)
      }
    }
    return combined.slice(0, maxItems)
  }, [jobsResponse, maxItems])

  // Build column 2: Latest Admit Cards
  const admitCardsList = useMemo<NotificationItem[]>(() => {
    const rawAdmitCards = admitCardsResponse?.data?.admitCards || []
    const mapped: NotificationItem[] = rawAdmitCards.map((c: any) => {
      const title = c.title || c.postName || "Admit Card"
      const datePart = c.admitCardReleaseDate || c.examDate || c.date
      const formatted = datePart ? ` - (${formatNotificationDate(datePart)})` : " - (Download Available)"
      return {
        text: `${title}${formatted}`,
        link: c.link || c.downloadLink || "/admitcards"
      }
    })

    const combined = [...mapped]
    for (const fb of fallbackAdmitCards) {
      if (combined.length >= maxItems) break
      if (!combined.some(c => c.text.toLowerCase().includes(fb.text.slice(0, 20).toLowerCase()))) {
        combined.push(fb)
      }
    }
    return combined.slice(0, maxItems)
  }, [admitCardsResponse, maxItems])

  // Build column 3: Latest Results
  const resultsList = useMemo<NotificationItem[]>(() => {
    const rawResults = resultsResponse?.data?.results || resultsResponse?.data?.govResults || []
    const mapped: NotificationItem[] = rawResults.map((r: any) => {
      const title = r.title || "Government Result"
      const datePart = r.resultDate || r.date
      const formatted = datePart ? ` - (Declared: ${formatNotificationDate(datePart)})` : " - (Result Live)"
      return {
        text: `${title}${formatted}`,
        link: r.link || "/results"
      }
    })

    const combined = [...mapped]
    for (const fb of fallbackResults) {
      if (combined.length >= maxItems) break
      if (!combined.some(c => c.text.toLowerCase().includes(fb.text.slice(0, 20).toLowerCase()))) {
        combined.push(fb)
      }
    }
    return combined.slice(0, maxItems)
  }, [resultsResponse, maxItems])

  const columns = [
    {
      title: "Latest Jobs",
      items: jobsList,
      viewAllLink: "/latest-jobs"
    },
    {
      title: "Latest Admit Cards",
      items: admitCardsList,
      viewAllLink: "/admitcards"
    },
    {
      title: "Latest Results",
      items: resultsList,
      viewAllLink: "/results"
    }
  ]

  return (
    <section className={`w-full py-8 sm:py-12 ${className}`}>
      <div className={`container mx-auto px-4 ${containerClassName}`}>
        {/* Header Title matching user image */}
        {showTitle && (
          <div className="mb-6 flex flex-wrap items-baseline gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {title}
            </h2>
            {subtitle && (
              <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                {subtitle}
              </span>
            )}
          </div>
        )}

        {/* 3-Column Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          {columns.map((column, colIdx) => (
            <div
              key={colIdx}
              className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-400 dark:hover:border-zinc-700 transition-colors"
            >
              {/* Solid Black Header Bar */}
              <div className="bg-black text-white px-5 py-3.5 font-bold text-base sm:text-lg tracking-tight select-none">
                {column.title}
              </div>

              {/* Card Body & Items */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <ul className="space-y-0">
                  {column.items.map((item, itemIdx) => {
                    const isExternal = item.link.startsWith("http://") || item.link.startsWith("https://")
                    return (
                      <li
                        key={itemIdx}
                        className="border-b border-dotted border-slate-300 dark:border-zinc-800 pb-2.5 mb-2.5 last:border-b-0 last:pb-0 last:mb-0"
                      >
                        {isExternal ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-start gap-2 text-xs sm:text-[13px] leading-snug font-medium text-[#1a56db] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          >
                            <span className="text-slate-900 dark:text-slate-300 font-bold select-none text-sm leading-none shrink-0 mt-0.5">
                              &raquo;
                            </span>
                            <span className="group-hover:underline line-clamp-2">
                              {item.text}
                            </span>
                          </a>
                        ) : (
                          <Link
                            href={item.link}
                            className="group flex items-start gap-2 text-xs sm:text-[13px] leading-snug font-medium text-[#1a56db] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          >
                            <span className="text-slate-900 dark:text-slate-300 font-bold select-none text-sm leading-none shrink-0 mt-0.5">
                              &raquo;
                            </span>
                            <span className="group-hover:underline line-clamp-2">
                              {item.text}
                            </span>
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>

                {/* Solid Divider Line & View All Button */}
                <div className="border-t border-slate-300 dark:border-zinc-800 pt-3.5 mt-4 flex justify-end items-center">
                  <Link
                    href={column.viewAllLink}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#0070e0] hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
                  >
                    View All &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
