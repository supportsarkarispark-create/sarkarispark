"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Avatar, AvatarFallback } from "@/components/ui/Avatar"
import { Input } from "@/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/DropdownMenu"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import toast from "react-hot-toast"
import {
  Users,
  GraduationCap,
  CreditCard,
  Award,
  TrendingUp,
  DollarSign,
  UserCheck,
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings as SettingsIcon,
  Calendar,
  Download,
  Shield,
  BarChart3,
  ImageIcon,
  Activity,
  Trophy,
  Building2,
  BookOpen,
  Laptop,
  FolderOpen,
  Edit,
  Trash2,
  HelpCircle,
  Ban,
  Check,
  Briefcase,
  MessageCircle,
  Flame,
  LayoutDashboard,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Sliders,
  Eye,
  RefreshCw,
} from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isLoading: authLoading } = useAuth()

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard")

  // Module search filter
  const [moduleSearch, setModuleSearch] = useState("")

  // User filter states
  const [userSearch, setUserSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Check if user is admin
  const isAdmin = user?.role === "admin" || user?.role === "superadmin"

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery(
    ["admin-stats"],
    () => adminAPI.getDashboardStats(),
    {
      enabled: !!user && isAdmin,
      refetchInterval: 30000,
    }
  )

  const { data: usersData, isLoading: usersLoading } = useQuery(
    ["admin-users", { search: userSearch, role: roleFilter, status: statusFilter }],
    () =>
      adminAPI.getUsers({
        search: userSearch || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        subscriptionType: statusFilter !== "all" ? statusFilter : undefined,
      }),
    {
      enabled: !!user && isAdmin,
      refetchInterval: 30000,
    }
  )

  // User mutations
  const updateUserMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => adminAPI.updateUser(id, data),
    {
      onSuccess: () => {
        toast.success("User updated successfully")
        queryClient.invalidateQueries(["admin-users"])
        queryClient.invalidateQueries(["admin-stats"])
        setIsEditDialogOpen(false)
        setSelectedUser(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update user")
      },
    }
  )

  const deleteUserMutation = useMutation(
    (id: string) => adminAPI.deleteUser(id),
    {
      onSuccess: () => {
        toast.success("User deleted successfully")
        queryClient.invalidateQueries(["admin-users"])
        queryClient.invalidateQueries(["admin-stats"])
        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete user")
      },
    }
  )

  // Export users to PDF
  const exportUsers = async () => {
    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.text("User Management Report", 14, 20)

    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total Users: ${filteredUsers.length}`, 14, 38)

    const headers = ["Name", "Email", "Role", "Subscription", "Status", "Created At"]
    let y = 50

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    headers.forEach((header, i) => {
      doc.text(header, 14 + i * 32, y)
    })

    doc.setFont("helvetica", "normal")
    filteredUsers.forEach((u: any) => {
      y += 8
      if (y > 280) {
        doc.addPage()
        y = 20
      }

      const row = [
        u.name?.substring(0, 15) || "",
        u.email?.substring(0, 20) || "",
        u.role,
        u.subscriptionType || "free",
        u.isActive ? "Active" : "Inactive",
        new Date(u.createdAt).toLocaleDateString(),
      ]

      row.forEach((cell, i) => {
        doc.text(String(cell), 14 + i * 32, y)
      })
    })

    doc.save(`users-${new Date().toISOString().split("T")[0]}.pdf`)
  }

  // Filter users locally
  const filteredUsers = (usersData?.data?.users || []).filter((u: any) => {
    const matchesSearch =
      userSearch === "" ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "inactive" && !u.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery(
    ["admin-payments"],
    () => adminAPI.getPayments(),
    {
      enabled: !!user && isAdmin,
      refetchInterval: 30000,
    }
  )

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
    ["admin-analytics"],
    () => adminAPI.getAnalytics("30"),
    {
      enabled: !!user && isAdmin,
      refetchInterval: 60000,
    }
  )

  // Redirect if not admin
  if (!authLoading && (!user || !isAdmin)) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center p-8 border-red-200 dark:border-red-900/50 shadow-2xl">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Admin Access Required</h1>
            <p className="text-muted-foreground text-sm mb-6">
              You must be logged in with an administrator account to access the Sarkari Spark Command Center.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/">
                <Button variant="outline">Go Home</Button>
              </Link>
              <Link href="/login?redirect=/admin">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  Login as Admin
                </Button>
              </Link>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  const stats = statsData?.data?.stats || {}
  const recent = statsData?.data?.recent || {}
  const payments = paymentsData?.data?.payments || []
  const analytics = analyticsData?.data?.analytics || {}

  // Stat Cards Configuration
  const statCards = [
    {
      title: "Total Aspirants",
      value: stats.users?.total !== undefined ? Number(stats.users.total).toLocaleString() : "0",
      change: stats.users?.newToday > 0 ? `+${stats.users.newToday} joined today` : "Live Real-Time",
      icon: Users,
      color: "from-blue-600 to-indigo-600",
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40",
    },
    {
      title: "Active Subscriptions",
      value: stats.users?.premium !== undefined ? Number(stats.users.premium).toLocaleString() : "0",
      change: "Active Pro Students",
      icon: CreditCard,
      color: "from-purple-600 to-violet-600",
      accent: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/40",
    },
    {
      title: "Total Revenue",
      value: `₹${(stats.revenue?.total || 0).toLocaleString("en-IN")}`,
      change: stats.revenue?.today > 0 ? `+₹${stats.revenue.today} today` : "All Time Verified",
      icon: DollarSign,
      color: "from-emerald-600 to-teal-600",
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40",
    },
    {
      title: "Full Mock Tests",
      value: stats.exams?.total !== undefined ? Number(stats.exams.total).toLocaleString() : "0",
      change: `${stats.exams?.published || 0} active in portal`,
      icon: GraduationCap,
      color: "from-amber-600 to-orange-600",
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
    },
    {
      title: "Practice Questions",
      value: stats.questions?.total !== undefined ? Number(stats.questions.total).toLocaleString() : "0",
      change: "Bilingual Question Bank",
      icon: FileText,
      color: "from-rose-600 to-pink-600",
      accent: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40",
    },
  ]

  // Recent Activity Processing
  const recentActivity: any[] = []

  if (recent.users) {
    recent.users.forEach((u: any) => {
      recentActivity.push({
        action: `New user registered: ${u.name}`,
        user: u.email,
        time: new Date(u.createdAt).toLocaleString(),
        icon: UserCheck,
        type: "user",
      })
    })
  }

  if (recent.payments) {
    recent.payments.forEach((payment: any) => {
      recentActivity.push({
        action: `Payment received: ₹${payment.amount} (${payment.plan || "Pro"})`,
        user: payment.user?.name || "Student",
        time: new Date(payment.createdAt).toLocaleString(),
        icon: CreditCard,
        type: "payment",
      })
    })
  }

  if (recent.results) {
    recent.results.forEach((result: any) => {
      recentActivity.push({
        action: `Completed mock test: ${result.examId?.title || "Online Exam"}`,
        user: result.userId?.name || "Student",
        time: new Date(result.createdAt || result.submittedAt).toLocaleString(),
        icon: Trophy,
        type: "exam",
      })
    })
  }

  recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  const activityFeed = recentActivity.slice(0, 8)

  // ALL 18 ADMIN TOOLS CATEGORIZED LOGICALLY (ZERO FEATURES REMOVED)
  const allModules = [
    // 1. Examination & Question Bank (6 tools)
    {
      id: "exams",
      title: "Exams Management",
      subtitle: "Create, publish & manage mock tests",
      href: "/admin/exams",
      category: "exams",
      categoryName: "Examination & Tests",
      icon: GraduationCap,
      badge: "Core",
      color: "from-blue-600 to-indigo-700",
      accent: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    },
    {
      id: "questions",
      title: "Question Bank",
      subtitle: "Add, edit & bulk import questions",
      href: "/admin/questions",
      category: "exams",
      categoryName: "Examination & Tests",
      icon: FileText,
      badge: "Bilingual",
      color: "from-purple-600 to-indigo-600",
      accent: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
    },
    {
      id: "categories",
      title: "Exam Categories",
      subtitle: "SSC, Police, Railway, Banking groups",
      href: "/admin/categories",
      category: "exams",
      categoryName: "Examination & Tests",
      icon: FolderOpen,
      color: "from-amber-600 to-orange-600",
      accent: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    },
    {
      id: "courses",
      title: "Computer Courses",
      subtitle: "IT courses, curriculum & test series",
      href: "/admin/courses",
      category: "exams",
      categoryName: "Examination & Tests",
      icon: Laptop,
      color: "from-cyan-600 to-blue-700",
      accent: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
    },
    {
      id: "study-materials",
      title: "Study Materials",
      subtitle: "PDF notes, video lectures & PYQs",
      href: "/admin/study-materials",
      category: "exams",
      categoryName: "Examination & Tests",
      icon: BookOpen,
      color: "from-teal-600 to-emerald-700",
      accent: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
    },
    {
      id: "results",
      title: "Exam Results",
      subtitle: "Student attempts, scorecards & rank lists",
      href: "/admin/results",
      category: "exams",
      categoryName: "Examination & Tests",
      icon: Trophy,
      badge: "Rankings",
      color: "from-yellow-500 to-amber-600",
      accent: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
    },

    // 2. Sarkari Recruitment Hub (4 tools)
    {
      id: "latest-jobs",
      title: "Latest Jobs",
      subtitle: "Govt job vacancies & online notifications",
      href: "/admin/latest-jobs",
      category: "recruitment",
      categoryName: "Sarkari Recruitment Hub",
      icon: Briefcase,
      badge: "Live Updates",
      color: "from-blue-600 to-sky-700",
      accent: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    },
    {
      id: "admitcards",
      title: "Admit Cards",
      subtitle: "Hall tickets, city slips & call letters",
      href: "/admin/admitcards",
      category: "recruitment",
      categoryName: "Sarkari Recruitment Hub",
      icon: Award,
      color: "from-emerald-600 to-green-700",
      accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    },
    {
      id: "gov-results",
      title: "Govt Results",
      subtitle: "Official exam cutoffs & final merit lists",
      href: "/admin/gov-results",
      category: "recruitment",
      categoryName: "Sarkari Recruitment Hub",
      icon: Building2,
      color: "from-teal-600 to-cyan-700",
      accent: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
    },
    {
      id: "sarkari-kam",
      title: "Sarkari Works",
      subtitle: "Certificates, citizen cards & utilities",
      href: "/admin/sarkari-kam",
      category: "recruitment",
      categoryName: "Sarkari Recruitment Hub",
      icon: Shield,
      color: "from-rose-600 to-red-700",
      accent: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    },

    // 3. Appearance & Homepage Content (5 tools)
    {
      id: "slider",
      title: "Hero Banner Slider",
      subtitle: "Homepage dynamic banner images & links",
      href: "/admin/slider",
      category: "appearance",
      categoryName: "Appearance & Content",
      icon: Sliders,
      badge: "Homepage Banner",
      color: "from-purple-600 to-pink-600",
      accent: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
    },
    {
      id: "popular-exams",
      title: "Popular Exams",
      subtitle: "Featured exams carousel on homepage",
      href: "/admin/popular-exams",
      category: "appearance",
      categoryName: "Appearance & Content",
      icon: Flame,
      color: "from-orange-600 to-amber-600",
      accent: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
    },
    {
      id: "media",
      title: "Media Library",
      subtitle: "Upload & organize image assets",
      href: "/admin/media",
      category: "appearance",
      categoryName: "Appearance & Content",
      icon: ImageIcon,
      color: "from-green-600 to-emerald-700",
      accent: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300",
    },
    {
      id: "settings",
      title: "Site Settings",
      subtitle: "Hero text, live counters, branding & SEO",
      href: "/admin/settings",
      category: "appearance",
      categoryName: "Appearance & Content",
      icon: SettingsIcon,
      badge: "Config",
      color: "from-slate-700 to-slate-900",
      accent: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
    {
      id: "about",
      title: "About Page",
      subtitle: "Platform credentials, mission & story",
      href: "/admin/about",
      category: "appearance",
      categoryName: "Appearance & Content",
      icon: Building2,
      color: "from-pink-600 to-rose-700",
      accent: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
    },

    // 4. Monetization, Engagement & Support (3 tools)
    {
      id: "pricing",
      title: "Pricing & Plans",
      subtitle: "Test series subscriptions & exam pricing",
      href: "/admin/pricing",
      category: "business",
      categoryName: "Monetization & Engagement",
      icon: DollarSign,
      badge: "Pro Pass",
      color: "from-emerald-600 to-teal-700",
      accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    },
    {
      id: "feedback",
      title: "Student Feedback",
      subtitle: "Topper testimonials & student reviews",
      href: "/admin/feedback",
      category: "business",
      categoryName: "Monetization & Engagement",
      icon: MessageCircle,
      badge: "Testimonials",
      color: "from-amber-600 to-yellow-600",
      accent: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    },
    {
      id: "faqs",
      title: "FAQs Management",
      subtitle: "Student inquiries & bilingual answers",
      href: "/admin/faqs",
      category: "business",
      categoryName: "Monetization & Engagement",
      icon: HelpCircle,
      color: "from-indigo-600 to-violet-700",
      accent: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    },
  ]

  // Filter modules based on search
  const filteredModules = allModules.filter(
    (m) =>
      m.title.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      m.subtitle.toLowerCase().includes(moduleSearch.toLowerCase()) ||
      m.categoryName.toLowerCase().includes(moduleSearch.toLowerCase())
  )

  const hubs = [
    {
      id: "exams",
      title: "Examination & Question Bank",
      description: "Manage tests, bilingual questions, categories, IT courses, and result analytics",
      icon: GraduationCap,
      color: "text-indigo-600 dark:text-indigo-400",
      modules: filteredModules.filter((m) => m.category === "exams"),
    },
    {
      id: "recruitment",
      title: "Sarkari Recruitment Hub",
      description: "Manage latest vacancies, hall tickets, govt results, and citizen works",
      icon: Briefcase,
      color: "text-blue-600 dark:text-blue-400",
      modules: filteredModules.filter((m) => m.category === "recruitment"),
    },
    {
      id: "appearance",
      title: "Appearance & Homepage Content",
      description: "Hero banner sliders, popular exams carousel, media library, and site settings",
      icon: Sparkles,
      color: "text-purple-600 dark:text-purple-400",
      modules: filteredModules.filter((m) => m.category === "appearance"),
    },
    {
      id: "business",
      title: "Monetization & Student Engagement",
      description: "Exam passes, student testimonials, and bilingual FAQ helpdesk",
      icon: Award,
      color: "text-emerald-600 dark:text-emerald-400",
      modules: filteredModules.filter((m) => m.category === "business"),
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* 1. Executive Command Center Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/40 shadow-xl">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Title & Status */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Sarkari Spark Command Center
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Server • 30s Realtime Sync
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                Executive Dashboard
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-normal">
                Manage all 18 platform modules, student accounts, mock tests, questions, and homepage banners with zero clutter.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchStats()}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-2 backdrop-blur-md"
              >
                <RefreshCw className={`h-4 w-4 ${statsLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh Data</span>
              </Button>
              
              <Link href="/" target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-slate-900 gap-2 backdrop-blur-md transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Live Website
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </Link>

              <Link href="/admin/settings">
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Site Settings
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* 2. Executive KPI Metrics Bar (Glassmorphic) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {statsLoading ? <span className="animate-pulse">...</span> : stat.value}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 3. Main Navigation Tabs: Un-Cluttered & Smart */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            <TabsList className="bg-slate-200/70 dark:bg-slate-900/90 p-1 rounded-2xl h-auto flex flex-wrap gap-1">
              <TabsTrigger value="dashboard" className="gap-2 rounded-xl text-xs sm:text-sm font-semibold py-2 px-4">
                <LayoutDashboard className="h-4 w-4" />
                All 18 Modules
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2 rounded-xl text-xs sm:text-sm font-semibold py-2 px-4">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2 rounded-xl text-xs sm:text-sm font-semibold py-2 px-4">
                <CreditCard className="h-4 w-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 rounded-xl text-xs sm:text-sm font-semibold py-2 px-4">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2 rounded-xl text-xs sm:text-sm font-semibold py-2 px-4">
                <Activity className="h-4 w-4" />
                Live Feed
              </TabsTrigger>
            </TabsList>

            {activeTab === "dashboard" && (
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Quick find module (e.g. slider, exam)..."
                  value={moduleSearch}
                  onChange={(e) => setModuleSearch(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs sm:text-sm shadow-sm"
                />
              </div>
            )}
          </div>

          {/* TAB 1: ALL 18 MODULES (ORGANIZED INTO 4 CATEGORIZED HUBS) */}
          <TabsContent value="dashboard" className="space-y-10 focus:outline-none">
            
            {/* Quick Hero Banner Slider Spotlight Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-500/20">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs">
                  <Sparkles className="h-3.5 w-3.5 fill-slate-950" /> Homepage Hero Slider Connected
                </span>
                <h3 className="text-xl sm:text-2xl font-bold">Manage Homepage Banner Sliders</h3>
                <p className="text-indigo-200 text-sm max-w-xl">
                  Upload promotional banners, notification posters, or video slides. Changes reflect instantly on the public home screen.
                </p>
              </div>
              <Link href="/admin/slider" className="flex-shrink-0">
                <Button className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold gap-2 rounded-xl px-6 py-5 shadow-lg shadow-amber-400/20">
                  <Sliders className="h-4 w-4" />
                  Open Slider Manager
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Categorized Hubs */}
            {hubs.map((hub) => (
              hub.modules.length > 0 && (
                <div key={hub.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <hub.icon className={`h-5 w-5 ${hub.color}`} />
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        {hub.title}
                      </h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                        {hub.modules.length} Tools
                      </span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hub.modules.map((module) => (
                      <Link key={module.id} href={module.href}>
                        <Card className="group h-full border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer rounded-2xl">
                          <CardContent className="p-5 flex items-start gap-4">
                            <div className={`h-12 w-12 rounded-xl ${module.accent} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                              <module.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-bold text-slate-900 dark:text-white text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {module.title}
                                </p>
                                {module.badge && (
                                  <Badge variant="outline" className="text-[10px] px-2 py-0 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold flex-shrink-0">
                                    {module.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {module.subtitle}
                              </p>
                              <div className="mt-3 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                <span>Open tool</span>
                                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            ))}

            {filteredModules.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Search className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-lg font-bold text-slate-900 dark:text-white">No administrative tool matched &quot;{moduleSearch}&quot;</p>
                <p className="text-sm text-slate-500 mt-1">Try searching for &quot;exams&quot;, &quot;slider&quot;, &quot;questions&quot;, or &quot;jobs&quot;</p>
                <Button variant="outline" size="sm" onClick={() => setModuleSearch("")} className="mt-4">
                  Clear Search
                </Button>
              </div>
            )}

            {/* Split Bottom Preview: Live Activity & Quick Analytics Summary */}
            <div className="grid lg:grid-cols-2 gap-6 pt-4">
              
              {/* Activity Mini Feed */}
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-500" />
                      Live Platform Stream
                    </CardTitle>
                    <CardDescription className="text-xs">Real-time attempts, registrations & payments</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("activity")} className="text-xs text-indigo-600 dark:text-indigo-400">
                    View Full Feed →
                  </Button>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="py-8 text-center text-xs text-slate-400">Loading live stream...</div>
                  ) : activityFeed.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">No activity recorded yet</div>
                  ) : (
                    <div className="space-y-3">
                      {activityFeed.slice(0, 5).map((act: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            act.type === "payment" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50" :
                            act.type === "exam" ? "bg-blue-100 text-blue-600 dark:bg-blue-950/50" :
                            "bg-purple-100 text-purple-600 dark:bg-purple-950/50"
                          }`}>
                            <act.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-slate-900 dark:text-slate-200">{act.action}</p>
                            <p className="text-[11px] text-slate-400 truncate">{act.user}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{act.time.split(",")[1] || act.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Popular Exams List */}
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      Top Attempted Mock Tests (30 Days)
                    </CardTitle>
                    <CardDescription className="text-xs">Highest student engagement</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("analytics")} className="text-xs text-indigo-600 dark:text-indigo-400">
                    Full Analytics →
                  </Button>
                </CardHeader>
                <CardContent>
                  {analyticsLoading ? (
                    <div className="py-8 text-center text-xs text-slate-400">Loading popular exams...</div>
                  ) : !analytics?.popularExams || analytics.popularExams.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">No exam attempts recorded yet</div>
                  ) : (
                    <div className="space-y-3">
                      {analytics.popularExams.slice(0, 5).map((exam: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-slate-200 truncate">{exam.title}</span>
                          </div>
                          <Badge variant="outline" className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            {exam.attempts} attempts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

          </TabsContent>

          {/* TAB 2: USER MANAGEMENT (100% COMPLETE & PRESERVED) */}
          <TabsContent value="users" className="focus:outline-none">
            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm overflow-hidden">
              <CardHeader className="p-6 sm:p-8 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold">User Management</CardTitle>
                    <CardDescription className="text-sm">Manage registered aspirants, roles, subscriptions, and security</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-9 w-full sm:w-48 h-9 text-xs rounded-xl"
                      />
                    </div>
                    {/* Role Filter */}
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full sm:w-32 h-9 text-xs rounded-xl">
                        <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-32 h-9 text-xs rounded-xl">
                        <CheckCircle className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Export PDF */}
                    <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-xl text-xs" onClick={exportUsers}>
                      <Download className="h-3.5 w-3.5" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold text-base">No users found</p>
                    <p className="text-xs mt-1">Try adjusting your search query or filters</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                          <th className="text-left p-4 pl-6">Student Name</th>
                          <th className="text-left p-4">Email</th>
                          <th className="text-left p-4">Role</th>
                          <th className="text-left p-4">Plan</th>
                          <th className="text-left p-4">Account Status</th>
                          <th className="text-right p-4 pr-6">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                        {filteredUsers.slice(0, 15).map((u: any) => (
                          <tr key={u._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
                                    {u.name?.charAt(0).toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-slate-900 dark:text-white">{u.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600 dark:text-slate-400 font-normal">{u.email}</td>
                            <td className="p-4">
                              <Badge variant={u.role === "admin" || u.role === "superadmin" ? "default" : "secondary"} className="text-xs capitalize">
                                {u.role}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge variant={u.subscriptionType === "premium" ? "success" : "outline"} className="text-xs capitalize">
                                {u.subscriptionType || "free"}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${u.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                  {u.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(u)
                                      setIsViewDialogOpen(true)
                                    }}
                                    className="gap-2 cursor-pointer"
                                  >
                                    <FileText className="h-4 w-4" />
                                    View Full Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(u)
                                      setIsEditDialogOpen(true)
                                    }}
                                    className="gap-2 cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit Role / Status
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      updateUserMutation.mutate({
                                        id: u._id,
                                        data: { isActive: !u.isActive },
                                      })
                                    }}
                                    className="gap-2 cursor-pointer"
                                  >
                                    {u.isActive ? (
                                      <>
                                        <Ban className="h-4 w-4 text-amber-500" />
                                        Deactivate Account
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 text-emerald-500" />
                                        Activate Account
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(u)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                    className="gap-2 text-red-600 cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: PAYMENTS & TRANSACTIONS (100% COMPLETE & PRESERVED) */}
          <TabsContent value="payments" className="focus:outline-none">
            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm overflow-hidden">
              <CardHeader className="p-6 sm:p-8 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold">Payment Transactions</CardTitle>
                  <CardDescription className="text-sm">Razorpay order history, student subscriptions, and revenue logs</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2 h-9 rounded-xl text-xs">
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {paymentsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold text-base">No payment transactions recorded</p>
                    <p className="text-xs mt-1">Student payments via Razorpay will be logged here in real-time</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                          <th className="text-left p-4 pl-6">Order ID</th>
                          <th className="text-left p-4">Student</th>
                          <th className="text-left p-4">Amount</th>
                          <th className="text-left p-4">Package</th>
                          <th className="text-left p-4">Payment Status</th>
                          <th className="text-right p-4 pr-6">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                        {payments.slice(0, 15).map((payment: any) => (
                          <tr key={payment._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 pl-6 font-mono text-xs text-slate-700 dark:text-slate-300">
                              {payment.razorpayOrderId || payment._id}
                            </td>
                            <td className="p-4 font-semibold text-slate-900 dark:text-white">
                              {payment.user?.name || "Student"}
                            </td>
                            <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{payment.amount}
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="text-xs">
                                {payment.plan || "Mock Test Pass"}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant={
                                  payment.status === "completed"
                                    ? "success"
                                    : payment.status === "pending"
                                    ? "warning"
                                    : "destructive"
                                }
                                className="text-xs capitalize"
                              >
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="p-4 pr-6 text-right text-slate-500 dark:text-slate-400 text-xs">
                              {new Date(payment.createdAt).toLocaleDateString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: ANALYTICS & INSIGHTS (100% COMPLETE & PRESERVED) */}
          <TabsContent value="analytics" className="focus:outline-none space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Revenue Trends */}
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    Revenue Trend (Last 30 Days)
                  </CardTitle>
                  <CardDescription>Daily payment receipts</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : !analytics?.revenueData || analytics.revenueData.length === 0 ? (
                    <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No revenue recorded in the last 30 days</p>
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-56 pr-2">
                      {analytics.revenueData.slice(-10).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                          <span className="text-slate-500">{item._id}</span>
                          <span className="font-bold text-emerald-600">₹{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User Growth */}
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    User Registrations (Last 30 Days)
                  </CardTitle>
                  <CardDescription>Daily new student signups</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : !analytics?.userGrowth || analytics.userGrowth.length === 0 ? (
                    <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No user growth data recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-56 pr-2">
                      {analytics.userGrowth.slice(-10).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                          <span className="text-slate-500">{item._id}</span>
                          <span className="font-bold text-blue-600">+{item.count} students</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Popular Exams */}
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Most Attempted Exams
                  </CardTitle>
                  <CardDescription>Top rankings by student participation</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : !analytics?.popularExams || analytics.popularExams.length === 0 ? (
                    <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                      <Trophy className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No exam data available</p>
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-56 pr-2">
                      {analytics.popularExams.slice(0, 5).map((exam: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{exam.title}</span>
                          <Badge variant="outline" className="text-xs font-bold text-amber-600">{exam.attempts} attempts</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subscription Distribution */}
              <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    Plan Distribution
                  </CardTitle>
                  <CardDescription>Free vs Pro tier student breakdown</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  {analyticsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    </div>
                  ) : !analytics?.subscriptionDistribution || analytics.subscriptionDistribution.length === 0 ? (
                    <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No subscription data available</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {analytics.subscriptionDistribution.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                          <span className="font-bold uppercase tracking-wider">{item._id || "Free Tier"}</span>
                          <span className="text-slate-600 dark:text-slate-400 font-semibold">{item.count} students</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* TAB 5: LIVE ACTIVITY STREAM (100% COMPLETE & PRESERVED) */}
          <TabsContent value="activity" className="focus:outline-none">
            <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm overflow-hidden">
              <CardHeader className="p-6 sm:p-8 border-b border-slate-200/80 dark:border-slate-800 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
                    Live Activity Stream
                  </CardTitle>
                  <CardDescription className="text-sm">Continuous 30-second polling of all system activities</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchStats()} className="gap-2 h-9 rounded-xl text-xs">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                {statsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  </div>
                ) : activityFeed.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold text-base">No recent actions recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityFeed.map((activity: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            activity.type === "payment"
                              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50"
                              : activity.type === "exam"
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-950/50"
                              : "bg-purple-100 text-purple-600 dark:bg-purple-950/50"
                          }`}
                        >
                          <activity.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{activity.action}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">by {activity.user}</p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* DIALOG 1: VIEW USER DETAILS (100% PRESERVED) */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Profile Details</DialogTitle>
              <DialogDescription>Full student account & performance profile</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6 py-4">
                {/* Basic Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                    <div>
                      <span className="text-xs text-muted-foreground block">Full Name</span>
                      <p className="font-semibold">{selectedUser.name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Email Address</span>
                      <p className="font-semibold">{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Phone</span>
                      <p className="font-semibold">{selectedUser.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Assigned Role</span>
                      <Badge variant={selectedUser.role === "admin" || selectedUser.role === "superadmin" ? "default" : "secondary"}>
                        {selectedUser.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> Performance Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                      <span className="text-[11px] text-muted-foreground block">Exams Attempted</span>
                      <p className="text-xl font-bold">{selectedUser.stats?.totalExamsAttempted || 0}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                      <span className="text-[11px] text-muted-foreground block">Questions Solved</span>
                      <p className="text-xl font-bold">{selectedUser.stats?.totalQuestionsSolved || 0}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                      <span className="text-[11px] text-muted-foreground block">Average Score</span>
                      <p className="text-xl font-bold text-indigo-600">{selectedUser.stats?.averageScore || 0}%</p>
                    </div>
                  </div>
                </div>

                {/* Subscription */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Subscription Tier
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                    <div>
                      <span className="text-xs text-muted-foreground block">Plan Type</span>
                      <Badge variant={selectedUser.subscriptionType === "premium" ? "success" : "outline"} className="capitalize mt-1">
                        {selectedUser.subscriptionType || "free"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Expiration Date</span>
                      <p className="font-semibold">
                        {selectedUser.subscriptionExpiry
                          ? new Date(selectedUser.subscriptionExpiry).toLocaleDateString()
                          : "Lifetime / None"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Shield className="h-4 w-4" /> Account Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                    <div>
                      <span className="text-xs text-muted-foreground block">Status</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`h-2 w-2 rounded-full ${selectedUser.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                        <span className="font-semibold">{selectedUser.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Joined Date</span>
                      <p className="font-semibold">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG 2: EDIT USER (100% PRESERVED) */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Permissions</DialogTitle>
              <DialogDescription>Update user role and active/inactive status</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(val) => setSelectedUser({ ...selectedUser, role: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={selectedUser.isActive ? "active" : "inactive"}
                    onValueChange={(val) => setSelectedUser({ ...selectedUser, isActive: val === "active" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedUser) {
                    updateUserMutation.mutate({
                      id: selectedUser._id,
                      data: {
                        role: selectedUser.role,
                        isActive: selectedUser.isActive,
                      },
                    })
                  }
                }}
                disabled={updateUserMutation.isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {updateUserMutation.isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG 3: DELETE USER (100% PRESERVED) */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete user &quot;{selectedUser?.name}&quot; ({selectedUser?.email})? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedUser) {
                    deleteUserMutation.mutate(selectedUser._id)
                  }
                }}
                disabled={deleteUserMutation.isLoading}
              >
                {deleteUserMutation.isLoading ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>

      <Footer />
    </div>
  )
}
