"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import Link from "next/link"
import { coursesAPI, getImageUrl } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Search,
  Laptop,
  BookOpen,
  ChevronRight,
  GraduationCap,
} from "lucide-react"

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const { data: coursesData, isLoading } = useQuery(
    ["courses", searchQuery],
    () =>
      coursesAPI.getCourses({
        search: searchQuery || undefined,
      }),
    { keepPreviousData: true }
  )

  const courses = coursesData?.data?.courses || []

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Laptop className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Computer Courses</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Learn computer skills with structured courses and practice tests
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 lg:mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-32 lg:h-40 bg-muted" />
                <CardContent className="h-16 lg:h-24" />
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8 lg:py-12">
            <GraduationCap className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base lg:text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {courses.map((course: any) => {
              const imageUrl = course.image ? getImageUrl(course.image) : null
              const examCount = course.examCount || 0
              return (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <div
                    className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-200"
                  >
                    {/* Course Image - Full Width */}
                    <div className="relative h-36 sm:h-48 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                          <Laptop className="h-14 w-14 sm:h-20 sm:w-20 text-white/90" />
                        </div>
                      )}
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Test Count Badge */}
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                        <Badge className="bg-white/95 text-black font-semibold shadow-lg text-xs">
                          {examCount} Exams
                        </Badge>
                      </div>

                      {/* Course Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <h3 className="text-white font-bold text-sm sm:text-lg line-clamp-2 drop-shadow-lg">
                          {course.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5">
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                        {course.description || "Master this course with our interactive tests"}
                      </p>

                      {/* Features */}
                      <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4 text-[10px] sm:text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                          <span>Interactive</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                          <span>Practice Tests</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button className="w-full group-hover:bg-indigo-600 transition-colors py-6 text-xs sm:text-sm">
                        View Course
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
