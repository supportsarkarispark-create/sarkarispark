"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { adminAPI } from "@/lib/api"
import api from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Clock,
  BookOpen,
  Crown,
  Filter,
  ArrowLeft,
  Loader2,
  Layers,
  CalendarDays,
  FileQuestion,
  X,
} from "lucide-react"
import toast from "react-hot-toast"

export default function AdminExamsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'parents' | 'tests'>('parents')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [premiumFilter, setPremiumFilter] = useState('')

  // Read category from URL query param (when coming from categories page)
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl)
    }
  }, [searchParams])

  // Fetch categories for filter
  const { data: categoriesData } = useQuery(['exam-categories'], () => api.get('/exam-categories'))
  const categories = categoriesData?.data?.categories || []

  const { data: examsData, isLoading } = useQuery(["admin-exams"], async () => {
    const response = await api.get("/exams", { params: { limit: 200 } })
    return response
  })
  const exams = examsData?.data?.exams || []

  // Separate parent exams and tests
  const parentExams = exams.filter((exam: any) => !exam.parentExamId)
  const childTests = exams.filter((exam: any) => !!exam.parentExamId)

  const filteredExams = parentExams.filter((exam: any) => {
    const matchesSearch = exam.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || exam.category === categoryFilter
    const matchesType = !typeFilter || 
      (typeFilter === 'exam' && !exam.isPYQ) || 
      (typeFilter === 'pyq' && exam.isPYQ)
    const matchesPremium = !premiumFilter || 
      (premiumFilter === 'free' && !exam.isPremium) || 
      (premiumFilter === 'premium' && exam.isPremium)
    return matchesSearch && matchesCategory && matchesType && matchesPremium
  })

  const filteredTests = childTests.filter((exam: any) => {
    const matchesSearch = exam.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || exam.category === categoryFilter
    const matchesPremium = !premiumFilter || 
      (premiumFilter === 'free' && !exam.isPremium) || 
      (premiumFilter === 'premium' && exam.isPremium)
    return matchesSearch && matchesCategory && matchesPremium
  })

  const currentList = activeTab === 'parents' ? filteredExams : filteredTests

  const deleteMutation = useMutation(
    (id: string) => adminAPI.deleteExam(id),
    {
      onSuccess: () => {
        toast.success("Exam deleted successfully")
        queryClient.invalidateQueries(["admin-exams"])
        queryClient.invalidateQueries(["admin-stats"])
        setDeleteExamId(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete exam")
      },
    }
  )

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
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Exam Management</h1>
            <p className="text-muted-foreground">Create and manage exams</p>
          </div>
          <Link href="/admin/exams/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Exam
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exams by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>

              {/* Type Filter - only for parents tab */}
              {activeTab === 'parents' && (
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="exam">Exams Only</option>
                  <option value="pyq">PYQ Only</option>
                </select>
              )}

              {/* Premium Filter */}
              <select
                value={premiumFilter}
                onChange={(e) => setPremiumFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">All Access</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>

              {/* Clear Filters */}
              {(categoryFilter || typeFilter || premiumFilter || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setCategoryFilter('')
                    setTypeFilter('')
                    setPremiumFilter('')
                  }}
                  className="h-9 text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Filter Display */}
        {categoryFilter && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-800">
              Showing exams in category: <strong>{categoryFilter}</strong>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCategoryFilter('')}
              className="h-7 text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'parents' ? 'default' : 'outline'}
            onClick={() => setActiveTab('parents')}
            className="gap-2"
          >
            <Layers className="h-4 w-4" />
            Exam Groups ({filteredExams.length})
          </Button>
          <Button
            variant={activeTab === 'tests' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tests')}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Tests ({filteredTests.length})
          </Button>
        </div>

        {/* Exams Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'parents' ? `All Exam Groups (${filteredExams.length})` : `All Tests (${filteredTests.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : currentList.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === 'parents' ? 'No exam groups found' : 'No tests found'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Exam</th>
                      <th className="text-left p-4 font-medium">Category</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Tests</th>
                      <th className="text-left p-4 font-medium">Premium</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentList.map((exam: any) => {
                      const testCount = activeTab === 'parents' 
                        ? childTests.filter((t: any) => t.parentExamId === exam.id).length 
                        : null
                      return (
                        <tr key={exam.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{exam.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {exam.description}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary">{exam.category}</Badge>
                          </td>
                          <td className="p-4">
                            {activeTab === 'parents' ? (
                              exam.isPYQ ? (
                                <Badge className="bg-amber-100 text-amber-800 gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  PYQ
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 gap-1">
                                  <Layers className="h-3 w-3" />
                                  Exam
                                </Badge>
                              )
                            ) : (
                              <Badge className="bg-green-100 text-green-800 gap-1">
                                <BookOpen className="h-3 w-3" />
                                Test #{exam.testNumber || 1}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            {activeTab === 'parents' ? (
                              <Badge variant="outline">{testCount} tests</Badge>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {exam.duration}m
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileQuestion className="h-3 w-3" />
                                  {exam.totalQuestions} Qs
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {exam.isPremium ? (
                              <Badge className="bg-amber-100 text-amber-800">
                                <Crown className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            ) : (
                              <Badge variant="outline">Free</Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Link href={`/admin/exams/${exam.id}/questions`}>
                                <Button variant="ghost" size="sm" title="Manage Questions">
                                  <BookOpen className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/admin/exams/${exam.id}/edit`}>
                                <Button variant="ghost" size="sm" title="Edit Exam">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteExamId(exam.id)}
                                title="Delete Exam"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deleteExamId} onOpenChange={() => setDeleteExamId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam</DialogTitle>
            <DialogDescription>
              Are you sure? This will permanently delete the exam and all its questions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteExamId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteExamId && deleteMutation.mutate(deleteExamId)}
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
