"use client"

import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { coursesAPI, getImageUrl } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Laptop,
  BookOpen,
  Clock,
  Play,
  ChevronLeft,
  GraduationCap,
  FileQuestion,
  Target,
  ArrowLeft,
  Star,
  Lock,
} from "lucide-react"

export default function CourseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const { data: courseData, isLoading } = useQuery(
    ["course", id],
    () => coursesAPI.getCourse(id),
    { enabled: !!id }
  )

  const course = courseData?.data?.course
  const exams = courseData?.data?.exams || []

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-muted rounded mb-4" />
            <div className="h-4 w-full max-w-2xl bg-muted rounded mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-40 bg-muted" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Course not found</h3>
            <p className="text-muted-foreground mb-6">
              The course you are looking for does not exist or has been removed.
            </p>
            <Link href="/courses">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="pl-0 gap-2"
            onClick={() => router.push("/courses")}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Courses
          </Button>
        </div>

        {/* Course Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Course Image */}
            <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden flex-shrink-0">
              {course.image ? (
                <img
                  src={getImageUrl(course.image)}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                  <Laptop className="h-16 w-16 text-blue-500/50" />
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Laptop className="h-5 w-5 text-white" />
                </div>
                <Badge variant="secondary" className="gap-1">
                  <BookOpen className="h-3 w-3" />
                  {exams.length} Exams
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
              <p className="text-muted-foreground max-w-2xl">
                {course.description || "Master computer skills with comprehensive practice exams and assessments."}
              </p>
            </div>
          </div>
        </div>

        <div className="border-b mb-8" />

        {/* Exams List */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Course Exams</h2>
          <p className="text-muted-foreground mb-6">
            Complete these exams to master the course content
          </p>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exams available</h3>
            <p className="text-muted-foreground">
              This course does not have any exams yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((courseExam: any, index: number) => (
              <Card
                key={courseExam.id}
                className={`group hover:shadow-lg transition-all overflow-hidden ${
                  courseExam.accessType === 'premium' 
                    ? 'border-amber-400 ring-1 ring-amber-400/20 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-background' 
                    : courseExam.accessType === 'login'
                    ? 'border-blue-300'
                    : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    {/* Access Type Badge */}
                    {courseExam.accessType === 'premium' && (
                      <Badge className="bg-amber-500 text-white gap-1">
                        <Star className="h-3 w-3 fill-white" />
                        Premium
                      </Badge>
                    )}
                    {courseExam.accessType === 'login' && (
                      <Badge variant="secondary" className="bg-blue-500 text-white gap-1">
                        <Lock className="h-3 w-3" />
                        Login
                      </Badge>
                    )}
                    {courseExam.accessType === 'free' && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Free
                      </Badge>
                    )}
                    {courseExam.difficulty && (
                      <Badge variant="outline" className="text-xs">
                        {courseExam.difficulty}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className={`text-lg line-clamp-2 ${courseExam.accessType === 'premium' ? 'text-amber-700 dark:text-amber-400' : ''}`}>
                    {courseExam.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {courseExam.description || `Practice test for ${course.title}`}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {courseExam.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{courseExam.duration} min</span>
                      </div>
                    )}
                    {courseExam.totalQuestions && (
                      <div className="flex items-center gap-1">
                        <FileQuestion className="h-4 w-4" />
                        <span>{courseExam.totalQuestions} Qs</span>
                      </div>
                    )}
                    {courseExam.totalMarks && (
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{courseExam.totalMarks} Marks</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/computer-exams/${courseExam.id}`}>
                    <Button className="w-full gap-2">
                      <Play className="h-4 w-4" />
                      Start Test
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
