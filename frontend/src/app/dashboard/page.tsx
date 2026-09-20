"use client"

import { useQuery } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { resultsAPI, computerCourseResultsAPI } from "@/lib/api"
import api from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Progress } from "@/components/ui/Progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Target,
  Flame,
  Calendar,
  ArrowRight,
  BarChart3,
  Zap,
  Crown,
  Monitor,
  CheckCircle,
  XCircle,
} from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  
  const { data: analyticsData } = useQuery("analytics", resultsAPI.getAnalytics)
  const { data: resultsData } = useQuery("myResults", () => resultsAPI.getMyResults({ limit: 5 }))
  const { data: examsData } = useQuery("exams", () => api.get("/exams", { params: { limit: 6 } }))
  const { data: computerResultsData } = useQuery("computerResults", () => computerCourseResultsAPI.getMyResults())

  const analytics = analyticsData?.data?.analytics
  const recentResults = resultsData?.data?.results || []
  const exams = examsData?.data?.exams || []
  const computerResults = computerResultsData?.data?.results || []

  const statsCards = [
    {
      title: "Total Exams",
      value: analytics?.totalExams || 0,
      icon: BookOpen,
      trend: "+12%",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Avg Score",
      value: `${Math.round(analytics?.averageScore || 0)}%`,
      icon: Target,
      trend: "+5%",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Best Score",
      value: `${Math.round(analytics?.highestScore || 0)}%`,
      icon: Award,
      trend: "All time",
      color: "from-purple-500 to-purple-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{user?.name}</span> 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here&apos;s your learning progress and upcoming activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index} className="card-hover overflow-hidden">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                    <Badge variant="success" className="mt-2 text-[10px] sm:text-xs">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className={`h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-8">
            {/* Progress Overview */}
            <Card className="overflow-hidden">
              <CardHeader className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base lg:text-lg">Performance Overview</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Track your progress over time</CardDescription>
                  </div>
                  <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                {analytics?.progressOverTime && analytics.progressOverTime.length > 0 ? (
                  <div className="h-36 sm:h-48 flex items-end justify-around gap-1 sm:gap-2 p-2 sm:p-4 bg-muted/50 rounded-xl">
                    {analytics.progressOverTime.slice(-7).map((result: any, i: number) => (
                      <div key={i} className="flex flex-col items-center gap-1 sm:gap-2 flex-1">
                        <div
                          className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all hover:opacity-80"
                          style={{ height: `${Math.max(result.percentage, 10) * 1.5}px` }}
                        />
                        <span className="text-[10px] sm:text-xs text-muted-foreground truncate w-full text-center">
                          {new Date(result.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-36 sm:h-48 flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                    Take more exams to see your performance
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Exams */}
            <Card>
              <CardHeader className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base lg:text-lg">Recent Attempts</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Your latest exam results</CardDescription>
                  </div>
                  <Link href="/results">
                    <Button variant="ghost" className="gap-2 text-xs sm:text-sm">
                      View All
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {recentResults.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <BookOpen className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-xs sm:text-sm text-muted-foreground">No exams attempted yet</p>
                      <Link href="/exams">
                        <Button className="mt-4 text-xs sm:text-sm py-6">Start Your First Exam</Button>
                      </Link>
                    </div>
                  ) : (
                    recentResults.map((result: any) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center ${
                            result.status === "Passed" 
                              ? "bg-green-100 text-green-600" 
                              : "bg-red-100 text-red-600"
                          }`}>
                            <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs sm:text-sm line-clamp-1">{result.exam.title}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {result.exam.category} • {new Date(result.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg sm:text-xl font-bold">{result.percentage}%</p>
                          <Badge variant={result.status === "Passed" ? "success" : "destructive"} className="text-[10px] sm:text-xs">
                            {result.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Computer Course Results */}
            <Card>
              <CardHeader className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base lg:text-lg">Computer Course Results</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Your computer course exam results</CardDescription>
                  </div>
                  <Link href="/dashboard/computer-results">
                    <Button variant="ghost" className="gap-2 text-xs sm:text-sm">
                      View All
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {computerResults.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <Monitor className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-xs sm:text-sm text-muted-foreground">No computer course exams attempted yet</p>
                      <Link href="/courses">
                        <Button className="mt-4 text-xs sm:text-sm py-6">Browse Computer Courses</Button>
                      </Link>
                    </div>
                  ) : (
                    computerResults.slice(0, 5).map((result: any) => (
                      <Link key={result.id} href={`/dashboard/computer-results/${result.id}`}>
                        <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                          <div className="flex items-center gap-2 sm:gap-4">
                            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center ${
                              result.passed
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}>
                              {result.passed ? <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" /> : <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
                            </div>
                            <div>
                              <p className="font-semibold text-xs sm:text-sm line-clamp-1">{result.exam?.title || "Computer Exam"}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">
                                {result.course?.title || "Computer Course"} • {new Date(result.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg sm:text-xl font-bold">{result.percentage}%</p>
                            <Badge variant={result.passed ? "success" : "destructive"} className="text-[10px] sm:text-xs">
                              {result.passed ? "Passed" : "Failed"}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Available Exams */}
            <Card>
              <CardHeader className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base lg:text-lg">Recommended Exams</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Based on your target exams</CardDescription>
                  </div>
                  <Link href="/exams">
                    <Button variant="ghost" className="gap-2 text-xs sm:text-sm">
                      Browse All
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 lg:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {exams.slice(0, 4).map((exam: any) => (
                    <Link key={exam.id} href={`/exams/${exam.id}`}>
                      <div className="group p-3 sm:p-4 border rounded-xl hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="secondary" className="text-[10px] sm:text-xs">{exam.category}</Badge>
                          {exam.isPremium && (
                            <Badge variant="warning" className="gap-1 text-[10px] sm:text-xs">
                              <Crown className="h-3 w-3" />
                              Pro
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-xs sm:text-sm mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                          {exam.title}
                        </h4>
                        <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                            {exam.totalQuestions} Qs
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            {exam.duration} min
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Subscription Card */}
            <Card className="bg-gradient-to-br from-primary to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{user?.subscriptionType === "free" ? "Free Plan" : "Premium Plan"}</p>
                    <p className="text-sm text-white/80">
                      {user?.subscriptionType === "free" ? "Upgrade for more features" : "Active subscription"}
                    </p>
                  </div>
                </div>
                {user?.subscriptionType === "free" ? (
                  <>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Free exams used</span>
                        <span>3/5</span>
                      </div>
                      <Progress value={60} className="bg-white/20" />
                    </div>
                    <Link href="/payment">
                      <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold">
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade to Premium
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/payment">
                    <Button className="w-full bg-white text-indigo-700 hover:bg-white/90 font-bold shadow-md flex items-center justify-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      View Plan & Days Left
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
