"use client"

import { useState } from "react"
import { useMutation, useQuery } from "react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { adminAPI, examCategoryAPI, examsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Switch } from "@/components/ui/Switch"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  ArrowLeft,
  Plus,
  Loader2,
  Clock,
  BookOpen,
  GraduationCap,
  CheckCircle,
  Crown,
  Layers,
  CalendarDays,
  Info,
} from "lucide-react"
import toast from "react-hot-toast"

const DIFFICULTIES = ["Easy", "Medium", "Hard"]

export default function CreateExamPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isParentExam, setIsParentExam] = useState(true)

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

  // Fetch categories dynamically
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    "exam-categories",
    examCategoryAPI.getCategories
  )
  const categories = categoriesData?.data?.categories || []

  // Fetch parent exams filtered by selected category
  const { data: parentExamsData } = useQuery(
    ["parent-exams", formData.category],
    () => examsAPI.getExams({ isParent: 'true', category: formData.category, limit: 100 }),
    { enabled: !isParentExam && !!formData.category }
  )
  const parentExams = parentExamsData?.data?.exams || []

  const createMutation = useMutation(
    (data: any) => adminAPI.createExam(data),
    {
      onSuccess: () => {
        toast.success("Exam created successfully!")
        router.push("/admin/exams")
      },
      onError: (error: any) => {
        console.error("Create exam error:", error)
        console.error("Error response:", error.response?.data)
        toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to create exam")
        setIsSubmitting(false)
      },
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Prepare data - set parentExamId to null for parent exams
    const submitData = {
      ...formData,
      parentExamId: isParentExam ? null : formData.parentExamId
    }
    
    createMutation.mutate(submitData)
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/exams">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Exams
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Exam</CardTitle>
            <CardDescription className="space-y-2">
              <p>Fill in the details to create exams and tests.</p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="font-medium text-blue-800 mb-1">📋 How to add content:</p>
                <ul className="list-disc list-inside text-blue-700 space-y-0.5">
                  <li><strong>Exam Group / PYQ:</strong> Creates a folder (e.g., &quot;SSC CGL&quot; or &quot;SSC CGL 2023 PYQ&quot;)</li>
                  <li><strong>Test:</strong> Creates an actual test inside a folder (e.g., &quot;Mock Test 1&quot;)</li>
                  <li><strong>Step 1:</strong> First create Exam Groups / PYQs</li>
                  <li><strong>Step 2:</strong> Then select &quot;Test&quot; and choose the parent exam to add tests under it</li>
                </ul>
              </div>
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

                {/* Exam Type Toggle */}
                <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="examType"
                      checked={isParentExam}
                      onChange={() => {
                        setIsParentExam(true)
                        setFormData({ ...formData, parentExamId: "" })
                      }}
                      className="h-4 w-4"
                    />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Layers className="h-4 w-4 text-blue-500" />
                        Exam Group / PYQ
                      </p>
                      <p className="text-xs text-muted-foreground">Creates a parent exam that contains multiple tests</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="examType"
                      checked={!isParentExam}
                      onChange={() => setIsParentExam(false)}
                      className="h-4 w-4"
                    />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-500" />
                        Test (under existing exam)
                      </p>
                      <p className="text-xs text-muted-foreground">Creates a test under an existing exam group</p>
                    </div>
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Exam Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={isParentExam ? "e.g., SSC CGL" : "e.g., SSC CGL Mock Test 1"}
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
                      onChange={(e) => {
                        setFormData({ ...formData, category: e.target.value, parentExamId: "" })
                      }}
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
                    {!isParentExam && formData.category && parentExams.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        ℹ️ No exam groups found in this category. Please create an Exam Group or PYQ first.
                      </p>
                    )}
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

                  {/* Parent Exam selector (only for tests) */}
                  {!isParentExam && (
                    <>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Parent Exam / PYQ *</label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Select which exam group this test belongs to
                        </p>
                        <select
                          value={formData.parentExamId}
                          onChange={(e) => {
                            setFormData({ 
                              ...formData, 
                              parentExamId: e.target.value
                            })
                          }}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required={!isParentExam}
                        >
                          <option value="">-- Select Parent Exam --</option>
                          {parentExams.length === 0 && (
                            <option value="" disabled>No parent exams found in this category.</option>
                          )}
                          {parentExams.map((exam: any) => (
                            <option key={exam.id} value={exam.id}>
                              {exam.title} {exam.isPYQ ? "[PYQ]" : "[Exam]"}
                            </option>
                          ))}
                        </select>
                        {parentExams.length === 0 && (
                          <p className="text-xs text-red-500 mt-1">
                            ⚠️ No exam groups found. Please create an Exam Group or PYQ first before adding tests.
                          </p>
                        )}
                      </div>

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
                    </>
                  )}

                  {/* isPYQ toggle (only for parent exams) */}
                  {isParentExam && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Switch
                          checked={formData.isPYQ}
                          onCheckedChange={(checked) => setFormData({ ...formData, isPYQ: checked })}
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
                </div>
              </div>

              {/* Exam Settings - Only for Tests */}
              {!isParentExam && (
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
                      <p className="text-xs text-muted-foreground">Marks deducted per wrong answer</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Options
                </h3>

                <div className="flex gap-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Switch
                      checked={formData.isPremium}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
                    />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-500" />
                        Premium Exam
                      </p>
                      <p className="text-sm text-muted-foreground">Only premium users can access</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <div>
                      <p className="font-medium">Active</p>
                      <p className="text-sm text-muted-foreground">Exam is visible to users</p>
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Exam
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
