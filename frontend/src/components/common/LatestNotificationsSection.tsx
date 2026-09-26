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

export default function LatestNotificationsSection({
  className = "",
  containerClassName = "",
  title = "LATEST SARKARI NOTIFICATIONS & ALERTS",
  subtitle = "(LATEST JOBS • ADMIT CARDS • RESULTS)",
  showTitle = true,
  maxItems = 10,
}: LatestNotificationsSectionProps) {
  // Query 1: Latest Jobs (Only real data from database)
  const { data: jobsResponse, isLoading: isLoadingJobs } = useQuery(
    ["notifications-latest-jobs"],
    () => latestJobsAPI.getLatestJobs({ limit: maxItems }),
    { refetchOnWindowFocus: true, staleTime: 30 * 1000 }
  )

  // Query 2: Admit Cards (Only real data from database)
  const { data: admitCardsResponse, isLoading: isLoadingAdmitCards } = useQuery(
    ["notifications-admit-cards"],
    () => sarkariAdmitCardAPI.getSarkariAdmitCards({ limit: maxItems }),
    { refetchOnWindowFocus: true, staleTime: 30 * 1000 }
  )

  // Query 3: Results (Only real data from database)
  const { data: resultsResponse, isLoading: isLoadingResults } = useQuery(
    ["notifications-results"],
    () => govResultsAPI.getGovResults({ limit: maxItems }),
    { refetchOnWindowFocus: true, staleTime: 30 * 1000 }
  )

  // Build column 1: Latest Jobs (No dummy data)
  const jobsList = useMemo<NotificationItem[]>(() => {
    const rawJobs = jobsResponse?.data?.jobs || jobsResponse?.data?.latestJobs || []
    return rawJobs.slice(0, maxItems).map((j: any) => {
      const datePart = j.lastDate ? ` - (Last Date: ${formatNotificationDate(j.lastDate)})` : ""
      return {
        text: `${j.title}${datePart}`,
        link: j.link || "/latest-jobs"
      }
    })
  }, [jobsResponse, maxItems])

  // Build column 2: Latest Admit Cards (No dummy data)
  const admitCardsList = useMemo<NotificationItem[]>(() => {
    const rawAdmitCards = admitCardsResponse?.data?.admitCards || []
    return rawAdmitCards.slice(0, maxItems).map((c: any) => {
      const title = c.title || c.postName || "Admit Card"
      const datePart = c.admitCardReleaseDate || c.examDate || c.date
      const formatted = datePart ? ` - (${formatNotificationDate(datePart)})` : ""
      return {
        text: `${title}${formatted}`,
        link: c.link || c.downloadLink || "/admitcards"
      }
    })
  }, [admitCardsResponse, maxItems])

  // Build column 3: Latest Results (No dummy data)
  const resultsList = useMemo<NotificationItem[]>(() => {
    const rawResults = resultsResponse?.data?.results || resultsResponse?.data?.govResults || []
    return rawResults.slice(0, maxItems).map((r: any) => {
      const title = r.title || "Government Result"
      const datePart = r.resultDate || r.date
      const formatted = datePart ? ` - (Declared: ${formatNotificationDate(datePart)})` : ""
      return {
        text: `${title}${formatted}`,
        link: r.link || "/results"
      }
    })
  }, [resultsResponse, maxItems])

  const columns = [
    {
      title: "Latest Jobs",
      items: jobsList,
      isLoading: isLoadingJobs,
      viewAllLink: "/latest-jobs"
    },
    {
      title: "Latest Admit Cards",
      items: admitCardsList,
      isLoading: isLoadingAdmitCards,
      viewAllLink: "/admitcards"
    },
    {
      title: "Latest Results",
      items: resultsList,
      isLoading: isLoadingResults,
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
              className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-400 dark:hover:border-zinc-700 transition-colors min-h-[300px]"
            >
              {/* Solid Black Header Bar */}
              <div className="bg-black text-white px-5 py-3.5 font-bold text-base sm:text-lg tracking-tight select-none">
                {column.title}
              </div>

              {/* Card Body & Items */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                {column.isLoading ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Loading notifications...</p>
                  </div>
                ) : column.items.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <p className="text-xs italic">No new notifications added yet</p>
                  </div>
                ) : (
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
                )}

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
