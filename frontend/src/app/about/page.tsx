"use client"

import Link from "next/link"
import { useQuery } from "react-query"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { settingsAPI, getImageUrl } from "@/lib/api"
import {
  Sparkles,
  Target,
  Compass,
  Award,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  BookOpen,
  BarChart3,
  Users,
  Clock,
  ShieldCheck,
  User,
} from "lucide-react"

export default function AboutPage() {
  const { data: settingsData, isLoading } = useQuery(["settings"], () => settingsAPI.getSettings())

  const aboutSection = settingsData?.data?.settings?.aboutSection || {}
  const contactInfo = settingsData?.data?.settings?.contactInfo || {}

  // Fallbacks for complete and robust details
  const title = aboutSection.title || "About Sarkari Spark"
  const subtitle = aboutSection.subtitle || "India's Dedicated Government Exam Preparation Hub"
  const description =
    aboutSection.description ||
    "Sarkari Spark is built with a singular mission: to provide every government job aspirant with accurate, high-quality mock tests, real-time analytics, and comprehensive syllabus coverage across SSC, Banking, Railways, and State exams."

  const mission = {
    title: aboutSection.mission?.title || "Our Mission",
    content:
      aboutSection.mission?.content ||
      "To democratize exam preparation by offering accessible, high-yield practice material that bridges the gap between preparation and exam success.",
  }

  const vision = {
    title: aboutSection.vision?.title || "Our Vision",
    content:
      aboutSection.vision?.content ||
      "To become India's most dependable and transparent ed-tech ecosystem for competitive examinations, powered by real exam pattern simulations.",
  }

  const stats = {
    years: aboutSection.stats?.yearsExperience || "5+",
    students: aboutSection.stats?.studentsHelped || "1,00,000+",
    successRate: aboutSection.stats?.successRate || "85%",
  }

  const founder = aboutSection.founder || {}
  const hasFounder = Boolean(founder.name && founder.name.trim() !== "")

  const keyHighlights = [
    {
      icon: BookOpen,
      title: "Real Exam Mock Tests",
      desc: "Latest TCS & NTA syllabus pattern with bilingual solutions.",
    },
    {
      icon: BarChart3,
      title: "In-Depth Analytics",
      desc: "Pinpoint accuracy, speed vs accuracy ratios, and All-India rank.",
    },
    {
      icon: ShieldCheck,
      title: "100% Verified Content",
      desc: "Curated by subject matter experts and previous year toppers.",
    },
    {
      icon: Clock,
      title: "24/7 Flexible Access",
      desc: "Seamless practice across mobile, tablet, and desktop anytime.",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Compact Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white py-14 md:py-16 border-b border-indigo-900/50">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Sarkari Spark Overview
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
              {title}
            </h1>
            <p className="text-base md:text-xl text-indigo-200 font-medium mb-4 max-w-2xl mx-auto">
              {subtitle}
            </p>
            <p className="text-sm md:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>

            {/* Quick Stats Bar */}
            <div className="mt-8 grid grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 backdrop-blur-md">
                <div className="text-2xl md:text-3xl font-extrabold text-amber-400">{stats.years}</div>
                <div className="text-xs text-slate-300 font-medium mt-1">Years of Trust</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 backdrop-blur-md">
                <div className="text-2xl md:text-3xl font-extrabold text-emerald-400">{stats.students}</div>
                <div className="text-xs text-slate-300 font-medium mt-1">Aspirants Guided</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 backdrop-blur-md">
                <div className="text-2xl md:text-3xl font-extrabold text-blue-400">{stats.successRate}</div>
                <div className="text-xs text-slate-300 font-medium mt-1">Success Ratio</div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Body Container */}
        <main className="container mx-auto px-4 max-w-5xl py-10 md:py-12 space-y-10">
          
          {/* Mission & Vision (2-Column Simple Grid) */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    <Target className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{mission.title}</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {mission.content}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{vision.title}</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {vision.content}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Conditional Founder / Leadership Spot */}
          {hasFounder && (
            <Card className="border border-amber-200 dark:border-amber-900/40 bg-gradient-to-r from-amber-50/70 to-orange-50/70 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center overflow-hidden shadow-md">
                      {founder.image ? (
                        <img
                          src={getImageUrl(founder.image)}
                          alt={founder.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="inline-block text-xs font-semibold tracking-wider text-amber-800 dark:text-amber-300 uppercase mb-1">
                      Leadership Spotlight
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{founder.name}</h3>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">{founder.role}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {founder.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Core Highlights (4-Point Simple Grid) */}
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Why Aspirants Choose Sarkari Spark
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Everything required to crack government exams with confidence
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {keyHighlights.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-auto">
                      {item.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Contact & Action Strip */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 md:p-8 border border-slate-800 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-bold text-white">Need Support or Have Questions?</h3>
                <p className="text-xs md:text-sm text-slate-300 max-w-md">
                  Our academic helpdesk is ready to assist you on your exam preparation journey.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{contactInfo.email || "support@sarkarispark.com"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{contactInfo.phone || "+91 98765 43210"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{contactInfo.address || "New Delhi, India"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link href="/exams">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-md gap-2">
                    Explore Mock Tests
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

        </main>
      </div>

      <Footer />
    </div>
  )
}
