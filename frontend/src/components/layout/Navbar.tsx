"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/Button"
import {
  BookOpen,
  GraduationCap,
  Menu,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Award,
  CreditCard,
  Home,
  Laptop,
  Briefcase,
  FileText,
  Building2,
  Crown,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { getImageUrl } from "@/lib/api"

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProfileOpen])

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/exams", label: "Exams", icon: BookOpen },
    { href: "/courses", label: "Computer Courses", icon: Laptop },
    { href: "/latest-jobs", label: "Latest Jobs", icon: Briefcase },
    { href: "/admitcards", label: "Admit Cards", icon: FileText },
    { href: "/results", label: "Results", icon: Award },
    { href: "/sarkari-kam", label: "Sarkari Kam", icon: Building2 },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-primary">Sarkari</span> Spark
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5 lg:gap-1.5 bg-background/85 dark:bg-slate-950/75 p-1.5 rounded-full border border-indigo-500/25 dark:border-indigo-500/35 shadow-sm shadow-indigo-500/5 backdrop-blur-md">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={`desktop-nav-${index}-${link.href}`}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 lg:px-3.5 lg:py-2 rounded-full transition-all duration-300 shrink-0 ${isActive
                      ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                      : "text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30"
                    }`}
                >
                  <link.icon className="h-3.5 w-3.5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex"
            >
              {mounted ? (
                resolvedTheme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              ) : (
                <div className="h-5 w-5" />
              )}
            </Button>

            {user ? (
              <div className="relative" ref={profileRef}>
                <Button
                  variant="ghost"
                  className="hidden md:flex items-center space-x-2"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  {user.avatar ? (
                    <img
                      src={getImageUrl(user.avatar)}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover border"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover shadow-lg">
                    <div className="p-2">
                      <Link href="/profile">
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button variant="ghost" className="w-full justify-start">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      {(user.role === "admin" || user.role === "superadmin") && (
                        <Link href="/admin">
                          <Button variant="ghost" className="w-full justify-start">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                      <Link href="/payment">
                        <Button variant="ghost" className="w-full justify-start">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Upgrade to Premium
                        </Button>
                      </Link>
                      <hr className="my-2" />
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive"
                        onClick={logout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl hover:bg-muted"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Slide-Over Backdrop + Panel) */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-background border-l border-border shadow-2xl flex flex-col justify-between overflow-y-auto p-5 z-10 animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <Link
                  href="/"
                  className="flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-extrabold tracking-tight">
                    <span className="text-primary">Sarkari</span> Spark
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Greeting / Quick Profile Card */}
              {user ? (
                <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-indigo-500"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-indigo-500/15 flex items-center gap-2">
                    <Link
                      href="/dashboard"
                      className="flex-1 py-1.5 text-center text-xs font-semibold rounded-lg bg-indigo-600 text-white shadow-xs"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex-1 py-1.5 text-center text-xs font-semibold rounded-lg bg-muted text-foreground hover:bg-muted/80"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-900/50 text-center space-y-2.5">
                  <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                    🎯 Crack Sarkari Exams with India&apos;s #1 Mock Test Portal
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button size="sm" className="w-full text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs">
                        Register
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="mt-5 space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Navigation
                </p>
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={`mobile-nav-${index}-${link.href}`}
                      href={link.href}
                      className={`flex items-center space-x-3 py-2.5 px-3.5 rounded-xl text-sm font-semibold transition-all ${isActive
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <link.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{link.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                    </Link>
                  )
                })}

                {/* Pro Pass Highlight in Drawer */}
                <Link
                  href="/payment"
                  className="flex items-center space-x-3 py-2.5 px-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-xs"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="flex-1">Get Pro Pass</span>
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded-md">Save 50%</span>
                </Link>

                {/* Admin Link if authorized */}
                {user && (user.role === "admin" || user.role === "superadmin") && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-3 py-2.5 px-3.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-4 border-t border-border mt-4 space-y-3">
              {user && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:bg-destructive/10 text-sm font-semibold rounded-xl"
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-2.5 h-4 w-4" />
                  Logout
                </Button>
              )}
              <p className="text-center text-[11px] text-muted-foreground">
                © {new Date().getFullYear()} Sarkari Spark • All Rights Reserved
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Fixed Mobile Bottom Navigation Bar (Hidden on Admin pages) */}
      {!pathname?.startsWith("/admin") && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] py-1.5 px-2">
          <div className="grid grid-cols-5 items-center max-w-md mx-auto">
            {/* 1. Home */}
            <Link
              href="/"
              className={`flex flex-col items-center justify-center py-1 transition-colors ${pathname === "/" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Home className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] leading-tight">Home</span>
            </Link>

            {/* 2. Exams */}
            <Link
              href="/exams"
              className={`flex flex-col items-center justify-center py-1 transition-colors ${pathname?.startsWith("/exams") ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <BookOpen className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] leading-tight">Exams</span>
            </Link>

            {/* 3. Pro Pass (Center Highlight) */}
            <Link
              href="/payment"
              className="flex flex-col items-center justify-center py-0.5 -mt-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Crown className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">Pro Pass</span>
            </Link>

            {/* 4. Jobs */}
            <Link
              href="/latest-jobs"
              className={`flex flex-col items-center justify-center py-1 transition-colors ${pathname?.startsWith("/latest-jobs") ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Briefcase className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] leading-tight">Jobs</span>
            </Link>

            {/* 5. Menu Drawer */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="flex flex-col items-center justify-center py-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {user?.avatar ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt="User"
                  className="h-5 w-5 rounded-full object-cover border mb-0.5"
                />
              ) : (
                <Menu className="h-5 w-5 mb-0.5" />
              )}
              <span className="text-[10px] leading-tight">{user ? "Account" : "Menu"}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
