"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { settingsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  ArrowLeft,
  Save,
  Loader2,
  Award,
  ImageIcon,
  Plus,
  Trash2,
  GripVertical,
  Flame,
} from "lucide-react"
import toast from "react-hot-toast"

export default function PopularExamsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: settingsData, isLoading } = useQuery(
    ["settings"],
    () => settingsAPI.getSettings()
  )

  const settings = settingsData?.data?.settings

  // Popular Exams State
  const [popularExams, setPopularExams] = useState([] as {
    title: string;
    subtitle: string;
    image: string;
    logo: string;
    isPopular: boolean;
    mockTestCount: string;
    attempts: string;
    questionsCount: string;
    maxMarks: string;
    timeMinutes: string;
    link: string;
    color: string;
    order: number;
  }[])

  // Initialize form when data loads
  useState(() => {
    if (settings) {
      if (settings.popularExams) {
        setPopularExams(settings.popularExams)
      }
    }
  })

  const updateMutation = useMutation(
    (data: any) => settingsAPI.updateSettings(data),
    {
      onSuccess: () => {
        toast.success("Popular exams updated successfully")
        queryClient.invalidateQueries(["settings"])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update")
      },
    }
  )

  const handleSave = () => {
    updateMutation.mutate({
      popularExams,
    })
  }

  // Popular Exams Helpers
  const addPopularExam = () => {
    setPopularExams(prev => [...prev, {
      title: "",
      subtitle: "",
      image: "",
      logo: "",
      isPopular: true,
      mockTestCount: "0",
      attempts: "0",
      questionsCount: "0",
      maxMarks: "0",
      timeMinutes: "0",
      link: "",
      color: "from-purple-500 to-blue-500",
      order: prev.length
    }])
  }

  const updatePopularExam = (index: number, field: string, value: any) => {
    setPopularExams(prev => prev.map((exam, i) => i === index ? { ...exam, [field]: value } : exam))
  }

  const removePopularExam = (index: number) => {
    setPopularExams(prev => prev.filter((_, i) => i !== index))
  }

  const handlePopularExamImageUpload = async (index: number, field: string, file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })
      const data = await response.json()
      if (data.success) {
        updatePopularExam(index, field, data.imageUrl)
        toast.success("Image uploaded successfully")
      } else {
        toast.error("Failed to upload image")
      }
    } catch (error) {
      toast.error("Error uploading image")
    }
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Award className="h-8 w-8 text-orange-500" />
              Popular Exams Carousel
            </h1>
            <p className="text-muted-foreground">
              Manage exams displayed in the home page carousel (auto-scrolls every 4 seconds)
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isLoading}
            className="gap-2"
          >
            {updateMutation.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Popular Exams List */}
            <Card className="border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Award className="h-5 w-5" />
                    Exam Cards
                  </CardTitle>
                  <CardDescription>Add, edit, or remove popular exam cards</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addPopularExam}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Exam
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {popularExams.map((exam, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">Exam #{index + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={exam.isPopular}
                            onChange={(e) => updatePopularExam(index, "isPopular", e.target.checked)}
                            className="rounded"
                          />
                          <Flame className="h-4 w-4 text-orange-500" />
                          Popular Badge
                        </label>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removePopularExam(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Exam Title</label>
                        <Input
                          value={exam.title}
                          onChange={(e) => updatePopularExam(index, "title", e.target.value)}
                          placeholder="e.g., UP Police Constable"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subtitle</label>
                        <Input
                          value={exam.subtitle}
                          onChange={(e) => updatePopularExam(index, "subtitle", e.target.value)}
                          placeholder="e.g., Mock Test - 18"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Mock Tests</label>
                        <Input
                          value={exam.mockTestCount}
                          onChange={(e) => updatePopularExam(index, "mockTestCount", e.target.value)}
                          placeholder="e.g., 18"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Attempts</label>
                        <Input
                          value={exam.attempts}
                          onChange={(e) => updatePopularExam(index, "attempts", e.target.value)}
                          placeholder="e.g., 1.5k"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Questions</label>
                        <Input
                          value={exam.questionsCount}
                          onChange={(e) => updatePopularExam(index, "questionsCount", e.target.value)}
                          placeholder="e.g., 150"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Max Marks</label>
                        <Input
                          value={exam.maxMarks}
                          onChange={(e) => updatePopularExam(index, "maxMarks", e.target.value)}
                          placeholder="e.g., 300"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Time (minutes)</label>
                        <Input
                          value={exam.timeMinutes}
                          onChange={(e) => updatePopularExam(index, "timeMinutes", e.target.value)}
                          placeholder="e.g., 120"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Link URL</label>
                        <Input
                          value={exam.link}
                          onChange={(e) => updatePopularExam(index, "link", e.target.value)}
                          placeholder="e.g., /exams/up-police-constable"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Color Gradient</label>
                        <Input
                          value={exam.color}
                          onChange={(e) => updatePopularExam(index, "color", e.target.value)}
                          placeholder="e.g., from-red-500 to-orange-500"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Logo Image</label>
                        <div className="flex gap-2">
                          <Input
                            value={exam.logo}
                            onChange={(e) => updatePopularExam(index, "logo", e.target.value)}
                            placeholder="Logo URL or path"
                            className="flex-1"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePopularExamImageUpload(index, "logo", e.target.files[0])
                              }
                            }}
                            className="hidden"
                            id={`exam-logo-${index}`}
                          />
                          <label htmlFor={`exam-logo-${index}`}>
                            <Button type="button" variant="ghost" size="sm" className="cursor-pointer" asChild>
                              <span><ImageIcon className="h-4 w-4" /></span>
                            </Button>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Background Image</label>
                        <div className="flex gap-2">
                          <Input
                            value={exam.image}
                            onChange={(e) => updatePopularExam(index, "image", e.target.value)}
                            placeholder="Background image URL"
                            className="flex-1"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePopularExamImageUpload(index, "image", e.target.files[0])
                              }
                            }}
                            className="hidden"
                            id={`exam-image-${index}`}
                          />
                          <label htmlFor={`exam-image-${index}`}>
                            <Button type="button" variant="ghost" size="sm" className="cursor-pointer" asChild>
                              <span><ImageIcon className="h-4 w-4" /></span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {popularExams.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No popular exams added yet. Click &quot;Add Exam&quot; to create one.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
