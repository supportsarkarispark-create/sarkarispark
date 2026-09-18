"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import {
  FolderOpen,
  BookOpen,
  Clock,
  CheckCircle2,
  Search,
  ArrowRight,
  Play,
} from "lucide-react"
import { getImageUrl } from "@/lib/api"

interface Course {
  id: string
  title: string
  description: string
  image: string
  isActive: boolean
}

interface ComputerCourseExam {
  id: string
  title: string
  description: string
  duration: number
  totalQuestions: number
  totalMarks: number
  passingMarks: number
  accessType: string
  isActive: boolean
}

export default function ComputerCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [viewState, setViewState] = useState<"courses" | "exams">("courses")

  // Fetch courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery(
    "computer-courses",
    async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/computer`, {
        credentials: "include",
      })
      return response.json()
    }
  )

  const courses = coursesData?.courses || []

  // Fetch exams for selected course
  const { data: examsData, isLoading: examsLoading } = useQuery(
    ["computer-course-exams", selectedCourse?.id],
    async () => {
      if (!selectedCourse) return { exams: [] }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/computer-course-exams/course/${selectedCourse.id}`,
        { credentials: "include" }
      )
      return response.json()
    },
    { enabled: !!selectedCourse }
  )

  const exams = examsData?.exams || []

  const filteredCourses = courses.filter((course: Course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setViewState("exams")
  }

  const handleBackToCourses = () => {
    setSelectedCourse(null)
    setViewState("courses")
  }

  if (coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading computer courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Computer Courses</h1>
              <p className="text-sm text-gray-600 mt-1">
                {viewState === "courses" ? "Select a course to view tests" : selectedCourse?.title}
              </p>
            </div>
            {viewState === "exams" && (
              <Button variant="outline" onClick={handleBackToCourses}>
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Courses
              </Button>
            )}
          </div>

          {viewState === "courses" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 max-w-md"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {viewState === "courses" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground">Computer courses will appear here when added by admin</p>
              </div>
            ) : (
              filteredCourses.map((course: Course) => {
                const examCount = coursesData?.examCounts?.[course.id] || 0
                const imageUrl = course.image ? getImageUrl(course.image) : null
                return (
                  <div
                    key={course.id}
                    className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-200"
                    onClick={() => handleCourseClick(course)}
                  >
                    {/* Course Image - Full Width */}
                    <div className="relative h-48 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-course.png'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                          <BookOpen className="h-20 w-20 text-white/90" />
                        </div>
                      )}
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Test Count Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/95 text-black font-semibold shadow-lg">
                          {examCount} Tests
                        </Badge>
                      </div>

                      {/* Course Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg line-clamp-2 drop-shadow-lg">
                          {course.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                        {course.description || "Master this course with our interactive tests"}
                      </p>

                      {/* Features */}
                      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Interactive</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Instant Results</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button className="w-full group-hover:bg-indigo-600 transition-colors">
                        <Play className="h-4 w-4 mr-2" />
                        Start Learning
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Course Info */}
            {selectedCourse && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {selectedCourse.image ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(selectedCourse.image)}
                          alt={selectedCourse.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2">{selectedCourse.title}</h2>
                      <p className="text-sm text-gray-600">{selectedCourse.description || "No description available"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exams List */}
            {examsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Loading tests...</p>
              </div>
            ) : exams.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tests found</h3>
                <p className="text-muted-foreground">Tests will appear here when added by admin</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exams.map((exam: ComputerCourseExam) => (
                  <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">{exam.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exam.description || "No description"}</p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{exam.duration} mins</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span>{exam.totalQuestions} Q</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{exam.totalMarks} Marks</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant={exam.accessType === "free" ? "default" : "secondary"}>
                            {exam.accessType}
                          </Badge>
                        </div>
                      </div>

                      <Link href={`/computer-courses/${exam.id}/attempt`}>
                        <Button className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Start Test
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
