"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import Link from "next/link"
import { useParams } from "next/navigation"
import api from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Clock,
  BookOpen,
  Target,
  AlertCircle,
  Play,
  Star,
  Users,
  Trophy,
  Crown,
  CheckCircle,
  FileText,
  BarChart3,
} from "lucide-react"

export default function ExamDetailPage() {
  const params = useParams()
  const examId = params.id as string
  const [activeTab, setActiveTab] = useState("overview")

  const { data: examData, isLoading } = useQuery(
    ["exam", examId],
    () => api.get(`/exams/${examId}`)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const exam = examData?.data?.exam

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Exam not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-sm">
                {exam.category}
              </Badge>
              {exam.subCategory && (
                <Badge variant="outline" className="text-sm">
                  {exam.subCategory}
                </Badge>
              )}
              {exam.isPremium && (
                <Badge variant="warning" className="gap-1">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{exam.title}</h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
              {exam.description || `Practice ${exam.category} exam with ${exam.totalQuestions} questions. Improve your preparation with detailed analytics and explanations.`}
            </p>

            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{exam.duration} minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="font-semibold">{exam.totalQuestions} Questions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Marks</p>
                  <p className="font-semibold">{exam.totalMarks} Marks</p>
                </div>
              </div>
              {exam.ratings?.count > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-600 fill-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="font-semibold">{exam.ratings.average.toFixed(1)} ({exam.ratings.count})</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href={`/exams/${examId}/attempt`}>
                <Button size="lg" className="gap-2 btn-glow">
                  <Play className="h-5 w-5" />
                  Start Exam
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-2">
                <BarChart3 className="h-5 w-5" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Difficulty Level</p>
                      <p className="font-semibold">{exam.difficulty}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Language</p>
                      <p className="font-semibold">{exam.language}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Passing Marks</p>
                      <p className="font-semibold">{exam.passingMarks}%</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Negative Marking</p>
                      <p className="font-semibold">
                        {exam.negativeMarking > 0 ? `${exam.negativeMarking} per wrong answer` : "No negative marking"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What You Will Get</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { icon: CheckCircle, text: "Instant Results & Scorecard" },
                      { icon: FileText, text: "Detailed Solutions & Explanations" },
                      { icon: BarChart3, text: "Performance Analytics" },
                      { icon: Trophy, text: "All India Ranking" },
                      { icon: Users, text: "Compare with Top Performers" },
                      { icon: Target, text: "Weak Area Analysis" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3">
                        <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="syllabus">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Syllabus</CardTitle>
                  <CardDescription>Topics covered in this exam</CardDescription>
                </CardHeader>
                <CardContent>
                  {exam.syllabus && exam.syllabus.length > 0 ? (
                    <div className="space-y-4">
                      {exam.syllabus.map((topic: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{topic.topic}</span>
                          </div>
                          <Badge variant="secondary">{topic.weightage}% weightage</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <p>Syllabus information will be updated soon</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructions">
              <Card>
                <CardHeader>
                  <CardTitle>Important Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(exam.instructions || [
                      "Read all questions carefully before answering.",
                      "Each question carries equal marks unless specified otherwise.",
                      "There is no negative marking for unattempted questions.",
                      "Timer will start once you click 'Start Exam'.",
                      "Do not refresh the page during the exam.",
                      "Submit your exam before the timer ends.",
                    ]).map((instruction: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                        <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-muted-foreground">{instruction}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900">Important Note</p>
                        <p className="text-sm text-amber-800">
                          Once you start the exam, the timer cannot be paused. Make sure you have a stable internet connection and enough time to complete the exam.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Students who scored highest in this exam</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <div
                        key={rank}
                        className={`flex items-center justify-between p-4 rounded-xl ${
                          rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200" : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                            rank === 1 ? "bg-yellow-400 text-yellow-900" :
                            rank === 2 ? "bg-gray-300 text-gray-900" :
                            rank === 3 ? "bg-orange-400 text-orange-900" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {rank}
                          </div>
                          <div>
                            <p className="font-semibold">Student Name {rank}</p>
                            <p className="text-sm text-muted-foreground">Completed on {new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{95 - rank * 3}%</p>
                          <p className="text-sm text-muted-foreground">{180 - rank * 10} mins</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  )
}
