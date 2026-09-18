"use client"

import { useQuery } from "react-query"
import Link from "next/link"
import { useParams } from "next/navigation"
import { computerCourseResultsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Trophy, Clock, Target, CheckCircle, XCircle, ArrowLeft,
  GraduationCap, Calendar, Loader2, FileQuestion, AlertCircle,
  Printer, Share2, RotateCcw, BookOpen
} from "lucide-react"

export default function ComputerResultDetailPage() {
  const params = useParams()
  const resultId = params.id as string

  const { data: resultData, isLoading } = useQuery(
    ["computer-course-result", resultId],
    () => computerCourseResultsAPI.getResult(resultId)
  )

  const result = resultData?.data?.result

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`
    return `${mins}m ${secs}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Result Not Found</h3>
              <Link href="/dashboard/computer-results">
                <Button>Back to Results</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard/computer-results">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Results
              </Button>
            </Link>
          </div>

          <Card className="mb-8">
            <CardHeader className="text-center pb-6 border-b">
              <div className={`h-24 w-24 rounded-full mx-auto mb-4 flex items-center justify-center ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                {result.passed ? <Trophy className="h-12 w-12 text-green-600" /> : <AlertCircle className="h-12 w-12 text-red-600" />}
              </div>
              <CardTitle className="text-2xl mb-2">
                {result.passed ? "Congratulations!" : "Keep Practicing!"}
              </CardTitle>
              <CardDescription>
                You {result.passed ? "passed" : "completed"} the {result.exam?.title} exam
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="text-center mb-8">
                <div className={`text-6xl font-bold mb-2 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.percentage}%
                </div>
                <p className="text-lg text-muted-foreground">
                  {result.obtainedMarks} / {result.totalMarks} Marks
                </p>
                <Badge className={`mt-4 text-sm ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {result.passed ? "PASSED" : "FAILED"}
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <FileQuestion className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-xl font-semibold">{result.totalQuestions}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="text-xl font-semibold text-green-600">{result.correctAnswers}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl text-center">
                  <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="text-sm text-muted-foreground">Wrong</p>
                  <p className="text-xl font-semibold text-red-600">{result.wrongAnswers}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Time Taken</p>
                  <p className="text-xl font-semibold">{formatTime(result.timeTaken)}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Exam Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Course</p>
                      <p className="font-medium">{result.course?.title || "Computer Course"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Passing Marks</p>
                      <p className="font-medium">{result.exam?.passingMarks}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Completed On</p>
                      <p className="font-medium">{formatDate(result.completedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time Limit</p>
                      <p className="font-medium">{result.exam?.duration} minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Link href={`/computer-exams/${result.exam?.id}`}>
              <Button className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Retake Exam
              </Button>
            </Link>
          </div>

          {result.answers && result.answers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Answer Review
                </CardTitle>
                <CardDescription>Review your answers with correct solutions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.answers.map((answer: any, index: number) => {
                  const q = answer.questionId
                  const options = q?.options || []
                  const correctIdx = q?.correctOption
                  const userIdx = answer.selectedOption

                  return (
                    <div key={index} className="p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                          answer.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium mb-3">{q?.question || "Question"}</p>
                          <div className="space-y-2">
                            {options.map((opt: any, optIdx: number) => {
                              const isCorrect = optIdx === correctIdx
                              const isSelected = optIdx === userIdx
                              return (
                                <div key={optIdx} className={`p-2 rounded-lg text-sm ${
                                  isCorrect ? 'bg-green-100 text-green-800 border border-green-200' :
                                  isSelected ? 'bg-red-100 text-red-800 border border-red-200' :
                                  'bg-muted/50'
                                }`}>
                                  <span className="font-medium">{String.fromCharCode(65 + optIdx)}.</span> {opt.text}
                                  {isCorrect && <span className="ml-2 text-green-600 font-medium">(Correct)</span>}
                                  {isSelected && !isCorrect && <span className="ml-2 text-red-600 font-medium">(Your Answer)</span>}
                                </div>
                              )
                            })}
                          </div>
                          {q?.explanation && (
                            <div className="p-3 bg-blue-50 rounded-lg mt-3">
                              <p className="text-sm text-blue-800">
                                <strong>Explanation:</strong> {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className={`px-2 py-1 rounded text-sm font-medium ${
                          answer.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {answer.isCorrect ? '+' : '0'}{answer.marksObtained}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
