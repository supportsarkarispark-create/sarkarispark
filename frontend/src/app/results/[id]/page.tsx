"use client"

import { useQuery } from "react-query"
import Link from "next/link"
import { useParams } from "next/navigation"
import { resultsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Progress } from "@/components/ui/Progress"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  ArrowLeft,
  Download,
  Share2,
  TrendingUp,
  Award,
  Timer,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

export default function ResultPage() {
  const params = useParams()
  const resultId = params.id as string

  const { data: resultData, isLoading } = useQuery(
    ["result", resultId],
    () => resultsAPI.getResult(resultId)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const result = resultData?.data?.result
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Result not found</p>
      </div>
    )
  }

  // Download result as PDF using print to PDF
  const handleDownload = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Result - ${result?.exam?.title || "Exam"}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #3b82f6; }
    .subtitle { color: #666; margin-top: 5px; }
    .status { display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
    .status-passed { background: #dcfce7; color: #166534; }
    .status-failed { background: #fee2e2; color: #991b1b; }
    .score-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
    .score-card { background: #f8fafc; padding: 20px; border-radius: 10px; text-align: center; }
    .score-value { font-size: 32px; font-weight: bold; color: #3b82f6; }
    .score-label { color: #64748b; margin-top: 5px; }
    .section { margin: 30px 0; }
    .section-title { font-size: 18px; font-weight: bold; color: #1e293b; border-left: 4px solid #3b82f6; padding-left: 15px; margin-bottom: 15px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">SARKARI SPARK</div>
    <div class="subtitle">Official Exam Result</div>
  </div>

  <div style="text-align: center;">
    <h1 style="margin: 0; color: #1e293b;">${result?.exam?.title || "Exam"}</h1>
    <p style="color: #64748b; margin: 10px 0;">
      ${new Date(result.submittedAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}
    </p>
    <div class="status ${result.status === "Passed" ? "status-passed" : "status-failed"}">
      ${result.status.toUpperCase()}
    </div>
  </div>

  <div class="score-grid">
    <div class="score-card">
      <div class="score-value">${result.obtainedMarks}</div>
      <div class="score-label">Score</div>
    </div>
    <div class="score-card">
      <div class="score-value">${result.percentage?.toFixed(2) || 0}%</div>
      <div class="score-label">Percentage</div>
    </div>
    <div class="score-card">
      <div class="score-value">${result.accuracy?.toFixed(2) || 0}%</div>
      <div class="score-label">Accuracy</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Performance Breakdown</div>
    <div class="info-row">
      <span>Total Questions</span>
      <strong>${result.totalQuestions}</strong>
    </div>
    <div class="info-row">
      <span>Correct Answers</span>
      <strong style="color: #166534;">${result.correctAnswers}</strong>
    </div>
    <div class="info-row">
      <span>Wrong Answers</span>
      <strong style="color: #991b1b;">${result.wrongAnswers}</strong>
    </div>
    <div class="info-row">
      <span>Unattempted</span>
      <strong style="color: #92400e;">${result.totalQuestions - result.correctAnswers - result.wrongAnswers}</strong>
    </div>
    <div class="info-row">
      <span>Time Taken</span>
      <strong>${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s</strong>
    </div>
    <div class="info-row">
      <span>Total Marks</span>
      <strong>${result.totalMarks}</strong>
    </div>
  </div>

  <div class="footer">
    <p>This result is computer generated and does not require signature.</p>
    <p>Generated by Sarkari Spark | sarkarispark.com</p>
    <p style="font-size: 10px; color: #94a3b8;">Result ID: ${resultId}</p>
  </div>

  <script>
    window.onload = () => {
      setTimeout(() => {
        window.print()
        // Close window after print dialog (if user cancels or completes)
        setTimeout(() => window.close(), 1000)
      }, 500)
    }
  </script>
</body>
</html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
  }

  // Share result
  const handleShare = async () => {
    const shareData = {
      title: `Sarkari Spark - ${result?.exam?.title || "Exam"} Result`,
      text: `I scored ${result.obtainedMarks}/${result.totalMarks} (${result.percentage?.toFixed(2) || 0}%) on ${result?.exam?.title || "Exam"}!
Status: ${result.status}
Correct: ${result.correctAnswers}/${result.totalQuestions}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        alert("Result copied to clipboard!")
      }
    } catch (err) {
      console.error("Share failed:", err)
    }
  }

  const isPassed = result.status === "Passed"
  const accuracy = parseFloat(result.accuracy?.toFixed(2) || 0)
  const percentage = parseFloat(result.percentage?.toFixed(2) || 0)
  const totalQuestions = result.totalQuestions
  const correctAnswers = result.correctAnswers
  const wrongAnswers = result.wrongAnswers
  const unattempted = totalQuestions - correctAnswers - wrongAnswers

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/results">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Results
              </Button>
            </Link>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">{result?.exam?.title || "Exam Result"}</h1>
            <p className="text-muted-foreground mb-6">
              Attempted on {new Date(result.submittedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {/* Score Card */}
            <Card className={`overflow-hidden ${isPassed ? "border-green-500" : "border-red-500"}`}>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  {/* Circular Score */}
                  <div className="relative">
                    <div className={`h-32 w-32 rounded-full border-8 flex items-center justify-center ${
                      isPassed ? "border-green-500" : "border-red-500"
                    }`}>
                      <div className="text-center">
                        <p className="text-3xl font-bold">{percentage}%</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    </div>
                    <div className={`absolute -top-2 -right-2 h-10 w-10 rounded-full flex items-center justify-center ${
                      isPassed ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {isPassed ? (
                        <Trophy className="h-5 w-5 text-white" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div className="p-4 bg-green-50 rounded-xl">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
                      <p className="text-sm text-muted-foreground">Correct</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl">
                      <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-600">{wrongAnswers}</p>
                      <p className="text-sm text-muted-foreground">Wrong</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-amber-600">{unattempted}</p>
                      <p className="text-sm text-muted-foreground">Unattempted</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{accuracy.toFixed(2)}%</p>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Badge
                    variant={isPassed ? "success" : "destructive"}
                    className="text-lg px-4 py-2"
                  >
                    {result.status}
                  </Badge>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    <Award className="h-4 w-4 mr-2" />
                    Rank: {result.rank || "N/A"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="subject">Subject-wise</TabsTrigger>
                <TabsTrigger value="solutions">Solutions</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-6">
                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Score</span>
                        <span className="text-sm font-medium">{result.score}/{result?.exam?.totalMarks || result.totalMarks}</span>
                      </div>
                      <Progress value={(result.score / (result?.exam?.totalMarks || result.totalMarks || 1)) * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Accuracy</span>
                        <span className="text-sm font-medium">{accuracy.toFixed(2)}%</span>
                      </div>
                      <Progress value={accuracy} className="bg-muted [&>div]:bg-green-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Attempt Rate</span>
                        <span className="text-sm font-medium">
                          {((totalQuestions - unattempted) / totalQuestions * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={((totalQuestions - unattempted) / totalQuestions * 100)} className="bg-muted [&>div]:bg-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                {/* Time Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Time Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted/50 rounded-xl text-center">
                        <Timer className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="font-semibold">
                          {Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, "0")}
                        </p>
                        <p className="text-sm text-muted-foreground">Time Taken</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl text-center">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="font-semibold">
                          {(result.timeTaken / totalQuestions).toFixed(1)}s
                        </p>
                        <p className="text-sm text-muted-foreground">Avg per Question</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="font-semibold">{(result?.exam?.duration || 0) * 60 - result.timeTaken}s</p>
                        <p className="text-sm text-muted-foreground">Time Saved</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subject">
                <Card>
                  <CardHeader>
                    <CardTitle>Subject-wise Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.subjectBreakdown && result.subjectBreakdown.length > 0 ? (
                      <div className="space-y-4">
                        {result.subjectBreakdown.map((subject: any, index: number) => (
                          <div key={index} className="p-4 border rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">{subject.name}</span>
                              <Badge variant={subject.accuracy >= 60 ? "success" : "warning"}>
                                {subject.accuracy}%
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{subject.correct}/{subject.total} correct</span>
                              <span>{subject.timeSpent}s avg time</span>
                            </div>
                            <Progress value={subject.accuracy} className="mt-2" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4" />
                        <p>Subject-wise analysis not available for this exam</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="solutions">
                <Card>
                  <CardHeader>
                    <CardTitle>Question-wise Solutions</CardTitle>
                    <CardDescription>Review your answers with detailed explanations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.answers.map((answer: any, index: number) => (
                        <div
                          key={answer.questionId}
                          className={`p-4 border rounded-xl ${
                            answer.isCorrect
                              ? "border-green-200 bg-green-50"
                              : answer.selectedOption === -1
                              ? "border-amber-200 bg-amber-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              answer.isCorrect
                                ? "bg-green-500 text-white"
                                : answer.selectedOption === -1
                                ? "bg-amber-500 text-white"
                                : "bg-red-500 text-white"
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium mb-2">{answer.question?.question || `Question ${index + 1}`}</p>
                              <div className="grid sm:grid-cols-2 gap-2 mb-3">
                                {answer.question?.options.map((opt: string, optIndex: number) => (
                                  <div
                                    key={optIndex}
                                    className={`p-2 rounded-lg text-sm ${
                                      optIndex === answer.correctOption
                                        ? "bg-green-200 text-green-800"
                                        : optIndex === answer.selectedOption && !answer.isCorrect
                                        ? "bg-red-200 text-red-800"
                                        : "bg-muted"
                                    }`}
                                  >
                                    {optIndex === answer.correctOption && "✓ "}
                                    {optIndex === answer.selectedOption && !answer.isCorrect && "✗ "}
                                    {opt}
                                  </div>
                                ))}
                              </div>
                              {answer.question?.explanation && (
                                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                                  <span className="font-semibold text-blue-800">Explanation: </span>
                                  <span className="text-blue-700">{answer.question.explanation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button className="w-full gap-2" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Download Result
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  Share Result
                </Button>
                <Link href={`/exams/${result?.exam?.id || result.examId}/attempt`}>
                  <Button variant="secondary" className="w-full gap-2">
                    <BookOpen className="h-4 w-4" />
                    Reattempt Exam
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Improvement Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">💡 Improvement Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {accuracy < 60 && (
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>Focus on understanding concepts before attempting more questions</span>
                    </li>
                  )}
                  {unattempted > totalQuestions * 0.2 && (
                    <li className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>Work on time management - try to attempt all questions</span>
                    </li>
                  )}
                  {wrongAnswers > correctAnswers && (
                    <li className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-red-500 mt-0.5" />
                      <span>Review wrong answers carefully - understand your mistakes</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Practice more questions in your weak areas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-primary mt-0.5" />
                    <span>Take subject-wise tests to strengthen specific topics</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Comparison with Topper */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">🏆 vs Topper</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Score</span>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Topper Score</span>
                    <span className="font-semibold text-green-600">98%</span>
                  </div>
                  <Progress value={percentage} className="bg-muted [&>div]:bg-green-500" />
                  <p className="text-xs text-muted-foreground text-center">
                    You need {(98 - percentage).toFixed(1)}% more to beat the topper
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
