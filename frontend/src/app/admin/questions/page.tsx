"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { adminAPI } from "@/lib/api"
import api from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react"
import toast from "react-hot-toast"

interface Question {
  id: string
  _id?: string
  question: string
  options: { text: string; textHindi?: string; isCorrect?: boolean }[]
  correctAnswer: number
  explanation?: string
  subject?: string
  topic?: string
  difficulty: string
  marks: number
  examId: string
  createdAt: string
}

interface Exam {
  id: string
  _id?: string
  title: string
  category: string
  parentExamId?: string
  parentTitle?: string
}

const ITEMS_PER_PAGE = 10

export default function AdminQuestionsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Mode: 'regular' for regular exams, 'computer' for computer course exams
  const [mode, setMode] = useState<"regular" | "computer">("regular")

  // Filter states
  const [selectedExamId, setSelectedExamId] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  
  // Modal states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

  // Language toggle state
  const [showHindi, setShowHindi] = useState(false)

  // Form state with bilingual support and new option format (3 wrong + 1 correct)
  const [formData, setFormData] = useState<{
    question: string
    questionHindi: string
    correctOption: { text: string; textHindi: string }
    wrongOptions: { text: string; textHindi: string }[]
    explanation: string
    explanationHindi: string
    subject: string
    topic: string
    difficulty: string
    marks: number
    examId: string
  }>({
    question: "",
    questionHindi: "",
    correctOption: { text: "", textHindi: "" },
    wrongOptions: [
      { text: "", textHindi: "" },
      { text: "", textHindi: "" },
      { text: "", textHindi: "" }
    ],
    explanation: "",
    explanationHindi: "",
    subject: "",
    topic: "",
    difficulty: "Medium",
    marks: 1,
    examId: "",
  })

  // Fetch all exams for dropdown - filter to show only tests (with parentExamId)
  const { data: examsData, isLoading: examsLoading } = useQuery(
    ["exams"],
    () => api.get("/exams", { params: { limit: 500 } }),
    { enabled: mode === "regular" }
  )

  // Fetch computer course exams for dropdown
  const { data: computerExamsData, isLoading: computerExamsLoading } = useQuery(
    ["computer-course-exams"],
    () => api.get("/computer-course-exams", { params: { limit: 500 } }),
    { enabled: mode === "computer" }
  )

  // Filter to show only tests (exams with parentExamId), not parent exam groups
  // Also include parent exam title for better identification
  const exams: Exam[] = useMemo(() => {
    if (mode === "computer") {
      return computerExamsData?.data?.exams || []
    }

    const allExams = examsData?.data?.exams || []
    const parentExams = allExams.filter((e: any) => !e.parentExamId)
    const tests = allExams.filter((e: any) => e.parentExamId)

    // Add parent title to each test for display
    return tests.map((test: any) => {
      const parent = parentExams.find((p: any) => p.id === test.parentExamId || p._id === test.parentExamId)
      return {
        ...test,
        parentTitle: parent?.title || "Unknown Group"
      }
    })
  }, [examsData, computerExamsData, mode])

  // Fetch questions based on selected exam and mode
  const { data: questionsData, isLoading: questionsLoading } = useQuery(
    ["admin-questions", selectedExamId, currentPage, mode],
    async () => {
      if (selectedExamId && selectedExamId !== "all" && selectedExamId !== "undefined") {
        if (mode === "computer") {
          const response = await api.get(`/computer-course-exams/${selectedExamId}/questions`, {
            params: { page: currentPage, limit: ITEMS_PER_PAGE }
          })
          return response
        }
        return adminAPI.getQuestions(selectedExamId, { page: currentPage, limit: ITEMS_PER_PAGE })
      }
      return Promise.resolve({ data: { questions: [], total: 0, page: 1, pages: 0 } })
    },
    {
      enabled: selectedExamId !== "all" && !!selectedExamId && selectedExamId !== "undefined",
      keepPreviousData: true,
    }
  )

  // Get all questions for "all" view - fetch from each exam and combine
  const allQuestions = useMemo(() => {
    if (selectedExamId === "all") {
      // For "all" view, we'll need to fetch questions from all exams
      // This is a simplified version - in production, you'd want a dedicated API endpoint
      return { questions: [], total: 0, pages: 0 }
    }
    return {
      questions: questionsData?.data?.questions || [],
      total: questionsData?.data?.total || 0,
      pages: questionsData?.data?.pages || 0,
    }
  }, [selectedExamId, questionsData])

  // Filter questions by search query
  const filteredQuestions = useMemo(() => {
    let questions = allQuestions.questions
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      questions = questions.filter((q: Question) =>
        q.question.toLowerCase().includes(query) ||
        (q.subject && q.subject.toLowerCase().includes(query)) ||
        (q.topic && q.topic.toLowerCase().includes(query))
      )
    }
    return questions
  }, [allQuestions.questions, searchQuery])

  // Get exam name by ID
  const getExamName = (examId: string) => {
    const exam = exams.find((e: Exam) => e.id === examId || e._id === examId)
    return exam?.title || "Unknown Exam"
  }

  // Mutations
  const createMutation = useMutation(
    async (data: any) => {
      if (mode === "computer") {
        // Transform data format for computer course questions
        const computerData = {
          examId: data.examId,
          question: data.question,
          options: [
            data.correctOption,
            ...data.wrongOptions
          ],
          correctOption: 0, // First option is always correct in our format
          explanation: data.explanation,
          marks: data.marks,
          difficulty: data.difficulty
        }
        const response = await api.post(`/computer-course-questions`, computerData)
        return response
      }
      return adminAPI.createQuestion(data)
    },
    {
      onSuccess: () => {
        toast.success("Question added successfully")
        // Invalidate all admin-questions queries to refresh the list
        queryClient.invalidateQueries({ queryKey: ["admin-questions"] })
        // Refetch current page specifically
        queryClient.refetchQueries({ queryKey: ["admin-questions", selectedExamId, currentPage, mode] })
        setIsAddDialogOpen(false)
        resetForm()
      },
      onError: (error: any) => {
        const message = error.response?.data?.message
        const errors = error.response?.data?.errors
        if (errors && Array.isArray(errors)) {
          toast.error(`Validation error: ${errors[0].msg}`)
        } else {
          toast.error(message || "Failed to add question")
        }
      },
    }
  )

  const updateMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      if (mode === "computer") {
        // Transform data format for computer course questions
        const computerData = {
          question: data.question,
          options: [
            data.correctOption,
            ...data.wrongOptions
          ],
          correctOption: 0,
          explanation: data.explanation,
          marks: data.marks,
          difficulty: data.difficulty
        }
        const response = await api.put(`/computer-course-questions/${id}`, computerData)
        return response
      }
      return adminAPI.updateQuestion(id, data)
    },
    {
      onSuccess: () => {
        toast.success("Question updated successfully")
        // Invalidate all admin-questions queries to refresh the list
        queryClient.invalidateQueries({ queryKey: ["admin-questions"] })
        // Refetch current page specifically
        queryClient.refetchQueries({ queryKey: ["admin-questions", selectedExamId, currentPage, mode] })
        setIsEditDialogOpen(false)
        setSelectedQuestion(null)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update question")
      },
    }
  )

  const deleteMutation = useMutation(
    async (id: string) => {
      if (mode === "computer") {
        const response = await api.delete(`/computer-course-questions/${id}`)
        return response
      }
      return adminAPI.deleteQuestion(id)
    },
    {
      onSuccess: () => {
        toast.success("Question deleted successfully")
        // Invalidate all admin-questions queries to refresh the list
        queryClient.invalidateQueries({ queryKey: ["admin-questions"] })
        // Refetch current page specifically
        queryClient.refetchQueries({ queryKey: ["admin-questions", selectedExamId, currentPage, mode] })
        setIsDeleteDialogOpen(false)
        setSelectedQuestion(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete question")
      },
    }
  )

  const resetForm = () => {
    setFormData({
      question: "",
      questionHindi: "",
      correctOption: { text: "", textHindi: "" },
      wrongOptions: [
        { text: "", textHindi: "" },
        { text: "", textHindi: "" },
        { text: "", textHindi: "" }
      ],
      explanation: "",
      explanationHindi: "",
      subject: "",
      topic: "",
      difficulty: "Medium",
      marks: 1,
      examId: selectedExamId !== "all" ? selectedExamId : "",
    })
    setShowHindi(false)
  }

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.examId || formData.examId === "all") {
      toast.error("Please select an exam")
      return
    }

    if (!formData.question.trim()) {
      toast.error("Please enter question text")
      return
    }

    // Check correct option has text
    if (!formData.correctOption.text.trim()) {
      toast.error("Please enter the correct answer")
      return
    }

    // Check all wrong options have text
    const emptyWrongOptions = formData.wrongOptions.filter(opt => !opt.text.trim())
    if (emptyWrongOptions.length > 0) {
      toast.error(`Please fill in all 3 wrong options (${emptyWrongOptions.length} empty)`)
      return
    }

    const submitData = {
      examId: formData.examId,
      question: formData.question,
      questionHindi: formData.questionHindi,
      options: [
        { ...formData.correctOption, isCorrect: true },
        ...formData.wrongOptions.map(opt => ({ ...opt, isCorrect: false }))
      ],
      correctAnswer: 0, // First option is always correct before shuffling
      explanation: formData.explanation,
      explanationHindi: formData.explanationHindi,
      subject: formData.subject,
      topic: formData.topic,
      difficulty: formData.difficulty,
      marks: formData.marks,
    }

    createMutation.mutate(submitData)
  }

  const handleUpdateQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedQuestion) {
      // Transform data for API: combine correct + wrong options with isCorrect flag
      const allOptions = [
        { ...formData.correctOption, isCorrect: true },
        ...formData.wrongOptions.map(opt => ({ ...opt, isCorrect: false }))
      ]

      const submitData = {
        examId: formData.examId,
        question: formData.question,
        questionHindi: formData.questionHindi,
        options: allOptions,
        correctAnswer: 0, // First option is always correct before shuffling
        explanation: formData.explanation,
        explanationHindi: formData.explanationHindi,
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty,
        marks: formData.marks,
      }

      updateMutation.mutate({ id: selectedQuestion.id || selectedQuestion._id || '', data: submitData })
    }
  }

  const openAddDialog = () => {
    resetForm()
    if (selectedExamId !== "all") {
      setFormData(prev => ({ ...prev, examId: selectedExamId }))
    }
    setIsAddDialogOpen(true)
  }

  const openEditDialog = (question: Question) => {
    setSelectedQuestion(question)

    // Convert existing question format to new format (3 wrong + 1 correct)
    // Handle both old format (options array with correctAnswer index) and new format (isCorrect flag)
    const options = question.options || []
    let correctOpt = { text: "", textHindi: "" }
    let wrongOpts = [{ text: "", textHindi: "" }, { text: "", textHindi: "" }, { text: "", textHindi: "" }]
    
    // Check if using new format (isCorrect flag)
    const correctIndex = options.findIndex((opt: any) => opt.isCorrect)
    if (correctIndex >= 0) {
      correctOpt = {
        text: options[correctIndex].text || "",
        textHindi: options[correctIndex].textHindi || ""
      }
      wrongOpts = options
        .filter((opt: any) => !opt.isCorrect)
        .slice(0, 3)
        .map((opt: any) => ({
          text: opt.text || "",
          textHindi: opt.textHindi || ""
        }))
    } else {
      // Old format: use correctAnswer index
      const correctIndexOld = question.correctAnswer ?? 0
      correctOpt = {
        text: options[correctIndexOld]?.text || "",
        textHindi: options[correctIndexOld]?.textHindi || ""
      }
      wrongOpts = options
        .filter((_: any, idx: number) => idx !== correctIndexOld)
        .slice(0, 3)
        .map((opt: any) => ({
          text: opt.text || "",
          textHindi: opt.textHindi || ""
        }))
    }

    // Pad wrong options if needed
    while (wrongOpts.length < 3) {
      wrongOpts.push({ text: "", textHindi: "" })
    }

    setFormData({
      question: question.question || "",
      questionHindi: (question as any).questionHindi || "",
      correctOption: correctOpt,
      wrongOptions: wrongOpts,
      explanation: question.explanation || "",
      explanationHindi: (question as any).explanationHindi || "",
      subject: question.subject || "",
      topic: question.topic || "",
      difficulty: question.difficulty || "Medium",
      marks: question.marks || 1,
      examId: question.examId,
    })
    setShowHindi(false)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (question: Question) => {
    setSelectedQuestion(question)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (selectedQuestion) {
      const id = selectedQuestion.id || selectedQuestion._id || ""
      deleteMutation.mutate(id)
    } else {
      toast.error("No question selected")
    }
  }

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800"
      case "Medium": return "bg-amber-100 text-amber-800"
      case "Hard": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need admin privileges to manage questions.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const isLoading = examsLoading || questionsLoading
  const showNoExamSelected = selectedExamId === "all"

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
            </div>
            <h1 className="text-3xl font-bold">Question Management</h1>
            <p className="text-muted-foreground">
              Manage all exam questions in one place
            </p>
          </div>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === "regular" ? "default" : "outline"}
            onClick={() => {
              setMode("regular")
              setSelectedExamId("all")
              setCurrentPage(1)
            }}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Regular Exams
          </Button>
          <Button
            variant={mode === "computer" ? "default" : "outline"}
            onClick={() => {
              setMode("computer")
              setSelectedExamId("all")
              setCurrentPage(1)
            }}
            className="gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            Computer Courses
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-72">
                <Select value={selectedExamId} onValueChange={(value) => {
                  setSelectedExamId(value)
                  setCurrentPage(1)
                }}>
                  <SelectTrigger className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={mode === "computer" ? "Select Course Test" : "Select Test"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{mode === "computer" ? "All Course Tests (Please select one)" : "All Tests (Please select one)"}</SelectItem>
                    {exams.map((exam: Exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        <span className="font-medium">{exam.title}</span>
                        {mode === "regular" && exam.parentTitle && (
                          <span className="text-muted-foreground ml-2 text-xs">({exam.parentTitle})</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <p className="text-2xl font-bold">{allQuestions.total || filteredQuestions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Easy</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredQuestions.filter((q: Question) => q.difficulty === "Easy").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Medium</p>
              <p className="text-2xl font-bold text-amber-600">
                {filteredQuestions.filter((q: Question) => q.difficulty === "Medium").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Hard</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredQuestions.filter((q: Question) => q.difficulty === "Hard").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Questions
                </CardTitle>
                <CardDescription>
                  {selectedExamId !== "all" 
                    ? `Showing questions for: ${getExamName(selectedExamId)}`
                    : "Select an exam to view questions"}
                </CardDescription>
              </div>
              {allQuestions.pages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {allQuestions.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(allQuestions.pages, p + 1))}
                    disabled={currentPage === allQuestions.pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : showNoExamSelected ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Please select an exam to view questions</p>
                <p className="text-sm text-muted-foreground">
                  Use the dropdown above to filter questions by exam
                </p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No questions found for this exam</p>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Question
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium w-1/3">Question</th>
                      <th className="text-left p-4 font-medium">Options (A-D)</th>
                      <th className="text-left p-4 font-medium">Correct</th>
                      <th className="text-left p-4 font-medium">Difficulty</th>
                      <th className="text-left p-4 font-medium">Marks</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((question: Question) => (
                      <tr key={question.id || question._id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <div>
                            <p className="font-medium line-clamp-2">{question.question}</p>
                            {(question.subject || question.topic) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {question.subject}{question.topic && ` • ${question.topic}`}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {question.options.slice(0, 4).map((option, idx) => (
                              <p key={idx} className={`text-sm ${idx === question.correctAnswer ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                                {String.fromCharCode(65 + idx)}. {option.text}
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {String.fromCharCode(65 + question.correctAnswer)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{question.marks || 1}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(question)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(question)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Question Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Question
            </DialogTitle>
            <DialogDescription>
              Create a new question for {selectedExamId !== "all" ? getExamName(selectedExamId) : "selected exam"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddQuestion}>
            <div className="space-y-4 py-4">
              {/* Exam Selection - Always show and allow changing */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Exam *</label>
                <Select 
                  value={formData.examId} 
                  onValueChange={(value) => setFormData({ ...formData, examId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.length === 0 ? (
                      <SelectItem value="no-exams" disabled>No tests available. Create tests in Exam Management first.</SelectItem>
                    ) : (
                      exams.map((exam: Exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          <span className="font-medium">{exam.title}</span>
                          <span className="text-muted-foreground ml-2">({exam.parentTitle})</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Language Toggle */}
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Language:</span>
                <Button
                  type="button"
                  variant={!showHindi ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowHindi(false)}
                >
                  English Only
                </Button>
                <Button
                  type="button"
                  variant={showHindi ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowHindi(true)}
                >
                  English + Hindi
                </Button>
              </div>

              {/* Question - English */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Question (English) *</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Enter question text in English..."
                  required
                />
              </div>

              {/* Question - Hindi (conditional) */}
              {showHindi && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question (Hindi)</label>
                  <textarea
                    value={formData.questionHindi}
                    onChange={(e) => setFormData({ ...formData, questionHindi: e.target.value })}
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="हिंदी में प्रश्न दर्ज करें..."
                    dir="auto"
                  />
                </div>
              )}

              {/* Correct Answer */}
              <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <label className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Correct Answer *
                </label>
                <Input
                  value={formData.correctOption.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    correctOption: { ...formData.correctOption, text: e.target.value }
                  })}
                  placeholder="Enter the CORRECT answer option..."
                  className="bg-white"
                  required
                />
                {showHindi && (
                  <Input
                    value={formData.correctOption.textHindi}
                    onChange={(e) => setFormData({
                      ...formData,
                      correctOption: { ...formData.correctOption, textHindi: e.target.value }
                    })}
                    placeholder="सही उत्तर हिंदी में..."
                    dir="auto"
                  />
                )}
              </div>

              {/* Wrong Options */}
              <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <label className="text-sm font-medium text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Wrong Options (3 Incorrect Answers) *
                </label>
                {formData.wrongOptions.map((option, index) => (
                  <div key={index} className="space-y-2">
                    <Input
                      value={option.text}
                      onChange={(e) => {
                        const newWrongOptions = [...formData.wrongOptions]
                        newWrongOptions[index] = { ...newWrongOptions[index], text: e.target.value }
                        setFormData({ ...formData, wrongOptions: newWrongOptions })
                      }}
                      placeholder={`Wrong Option ${index + 1} (English)...`}
                      className="bg-white"
                      required
                    />
                    {showHindi && (
                      <Input
                        value={option.textHindi}
                        onChange={(e) => {
                          const newWrongOptions = [...formData.wrongOptions]
                          newWrongOptions[index] = { ...newWrongOptions[index], textHindi: e.target.value }
                          setFormData({ ...formData, wrongOptions: newWrongOptions })
                        }}
                        placeholder={`गलत विकल्प ${index + 1} (हिंदी)...`}
                        dir="auto"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Algebra"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Marks</label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {/* Explanation - English */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Explanation (English)</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Explain the correct answer..."
                />
              </div>

              {/* Explanation - Hindi (conditional) */}
              {showHindi && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Explanation (Hindi)</label>
                  <textarea
                    value={formData.explanationHindi}
                    onChange={(e) => setFormData({ ...formData, explanationHindi: e.target.value })}
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="सही उत्तर की व्याख्या..."
                    dir="auto"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isLoading}>
                {createMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Question
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateQuestion}>
            <div className="space-y-4 py-4">
              {/* Language Toggle */}
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Language:</span>
                <Button
                  type="button"
                  variant={!showHindi ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowHindi(false)}
                >
                  English Only
                </Button>
                <Button
                  type="button"
                  variant={showHindi ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowHindi(true)}
                >
                  English + Hindi
                </Button>
              </div>

              {/* Question - English */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Question (English) *</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Enter question text in English..."
                  required
                />
              </div>

              {/* Question - Hindi (conditional) */}
              {showHindi && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question (Hindi)</label>
                  <textarea
                    value={formData.questionHindi}
                    onChange={(e) => setFormData({ ...formData, questionHindi: e.target.value })}
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="हिंदी में प्रश्न दर्ज करें..."
                    dir="auto"
                  />
                </div>
              )}

              {/* Correct Answer */}
              <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <label className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Correct Answer *
                </label>
                <Input
                  value={formData.correctOption.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    correctOption: { ...formData.correctOption, text: e.target.value }
                  })}
                  placeholder="Enter the CORRECT answer option..."
                  className="bg-white"
                  required
                />
                {showHindi && (
                  <Input
                    value={formData.correctOption.textHindi}
                    onChange={(e) => setFormData({
                      ...formData,
                      correctOption: { ...formData.correctOption, textHindi: e.target.value }
                    })}
                    placeholder="सही उत्तर हिंदी में..."
                    dir="auto"
                  />
                )}
              </div>

              {/* Wrong Options */}
              <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <label className="text-sm font-medium text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Wrong Options (3 Incorrect Answers) *
                </label>
                {formData.wrongOptions.map((option, index) => (
                  <div key={index} className="space-y-2">
                    <Input
                      value={option.text}
                      onChange={(e) => {
                        const newWrongOptions = [...formData.wrongOptions]
                        newWrongOptions[index] = { ...newWrongOptions[index], text: e.target.value }
                        setFormData({ ...formData, wrongOptions: newWrongOptions })
                      }}
                      placeholder={`Wrong Option ${index + 1} (English)...`}
                      className="bg-white"
                      required
                    />
                    {showHindi && (
                      <Input
                        value={option.textHindi}
                        onChange={(e) => {
                          const newWrongOptions = [...formData.wrongOptions]
                          newWrongOptions[index] = { ...newWrongOptions[index], textHindi: e.target.value }
                          setFormData({ ...formData, wrongOptions: newWrongOptions })
                        }}
                        placeholder={`गलत विकल्प ${index + 1} (हिंदी)...`}
                        dir="auto"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Algebra"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Marks</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || 1 })}
                />
              </div>

              {/* Explanation - English */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Explanation (English)</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Explain the correct answer..."
                />
              </div>

              {/* Explanation - Hindi (conditional) */}
              {showHindi && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Explanation (Hindi)</label>
                  <textarea
                    value={formData.explanationHindi}
                    onChange={(e) => setFormData({ ...formData, explanationHindi: e.target.value })}
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="सही उत्तर की व्याख्या..."
                    dir="auto"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isLoading}>
                {updateMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-1" />
                    Update Question
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Question
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="py-4 px-4 bg-muted rounded-lg">
              <p className="font-medium line-clamp-2">{selectedQuestion.question}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Correct Answer: {String.fromCharCode(65 + selectedQuestion.correctAnswer)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
