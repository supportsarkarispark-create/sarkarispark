"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import Link from "next/link"
import { useParams } from "next/navigation"
import { computerCourseExamsAPI, computerCourseQuestionsAPI, computerCourseResultsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Clock, BookOpen, Target, AlertCircle, Play, CheckCircle, 
  BarChart3, ArrowLeft, GraduationCap, List, Users, Trophy,
  Star, Lock, Crown
} from "lucide-react"

export default function ComputerExamDetailPage() {
  const params = useParams()
  const examId = params.id as string
  const [activeTab, setActiveTab] = useState("overview")

  const { data: examData, isLoading: examLoading } = useQuery(
    ["computer-exam", examId],
    () => computerCourseExamsAPI.getExam(examId)
  )

  const { data: questionsData } = useQuery(
    ["computer-exam-questions", examId],
    () => computerCourseQuestionsAPI.getExamQuestions(examId)
  )

  const { data: checkResultData } = useQuery(
    ["computer-exam-check", examId],
    () => computerCourseResultsAPI.checkCompletion(examId)
  )

  const { data: leaderboardData } = useQuery(
    ["computer-exam-leaderboard", examId],
    () => computerCourseResultsAPI.getLeaderboard(examId, 5)
  )

  const exam = examData?.data?.exam
  const questions = questionsData?.data?.questions || []
  const hasCompleted = checkResultData?.data?.hasCompleted || false
  const previousResult = checkResultData?.data?.result || null
  const leaderboard = leaderboardData?.data?.leaderboard || []

  if (examLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center">Exam Not Found</CardTitle>
            <CardDescription className="text-center">
              The exam you are looking for does not exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/courses">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canStartExam = questions.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-primary/5" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-4xl mx-auto">
            <Link href="/courses" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-sm gap-1">
                <GraduationCap className="h-3 w-3" />
                Computer Course
              </Badge>
              {/* Premium Badge */}
              {exam.accessType === 'premium' && (
                <Badge className="text-sm gap-1 bg-amber-500 text-white">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              )}
              {exam.accessType === 'login' && (
                <Badge variant="secondary" className="text-sm gap-1 bg-blue-500 text-white">
                  <Lock className="h-3 w-3" />
                  Login Required
                </Badge>
              )}
              {exam.accessType === 'free' && (
                <Badge variant="outline" className="text-sm text-green-600 border-green-600">
                  Free
                </Badge>
              )}
              <Badge variant="outline" className="text-sm">
                {questions.length} / {exam.totalQuestions} Questions Available
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{exam.title}</h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
              {exam.description || `Practice exam with ${exam.totalQuestions} questions. Improve your skills.`}
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
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <List className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Passing Marks</p>
                  <p className="font-semibold">{exam.passingMarks}%</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Premium Exam Lock */}
              {exam.accessType === 'premium' ? (
                <div className="w-full">
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                          <Crown className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-amber-900">Premium Exam</h3>
                          <p className="text-amber-800 mb-3">
                            This is a premium exam. Please upgrade to access it.
                          </p>
                          <Link href="/pricing">
                            <Button className="gap-2 bg-amber-500 hover:bg-amber-600">
                              <Star className="h-4 w-4" />
                              Upgrade to Premium
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : exam.accessType === 'login' ? (
                <div className="w-full">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <Lock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-blue-900">Login Required</h3>
                          <p className="text-blue-800 mb-3">
                            Please login to access this exam.
                          </p>
                          <Link href="/login">
                            <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
                              <Lock className="h-4 w-4" />
                              Login
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : hasCompleted ? (
                <Link href={`/dashboard/computer-results/${previousResult?.id}`}>
                  <Button size="lg" className="gap-2 btn-glow">
                    <BarChart3 className="h-5 w-5" />
                    View Your Result ({previousResult?.percentage}%)
                  </Button>
                </Link>
              ) : canStartExam ? (
                <Link href={`/computer-exams/${examId}/attempt`}>
                  <Button size="lg" className="gap-2 btn-glow">
                    <Play className="h-5 w-5" />
                    Start Exam
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="gap-2" disabled>
                  <AlertCircle className="h-5 w-5" />
                  No Questions Available
                </Button>
              )}
              <Link href="/dashboard/computer-results">
                <Button variant="outline" size="lg" className="gap-2">
                  <BarChart3 className="h-5 w-5" />
                  My Results
                </Button>
              </Link>
            </div>

            {hasCompleted ? (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Exam Completed</p>
                  <p className="text-sm text-green-800">
                    You scored {previousResult?.percentage}% on this exam. 
                    {previousResult?.passed ? " Congratulations on passing!" : " Try again to improve your score."}
                  </p>
                </div>
              </div>
            ) : !canStartExam && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Questions Not Available</p>
                  <p className="text-sm text-amber-800">
                    This exam doesn&apos;t have any questions yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="leaderboard" className="gap-2">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Passing Marks</p>
                      <p className="font-semibold">{exam.passingMarks}%</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
                      <p className="font-semibold">{exam.totalQuestions}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Available Questions</p>
                      <p className="font-semibold">{questions.length}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Exam Duration</p>
                      <p className="font-semibold">{exam.duration} minutes</p>
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
                      { icon: BookOpen, text: "Detailed Solutions" },
                      { icon: BarChart3, text: "Performance Analytics" },
                      { icon: Target, text: "Correct Answer Analysis" },
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

            <TabsContent value="instructions">
              <Card>
                <CardHeader>
                  <CardTitle>Important Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "Read all questions carefully before answering.",
                      "Each question carries marks as specified.",
                      "There is no negative marking for wrong answers.",
                      "Timer will start once you click 'Start Exam'.",
                      "Do not refresh the page during the exam.",
                      "Submit your exam before the timer ends.",
                      "You can navigate between questions.",
                    ].map((instruction: string, index: number) => (
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
                          Once you start the exam, the timer cannot be paused.
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
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Students who scored highest in this exam</CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4" />
                      <p>No results yet. Be the first to take this exam!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {leaderboard.map((entry: any) => (
                        <div
                          key={entry.rank}
                          className={`flex items-center justify-between p-4 rounded-xl ${
                            entry.rank <= 3 
                              ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200" 
                              : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                              entry.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                              entry.rank === 2 ? "bg-gray-300 text-gray-900" :
                              entry.rank === 3 ? "bg-orange-400 text-orange-900" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {entry.rank}
                            </div>
                            <div>
                              <p className="font-semibold">{entry.user?.name || "Anonymous"}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(entry.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">{entry.percentage}%</p>
                            <p className="text-sm text-muted-foreground">{Math.floor(entry.timeTaken / 60)}m</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
