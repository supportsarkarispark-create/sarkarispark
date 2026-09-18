"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { feedbackAPI } from "@/lib/api"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Switch } from "@/components/ui/Switch"
import {
  ArrowLeft,
  Plus,
  Loader2,
  MessageCircle,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Send,
} from "lucide-react"
import toast from "react-hot-toast"

export default function AdminFeedbackPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [editingFeedback, setEditingFeedback] = useState<any>(null)
  const [formData, setFormData] = useState({
    studentName: "",
    exam: "",
    score: 0,
    testimonial: "",
    avatar: "",
    isApproved: false,
    isFeatured: false,
  })

  // Fetch all feedback
  const { data: feedbackData, isLoading, refetch } = useQuery(
    "admin-feedback",
    feedbackAPI.getAll
  )

  const feedback = feedbackData?.data?.feedback || []

  // Create mutation
  const createMutation = useMutation(
    (data: any) => feedbackAPI.create(data),
    {
      onSuccess: () => {
        toast.success("Feedback created successfully!")
        queryClient.invalidateQueries("admin-feedback")
        setIsCreating(false)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create feedback")
      },
    }
  )

  // Update mutation
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => feedbackAPI.update(id, data),
    {
      onSuccess: () => {
        toast.success("Feedback updated successfully!")
        queryClient.invalidateQueries("admin-feedback")
        setEditingFeedback(null)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update feedback")
      },
    }
  )

  // Delete mutation
  const deleteMutation = useMutation(
    (id: string) => feedbackAPI.delete(id),
    {
      onSuccess: () => {
        toast.success("Feedback deleted successfully!")
        queryClient.invalidateQueries("admin-feedback")
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete feedback")
      },
    }
  )

  // Toggle approval mutation
  const toggleApprovalMutation = useMutation(
    (id: string) => feedbackAPI.toggleApproval(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("admin-feedback")
        toast.success("Approval status updated!")
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update approval")
      },
    }
  )

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation(
    (id: string) => feedbackAPI.toggleFeatured(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("admin-feedback")
        toast.success("Featured status updated!")
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update featured")
      },
    }
  )

  const resetForm = () => {
    setFormData({
      studentName: "",
      exam: "",
      score: 0,
      testimonial: "",
      avatar: "",
      isApproved: false,
      isFeatured: false,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingFeedback) {
      updateMutation.mutate({ id: editingFeedback.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (fb: any) => {
    setEditingFeedback(fb)
    setFormData({
      studentName: fb.studentName,
      exam: fb.exam,
      score: fb.score,
      testimonial: fb.testimonial,
      avatar: fb.avatar || "",
      isApproved: fb.isApproved,
      isFeatured: fb.isFeatured,
    })
    setIsCreating(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this feedback?")) {
      deleteMutation.mutate(id)
    }
  }

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= score ? "fill-amber-400 text-amber-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
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
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Feedback</h1>
            <p className="text-muted-foreground">
              Manage student testimonials and success stories
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Feedback
          </Button>
        </div>

        {/* Create/Edit Form */}
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingFeedback ? "Edit Feedback" : "Add New Feedback"}
              </CardTitle>
              <CardDescription>
                {editingFeedback
                  ? "Update feedback details"
                  : "Add a new student testimonial"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Student Name *</label>
                    <Input
                      value={formData.studentName}
                      onChange={(e) =>
                        setFormData({ ...formData, studentName: e.target.value })
                      }
                      placeholder="Enter student name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Exam/Category *</label>
                    <Input
                      value={formData.exam}
                      onChange={(e) =>
                        setFormData({ ...formData, exam: e.target.value })
                      }
                      placeholder="e.g., SSC CGL, Banking"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Score (1-5) *</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setFormData({ ...formData, score })}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            formData.score >= score
                              ? "border-amber-400 bg-amber-50"
                              : "border-gray-200 hover:border-amber-300"
                          }`}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              formData.score >= score
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Testimonial *</label>
                    <textarea
                      value={formData.testimonial}
                      onChange={(e) =>
                        setFormData({ ...formData, testimonial: e.target.value })
                      }
                      placeholder="Student's testimonial..."
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.isApproved}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isApproved: checked })
                        }
                      />
                      <span className="text-sm">
                        {formData.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Featured</label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isFeatured: checked })
                        }
                      />
                      <span className="text-sm">
                        {formData.isFeatured ? "Featured" : "Regular"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false)
                      setEditingFeedback(null)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                    className="flex-1 gap-2"
                  >
                    {createMutation.isLoading || updateMutation.isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingFeedback ? (
                      <>
                        <Edit className="h-4 w-4" />
                        Update Feedback
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Feedback List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No feedback found</h3>
            <p className="text-muted-foreground mb-4">
              Add student testimonials to get started
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Feedback
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedback.map((fb: any) => (
              <Card
                key={fb.id}
                className={`${
                  fb.isFeatured
                    ? "border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-white"
                    : fb.isApproved
                    ? "border border-gray-200"
                    : "border border-gray-200 opacity-60"
                } hover:shadow-lg transition-all duration-300`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {fb.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base">{fb.studentName}</CardTitle>
                        <CardDescription className="text-xs">{fb.exam}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {fb.isFeatured && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {fb.isApproved ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">{renderStars(fb.score)}</div>
                  <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                    &quot;{fb.testimonial}&quot;
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(fb)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleApprovalMutation.mutate(fb.id)}
                      className="flex-1"
                    >
                      {fb.isApproved ? (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Unapprove
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFeaturedMutation.mutate(fb.id)}
                      className="flex-1"
                    >
                      {fb.isFeatured ? (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Unfeature
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Feature
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(fb.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
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
