"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import MediaLibrary from "@/components/media/MediaLibrary"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  FolderOpen,
  BookOpen,
  Clock,
  FileText,
  ImageIcon,
} from "lucide-react"
import toast from "react-hot-toast"
import api from "@/lib/api"
import { getImageUrl, mediaAPI } from "@/lib/api"

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
  courseId: string
  duration: number
  totalQuestions: number
  totalMarks: number
  passingMarks: number
  accessType: string
  isActive: boolean
  order: number
}

const ITEMS_PER_PAGE = 10

export default function AdminCoursesPage() {
  const queryClient = useQueryClient()
  
  // View state: 'courses' or 'exams'
  const [viewState, setViewState] = useState<"courses" | "exams">("courses")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  
  // Search and pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  
  // Modal states
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingExam, setEditingExam] = useState<ComputerCourseExam | null>(null)
  const [deletingItem, setDeletingItem] = useState<{ type: 'course' | 'exam', id: string, name: string } | null>(null)
  
  // Image upload states
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
  
  // Course form state
  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    image: "",
    isActive: true
  })
  
  // Exam form state
  const [examFormData, setExamFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    duration: 60,
    totalQuestions: 50,
    totalMarks: 100,
    passingMarks: 35,
    accessType: "free",
    isActive: true,
    order: 0
  })

  // Fetch courses
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useQuery(
    ["admin-computer-courses", currentPage],
    async () => {
      const response = await api.get("/courses/admin", {
        params: { page: currentPage, limit: ITEMS_PER_PAGE }
      })
      return response
    },
    {
      onError: (error: any) => {
        console.error('Courses fetch error:', error)
      }
    }
  )

  // Fetch exams for selected course
  const { data: examsData, isLoading: examsLoading } = useQuery(
    ["admin-computer-course-exams", selectedCourse?.id, currentPage],
    async () => {
      if (!selectedCourse) return { data: { exams: [], total: 0, pages: 0 } }
      const response = await api.get(`/computer-course-exams/course/${selectedCourse.id}`, {
        params: { page: currentPage, limit: ITEMS_PER_PAGE }
      })
      return response
    },
    { enabled: !!selectedCourse }
  )

  const courses = coursesData?.data?.courses || []
  const exams = examsData?.data?.exams || []
  const coursesTotal = coursesData?.data?.total || 0
  const examsTotal = examsData?.data?.total || 0

  // Filter courses by search
  const filteredCourses = courses.filter((course: Course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Mutations for courses
  const createCourseMutation = useMutation(
    async (data: any) => {
      const response = await api.post("/courses", data)
      return response
    },
    {
      onSuccess: () => {
        toast.success("Course created successfully")
        queryClient.invalidateQueries(["admin-computer-courses"])
        setIsCourseDialogOpen(false)
        resetCourseForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create course")
      }
    }
  )

  const updateCourseMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/courses/${id}`, data)
      return response
    },
    {
      onSuccess: () => {
        toast.success("Course updated successfully")
        queryClient.invalidateQueries(["admin-computer-courses"])
        setIsCourseDialogOpen(false)
        setEditingCourse(null)
        resetCourseForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update course")
      }
    }
  )

  const deleteCourseMutation = useMutation(
    async (id: string) => {
      const response = await api.delete(`/courses/${id}`)
      return response
    },
    {
      onSuccess: () => {
        toast.success("Course deleted successfully")
        queryClient.invalidateQueries(["admin-computer-courses"])
        setIsDeleteDialogOpen(false)
        setDeletingItem(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete course")
      }
    }
  )

  // Mutations for exams
  const createExamMutation = useMutation(
    async (data: any) => {
      const response = await api.post("/computer-course-exams", data)
      return response
    },
    {
      onSuccess: () => {
        toast.success("Test created successfully")
        queryClient.invalidateQueries(["admin-computer-course-exams"])
        setIsExamDialogOpen(false)
        resetExamForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create test")
      }
    }
  )

  const updateExamMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/computer-course-exams/${id}`, data)
      return response
    },
    {
      onSuccess: () => {
        toast.success("Test updated successfully")
        queryClient.invalidateQueries(["admin-computer-course-exams"])
        setIsExamDialogOpen(false)
        setEditingExam(null)
        resetExamForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update test")
      }
    }
  )

  const deleteExamMutation = useMutation(
    async (id: string) => {
      const response = await api.delete(`/computer-course-exams/${id}`)
      return response
    },
    {
      onSuccess: () => {
        toast.success("Test deleted successfully")
        queryClient.invalidateQueries(["admin-computer-course-exams"])
        setIsDeleteDialogOpen(false)
        setDeletingItem(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete test")
      }
    }
  )

  const resetCourseForm = () => {
    setCourseFormData({
      title: "",
      description: "",
      image: "",
      isActive: true
    })
    setSelectedImageFile(null)
    setImagePreview(null)
    setEditingCourse(null)
  }

  const resetExamForm = () => {
    setExamFormData({
      title: "",
      description: "",
      courseId: selectedCourse?.id || "",
      duration: 60,
      totalQuestions: 50,
      totalMarks: 100,
      passingMarks: 35,
      accessType: "free",
      isActive: true,
      order: 0
    })
    setEditingExam(null)
  }

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let imagePath = courseFormData.image
    
    if (selectedImageFile) {
      try {
        const formDataUpload = new FormData()
        formDataUpload.append('images', selectedImageFile)
        formDataUpload.append('type', 'course')
        
        const response = await mediaAPI.uploadImage(formDataUpload)
        const uploadedMedia = response.data?.media?.[0] || response.data
        imagePath = uploadedMedia.url || uploadedMedia.path || ''
      } catch (error) {
        console.error('Image upload failed:', error)
      }
    }
    
    const submitData = { ...courseFormData, image: imagePath }
    
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, data: submitData })
    } else {
      createCourseMutation.mutate(submitData)
    }
  }

  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = { ...examFormData, courseId: selectedCourse?.id }
    
    if (editingExam) {
      updateExamMutation.mutate({ id: editingExam.id, data: submitData })
    } else {
      createExamMutation.mutate(submitData)
    }
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setCourseFormData({
      title: course.title,
      description: course.description,
      image: course.image || "",
      isActive: course.isActive
    })
    setImagePreview(course.image ? getImageUrl(course.image) : null)
    setIsCourseDialogOpen(true)
  }

  const handleEditExam = (exam: ComputerCourseExam) => {
    setEditingExam(exam)
    setExamFormData({
      title: exam.title,
      description: exam.description,
      courseId: exam.courseId,
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      accessType: exam.accessType,
      isActive: exam.isActive,
      order: exam.order
    })
    setIsExamDialogOpen(true)
  }

  const handleDelete = (type: 'course' | 'exam', id: string, name: string) => {
    setDeletingItem({ type, id, name })
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!deletingItem) return
    
    if (deletingItem.type === 'course') {
      deleteCourseMutation.mutate(deletingItem.id)
    } else {
      deleteExamMutation.mutate(deletingItem.id)
    }
  }

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setViewState('exams')
  }

  const handleBackToCourses = () => {
    setSelectedCourse(null)
    setViewState('courses')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              {viewState === 'exams' && (
                <Button variant="ghost" size="sm" onClick={handleBackToCourses}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Courses
                </Button>
              )}
            </div>
            <h1 className="text-3xl font-bold">
              {viewState === 'courses' ? 'Computer Courses' : `${selectedCourse?.title} - Tests`}
            </h1>
            <p className="text-muted-foreground">
              {viewState === 'courses' ? 'Manage computer courses and their tests' : 'Manage tests for this course'}
            </p>
          </div>
          <Button onClick={() => viewState === 'courses' ? setIsCourseDialogOpen(true) : setIsExamDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {viewState === 'courses' ? 'Add Course' : 'Add Test'}
          </Button>
        </div>

        {/* Search */}
        {viewState === 'courses' && (
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Content */}
        {viewState === 'courses' ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {coursesLoading ? (
              [...Array(10)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-32 bg-muted" />
                  <CardContent className="h-24" />
                </Card>
              ))
            ) : filteredCourses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">Create courses to get started</p>
                <Button onClick={() => setIsCourseDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Course
                </Button>
              </div>
            ) : (
              filteredCourses.map((course: Course) => {
                const examCount = coursesData?.data?.examCounts?.[course.id] || 0
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden">
                    {course.image && (
                      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                        <img
                          src={getImageUrl(course.image)}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="relative z-10 pb-2">
                      <div className="flex items-start justify-between">
                        {course.image ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden">
                            <img
                              src={getImageUrl(course.image)}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditCourse(course)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete('course', course.id, course.title)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-2" onClick={() => handleCourseClick(course)}>
                      <h3 className="text-sm font-bold mb-1">{course.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{examCount} Tests</p>
                      <Button variant="ghost" size="sm" className="w-full">
                        <FileText className="h-3 w-3 mr-1" />
                        Manage Tests
                      </Button>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {examsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading tests...</p>
              </div>
            ) : exams.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tests found</h3>
                <p className="text-muted-foreground mb-4">Create tests for this course</p>
                <Button onClick={() => setIsExamDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Test
                </Button>
              </div>
            ) : (
              exams.map((exam: ComputerCourseExam) => (
                <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{exam.title}</CardTitle>
                        <CardDescription className="mt-1">{exam.description || "No description"}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExam(exam)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete('exam', exam.id, exam.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{exam.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{exam.totalQuestions} Q</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{exam.totalMarks} Marks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{exam.accessType}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/admin/questions`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          Manage Questions
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Course Dialog */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Create Course'}</DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Update course information' : 'Add a new computer course'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCourseSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Course Title</label>
                <Input
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  placeholder="Enter course description"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Course Image</label>
                <div className="flex items-start gap-4 mt-2">
                  {imagePreview && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImageFile(null)
                          setImagePreview(null)
                          setCourseFormData({ ...courseFormData, image: "" })
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setSelectedImageFile(file)
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setImagePreview(reader.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="hidden"
                        id="course-image-upload"
                      />
                      <label htmlFor="course-image-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="cursor-pointer"
                          asChild
                        >
                          <span className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            {imagePreview ? "Change Image" : "Upload Image"}
                          </span>
                        </Button>
                      </label>
                      <span className="text-xs text-muted-foreground">or</span>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMediaLibraryOpen(true)}
                      >
                        <ImageIcon className="h-4 w-4 mr-1" />
                        Select from Library
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="course-active"
                  checked={courseFormData.isActive}
                  onChange={(e) => setCourseFormData({ ...courseFormData, isActive: e.target.checked })}
                />
                <label htmlFor="course-active" className="text-sm">Active</label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCourseDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCourseMutation.isLoading || updateCourseMutation.isLoading}>
                {createCourseMutation.isLoading || updateCourseMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingCourse ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Exam Dialog */}
      <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExam ? 'Edit Test' : 'Create Test'}</DialogTitle>
            <DialogDescription>
              {editingExam ? 'Update test information' : 'Add a new test to this course'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleExamSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Test Title</label>
                <Input
                  value={examFormData.title}
                  onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })}
                  placeholder="Enter test title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={examFormData.description}
                  onChange={(e) => setExamFormData({ ...examFormData, description: e.target.value })}
                  placeholder="Enter test description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={examFormData.duration}
                    onChange={(e) => setExamFormData({ ...examFormData, duration: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Questions</label>
                  <Input
                    type="number"
                    value={examFormData.totalQuestions}
                    onChange={(e) => setExamFormData({ ...examFormData, totalQuestions: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Marks</label>
                  <Input
                    type="number"
                    value={examFormData.totalMarks}
                    onChange={(e) => setExamFormData({ ...examFormData, totalMarks: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Passing Marks</label>
                  <Input
                    type="number"
                    value={examFormData.passingMarks}
                    onChange={(e) => setExamFormData({ ...examFormData, passingMarks: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Access Type</label>
                <Select value={examFormData.accessType} onValueChange={(value) => setExamFormData({ ...examFormData, accessType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="login">Login Required</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Order</label>
                <Input
                  type="number"
                  value={examFormData.order}
                  onChange={(e) => setExamFormData({ ...examFormData, order: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="exam-active"
                  checked={examFormData.isActive}
                  onChange={(e) => setExamFormData({ ...examFormData, isActive: e.target.checked })}
                />
                <label htmlFor="exam-active" className="text-sm">Active</label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsExamDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createExamMutation.isLoading || updateExamMutation.isLoading}>
                {createExamMutation.isLoading || updateExamMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingExam ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingItem?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Library */}
      <MediaLibrary
        open={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={(imagePath) => {
          setCourseFormData({ ...courseFormData, image: imagePath })
          setImagePreview(getImageUrl(imagePath))
          setSelectedImageFile(null)
        }}
      />

      <Footer />
    </div>
  )
}
