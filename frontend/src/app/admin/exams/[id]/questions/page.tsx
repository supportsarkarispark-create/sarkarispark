"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { examsAPI, adminAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Plus,
  ArrowLeft,
  Trash2,
  Edit,
  Save,
  X,
  Loader2,
  CheckCircle,
  BookOpen,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"

export default function ExamQuestionsPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<{
    question: string;
    options: { text: string }[];
    correctAnswer: number;
    explanation: string;
    subject: string;
    topic: string;
    difficulty: string;
    marks: number;
    examId: string;
  }>({
    question: "",
    options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
    correctAnswer: 0,
    explanation: "",
    subject: "",
    topic: "",
    difficulty: "Medium",
    marks: 1,
    examId: examId,
  })

  const { data: examData } = useQuery(["exam", examId], () => examsAPI.getExam(examId))
  const { data: questionsData, isLoading } = useQuery(
    ["questions", examId],
    () => adminAPI.getQuestions(examId),
    {
      enabled: !!examId,
    }
  )

  const exam = examData?.data?.exam
  const questions = questionsData?.data?.questions || []

  const createMutation = useMutation(
    (data: any) => adminAPI.createQuestion(data),
    {
      onSuccess: () => {
        toast.success("Question added successfully")
        queryClient.invalidateQueries(["questions", examId])
        setIsAddDialogOpen(false)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to add question")
      },
    }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => adminAPI.updateQuestion(id, data),
    {
      onSuccess: () => {
        toast.success("Question updated successfully")
        queryClient.invalidateQueries(["questions", examId])
        setEditingQuestion(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update question")
      },
    }
  )

  const deleteMutation = useMutation(
    (id: string) => adminAPI.deleteQuestion(id),
    {
      onSuccess: () => {
        toast.success("Question deleted successfully")
        queryClient.invalidateQueries(["questions", examId])
        setDeleteQuestionId(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete question")
      },
    }
  )

  const resetForm = () => {
    setFormData({
      question: "",
      options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctAnswer: 0,
      explanation: "",
      subject: "",
      topic: "",
      difficulty: "Medium",
      marks: 1,
      examId: examId,
    })
  }

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleUpdateQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingQuestion) {
      updateMutation.mutate({ id: editingQuestion._id, data: formData })
    }
  }

  const startEdit = (question: any) => {
    setEditingQuestion(question)
    setFormData({
      question: question.question,
      options: question.options || [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      correctAnswer: question.correctAnswer ?? 0,
      explanation: question.explanation || "",
      subject: question.subject || "",
      topic: question.topic || "",
      difficulty: question.difficulty || "Medium",
      marks: question.marks || 1,
      examId: examId,
    })
  }

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin/exams">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Manage Questions</h1>
            <p className="text-muted-foreground">
              {exam?.title} • {questions.length} questions
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <p className="text-2xl font-bold">{questions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Easy</p>
              <p className="text-2xl font-bold text-green-600">
                {questions.filter((q: any) => q.difficulty === "Easy").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Medium</p>
              <p className="text-2xl font-bold text-amber-600">
                {questions.filter((q: any) => q.difficulty === "Medium").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Hard</p>
              <p className="text-2xl font-bold text-red-600">
                {questions.filter((q: any) => q.difficulty === "Hard").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : questions.length === 0 ? (
            <Card className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No questions yet</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                Add First Question
              </Button>
            </Card>
          ) : (
            questions.map((question: any, index: number) => (
              <Card key={question._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>Q{index + 1}</Badge>
                        <Badge variant={
                          question.difficulty === "Easy" ? "success" :
                          question.difficulty === "Medium" ? "warning" : "destructive"
                        }>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">{question.marks || 1} marks</Badge>
                      </div>
                      <p className="font-medium mb-4">{question.question}</p>
                      
                      <div className="grid md:grid-cols-2 gap-2 mb-4">
                        {question.options.map((option: any, optIndex: number) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded text-sm ${
                              optIndex === question.correctAnswer
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : "bg-muted"
                            }`}
                          >
                            {optIndex === question.correctAnswer && (
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                            )}
                            {String.fromCharCode(65 + optIndex)}. {typeof option === 'string' ? option : option.text}
                          </div>
                        ))}
                      </div>

                      {question.explanation && (
                        <div className="p-3 bg-blue-50 rounded text-sm text-blue-800 mb-2">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}

                      {(question.subject || question.topic) && (
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          {question.subject && <span>Subject: {question.subject}</span>}
                          {question.topic && <span>• Topic: {question.topic}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(question)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteQuestionId(question._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Question Dialog */}
      <Dialog
        open={isAddDialogOpen || !!editingQuestion}
        onOpenChange={() => {
          setIsAddDialogOpen(false)
          setEditingQuestion(null)
          resetForm()
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question *</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Enter question text..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Options *</label>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() => setFormData({ ...formData, correctAnswer: index })}
                      className="mt-3"
                    />
                    <Input
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...formData.options]
                        newOptions[index] = { ...newOptions[index], text: e.target.value }
                        setFormData({ ...formData, options: newOptions })
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      required
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Select radio button for correct answer
                </p>
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
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Explanation</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Explain the correct answer..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setEditingQuestion(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
                {createMutation.isLoading || updateMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingQuestion ? (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Update
                  </>
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

      {/* Delete Confirmation */}
      <Dialog open={!!deleteQuestionId} onOpenChange={() => setDeleteQuestionId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteQuestionId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteQuestionId && deleteMutation.mutate(deleteQuestionId)}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
