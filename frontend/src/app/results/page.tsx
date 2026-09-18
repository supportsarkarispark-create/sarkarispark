"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import Link from "next/link"
import { resultsAPI, govResultsAPI, computerCourseResultsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Trophy,
  Calendar,
  ArrowRight,
  Loader2,
  GraduationCap,
  Building2,
  ExternalLink,
  Sparkles,
  Monitor,
  CheckCircle,
  XCircle,
} from "lucide-react"

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState("gov-results")

  const { data: resultsData, isLoading: isLoadingMyResults } = useQuery(
    ["my-results"],
    () => resultsAPI.getMyResults(),
    { enabled: activeTab === "my-results" }
  )

  const { data: govResultsData, isLoading: isLoadingGovResults } = useQuery(
    ["gov-results"],
    () => govResultsAPI.getGovResults(),
    { enabled: activeTab === "gov-results" }
  )

  const { data: computerResultsData, isLoading: isLoadingComputerResults } = useQuery(
    ["computer-course-results"],
    () => computerCourseResultsAPI.getMyResults(),
    { enabled: activeTab === "computer-results" }
  )

  const myResults = resultsData?.data?.results || []
  const govResults = govResultsData?.data?.results || []
  const computerResults = computerResultsData?.data?.results || []

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8" />
            Results
          </h1>
          <p className="text-muted-foreground">
            View your exam results, computer course results, and government job results
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="gov-results" className="gap-2">
              <Building2 className="h-4 w-4" />
              Government Results
            </TabsTrigger>
            <TabsTrigger value="my-results" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              My Exam Results
            </TabsTrigger>
            <TabsTrigger value="computer-results" className="gap-2">
              <Monitor className="h-4 w-4" />
              Computer Course
            </TabsTrigger>
          </TabsList>

          {/* My Exam Results Tab */}
          <TabsContent value="my-results" className="mt-0">
            {isLoadingMyResults ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : myResults.length === 0 ? (
              <Card className="p-12 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t attempted any exams yet.
                </p>
                <Link href="/exams">
                  <Button>
                    Browse Exams
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myResults.map((result: any) => (
                  <Link key={result.id} href={`/results/${result.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <GraduationCap className="h-5 w-5 text-muted-foreground" />
                              <h3 className="font-semibold text-lg">
                                {result.exam?.title || "Exam"}
                              </h3>
                              <Badge variant={result.status === "Passed" ? "success" : "destructive"}>
                                {result.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(result.submittedAt).toLocaleDateString("en-IN")}
                              </span>
                              <span>{result.exam?.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{result.percentage}%</p>
                              <p className="text-sm text-muted-foreground">Score</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
                              <p className="text-sm text-muted-foreground">Correct</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-red-600">{result.wrongAnswers}</p>
                              <p className="text-sm text-muted-foreground">Wrong</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Computer Course Results Tab */}
          <TabsContent value="computer-results" className="mt-0">
            {isLoadingComputerResults ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : computerResults.length === 0 ? (
              <Card className="p-12 text-center">
                <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Computer Course Results</h3>
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t completed any computer course exams yet.
                </p>
                <Link href="/courses">
                  <Button>
                    Browse Computer Courses
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4">
                {computerResults.map((result: any) => (
                  <Link key={result.id} href={`/dashboard/computer-results/${result.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Monitor className="h-5 w-5 text-muted-foreground" />
                              <h3 className="font-semibold text-lg">
                                {result.exam?.title || "Computer Exam"}
                              </h3>
                              <Badge className={result.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                {result.passed ? "Passed" : "Failed"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(result.completedAt).toLocaleDateString("en-IN")}
                              </span>
                              <span>{result.course?.title || "Computer Course"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className={`text-2xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                {result.percentage}%
                              </p>
                              <p className="text-sm text-muted-foreground">Score</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
                              <p className="text-sm text-muted-foreground">Correct</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-red-600">{result.wrongAnswers}</p>
                              <p className="text-sm text-muted-foreground">Wrong</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Government Results Tab */}
          <TabsContent value="gov-results" className="mt-0">
            {isLoadingGovResults ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : govResults.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Government Results</h3>
                <p className="text-muted-foreground mb-4">
                  No government exam results available at the moment.
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {govResults.map((result: any) => (
                  <Card key={result._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                      {result.image ? (
                        <img src={result.image} alt={result.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Building2 className="h-12 w-12 text-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">{result.organization}</p>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="flex gap-2 mb-3">
                        <Badge variant="outline">{result.category}</Badge>
                        {result.isLatest && (
                          <Badge className="bg-green-500">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Latest
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{result.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{result.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4" />
                        {new Date(result.resultDate).toLocaleDateString("en-IN")}
                      </div>
                      <a href={result.link} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full gap-2">
                          <ExternalLink className="h-4 w-4" />
                          View Result
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
