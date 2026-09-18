"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "react-query"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { examsAPI, adminAPI, examCategoryAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Switch } from "@/components/ui/Switch"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  ArrowLeft,
  Save,
  Loader2,
  Clock,
  BookOpen,
  GraduationCap,
  Crown,
  CheckCircle,
  Layers,
  CalendarDays,
} from "lucide-react"
import toast from "react-hot-toast"

const DIFFICULTIES = ["Easy", "Medium", "Hard"]

export default function EditExamPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.id as string
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch categories dynamically
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    "exam-categories",
    examCategoryAPI.getCategories
  )
  const categories = categoriesData?.data?.categories || []
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    parentExamId: "",
    isPYQ: false,
    testNumber: 1,
    duration: 60,
    totalQuestions: 0,
    totalMarks: 0,
    passingMarks: 0,
    difficulty: "Medium",
    isPremium: false,
    isActive: true,
    negativeMarking: 0,
    pricing: {
      oneTime: { price: 0, discountPrice: 0, isActive: true },
      monthly: { price: 0, discountPrice: 0, isActive: false },
      yearly: { price: 0, discountPrice: 0, isActive: false }
    }
  })
  const [isParentExam, setIsParentExam] = useState(true)

  const { data: examData, isLoading } = useQuery(
    ["exam", examId],
    () => examsAPI.getExam(examId),
    {
      enabled: !!examId && examId !== "undefined",
    }
  )

  useEffect(() => {
    if (examData?.data?.exam) {
      const exam = examData.data.exam
      const hasParent = !!exam.parentExamId
      setIsParentExam(!hasParent)
      setFormData({
        title: exam.title || "",
        description: exam.description || "",
        category: exam.category || "",
        parentExamId: exam.parentExamId || "",
        isPYQ: exam.isPYQ || false,
        testNumber: exam.testNumber || 1,
        duration: exam.duration || 60,
        totalQuestions: exam.totalQuestions || 0,
        totalMarks: exam.totalMarks || 0,
        passingMarks: exam.passingMarks || 0,
        difficulty: exam.difficulty || "Medium",
        isPremium: exam.isPremium || false,
        isActive: exam.isActive !== false,
        negativeMarking: exam.negativeMarking || 0,
        pricing: exam.pricing || {
          oneTime: { price: 0, discountPrice: 0, isActive: true },
          monthly: { price: 0, discountPrice: 0, isActive: false },
          yearly: { price: 0, discountPrice: 0, isActive: false }
        }
      })
    }
  }, [examData])

  const updateMutation = useMutation(
    (data: any) => adminAPI.updateExam(examId, data),
    {
      onSuccess: () => {
        toast.success("Exam updated successfully!")
        router.push("/admin/exams")
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update exam")
        setIsSubmitting(false)
      },
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    updateMutation.mutate(formData)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/exams">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Exam</CardTitle>
            <CardDescription>
              Update exam details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Basic Information
                </h3>

                {/* Exam Type Info */}
                <div className="p-4 bg-muted/50 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    {isParentExam ? (
                      <>
                        <Layers className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Exam Group / PYQ</p>
                          <p className="text-xs text-muted-foreground">This is a parent exam that contains multiple tests</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">Test under: {formData.parentExamId ? "Parent Exam" : "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">This is a child test with number #{formData.testNumber}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Exam Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., SSC CGL 2024 Mock Test 1"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the exam..."
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                      disabled={categoriesLoading}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    {categoriesLoading && <p className="text-xs text-muted-foreground">Loading categories...</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty *</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      {DIFFICULTIES.map((diff) => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>

                  {/* isPYQ toggle (only for parent exams) */}
                  {isParentExam && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isPYQ}
                          onChange={(e) => setFormData({ ...formData, isPYQ: e.target.checked })}
                          className="h-5 w-5 rounded border-gray-300"
                        />
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-amber-500" />
                            This is a Previous Year Questions (PYQ) Group
                          </p>
                          <p className="text-xs text-muted-foreground">Mark this if this exam group contains previous year question papers</p>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Test number (only for child exams) */}
                  {!isParentExam && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Test Number</label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.testNumber}
                        onChange={(e) => setFormData({ ...formData, testNumber: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">e.g., Mock Test 1, Mock Test 2</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Exam Settings */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Exam Settings
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration (minutes) *</label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Questions *</label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.totalQuestions}
                      onChange={(e) => setFormData({ ...formData, totalQuestions: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Marks *</label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Passing Marks *</label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.passingMarks}
                      onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Negative Marking</label>
                    <Input
                      type="number"
                      min={0}
                      step={0.25}
                      value={formData.negativeMarking}
                      onChange={(e) => setFormData({ ...formData, negativeMarking: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Options
                </h3>

                <div className="flex gap-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPremium}
                      onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                      className="h-5 w-5 rounded border-gray-300"
                    />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-500" />
                        Premium Exam
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-5 w-5 rounded border-gray-300"
                    />
                    <div>
                      <p className="font-medium">Active</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-6 border-t">
                <Link href="/admin/exams">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
