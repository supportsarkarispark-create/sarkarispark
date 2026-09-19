"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { settingsAPI, sliderAPI, feedbackAPI, govResultsAPI, latestJobsAPI, sarkariAdmitCardAPI, examsAPI } from "@/lib/api"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
  Flame,
  FileText,
  Clock,
  Shield,
  Zap,
  HelpCircle,
  ChevronDown,
  Search,
  Sparkles,
  Bell,
  Smartphone,
  BarChart3,
  GraduationCap,
  Play,
  Check,
  Calendar,
} from "lucide-react"

// Helper to get full image URL
const getImageUrl = (path: string) => {
  if (!path) return ""
  if (path.startsWith("http")) return path
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"
  return `${baseUrl}${path}`
}

export default function HomePage() {
  const router = useRouter()
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // API Queries
  const { data: settingsData } = useQuery(["settings"], () => settingsAPI.getSettings())
  const { data: slidersData } = useQuery(["sliders"], () => sliderAPI.getSliders())
  const { data: feedbackData } = useQuery(["approved-feedback"], feedbackAPI.getApproved)
  const { data: govResultsData } = useQuery(["gov-results"], () => govResultsAPI.getGovResults({ limit: 6 }))
  const { data: latestJobsData } = useQuery(["latest-jobs"], () => latestJobsAPI.getLatestJobs({ limit: 6 }))
  const { data: sarkariAdmitCardsData } = useQuery(["sarkari-admit-cards"], () => sarkariAdmitCardAPI.getSarkariAdmitCards({ limit: 6 }))
  const { data: examsData } = useQuery(["exams"], () => examsAPI.getExams({ limit: 12 }))
  const { data: faqsData, isLoading: faqsLoading } = useQuery(["faqs"], () => api.get("/faqs"))

  const settings = settingsData?.data?.settings
  const sliders = slidersData?.data?.sliders || []
  const feedback = feedbackData?.data?.feedback || []
  const faqs = Array.isArray(faqsData?.data?.data)
    ? faqsData.data.data
    : Array.isArray(faqsData?.data?.faqs)
      ? faqsData.data.faqs
      : Array.isArray(faqsData?.data)
        ? faqsData.data
        : []

  // Live stats from Database
  const heroStats = {
    activeStudents: settings?.heroStats?.activeStudents !== undefined ? Number(settings.heroStats.activeStudents).toLocaleString() : "0",
    mockTests: settings?.heroStats?.mockTests !== undefined ? Number(settings.heroStats.mockTests).toLocaleString() : "0",
    questions: settings?.heroStats?.questions !== undefined ? Number(settings.heroStats.questions).toLocaleString() : "0",
    selections: settings?.heroStats?.selections !== undefined ? Number(settings.heroStats.selections).toLocaleString() : "0"
  }

  // Fallback rich updates if DB empty
  const defaultLatestExams = [
    { id: "up-police-constable", title: "UP Police Constable 2026 Full Mock Test", subtitle: "150 Questions • 300 Marks", link: "/exams" },
    { id: "ssc-cgl-tier1", title: "SSC CGL 2026 Tier-1 All India Live Test", subtitle: "100 Questions • 200 Marks", link: "/exams" },
    { id: "rrb-ntpc-cbt1", title: "Railway RRB NTPC CBT-1 Mega Mock", subtitle: "100 Questions • 90 Mins", link: "/exams" }
  ]

  const defaultAdmitCards = [
    { id: "1", title: "SSC GD Constable 2026 Admit Card Out", link: "/admitcards", date: "Available Now" },
    { id: "2", title: "Railway RPF Sub-Inspector Hall Ticket", link: "/admitcards", date: "Release: Live" },
    { id: "3", title: "UPSSSC PET 2026 Exam City Slip", link: "/admitcards", date: "Download Direct" }
  ]

  const defaultJobs = [
    { id: "1", title: "UP Police 60,244 Constable Recruitment", link: "/latest-jobs", lastDate: "Apply Active" },
    { id: "2", title: "SSC CGL 2026 (17,727 Vacancies) Form", link: "/latest-jobs", lastDate: "Online Form" },
    { id: "3", title: "Railway RRB ALP & Technician 18,799 Posts", link: "/latest-jobs", lastDate: "Apply Now" }
  ]

  const defaultGovResults = [
    { id: "1", title: "SSC CHSL 2025 Tier-1 Final Result Declared", link: "/results", date: "Merit List PDF" },
    { id: "2", title: "Bihar Police SI Preliminary Result & Cutoff", link: "/results", date: "Cutoff Marks" },
    { id: "3", title: "IBPS Clerk Prelims 2025 Scorecard Live", link: "/results", date: "Scorecard Out" }
  ]

  const govResults = (govResultsData?.data?.govResults && govResultsData.data.govResults.length > 0) ? govResultsData.data.govResults : defaultGovResults
  const latestJobs = (latestJobsData?.data?.latestJobs && latestJobsData.data.latestJobs.length > 0) ? latestJobsData.data.latestJobs : defaultJobs
  const sarkariAdmitCards = (sarkariAdmitCardsData?.data?.admitCards && sarkariAdmitCardsData.data.admitCards.length > 0) ? sarkariAdmitCardsData.data.admitCards : defaultAdmitCards
  const realExams = (examsData?.data?.exams && examsData.data.exams.length > 0) ? examsData.data.exams : defaultLatestExams

  // Rich Curated Popular Exams List
  const allPopularExams = [
    {
      id: "up-police",
      title: "UP Police Constable",
      category: "police",
      categoryName: "Police & Defence",
      badge: "🔥 Super Popular",
      mockTestCount: "25 Tests",
      attempts: "32.4k",
      questionsCount: "150 Qs",
      maxMarks: "300 M",
      timeMinutes: "120 Min",
      rating: "4.9",
      color: "from-blue-600 to-indigo-700",
      accent: "border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20",
      link: "/exams"
    },
    {
      id: "ssc-cgl",
      title: "SSC CGL 2026 (Tier-1)",
      category: "ssc",
      categoryName: "SSC Exams",
      badge: "⚡ Free Test Available",
      mockTestCount: "40 Tests",
      attempts: "48.2k",
      questionsCount: "100 Qs",
      maxMarks: "200 M",
      timeMinutes: "60 Min",
      rating: "4.9",
      color: "from-purple-600 to-violet-800",
      accent: "border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20",
      link: "/exams"
    },
    {
      id: "rrb-ntpc",
      title: "Railway RRB NTPC CBT-1",
      category: "railway",
      categoryName: "Railway",
      badge: "⭐ Topper Choice",
      mockTestCount: "35 Tests",
      attempts: "29.1k",
      questionsCount: "100 Qs",
      maxMarks: "100 M",
      timeMinutes: "90 Min",
      rating: "4.8",
      color: "from-emerald-600 to-teal-800",
      accent: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20",
      link: "/exams"
    },
    {
      id: "bihar-daroga",
      title: "Bihar Police SI (Daroga)",
      category: "police",
      categoryName: "Police & Defence",
      badge: "🔥 High Demand",
      mockTestCount: "20 Tests",
      attempts: "21.6k",
      questionsCount: "100 Qs",
      maxMarks: "200 M",
      timeMinutes: "120 Min",
      rating: "4.9",
      color: "from-amber-500 to-orange-600",
      accent: "border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20",
      link: "/exams"
    },
    {
      id: "ibps-po",
      title: "IBPS PO / Clerk Prelims",
      category: "banking",
      categoryName: "Banking",
      badge: "🎯 Speed Booster",
      mockTestCount: "30 Tests",
      attempts: "19.8k",
      questionsCount: "100 Qs",
      maxMarks: "100 M",
      timeMinutes: "60 Min",
      rating: "4.8",
      color: "from-cyan-600 to-blue-700",
      accent: "border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/50 dark:bg-cyan-950/20",
      link: "/exams"
    },
    {
      id: "ssc-chsl",
      title: "SSC CHSL (10+2)",
      category: "ssc",
      categoryName: "SSC Exams",
      badge: "✨ Latest Pattern",
      mockTestCount: "28 Tests",
      attempts: "27.4k",
      questionsCount: "100 Qs",
      maxMarks: "200 M",
      timeMinutes: "60 Min",
      rating: "4.7",
      color: "from-pink-600 to-rose-700",
      accent: "border-pink-200 dark:border-pink-900/50 bg-pink-50/50 dark:bg-pink-950/20",
      link: "/exams"
    },
    {
      id: "rpf-si",
      title: "Railway RPF Constable & SI",
      category: "railway",
      categoryName: "Railway",
      badge: "🚀 Live Ranking",
      mockTestCount: "22 Tests",
      attempts: "18.3k",
      questionsCount: "120 Qs",
      maxMarks: "120 M",
      timeMinutes: "90 Min",
      rating: "4.8",
      color: "from-indigo-600 to-blue-800",
      accent: "border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20",
      link: "/exams"
    },
    {
      id: "upsssc-pet",
      title: "UPSSSC PET Preliminary",
      category: "state",
      categoryName: "State Exams",
      badge: "🏆 100% Bilingual",
      mockTestCount: "18 Tests",
      attempts: "25.0k",
      questionsCount: "100 Qs",
      maxMarks: "100 M",
      timeMinutes: "120 Min",
      rating: "4.9",
      color: "from-teal-600 to-emerald-700",
      accent: "border-teal-200 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/20",
      link: "/exams"
    }
  ]

  // Filter exams
  const filteredExams = allPopularExams.filter(exam => {
    const matchesCategory = selectedCategory === "all" || exam.category === selectedCategory
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Sample student reviews
  const displayReviews = feedback.length > 0 ? feedback.slice(0, 3) : [
    {
      id: "1",
      studentName: "Ankit Sharma",
      exam: "Selected as Excise Inspector (SSC CGL)",
      score: 5,
      testimonial: "Sarkari Spark ke mock tests ka level actual exam se bilkul match karta hai. Analytics feature se mujhe pata chala ki mere Maths me calculation errors ho rahe the. Iss platform ki wajah se mera dream poora hua!",
      city: "Prayagraj, UP"
    },
    {
      id: "2",
      studentName: "Pooja Verma",
      exam: "Selected in UP Police Constable",
      score: 5,
      testimonial: "Daily speed tests aur live timer se exam hall ka pressure jhelne ki aadat ho gayi. Hindi aur English dono bhashao me questions aur solutions best hain. Highly recommended!",
      city: "Lucknow, UP"
    },
    {
      id: "3",
      studentName: "Rahul Kumar Yadav",
      exam: "Selected in Railway RRB NTPC",
      score: 5,
      testimonial: "All India Rank aur percentile dekh kar confidence build hua. Sabse acchi baat ye hai ki test submit karte hi detailed solutions mil jate hain jo samjhne me bohot aasan hain.",
      city: "Patna, Bihar"
    }
  ]

  // Default FAQs
  const defaultFaqs = [
    {
      _id: "faq-1",
      question: "Kya Sarkari Spark par Free Mock Tests available hain?",
      answer: "Haan! Har ek exam category (SSC, UP Police, Railway, Banking) ke pehle 1 se 2 mock tests bilkul 100% FREE hain taaki aap platform aur question quality bina kisi payment ke test kar sakein."
    },
    {
      _id: "faq-2",
      question: "Test submit karne ke baad result kab milta hai?",
      answer: "Test submit karte hi aapko turant Instant Scorecard, All-India Rank, Section-wise Accuracy, Percentile aur sabhi sawalon ke detailed step-by-step solutions mil jaate hain."
    },
    {
      _id: "faq-3",
      question: "Kya sawal Hindi aur English dono bhashao me hain?",
      answer: "Ji bilkul! Sarkari Spark ke sabhi mock tests aur solutions 100% Bilingual (Hindi + English) hain. Aap exam dete samay bhi ek click me language badal sakte hain."
    },
    {
      _id: "faq-4",
      question: "Kya main mobile phone par bhi test de sakta hoon?",
      answer: "Haan, Sarkari Spark mobile, tablet aur laptop har device ke liye fully optimized hai. Aap bina kisi rukawat ke apne phone browser me test attempt kar sakte hain."
    }
  ]

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs

  const handleToggleFaq = (id: string) => {
    const updated = new Set(openItems)
    if (updated.has(id)) {
      updated.delete(id)
    } else {
      updated.add(id)
    }
    setOpenItems(updated)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/exams?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push("/exams")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white pb-20 md:pb-0">
      <Navbar />

      {/* 1. Live Breaking News / Notification Ticker (Chalti Hui Line / Marquee) */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white py-2 border-b border-indigo-500/20 overflow-hidden relative flex items-center shadow-xs">
        {/* Left Fixed Live Badge */}
        <div className="z-10 pl-3 pr-2 sm:pl-4 sm:pr-3 bg-gradient-to-r from-indigo-950 via-indigo-950 to-transparent flex items-center shrink-0">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 shrink-0">
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping shrink-0" />
            <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-slate-950 shrink-0" />
            <span className="whitespace-nowrap">Live Updates</span>
          </span>
        </div>

        {/* Scrolling Marquee Container */}
        <div className="overflow-hidden whitespace-nowrap flex-1 relative flex items-center py-0.5">
          <div className="animate-marquee flex items-center text-xs sm:text-sm font-semibold text-slate-200 cursor-pointer">
            {/* Set 1 */}
            <div className="flex items-center gap-6 sm:gap-8 shrink-0 pr-6 sm:pr-8">
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
                🔥 UP Police Constable 2026 Free Mock Tests Active
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1.5 text-indigo-200">
                ⚡ SSC CGL 2026 Tier-1 Official Calendar Released
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-300 font-bold">
                📢 Railway RRB NTPC & Group D Admit Cards Available
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1.5 text-sky-300">
                🎯 IBPS PO & Clerk 2026 Mock Test Series Live
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1.5 text-pink-300 font-bold">
                ⭐ All-India Live Ranking & Bilingual Solutions
              </span>
              <span className="text-slate-600">•</span>
            </div>

            {/* Set 2 (Seamless Infinite Loop) */}
            <div className="flex items-center gap-6 sm:gap-8 shrink-0 pr-6 sm:pr-8" aria-hidden="true">
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold">
                🔥 UP Police Constable 2026 Free Mock Tests Active
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1.5 text-indigo-200">
                ⚡ SSC CGL 2026 Tier-1 Official Calendar Released
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-300 font-bold">
                📢 Railway RRB NTPC & Group D Admit Cards Available
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1.5 text-sky-300">
                🎯 IBPS PO & Clerk 2026 Mock Test Series Live
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1.5 text-pink-300 font-bold">
                ⭐ All-India Live Ranking & Bilingual Solutions
              </span>
              <span className="text-slate-600">•</span>
            </div>
          </div>
        </div>

        {/* Right Fixed Action Button */}
        <div className="hidden sm:flex items-center pr-4 pl-3 bg-gradient-to-l from-indigo-950 via-indigo-950 to-transparent z-10 shrink-0">
          <Link
            href="/exams"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            Attempt Test <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* 2. Hero Section - Premium Visual Experience */}
      <section className="relative overflow-hidden pt-6 pb-6 lg:pt-10 lg:pb-8">
        {/* Ambient Gradient Glow Backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-500/15 via-purple-500/20 to-cyan-400/15 blur-3xl -z-10 pointer-events-none" />
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">

              {/* Trust Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm text-[11px] sm:text-xs md:text-sm font-semibold text-indigo-900 dark:text-indigo-300 whitespace-nowrap">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="text-sm sm:text-base shrink-0">🇮🇳</span>
                <span className="whitespace-nowrap">India&apos;s #1 Govt Exam Mock Test Portal</span>
                <span className="hidden sm:inline-block text-slate-400 dark:text-slate-600">|</span>
                <span className="hidden sm:inline-flex items-center text-amber-500 font-bold">
                  ★ 4.9/5 Rating
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.18]">
                  <span className="block sm:inline text-slate-900 dark:text-white">
                    Abki Baar,{" "}
                  </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 drop-shadow-xs">
                    Sarkari Naukri
                  </span>{" "}
                  <span className="relative inline-block text-slate-900 dark:text-white">
                    Hamaar!
                    <span className="absolute -bottom-1 left-0 right-0 h-1 sm:h-1.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-sm" />
                  </span>{" "}
                  <span className="inline-block animate-pulse">🚀</span>
                </h1>
                <p className="text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
                  India ke top rankers aur subject experts dwara taiyar mock tests. Live All-India Ranking, timer, detailed bilingual solutions aur AI analytics ke sath guaranteed selection ki taiyari karein.
                </p>
              </div>

              {/* Quick Exam Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-xl">
                <div className="relative flex items-center p-1.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-200/80 dark:border-slate-800 shadow-xl shadow-indigo-100/50 dark:shadow-none focus-within:border-indigo-600 transition-all">
                  <div className="pl-3 text-slate-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search exam e.g. UP Police, SSC CGL, RRB NTPC..."
                    className="w-full px-3 py-2.5 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl px-5 py-2.5 font-semibold text-sm shadow-md"
                  >
                    Search
                  </Button>
                </div>
                {/* Trending Quick Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 text-xs text-slate-500 dark:text-slate-400 justify-start">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0">⚡ Trending:</span>
                  {["UP Police", "SSC CGL", "RRB NTPC", "IBPS PO", "CTET"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors shrink-0 text-[11px] font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </form>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 sm:gap-4 pt-1">
                <Link href="/exams" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 px-8 py-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    Start Mock Test
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/latest-jobs" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto gap-2 px-6 py-6 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-base"
                  >
                    <BriefcaseIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Latest Vacancies
                  </Button>
                </Link>
              </div>

              {/* Trust Micro-Bullets */}
              <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-2.5 pt-2 max-w-lg">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Curated by Rankers</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Real Exam Interface</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Hindi & English PYQs</span>
                </div>
              </div>

            </div>

            {/* Right Column: Image Banner Slider (Connected to Admin Panel) */}
            <div className="lg:col-span-5 relative">
              <HeroSlider sliders={sliders} />
            </div>

          </div>
        </div>
      </section>

      {/* 3. Stats Section with Glassmorphism */}
      <section className="py-5 sm:py-6 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 border border-indigo-100 dark:border-slate-800 flex items-center gap-4 hover:-translate-y-1 transition-all">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {heroStats.activeStudents}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Active Aspirants
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 border border-purple-100 dark:border-slate-800 flex items-center gap-4 hover:-translate-y-1 transition-all">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-purple-200 dark:shadow-none">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {heroStats.mockTests}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Full Mock Tests
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 border border-cyan-100 dark:border-slate-800 flex items-center gap-4 hover:-translate-y-1 transition-all">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-cyan-200 dark:shadow-none">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {heroStats.questions}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Practice Questions
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 border border-emerald-100 dark:border-slate-800 flex items-center gap-4 hover:-translate-y-1 transition-all">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-emerald-200 dark:shadow-none">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {heroStats.selections}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                  Final Selections
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Interactive Popular Mock Tests with Category Tabs */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">

          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" /> High-Yield Preparation
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
              Popular Online Mock Test Series
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              Latest pattern, negative marking aur previous year question papers par aadharit mock tests.
            </p>

            {/* Category Filter Pills (Horizontal scrollable strip on mobile, wrapped on desktop) */}
            <div className="flex items-center overflow-x-auto no-scrollbar gap-2 mt-6 py-2 px-1 justify-start sm:justify-center sm:flex-wrap">
              {[
                { id: "all", label: "All Exams" },
                { id: "police", label: "Police & Defence" },
                { id: "ssc", label: "SSC Exams" },
                { id: "railway", label: "Railway (RRB)" },
                { id: "banking", label: "Banking" },
                { id: "state", label: "State PCS / SI" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap ${selectedCategory === cat.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-105"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-800"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>

          {/* Mock Test Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Category & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {exam.categoryName}
                    </span>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/50">
                      {exam.badge}
                    </span>
                  </div>

                  {/* Title & Icon Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${exam.color} flex items-center justify-center text-white flex-shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {exam.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mt-0.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{exam.rating}</span>
                        <span className="text-slate-400">({exam.attempts} attempts)</span>
                      </div>
                    </div>
                  </div>

                  {/* Test Metadata Specs */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center mb-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div>
                      <p className="text-[10px] text-slate-400 font-normal">Questions</p>
                      <p className="font-bold">{exam.questionsCount}</p>
                    </div>
                    <div className="border-x border-slate-200 dark:border-slate-700">
                      <p className="text-[10px] text-slate-400 font-normal">Max Marks</p>
                      <p className="font-bold">{exam.maxMarks}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-normal">Duration</p>
                      <p className="font-bold">{exam.timeMinutes}</p>
                    </div>
                  </div>
                </div>

                {/* Card CTA */}
                <Link href={exam.link} className="block mt-2">
                  <Button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md group-hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                    <Play className="h-3.5 w-3.5 fill-white" />
                    Start Mock Test
                  </Button>
                </Link>

              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-10">
            <Link href="/exams">
              <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 font-bold border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
                View All 650+ Mock Tests <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* 5. Latest Updates Bento Grid (Jobs / Admit Cards / Results / Exams) */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-slate-100/60 to-white dark:from-slate-900/40 dark:to-slate-950 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4">

          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2">
                <Bell className="h-3.5 w-3.5" /> Real-time Sarkari Updates
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Recruitment & Exam Notifications
              </h2>
            </div>
            <Link href="/latest-jobs" className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline flex items-center gap-1">
              Browse All Notifications <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Box 1: Latest Jobs */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600">
                    <BriefcaseIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Latest Jobs</h3>
                </div>
                <Link href="/latest-jobs" className="text-xs font-semibold text-purple-600 hover:underline">View All</Link>
              </div>

              <div className="space-y-3">
                {latestJobs.slice(0, 3).map((job: any, idx: number) => (
                  <Link
                    key={idx}
                    href={job.link || "/latest-jobs"}
                    className="block p-3 rounded-xl hover:bg-purple-50/50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-purple-200"
                  >
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                      {job.title}
                    </p>
                    <span className="inline-block text-[11px] font-semibold text-purple-600 dark:text-purple-400 mt-1">
                      {job.lastDate ? `Status: ${job.lastDate}` : "Apply Online →"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Box 2: Admit Cards */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-green-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-green-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Admit Cards</h3>
                </div>
                <Link href="/admitcards" className="text-xs font-semibold text-emerald-600 hover:underline">View All</Link>
              </div>

              <div className="space-y-3">
                {sarkariAdmitCards.slice(0, 3).map((card: any, idx: number) => (
                  <Link
                    key={idx}
                    href={card.link || "/admitcards"}
                    className="block p-3 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-emerald-200"
                  >
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                      {card.title || card.postName}
                    </p>
                    <span className="inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      {card.date ? `Status: ${card.date}` : "Download Admit Card →"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Box 3: Exam Results */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-orange-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Govt Results</h3>
                </div>
                <Link href="/results" className="text-xs font-semibold text-orange-600 hover:underline">View All</Link>
              </div>

              <div className="space-y-3">
                {govResults.slice(0, 3).map((res: any, idx: number) => (
                  <Link
                    key={idx}
                    href={res.link || "/results"}
                    className="block p-3 rounded-xl hover:bg-orange-50/50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-orange-200"
                  >
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                      {res.title}
                    </p>
                    <span className="inline-block text-[11px] font-semibold text-orange-600 dark:text-orange-400 mt-1">
                      {res.date ? `Status: ${res.date}` : "Check Result →"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Box 4: Active Mock Tests */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Exam Series</h3>
                </div>
                <Link href="/exams" className="text-xs font-semibold text-blue-600 hover:underline">View All</Link>
              </div>

              <div className="space-y-3">
                {realExams.slice(0, 3).map((exam: any, idx: number) => (
                  <Link
                    key={idx}
                    href={exam.link || `/exams/${exam.id || ""}`}
                    className="block p-3 rounded-xl hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-blue-200"
                  >
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                      {exam.title}
                    </p>
                    <span className="inline-block text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1">
                      {exam.subtitle || "Start Online Test →"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Why Choose Sarkari Spark - Feature Bento Grid */}
      <section className="py-14 sm:py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider mb-3">
              <Shield className="h-3.5 w-3.5" /> Why Aspirants Trust Us
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
              Taiyari Wahi, Jo Selection Dilwaye!
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              Hamara platform har ek government exam aspirant ko ranker banane ke liye banaya gaya hai.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-200 dark:shadow-none group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Exact TCS/NTA Exam Interface
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Exam hall jaisa exact timer, question palette (Answered, Not Answered, Mark for Review) aur negative marking system.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-purple-200 dark:shadow-none group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                In-depth AI Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Janiye aapka weak topic kaun sa hai, kis sawal me zyada samay laga aur accuracy kaise improve ki jaye.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-200 dark:shadow-none group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                All-India Live Ranking
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Lakho students ke sath live compete karein aur apni real standing percentile aur rank dekhein.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-amber-200 dark:shadow-none group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                100% Bilingual (Hindi + English)
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Hindi aur English dono bhashao me questions aur step-by-step easy solutions available hain.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-rose-200 dark:shadow-none group-hover:scale-110 transition-transform">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Mobile & Laptop Friendly
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Kabhi bhi, kahin bhi test attempt karein. Koi app download kiye bina seedha mobile browser par smooth chalta hai.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-850 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-cyan-200 dark:shadow-none group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Instant Scorecard & Analysis
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Test khatam hote hi marks, accuracy, correct/incorrect summary aur topper comparison chart dekhein.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Success Stories & Student Reviews */}
      <section className="py-14 sm:py-20 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wider mb-3">
              <Star className="h-3.5 w-3.5 fill-amber-500" /> Verified Aspirants
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
              Hamare Toppers Ki Zubani
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              Hazaron students ne Sarkari Spark ke mock tests se apna sarkari naukri ka sapna sach kiya hai.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {displayReviews.map((rev: any, index: number) => (
              <div
                key={index}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {[...Array(rev.score || 5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-6 leading-relaxed">
                    &ldquo;{rev.testimonial}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                    {rev.studentName ? rev.studentName.charAt(0) : "S"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{rev.studentName}</h4>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{rev.exam}</p>
                    {rev.city && <p className="text-[11px] text-slate-400">{rev.city}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. Frequently Asked Questions (FAQ) Section */}
      <section className="py-14 sm:py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4 max-w-4xl">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider mb-3">
              <HelpCircle className="h-3.5 w-3.5" /> FAQs
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Aksar Pooche Jane Wale Sawal
            </h2>
          </div>

          <div className="space-y-3.5">
            {displayFaqs.map((faq: any, idx: number) => {
              const isOpen = openItems.has(faq._id)
              return (
                <div
                  key={faq._id || idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen
                    ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                >
                  <button
                    onClick={() => handleToggleFaq(faq._id)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {faq.question}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* 9. Final High-Conversion CTA Banner */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-950 text-white border-t border-indigo-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-4">
            🚀 EXAM PREPARATION PLATFORM
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
            Apna Sarkari Job Ka Sapna Sach Karein!
          </h2>
          <p className="text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Join thousands of serious aspirants preparing with Sarkari Spark. Get access to 650+ test series, previous years&apos; papers, and live All-India ranking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto px-9 py-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-500/20 hover:-translate-y-0.5 transition-all"
              >
                Get Started Now
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/exams" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-6 rounded-xl border-2 border-white/80 bg-transparent text-white hover:bg-white hover:text-slate-950 font-bold text-base transition-all"
              >
                Explore 650+ Test Series
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs sm:text-sm text-indigo-200">
            <span>✓ Access to 650+ Mock Tests</span>
            <span>✓ All India Live Ranking & Percentile</span>
            <span>✓ Curated by Subject Matter Experts</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Briefcase icon helper
function BriefcaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

// Hero Slider Component (Dynamically connected to Admin Panel via /api/sliders)
function HeroSlider({ sliders }: { sliders: any[] }) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Curated fallback slides if database has no active slides
  const defaultFallbackSliders = [
    {
      _id: "default-1",
      title: "UP Police Constable 2026 Special Batch",
      subtitle: "60,000+ Vacancies • 25 Full Length Mock Tests with All India Rank",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop",
      redirectUrl: "/exams",
      badge: "🔥 Super Popular"
    },
    {
      _id: "default-2",
      title: "SSC CGL 2026 Tier-1 Mega Mock Series",
      subtitle: "Exact TCS Exam Pattern • Real Timer & Negative Marking Simulation",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop",
      redirectUrl: "/exams",
      badge: "⚡ Free Test Available"
    },
    {
      _id: "default-3",
      title: "Railway RRB NTPC & Group D Test Series",
      subtitle: "Previous 10 Years Solved Papers (PYQs) • 100% Bilingual in Hindi & English",
      image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200&auto=format&fit=crop",
      redirectUrl: "/exams",
      badge: "⭐ Topper Choice"
    }
  ]

  const activeSliders = (Array.isArray(sliders) && sliders.length > 0)
    ? sliders.filter((s) => s.isActive).sort((a, b) => (a.order || 0) - (b.order || 0))
    : []

  const displaySliders = activeSliders.length > 0 ? activeSliders : defaultFallbackSliders

  useEffect(() => {
    if (isPaused || displaySliders.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySliders.length)
    }, 4500)

    return () => clearInterval(interval)
  }, [isPaused, displaySliders.length])

  // Reset index if out of bounds
  useEffect(() => {
    if (currentIndex >= displaySliders.length) {
      setCurrentIndex(0)
    }
  }, [displaySliders.length, currentIndex])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % displaySliders.length)
  }

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + displaySliders.length) % displaySliders.length)
  }

  const handleSlideClick = () => {
    const slide = displaySliders[currentIndex]
    if (slide?.redirectUrl) {
      router.push(slide.redirectUrl)
    } else {
      router.push("/exams")
    }
  }

  const currentSlide = displaySliders[currentIndex] || displaySliders[0]
  const imageUrl = getImageUrl(currentSlide?.image)
  const videoUrl = currentSlide?.video ? getImageUrl(currentSlide.video) : null

  return (
    <div
      className="relative w-full group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient Glow Backdrop */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-600/30 via-purple-600/25 to-pink-600/30 rounded-[32px] blur-xl -z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Main Banner Card */}
      <div className="relative bg-slate-900 border border-indigo-200/40 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10">
        <div
          className="relative h-[220px] sm:h-[340px] md:h-[420px] lg:h-[480px] xl:h-[510px] cursor-pointer"
          onClick={handleSlideClick}
        >
          {/* Media: Video or Image */}
          {videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              muted
              onEnded={nextSlide}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={imageUrl}
              alt={currentSlide?.title || "Sarkari Spark Mock Test Banner"}
              onError={(e) => {
                // Fallback to high quality image if link fails
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop"
              }}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          )}

          {/* Multi-Stop Gradient Scrim for crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-transparent pointer-events-none" />

          {/* Top Overlays: Badge & Slide Counter */}
          <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between pointer-events-none">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-slate-950/75 border border-white/20 backdrop-blur-md text-[10px] sm:text-xs font-bold text-amber-300 shadow-md">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400" />
              {currentSlide?.badge || "🔥 Featured Test Series"}
            </span>
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-950/75 border border-white/20 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold text-white/90 shadow-md">
              {currentIndex + 1} / {displaySliders.length}
            </span>
          </div>

          {/* Bottom Content Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 space-y-1 sm:space-y-2">
            {currentSlide?.title && (
              <h3 className="text-white text-base sm:text-2xl font-black tracking-tight leading-snug drop-shadow-md line-clamp-1 sm:line-clamp-none">
                {currentSlide.title}
              </h3>
            )}
            {currentSlide?.subtitle && (
              <p className="text-slate-200/90 text-[11px] sm:text-sm font-normal line-clamp-1 sm:line-clamp-2 max-w-xl drop-shadow">
                {currentSlide.subtitle}
              </p>
            )}

            {/* Smart Interactive CTA Pill */}
            <div className="pt-1 sm:pt-2 flex items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md group-hover:scale-105 transition-transform">
                <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-slate-950" />
                Attempt Mock Test
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </span>
              {currentSlide?.redirectUrl && (
                <span className="hidden sm:inline-flex text-xs font-medium text-white/70 hover:text-white transition-colors underline decoration-white/30 underline-offset-4">
                  View details
                </span>
              )}
            </div>
          </div>

          {/* Left / Right Nav Controls */}
          {displaySliders.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  prevSlide()
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-950 hover:scale-110 active:scale-95 transition-all shadow-lg"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  nextSlide()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-950 hover:scale-110 active:scale-95 transition-all shadow-lg"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Indicator Dots / Bar */}
        {displaySliders.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {displaySliders.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  goToSlide(index)
                }}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                  ? "bg-amber-400 w-7 shadow-sm"
                  : "bg-white/40 hover:bg-white/75 w-2"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
