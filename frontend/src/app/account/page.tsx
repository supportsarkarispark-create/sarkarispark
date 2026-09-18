"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { getImageUrl } from "@/lib/api"
import {
  User,
  LayoutDashboard,
  Crown,
  BookOpen,
  Briefcase,
  FileText,
  Award,
  Laptop,
  Building2,
  Settings,
  HelpCircle,
  Phone,
  Shield,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
} from "lucide-react"

export default function AccountPage() {
  const { user, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-24 md:pb-0">
      <div>
        <Navbar />

        <div className="container mx-auto px-4 py-6 max-w-xl">
          {/* Header Title */}
          <div className="mb-4">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              My Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage your exams, subscription & preferences
            </p>
          </div>

          {/* User Profile Card */}
          {user ? (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl shadow-indigo-500/15 mb-6 relative overflow-hidden">
              {/* Background ambient pattern */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-4 relative z-10">
                {user.avatar ? (
                  <img
                    src={getImageUrl(user.avatar)}
                    alt={user.name}
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-white/50 shadow-md shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-2xl flex items-center justify-center border-2 border-white/40 shadow-md shrink-0">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="font-extrabold text-lg sm:text-xl text-white truncate">
                      {user.name}
                    </h2>
                    {user.role === "admin" || user.role === "superadmin" ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                        Admin
                      </span>
                    ) : user.subscriptionType === "premium" ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                        <Crown className="w-3 h-3" /> Pro Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white/90">
                        Student Aspirant
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-100/80 truncate mb-2">
                    {user.email}
                  </p>
                  <p className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Target: {user.profile?.targetExams?.join(", ") || "Govt Exams 2026"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/15 relative z-10">
                <Link
                  href="/dashboard"
                  className="py-2 px-3 rounded-xl bg-white text-indigo-900 font-bold text-xs text-center shadow-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  My Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="py-2 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs text-center backdrop-blur-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  Edit Profile
                </Link>
              </div>

              {/* Admin Panel button if authorized */}
              {(user.role === "admin" || user.role === "superadmin") && (
                <div className="mt-2 relative z-10">
                  <Link
                    href="/admin"
                    className="block py-2 px-3 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs text-center shadow-md hover:bg-amber-300 transition-all"
                  >
                    ⚙️ Open Admin Control Panel
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out Hero Card */
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl shadow-indigo-950/30 mb-6 border border-indigo-800/40 relative overflow-hidden text-center space-y-4">
              <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-lg">
                <User className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Welcome Aspirant! 🚀
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto mt-1">
                  Login karein aur apne mock test score, All India Rank aur study materials ko track karein.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 max-w-xs mx-auto">
                <Link href="/login" className="w-full">
                  <Button
                    type="button"
                    className="w-full rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs py-5 shadow-md"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="w-full">
                  <Button
                    type="button"
                    className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-500 hover:to-amber-600 font-extrabold text-xs py-5 shadow-md"
                  >
                    Registration
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Quick 2x2 Feature Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link
              href="/payment"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 hover:border-amber-500/50 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
                  <Crown className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                  Save 50%
                </span>
              </div>
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  Pro Pass
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  650+ Mock Tests Unlocked
                </p>
              </div>
            </Link>

            <Link
              href="/exams"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  All Mock Tests
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  SSC, Police, Railway & More
                </p>
              </div>
            </Link>

            <Link
              href="/latest-jobs"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform mb-2">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                  Latest Vacancies
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  2026 Active Forms
                </p>
              </div>
            </Link>

            <Link
              href="/admitcards"
              className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">
                  Admit Cards
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Direct Hall Ticket Download
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Menu List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-3 mb-6 space-y-1">
            <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Exam Sections
            </p>

            <Link
              href="/courses"
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Computer Courses & Tests</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/results"
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Exam Results & Cutoffs</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/sarkari-kam"
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Sarkari Kam (Citizen Services)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Preferences & Support Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-3 mb-6 space-y-1">
            <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Preferences & Support
            </p>

            {/* Dark Mode Switcher Row */}
            <div className="flex items-center justify-between p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  {resolvedTheme === "dark" ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="font-semibold text-sm block">Theme Appearance</span>
                  <span className="text-[11px] text-slate-400">
                    {resolvedTheme === "dark" ? "Dark Mode Active" : "Light Mode Active"}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="rounded-xl text-xs font-bold"
              >
                Toggle
              </Button>
            </div>

            <Link
              href="/faq"
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">FAQs & Test Guides</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/contact"
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Help & Support</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/privacy-policy"
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Privacy & Security</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            {/* Logout Row if user logged in */}
            {user && (
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm">Log Out Account</span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
