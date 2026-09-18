"use client"

import { useQuery } from "react-query"
import Link from "next/link"
import { computerCourseResultsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Trophy, Clock, Target, CheckCircle, XCircle, ArrowLeft,
  Eye, GraduationCap, Calendar, Loader2, BarChart3, TrendingUp
} from "lucide-react"

export default function ComputerResultsPage() {
  const { data: resultsData, isLoading } = useQuery(
    "computer-course-results",
    () => computerCourseResultsAPI.getMyResults()
  )

  const results = resultsData?.data?.results || []

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const passedCount = results.filter((r: any) => r.passed).length
  const avgScore = results.length > 0
    ? (results.reduce((acc: number, r: any) => acc + r.percentage, 0) / results.length).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Computer Course Results</h1>
            <p className="text-muted-foreground">
              View all your computer course exam results and performance history
            </p>
          </div>

          {!isLoading && results.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Exams</p>
                      <p className="text-xl font-bold">{results.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Passed</p>
                      <p className="text-xl font-bold text-green-600">{passedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                      <p className="text-xl font-bold text-blue-600">{avgScore}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Time</p>
                      <p className="text-xl font-bold">
                        {Math.floor(results.reduce((acc: number, r: any) => acc + r.timeTaken, 0) / 60)}m
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven&apos;t completed any computer course exams yet.
                </p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {results.map((result: any) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {result.course?.title || "Computer Course"}
                          </Badge>
                          {result.passed ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Passed</Badge>
                          ) : (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{result.exam?.title || "Exam"}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(result.completedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(result.timeTaken)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {result.correctAnswers}/{result.totalQuestions} Correct
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {result.percentage}%
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.obtainedMarks}/{result.totalMarks} Marks
                          </p>
                        </div>
                        <Link href={`/dashboard/computer-results/${result.id}`}>
                          <Button variant="outline" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
