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
                  className={`relative flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 lg:px-3.5 lg:py-2 rounded-full transition-all duration-300 shrink-0 ${
                    isActive
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
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={`mobile-nav-${index}-${link.href}`}
                  href={link.href}
                  className={`flex items-center space-x-3 py-2.5 px-5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive 
                      ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/15" 
                      : "text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
            
            <hr className="my-2" />
            
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user.avatar ? (
                    <img
                      src={getImageUrl(user.avatar)}
                      alt={user.name}
                      className="h-5 w-5 rounded-full object-cover border"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span>Profile</span>
                </Link>
                {(user.role === "admin" || user.role === "superadmin") && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-3 py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <Link
                  href="/payment"
                  className="flex items-center space-x-3 py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Upgrade to Premium</span>
                </Link>
                <hr className="my-2" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive py-3"
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-3 pt-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full py-3">Login</Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full py-3">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
