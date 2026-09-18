"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { feedbackAPI, mediaAPI } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import {
  Star,
  MessageCircle,
  Send,
  Loader2,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  LogIn,
  Upload,
  X,
} from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"

export default function FeedbackPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    studentName: user?.name || "",
    exam: "",
    score: 0,
    testimonial: "",
    avatar: "",
  })

  // Fetch approved feedback
  const { data: feedbackData, isLoading } = useQuery(
    "approved-feedback",
    feedbackAPI.getApproved
  )

  const feedback = feedbackData?.data?.feedback || []
  const featuredFeedback = feedback.filter((fb: any) => fb.isFeatured)
  const regularFeedback = feedback.filter((fb: any) => !fb.isFeatured)

  // Create feedback mutation
  const createMutation = useMutation(
    (data: any) => feedbackAPI.create(data),
    {
      onSuccess: () => {
        toast.success("Feedback submitted successfully! It will be visible after approval.")
        setShowForm(false)
        setFormData({
          studentName: user?.name || "",
          exam: "",
          score: 0,
          testimonial: "",
          avatar: "",
        })
        setAvatarFile(null)
        setAvatarPreview("")
        setIsSubmitting(false)
      },
      onError: (error: any) => {
        console.error("Feedback submission error:", error)
        console.error("Error response:", error?.response?.data)
        toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to submit feedback")
        setIsSubmitting(false)
      },
    }
  )

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 50KB)
      if (file.size > 50 * 1024) {
        toast.error("Image size must be under 50KB")
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview("")
    setFormData({ ...formData, avatar: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate score is selected
    if (formData.score === 0) {
      toast.error("Please select a rating (1-5 stars)")
      return
    }

    setIsSubmitting(true)

    // Upload avatar if selected
    if (avatarFile) {
      setIsUploading(true)
      try {
        const formDataUpload = new FormData()
        formDataUpload.append("file", avatarFile)
        formDataUpload.append("folder", "feedback-avatars")

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/media/upload-feedback-photo`, {
          method: 'POST',
          body: formDataUpload,
        })
        const uploadData = await uploadResponse.json()
        
        if (!uploadData.success) {
          throw new Error(uploadData.error || 'Failed to upload photo')
        }

        const avatarUrl = uploadData.url

        if (avatarUrl) {
          setFormData({ ...formData, avatar: avatarUrl })
          createMutation.mutate({ ...formData, avatar: avatarUrl })
        } else {
          throw new Error("Failed to get image URL")
        }
      } catch (error) {
        console.error("Avatar upload error:", error)
        toast.error("Failed to upload avatar. Submitting without avatar.")
        createMutation.mutate(formData)
      } finally {
        setIsUploading(false)
      }
    } else {
      createMutation.mutate(formData)
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

  const renderFeedbackCard = (fb: any, isFeatured: boolean = false) => (
    <Card
      key={fb.id}
      className={`${
        isFeatured
          ? "border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-white"
          : "border border-gray-200"
      } hover:shadow-lg transition-all duration-300`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {fb.studentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg">{fb.studentName}</CardTitle>
              <CardDescription className="text-sm">{fb.exam}</CardDescription>
            </div>
          </div>
          {isFeatured && (
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">{renderStars(fb.score)}</div>
        <p className="text-gray-700 leading-relaxed">&quot;{fb.testimonial}&quot;</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <MessageCircle className="h-10 w-10 text-primary" />
            Student Success Stories
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Read what our students have to say about their experience with Sarkari Spark
          </p>
        </div>

        {/* Featured Feedback */}
        {featuredFeedback.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-amber-500" />
              Featured Success Stories
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredFeedback.map((fb: any) => renderFeedbackCard(fb, true))}
            </div>
          </div>
        )}

        {/* Regular Feedback */}
        {regularFeedback.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              All Testimonials
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularFeedback.map((fb: any) => renderFeedbackCard(fb, false))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No testimonials yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to share your success story!
            </p>
          </div>
        ) : null}

        {/* Submit Feedback Section */}
        <div className="max-w-2xl mx-auto">
          {!user ? (
            <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Login to Submit Feedback</h3>
                  <p className="text-muted-foreground mb-4">
                    You need to be logged in to share your success story
                  </p>
                  <Link href="/login">
                    <Button className="gap-2">
                      <LogIn className="h-4 w-4" />
                      Login to Continue
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : !showForm ? (
            <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Share Your Success Story</h3>
                  <p className="text-muted-foreground mb-4">
                    Help others by sharing your experience with Sarkari Spark
                  </p>
                  <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Send className="h-4 w-4" />
                    Submit Your Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Submit Your Feedback
                </CardTitle>
                <CardDescription>
                  Share your experience to help other students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Name</label>
                    <Input
                      value={formData.studentName}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Using your account name</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Exam/Category *</label>
                    <Input
                      value={formData.exam}
                      onChange={(e) =>
                        setFormData({ ...formData, exam: e.target.value })
                      }
                      placeholder="e.g., SSC CGL, Banking, Railway"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Photo (Optional)</label>
                    <div className="flex items-center gap-4">
                      {avatarPreview ? (
                        <div className="relative">
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="h-20 w-20 rounded-full object-cover border-2 border-primary"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-muted border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent cursor-pointer"
                        >
                          <Upload className="h-4 w-4" />
                          {avatarFile ? avatarFile.name : "Choose Photo"}
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload your photo (optional)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Score (1-5) *</label>
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
                    {formData.score === 0 && (
                      <p className="text-xs text-red-500">Please select a rating</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Testimonial *</label>
                    <textarea
                      value={formData.testimonial}
                      onChange={(e) =>
                        setFormData({ ...formData, testimonial: e.target.value })
                      }
                      placeholder="Share your experience, tips, or success story..."
                      className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    <CheckCircle className="h-3 w-3 inline mr-1" />
                    Your feedback will be reviewed and published after approval
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
