"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useQuery, useQueryClient } from "react-query"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { examCategoryAPI, coursesAPI, studyMaterialAPI, examsAPI, getImageUrl } from "@/lib/api"
import api from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import TestCard from "@/components/exam/TestCard"
import {
  Search,
  Clock,
  BookOpen,
  FileText,
  Play,
  Crown,
  FolderOpen,
  Folder,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  FileQuestion,
  Download,
  ExternalLink,
  FileArchive,
  Video,
  Monitor,
  Target,
  CheckCircle,
  Flame,
  ClipboardList,
  Layers,
  CalendarDays,
  ListChecks,
  Star,
  Users,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

type ViewState = 'categories' | 'courses' | 'course-detail' | 'all-exams' | 'exams-pyqs' | 'tests'

export default function ExamsPage() {
  const searchParams = useSearchParams()
  const hasProcessedCategoryId = useRef(false)
  const [viewState, setViewState] = useState<ViewState>('categories')
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  // Static FAQs
  const faqs = [
    {
      _id: "faq-1",
      question: "Kya Sarkari Spark par Free Mock Tests available hain?",
      answer: "Haan! Har ek exam category (SSC, UP Police, Railway, Banking) ke pehle 1 se 2 mock tests bilkul 100% FREE hain taaki aap platform aur question quality bina kisi payment ke test kar sakein."
    },
    {
      _id: "faq-2",
      question: "Test submit karne ke baad result kab milta hai?",
      answer: "Test submit karte hi aapko turant Instant Scorecard, All-India Rank, Section-wise Accuracy, Percentile aur sabhi sawalon ke detailed step-by-step solutions mil jaate hain."
    },
    {
      _id: "faq-3",
      question: "Kya sawal Hindi aur English dono bhashao me hain?",
      answer: "Ji bilkul! Sarkari Spark ke sabhi mock tests aur solutions 100% Bilingual (Hindi + English) hain. Aap exam dete samay bhi ek click me language badal sakte hain."
    },
    {
      _id: "faq-4",
      question: "Kya main mobile phone par bhi test de sakta hoon?",
      answer: "Haan, Sarkari Spark mobile, tablet aur laptop har device ke liye fully optimized hai. Aap bina kisi rukawat ke apne phone browser me test attempt kar sakte hain."
    }
  ]
  const faqsLoading = false

  const handleMouseEnter = (id: string) => {
    setOpenItems(new Set([id]))
  }

  const handleMouseLeave = () => {
    setOpenItems(new Set())
  }

  // Fetch all exams directly
  const { data: allExamsData, isLoading: allExamsLoading } = useQuery(
    "all-exams",
    () => api.get("/exams", { params: { limit: 100 } })
  )

  // Fetch all categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    "exam-categories",
    examCategoryAPI.getCategories
  )

  // Fetch category details with courses when category is selected
  const { data: categoryDetailData, isLoading: categoryDetailLoading } = useQuery(
    ["category-detail", selectedCategory?.id],
    () => examCategoryAPI.getCategory(selectedCategory?.id),
    { enabled: !!selectedCategory?.id }
  )


  // Fetch study materials when course is selected
  const { data: studyMaterialsData, isLoading: materialsLoading } = useQuery(
    ["study-materials", selectedCourse?.id],
    () => studyMaterialAPI.getCourseMaterials(selectedCourse?.id),
    { enabled: !!selectedCourse?.id }
  )

  // Fetch tests under selected exam
  const { data: testsData, isLoading: testsLoading, error: testsError } = useQuery(
    ["exam-tests", selectedExam?.id],
    () => examsAPI.getExamTests(selectedExam?.id),
    {
      enabled: !!selectedExam?.id,
      onError: (err: any) => {
        console.error('[DEBUG] tests query error:', err)
        console.error('[DEBUG] error response:', err?.response?.data)
      }
    }
  )

  const allExams = allExamsData?.data?.exams || []
  const categories = useMemo(() => categoriesData?.data?.categories || [], [categoriesData])
  const courses = categoryDetailData?.data?.courses || []

  // Handle categoryId from URL parameter (for footer links) - only process once
  useEffect(() => {
    if (hasProcessedCategoryId.current) return

    const categoryId = searchParams.get('categoryId')
    if (categoryId && categories.length > 0) {
      const category = categories.find((cat: any) => cat.id === categoryId)
      if (category) {
        setSelectedCategory(category)
        setViewState('exams-pyqs')
        hasProcessedCategoryId.current = true
      }
    }
  }, [categories, searchParams])

  // If category is selected, use category data; otherwise use allExams
  const regularExams = selectedCategory
    ? (categoryDetailData?.data?.exams || [])
    : allExams.filter((exam: any) => !exam.parentExamId && !exam.isPYQ)

  const pyqs = selectedCategory
    ? (categoryDetailData?.data?.pyqs || [])
    : allExams.filter((exam: any) => !exam.parentExamId && exam.isPYQ)

  // Sort: Free exams first, then premium exams
  const sortedRegularExams = [...regularExams].sort((a: any, b: any) => {
    if (a.isPremium === b.isPremium) return 0
    return a.isPremium ? 1 : -1
  })

  const sortedPyqs = [...pyqs].sort((a: any, b: any) => {
    if (a.isPremium === b.isPremium) return 0
    return a.isPremium ? 1 : -1
  })

  const studyMaterials = studyMaterialsData?.data?.materials || {}
  const tests = testsData?.data?.tests || []
  const queryClient = useQueryClient()

  // Handle category selection
  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category)
    setViewState('exams-pyqs')
  }

  // Handle exam/pyq selection
  const handleExamClick = (exam: any) => {
    setSelectedExam(exam)
    setViewState('tests')
  }

  // Handle course selection
  const handleCourseClick = (course: any) => {
    setSelectedCourse(course)
    setViewState('course-detail')
  }

  // Go back to categories
  const goBackToCategories = () => {
    setViewState('categories')
    setSelectedCategory(null)
    setSelectedCourse(null)
    setSelectedExam(null)
  }

  // Go back to exams-pyqs
  const goBackToExamsPyqs = () => {
    setViewState('exams-pyqs')
    setSelectedExam(null)
  }

  // Go back to courses
  const goBackToCourses = () => {
    setViewState('courses')
    setSelectedCourse(null)
  }

  // Get icon based on file type
  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'Video': return <Video className="h-5 w-5" />
      case 'PYQ': return <FileQuestion className="h-5 w-5" />
      case 'Notes': return <FileText className="h-5 w-5" />
      case 'Ebook': return <BookOpen className="h-5 w-5" />
      case 'Syllabus': return <FileArchive className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2 mb-2">
            {viewState !== 'categories' && (
              <Button variant="ghost" size="sm" onClick={
                viewState === 'course-detail' ? goBackToCourses :
                viewState === 'tests' ? goBackToExamsPyqs :
                viewState === 'all-exams' ? () => setViewState('categories') :
                goBackToCategories
              } className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {viewState === 'categories' && "Exam Categories"}
            {viewState === 'courses' && `${selectedCategory?.name} - Courses`}
            {viewState === 'exams-pyqs' && `${selectedCategory?.name}`}
            {viewState === 'tests' && `${selectedExam?.title}`}
            {viewState === 'course-detail' && `${selectedCourse?.title}`}
            {viewState === 'all-exams' && "All Available Exams"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {viewState === 'categories' && "Select a category to explore exams"}
            {viewState === 'courses' && "Available courses in this category"}
            {viewState === 'exams-pyqs' && "Explore exams and previous year questions"}
            {viewState === 'tests' && "Select a test to start practicing"}
            {viewState === 'course-detail' && "Access exams and study materials for this course"}
            {viewState === 'all-exams' && "Browse all available mock tests and exams"}
          </p>
        </div>


        {/* CATEGORIES VIEW */}
        {viewState === 'categories' && (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories Grid */}
            {categoriesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-24 lg:h-32 bg-muted" />
                    <CardContent className="h-16 lg:h-24" />
                  </Card>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <Folder className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base lg:text-lg font-semibold mb-2">No categories found</h3>
                <p className="text-sm text-muted-foreground mb-4">Categories will appear here when added by admin</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
                {categories
                  .filter((cat: any) => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((category: any) => (
                    <div
                      key={category.id}
                      className="group bg-white rounded-xl p-3 lg:p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 cursor-pointer relative overflow-hidden"
                      onClick={() => handleCategoryClick(category)}
                    >
                      {/* Category Image Watermark Background */}
                      {category.image && (
                        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                          <img
                            src={getImageUrl(category.image)}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Icon and Popular Badge */}
                      <div className="flex items-start justify-between mb-2 lg:mb-3 relative z-10">
                        {category.image ? (
                          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg overflow-hidden">
                            <img
                              src={getImageUrl(category.image)}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className={`w-6 h-6 lg:w-7 lg:h-7 rounded-md bg-gradient-to-br ${category.color || 'from-blue-500 to-blue-600'} flex items-center justify-center`}>
                              <FolderOpen className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                            </div>
                          </div>
                        )}
                        {category.isPopular && (
                          <span className="px-1.5 py-0.5 lg:px-2 lg:py-0.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[9px] lg:text-[10px] font-semibold rounded-full flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                            Popular
                          </span>
                        )}
                      </div>

                      {/* Title and Subtitle */}
                      <h3 className="text-xs lg:text-sm font-bold text-gray-800 mb-0.5 leading-tight">{category.name}</h3>
                      <p className="text-[10px] lg:text-xs text-gray-500 mb-1 lg:mb-2">{category.examCount || category.count || 'Multiple'} Tests Available</p>

                      {/* Exams Count Badge */}
                      <div className="inline-block px-1.5 py-0.5 lg:px-2 lg:py-1 bg-gray-100 rounded-md mb-1 lg:mb-2">
                        <span className="text-[10px] lg:text-xs font-semibold text-gray-700">{category.totalExams || category.examCount || '10+'} Exams</span>
                      </div>

                      {/* Details List */}
                      <div className="space-y-0.5 lg:space-y-1 mb-2 lg:mb-3">
                        <div className="flex items-center gap-1 lg:gap-1.5 text-[10px] lg:text-xs text-gray-600">
                          <CheckCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-green-500 flex-shrink-0" />
                          <span>Mock Tests: {category.mockTestCount || 'Various'}</span>
                        </div>
                        <div className="flex items-center gap-1 lg:gap-1.5 text-[10px] lg:text-xs text-gray-600">
                          <CheckCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-green-500 flex-shrink-0" />
                          <span>Difficulty: {category.difficulty || 'All Levels'}</span>
                        </div>
                        <div className="flex items-center gap-1 lg:gap-1.5 text-[10px] lg:text-xs text-gray-600">
                          <CheckCircle className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-green-500 flex-shrink-0" />
                          <span>Updated: {category.lastUpdated || 'Regularly'}</span>
                        </div>
                      </div>

                      {/* Explore Button */}
                      <button className="w-full py-1.5 lg:py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs lg:text-sm font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-1 lg:gap-2">
                        Explore
                        <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {/* ALL EXAMS VIEW */}
        {viewState === 'all-exams' && (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* All Exams Grid */}
            {allExamsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-24 lg:h-32 bg-muted" />
                    <CardContent className="h-16 lg:h-24" />
                  </Card>
                ))}
              </div>
            ) : allExams.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <FileQuestion className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base lg:text-lg font-semibold mb-2">No exams found</h3>
                <p className="text-sm text-muted-foreground">Exams will appear here when added by admin</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {allExams
                  .filter((exam: any) =>
                    exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    exam.category?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((exam: any) => (
                    <Card
                      key={exam.id}
                      className="group hover:shadow-lg transition-all overflow-hidden"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {exam.category || 'General'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {exam.difficulty || 'Mixed'}
                          </Badge>
                          {exam.isPremium && (
                            <Badge variant="secondary" className="text-xs">
                              Premium
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base lg:text-lg line-clamp-2">{exam.title}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2">
                          {exam.description || `Practice test with ${exam.totalQuestions} questions`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 lg:gap-4 text-xs sm:text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{exam.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileQuestion className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{exam.totalQuestions} Qs</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{exam.totalMarks} Marks</span>
                          </div>
                        </div>
                        <Link href={`/exams/${exam.id}`}>
                          <Button className="w-full gap-2 py-6">
                            <Play className="h-4 w-4" />
                            Start Exam
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </>
        )}

        {/* EXAMS & PYQS VIEW */}
        {viewState === 'exams-pyqs' && (
          <>
            {categoryDetailLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-32 bg-muted" />
                    <CardContent className="h-24" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-10">
                {/* Exams Section */}
                {sortedRegularExams.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        <span>Exams</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-3 py-1 text-sm font-semibold shadow-md">
                        {sortedRegularExams.length}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {sortedRegularExams.map((exam: any, index: number) => (
                        <Card
                          key={exam.id}
                          className={`group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden shadow-md hover:-translate-y-1 relative ${exam.isPremium ? 'border-2 border-amber-400' : 'border-0'}`}
                          onClick={() => handleExamClick(exam)}
                        >
                          {/* Premium Badge */}
                          {exam.isPremium && (
                            <div className="absolute top-2 right-2 z-10">
                              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 px-2 py-1 text-xs font-bold shadow-md flex items-center gap-1">
                                <Crown className="h-3 w-3" />
                                PREMIUM
                              </Badge>
                            </div>
                          )}

                          {/* Gradient Header */}
                          <div className={`h-2 bg-gradient-to-r ${[
                            exam.isPremium ? 'from-amber-500 to-yellow-400' : 'from-blue-500 to-cyan-400',
                            exam.isPremium ? 'from-amber-500 to-yellow-400' : 'from-purple-500 to-pink-400',
                            exam.isPremium ? 'from-amber-500 to-yellow-400' : 'from-green-500 to-emerald-400',
                            exam.isPremium ? 'from-amber-500 to-yellow-400' : 'from-orange-500 to-yellow-400',
                            exam.isPremium ? 'from-amber-500 to-yellow-400' : 'from-indigo-500 to-violet-400',
                            exam.isPremium ? 'from-amber-500 to-yellow-400' : 'from-red-500 to-rose-400'
                          ][index % 6]}`} />

                          <CardHeader className="pb-3 pt-4 px-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${exam.isPremium ? 'bg-gradient-to-br from-amber-100 to-yellow-50' : 'bg-gradient-to-br from-blue-100 to-blue-50'}`}>
                                  <GraduationCap className={`h-5 w-5 ${exam.isPremium ? 'text-amber-600' : 'text-blue-600'}`} />
                                </div>
                                <Badge variant="outline" className="text-[11px] font-medium px-2 py-0.5">
                                  {exam.difficulty || 'Mixed'}
                                </Badge>
                              </div>
                            </div>
                            <CardTitle className="text-base line-clamp-2 font-bold text-gray-800 min-h-[40px]">{exam.title}</CardTitle>
                            <CardDescription className="text-xs line-clamp-2 text-gray-500 mt-1 min-h-[32px]">
                              {exam.description || 'Mock tests and practice papers available'}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent className="px-4 pb-5 pt-0">
                            {/* Folder Stats - What this exam group contains */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="text-center p-2 bg-blue-50 rounded-lg">
                                <Layers className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                                <p className="text-sm font-bold text-blue-600">{exam.testCount || 0}</p>
                                <p className="text-[10px] text-gray-500">Tests</p>
                              </div>
                              <div className="text-center p-2 bg-green-50 rounded-lg">
                                <Play className="h-4 w-4 mx-auto mb-1 text-green-600" />
                                <p className="text-sm font-bold text-green-600">{exam.attempts || 0}</p>
                                <p className="text-[10px] text-gray-500">Attempts</p>
                              </div>
                              <div className="text-center p-2 bg-purple-50 rounded-lg">
                                <Star className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                                <p className="text-sm font-bold text-purple-600">{exam.rating?.average || 0}</p>
                                <p className="text-[10px] text-gray-500">Rating</p>
                              </div>
                            </div>
                            
                            {/* View Button */}
                            <Button size="sm" className="w-full gap-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 shadow-sm hover:shadow-md transition-all text-sm h-9">
                              <ChevronRight className="h-4 w-4" />
                              View Tests ({exam.testCount || 0})
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Separator Line */}
                {sortedRegularExams.length > 0 && sortedPyqs.length > 0 && (
                  <div className="relative py-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <div className="bg-white px-6 py-2 shadow-sm rounded-full border border-gray-200">
                        <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-amber-500" />
                          Previous Year Questions
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PYQs Section */}
                {sortedPyqs.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-amber-600" />
                        <span>Previous Year Questions</span>
                      </div>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1 text-sm font-semibold shadow-md">
                        {sortedPyqs.length}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {sortedPyqs.map((pyq: any, index: number) => (
                        <Card
                          key={pyq.id}
                          className={`group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden shadow-md hover:-translate-y-1 relative ${pyq.isPremium ? 'border-2 border-amber-400' : 'border-0'}`}
                          onClick={() => handleExamClick(pyq)}
                        >
                          {/* Premium Badge */}
                          {pyq.isPremium && (
                            <div className="absolute top-2 right-2 z-10">
                              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 px-2 py-1 text-xs font-bold shadow-md flex items-center gap-1">
                                <Crown className="h-3 w-3" />
                                PREMIUM
                              </Badge>
                            </div>
                          )}

                          {/* Amber Gradient Header */}
                          <div className={`h-2 bg-gradient-to-r ${pyq.isPremium ? 'from-amber-500 to-yellow-400' : 'from-amber-500 to-orange-400'}`} />

                          <CardHeader className="pb-3 pt-4 px-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${pyq.isPremium ? 'bg-gradient-to-br from-amber-100 to-yellow-50' : 'bg-gradient-to-br from-amber-100 to-amber-50'}`}>
                                  <CalendarDays className="h-5 w-5 text-amber-600" />
                                </div>
                                <Badge className="text-[11px] bg-amber-100 text-amber-700 border-amber-200 px-2 py-0.5">
                                  PYQ
                                </Badge>
                              </div>
                            </div>
                            <CardTitle className="text-base line-clamp-2 font-bold text-gray-800 min-h-[40px]">{pyq.title}</CardTitle>
                            <CardDescription className="text-xs line-clamp-2 text-gray-500 mt-1 min-h-[32px]">
                              {pyq.description || 'Previous year question papers with solutions'}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent className="px-4 pb-5 pt-0">
                            {/* Folder Stats - What this PYQ group contains */}
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              <div className="text-center p-2 bg-amber-50 rounded-lg">
                                <Layers className="h-4 w-4 mx-auto mb-1 text-amber-600" />
                                <p className="text-sm font-bold text-amber-600">{pyq.testCount || 0}</p>
                                <p className="text-[10px] text-gray-500">Papers</p>
                              </div>
                              <div className="text-center p-2 bg-orange-50 rounded-lg">
                                <Users className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                                <p className="text-sm font-bold text-orange-600">{pyq.attempts || 0}</p>
                                <p className="text-[10px] text-gray-500">Attempts</p>
                              </div>
                              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                                <p className="text-sm font-bold text-yellow-600">{pyq.rating?.average || 0}</p>
                                <p className="text-[10px] text-gray-500">Rating</p>
                              </div>
                            </div>
                            
                            {/* View Button */}
                            <Button size="sm" className="w-full gap-1 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 text-white border-0 shadow-sm hover:shadow-md transition-all text-sm h-9">
                              <ChevronRight className="h-4 w-4" />
                              View Papers ({pyq.testCount || 0})
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Courses Section */}
                {courses.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Courses ({courses.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {courses.map((course: any, index: number) => (
                        <div
                          key={course.id}
                          onClick={() => handleCourseClick(course)}
                          className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-primary/30 hover:-translate-y-1"
                        >
                          {/* Top Color Bar */}
                          <div className={`h-1.5 bg-gradient-to-r ${[
                            'from-blue-500 to-cyan-400',
                            'from-purple-500 to-pink-400',
                            'from-orange-500 to-yellow-400',
                            'from-green-500 to-emerald-400',
                            'from-red-500 to-rose-400',
                            'from-indigo-500 to-violet-400'
                          ][index % 6]}`} />

                          {/* Logo Container */}
                          <div className="relative h-36 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
                            <div className="absolute top-2 right-2 w-20 h-20 bg-primary/5 rounded-full blur-xl" />
                            <div className="absolute bottom-2 left-2 w-16 h-16 bg-primary/5 rounded-full blur-lg" />

                            {course.image ? (
                              <div className="relative z-10 w-24 h-24 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300">
                                <img
                                  src={getImageUrl(course.image) || ''}
                                  alt={course.title}
                                  className="max-h-full max-w-full object-contain"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>'
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl shadow-md border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="h-12 w-12 text-primary/60" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-3 pt-2">
                            <h4 className="font-semibold text-sm text-gray-800 line-clamp-1 text-center group-hover:text-primary transition-colors">
                              {course.title}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-1 text-center mt-0.5">
                              {course.description || `${course.examCount || 0} exams available`}
                            </p>

                            {/* Stats Row */}
                            <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                  <FileQuestion className="h-3 w-3 text-blue-600" />
                                </div>
                                <span className="font-medium">{course.examCount || 0}</span>
                              </div>
                              {course.studyMaterialCount > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                    <FileText className="h-3 w-3 text-green-600" />
                                  </div>
                                  <span className="font-medium">{course.studyMaterialCount}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                            <button className="bg-white text-primary px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              View Course
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Empty State */}
                {regularExams.length === 0 && pyqs.length === 0 && courses.length === 0 && (
                  <div className="text-center py-12">
                    <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No content available yet</h3>
                    <p className="text-muted-foreground mb-4">Exams, PYQs, and courses will appear here when added by admin</p>
                    <Button variant="outline" onClick={goBackToCategories}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Categories
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* TESTS VIEW */}
        {viewState === 'tests' && selectedExam && (
          <>
            {testsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-32 bg-muted" />
                    <CardContent className="h-24" />
                  </Card>
                ))}
              </div>
            ) : testsError ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-red-600">Error loading tests</h3>
                <p className="text-muted-foreground mb-4">
                  {(testsError as any)?.response?.data?.message || (testsError as any)?.message || 'Failed to load tests'}
                </p>
                <Button onClick={() => queryClient.invalidateQueries(['exam-tests', selectedExam?.id])}>
                  Retry
                </Button>
              </div>
            ) : tests.length === 0 ? (
              <div className="text-center py-12">
                <ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tests available yet</h3>
                <p className="text-muted-foreground">Tests will be added to this exam soon</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Exam ID: {selectedExam?.id}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tests.map((test: any) => (
                  <TestCard
                    key={test.id}
                    test={test}
                    parentTitle={selectedExam?.title}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* COURSE DETAIL VIEW */}
        {viewState === 'course-detail' && selectedCourse && (
          <Tabs defaultValue="materials" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="materials" className="gap-2">
                <FileText className="h-4 w-4" />
                Study Materials
              </TabsTrigger>
            </TabsList>

            {/* STUDY MATERIALS TAB */}
            <TabsContent value="materials">
              {materialsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="h-20" />
                    </Card>
                  ))}
                </div>
              ) : Object.keys(studyMaterials).length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No study materials</h3>
                  <p className="text-muted-foreground">Study materials will be added to this course soon</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(studyMaterials).map(([type, materials]: [string, any]) => (
                    <div key={type}>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        {getMaterialIcon(type)}
                        {type} ({materials.length})
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {materials.map((material: any) => (
                          <Card key={material.id} className="hover:shadow-md transition-all">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                  {getMaterialIcon(type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold truncate">{material.title}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {material.description || `${material.type} material`}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    {material.year && <span>Year: {material.year}</span>}
                                    <span>{material.language}</span>
                                    {material.fileSize > 0 && (
                                      <span>{(material.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  {material.isPremium ? (
                                    <Badge variant="warning" className="gap-1">
                                      <Crown className="h-3 w-3" />
                                      Premium
                                    </Badge>
                                  ) : (
                                    <Badge variant="success">Free</Badge>
                                  )}
                                  <a
                                    href={material.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => studyMaterialAPI.incrementDownload(material.id)}
                                  >
                                    <Button size="sm" variant="outline" className="gap-1">
                                      <Download className="h-3 w-3" />
                                      Download
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 mb-4 shadow-lg text-center">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
              <HelpCircle className="h-6 w-6" />
              Frequently Asked Questions
            </h2>
            <p className="text-indigo-100">Find answers to common questions</p>
          </div>
          {faqsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : faqs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No FAQs available</p>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq: any, index: number) => (
                <div
                  key={faq._id}
                  className="border-2 border-indigo-100 rounded-xl overflow-hidden transition-all duration-300 hover:border-indigo-300 hover:shadow-md"
                  onMouseEnter={() => handleMouseEnter(faq._id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className="w-full text-left p-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-foreground flex items-center gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </span>
                      {faq.question}
                    </span>
                    {openItems.has(faq._id) ? (
                      <ChevronUp className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                  {openItems.has(faq._id) && (
                    <div className="px-4 pb-4 pt-0 bg-white">
                      <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
