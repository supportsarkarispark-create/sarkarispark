"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Card, CardContent } from "@/components/ui/Card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/Dialog"
import { Switch } from "@/components/ui/Switch"
import { sliderAPI, getImageUrl as getApiImageUrl } from "@/lib/api"
import { toast } from "react-hot-toast"
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  Upload,
  Video,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from "lucide-react"

interface SliderForm {
  _id?: string
  image: string
  video: string
  videoDuration: number
  title: string
  subtitle: string
  redirectUrl: string
  isActive: boolean
  order: number
  imageFile?: File | null
  videoFile?: File | null
}

const EMPTY_FORM: SliderForm = {
  image: "",
  video: "",
  videoDuration: 0,
  title: "",
  subtitle: "",
  redirectUrl: "",
  isActive: true,
  order: 0,
  imageFile: null,
  videoFile: null,
}

export default function SliderAdminPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const { user, isLoading: authLoading } = useAuth()
  const isAdmin = user?.role === "admin" || user?.role === "superadmin"

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState<SliderForm | null>(null)
  const [formData, setFormData] = useState<SliderForm>(EMPTY_FORM)

  // Media input mode: "url" (default, great for ImgBB/Cloudinary) or "upload"
  const [imageMode, setImageMode] = useState<"url" | "upload">("url")
  const [videoMode, setVideoMode] = useState<"url" | "upload">("url")
  const [showVideoOptions, setShowVideoOptions] = useState(false)
  const [isResolvingUrl, setIsResolvingUrl] = useState(false)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin/slider")
    }
  }, [user, isAdmin, authLoading, router])

  // Helper to resolve ImgBB webpage link (ibb.co/xyz) to direct image link (i.ibb.co/...png)
  const resolveImgBbUrl = async (url: string): Promise<string> => {
    const trimmed = url.trim()
    if (trimmed.includes("ibb.co/") && !trimmed.includes("i.ibb.co/")) {
      try {
        const cleanUrl = trimmed.split("?")[0].replace(/\/$/, "")
        const res = await fetch(`${cleanUrl}/oembed.json`)
        if (res.ok) {
          const data = await res.json()
          if (data.url) return data.url
        }
      } catch (err) {
        console.warn("Error resolving ImgBB oembed:", err)
      }
    }
    return trimmed
  }

  // Fetch sliders
  const { data: slidersData, isLoading } = useQuery(
    ["admin-sliders"],
    () => sliderAPI.getAllSlidersAdmin(),
    {
      enabled: !!user && isAdmin,
    }
  )

  const sliders = slidersData?.data?.sliders || []
  const activeSliders = sliders.filter((s: SliderForm) => s.isActive).sort((a: SliderForm, b: SliderForm) => (a.order || 0) - (b.order || 0))

  // Mutations
  const createMutation = useMutation(
    (formDataToSend: FormData) => sliderAPI.createSlider(formDataToSend),
    {
      onSuccess: () => {
        toast.success("Slide banner added successfully!")
        queryClient.invalidateQueries(["admin-sliders"])
        queryClient.invalidateQueries(["sliders"])
        setIsAddDialogOpen(false)
        resetForm()
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || "Failed to add slide"
        toast.error(message)
        console.error("Create slide error:", error)
      },
    }
  )

  const updateMutation = useMutation(
    ({ id, formDataToSend }: { id: string; formDataToSend: FormData }) =>
      sliderAPI.updateSlider(id, formDataToSend),
    {
      onSuccess: () => {
        toast.success("Slide banner updated successfully!")
        queryClient.invalidateQueries(["admin-sliders"])
        queryClient.invalidateQueries(["sliders"])
        setIsEditDialogOpen(false)
        setSelectedSlide(null)
        resetForm()
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || "Failed to update slide"
        toast.error(message)
      },
    }
  )

  const deleteMutation = useMutation(
    (id: string) => sliderAPI.deleteSlider(id),
    {
      onSuccess: () => {
        toast.success("Slide deleted successfully!")
        queryClient.invalidateQueries(["admin-sliders"])
        queryClient.invalidateQueries(["sliders"])
        setIsDeleteDialogOpen(false)
        setSelectedSlide(null)
      },
      onError: () => {
        toast.error("Failed to delete slide")
      },
    }
  )

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setImagePreview(null)
    setVideoPreview(null)
    setImageMode("url")
    setVideoMode("url")
    setShowVideoOptions(false)
    setIsResolvingUrl(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (videoInputRef.current) videoInputRef.current.value = ""
  }

  const handleAddClick = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const handleEditClick = (slide: SliderForm) => {
    setSelectedSlide(slide)
    setFormData({
      ...slide,
      imageFile: null,
      videoFile: null,
    })
    setImagePreview(slide.image ? getApiImageUrl(slide.image) : null)
    setVideoPreview(slide.video ? getApiImageUrl(slide.video) : null)
    setImageMode(slide.image?.startsWith("http") ? "url" : "upload")
    setVideoMode(slide.video?.startsWith("http") ? "url" : "upload")
    setShowVideoOptions(Boolean(slide.video))
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (slide: SliderForm) => {
    setSelectedSlide(slide)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedSlide?._id) {
      deleteMutation.mutate(selectedSlide._id)
    }
  }

  // Handle URL changes with automatic ImgBB conversion
  const handleImageUrlChange = async (url: string) => {
    const trimmed = url.trim()
    setFormData((prev) => ({ ...prev, image: trimmed, imageFile: null }))

    if (trimmed.includes("ibb.co/") && !trimmed.includes("i.ibb.co/")) {
      setIsResolvingUrl(true)
      try {
        const directUrl = await resolveImgBbUrl(trimmed)
        if (directUrl && directUrl !== trimmed) {
          setFormData((prev) => ({ ...prev, image: directUrl }))
          setImagePreview(directUrl)
          toast.success("ImgBB link converted to direct image!")
          return
        }
      } catch (e) {
        console.error("Auto resolve error:", e)
      } finally {
        setIsResolvingUrl(false)
      }
    }

    setImagePreview(trimmed ? getApiImageUrl(trimmed) : null)
  }

  const handleVideoUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, video: url.trim(), videoFile: null }))
    setVideoPreview(url.trim() ? getApiImageUrl(url.trim()) : null)
  }

  // Handle local file uploads
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file, image: "" }))
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, videoFile: file, video: "" }))
      const previewUrl = URL.createObjectURL(file)
      setVideoPreview(previewUrl)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: "", imageFile: null }))
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleRemoveVideo = () => {
    setFormData((prev) => ({ ...prev, video: "", videoFile: null }))
    setVideoPreview(null)
    if (videoInputRef.current) videoInputRef.current.value = ""
  }

  const prepareFormData = (imageOverride?: string): FormData => {
    const formDataToSend = new FormData()
    formDataToSend.append("title", formData.title || "")
    formDataToSend.append("subtitle", formData.subtitle || "")
    formDataToSend.append("redirectUrl", formData.redirectUrl || "")
    formDataToSend.append("videoDuration", "0")
    formDataToSend.append("isActive", String(formData.isActive))
    formDataToSend.append("order", String(formData.order || 0))

    const finalImage = imageOverride || formData.image

    // Handle Image: Send file if uploaded, otherwise send URL
    if (formData.imageFile) {
      formDataToSend.append("image", formData.imageFile)
    } else if (finalImage) {
      formDataToSend.append("imageUrl", finalImage)
      formDataToSend.append("image", finalImage)
    }

    // Handle Video: Send file if uploaded, otherwise send URL
    if (formData.videoFile) {
      formDataToSend.append("video", formData.videoFile)
    } else if (formData.video) {
      formDataToSend.append("videoUrl", formData.video)
      formDataToSend.append("video", formData.video)
    }

    return formDataToSend
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.image && !formData.imageFile) {
      toast.error("Please paste an Image URL or upload an image file")
      return
    }

    let finalImageUrl = formData.image
    if (finalImageUrl && finalImageUrl.includes("ibb.co/") && !finalImageUrl.includes("i.ibb.co/")) {
      setIsResolvingUrl(true)
      finalImageUrl = await resolveImgBbUrl(finalImageUrl)
      setIsResolvingUrl(false)
      setFormData((prev) => ({ ...prev, image: finalImageUrl }))
    }

    const formDataToSend = prepareFormData(finalImageUrl)

    if (isEditDialogOpen && selectedSlide) {
      updateMutation.mutate({ id: selectedSlide._id!, formDataToSend })
    } else {
      createMutation.mutate(formDataToSend)
    }
  }

  const nextPreview = () => {
    if (activeSliders.length > 0) {
      setPreviewIndex((prev) => (prev + 1) % activeSliders.length)
    }
  }

  const prevPreview = () => {
    if (activeSliders.length > 0) {
      setPreviewIndex((prev) => (prev - 1 + activeSliders.length) % activeSliders.length)
    }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 hidden sm:block" />
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Hero Slider Management</h1>
        </div>

        <Button onClick={handleAddClick} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" />
          Add New Slide
        </Button>
      </div>

      {/* Main Grid: Left List, Right Live Preview */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: All Slides List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Configured Slides</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {sliders.length}
              </span>
            </h2>
            <span className="text-xs text-muted-foreground">Active on homepage: {activeSliders.length}</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading slides...</p>
            </div>
          ) : sliders.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-2">
              <CardContent className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">No slider banners yet</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Homepage currently displays the branded Sarkari Spark watermark. Add your first banner using an ImgBB link or image file.
                  </p>
                </div>
                <Button onClick={handleAddClick} size="sm" className="gap-1.5 mt-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Banner
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sliders.map((slide: SliderForm) => {
                const imageUrl = slide.image ? getApiImageUrl(slide.image) : ""
                const videoUrl = slide.video ? getApiImageUrl(slide.video) : ""

                return (
                  <Card
                    key={slide._id}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      !slide.isActive ? "opacity-60 bg-slate-50 dark:bg-slate-900/40" : "hover:border-indigo-300 dark:hover:border-indigo-800 shadow-sm"
                    }`}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Thumbnail View */}
                        <div className="w-24 sm:w-32 h-16 sm:h-20 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 relative border border-slate-200 dark:border-slate-800">
                          {videoUrl ? (
                            <video src={videoUrl} muted className="w-full h-full object-cover" />
                          ) : imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={slide.title || "Slide banner"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-banner.png"
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                              No Media
                            </div>
                          )}
                          {videoUrl && (
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-[9px] text-white rounded font-medium flex items-center gap-0.5">
                              <Video className="h-2.5 w-2.5" /> Video
                            </span>
                          )}
                        </div>

                        {/* Slide Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                {slide.title || "Banner (No Title Text)"}
                              </h3>
                              {slide.subtitle && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {slide.subtitle}
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:text-indigo-600 dark:text-slate-400"
                                onClick={() => handleEditClick(slide)}
                                title="Edit slide"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => handleDeleteClick(slide)}
                                title="Delete slide"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                              Order: #{slide.order || 0}
                            </span>

                            {slide.isActive ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-medium">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-medium">
                                Hidden
                              </span>
                            )}

                            {slide.redirectUrl && (
                              <span className="inline-flex items-center gap-1 text-muted-foreground truncate max-w-[150px]">
                                <ExternalLink className="h-3 w-3" />
                                {slide.redirectUrl}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Homepage Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Live Homepage Preview</h2>
            <span className="text-xs text-muted-foreground">Interactive</span>
          </div>

          <Card className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 p-2 sm:p-3 shadow-xl">
            {activeSliders.length > 0 ? (
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-slate-900 flex items-center justify-center">
                {/* Active Slide Media */}
                {activeSliders[previewIndex]?.video ? (
                  <video
                    src={getApiImageUrl(activeSliders[previewIndex].video)}
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={getApiImageUrl(activeSliders[previewIndex]?.image)}
                    alt={activeSliders[previewIndex]?.title || "Slider Preview"}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Overlay Text if Present */}
                {(activeSliders[previewIndex]?.title || activeSliders[previewIndex]?.subtitle) && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    {activeSliders[previewIndex]?.title && (
                      <h4 className="text-white text-xs sm:text-sm font-bold line-clamp-1">
                        {activeSliders[previewIndex].title}
                      </h4>
                    )}
                    {activeSliders[previewIndex]?.subtitle && (
                      <p className="text-white/80 text-[10px] sm:text-xs line-clamp-1 mt-0.5">
                        {activeSliders[previewIndex].subtitle}
                      </p>
                    )}
                  </div>
                )}

                {/* Controls */}
                {activeSliders.length > 1 && (
                  <>
                    <button
                      onClick={prevPreview}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextPreview}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm"
                      aria-label="Next"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {activeSliders.map((_: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setPreviewIndex(idx)}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === previewIndex ? "w-4 bg-amber-400" : "w-1.5 bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Watermark State Preview */
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center mb-2">
                  <GraduationCap className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-wider text-white/80">SARKARI</span>
                  <span className="text-base font-black tracking-wider text-amber-400">SPARK</span>
                </div>
                <p className="text-[10px] tracking-widest text-slate-400 uppercase mt-0.5">Govt Exam Mock Test Portal</p>
                <span className="mt-3 text-[11px] text-amber-400/80 font-medium">No active slides (Watermark Active)</span>
              </div>
            )}

            <div className="p-3 text-center border-t border-slate-800 mt-2">
              <p className="text-xs text-slate-400">
                This reflects the live banner box on <span className="text-indigo-400">sarkarispark.com</span>
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Add / Edit Slide Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              {isEditDialogOpen ? "Edit Slide Banner" : "Add Slide Banner"}
            </DialogTitle>
            <DialogDescription>
              Add an image or video banner to the homepage hero slider. Supports direct links (ImgBB, Cloudinary, etc.) and file uploads.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* 1. Image Media Section */}
            <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-sm flex items-center gap-1.5">
                  <span>Banner Image</span>
                  <span className="text-red-500">*</span>
                </Label>

                {/* Mode Selector Toggle */}
                <div className="inline-flex rounded-lg p-0.5 bg-slate-200 dark:bg-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setImageMode("url")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      imageMode === "url"
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <LinkIcon className="h-3 w-3 inline mr-1" />
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      imageMode === "upload"
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <Upload className="h-3 w-3 inline mr-1" />
                    Upload File
                  </button>
                </div>
              </div>

              {/* Mode 1: URL Input (Recommended for ImgBB) */}
              {imageMode === "url" ? (
                <div className="space-y-1.5">
                  <Input
                    value={formData.image}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="e.g. https://i.ibb.co/.../banner.png"
                    className="font-mono text-xs sm:text-sm bg-white dark:bg-slate-950"
                  />
                  {formData.image && formData.image.includes("ibb.co/") && !formData.image.includes("i.ibb.co/") && (
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs space-y-1">
                      <p className="font-semibold">⚠️ Yeh ImgBB ka Webpage Link hai, Direct Image Link nahi:</p>
                      <p>ImgBB par photo par Right-Click karein aur <strong>&quot;Copy Image Address&quot;</strong> (ya Direct Link dropdown) select karein. Direct link hamesha <code className="font-bold">i.ibb.co/...</code> se shuru hota hai.</p>
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Direct image link paste karein (e.g. <span className="font-semibold text-indigo-600 dark:text-indigo-400">https://i.ibb.co/.../banner.png</span>). Permanent aur instant load hota hai.
                  </p>
                </div>
              ) : (
                /* Mode 2: File Upload */
                <div className="space-y-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-800 dark:file:text-slate-200 cursor-pointer"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Upload PNG, JPG, or WebP image from your device.
                  </p>
                </div>
              )}

              {/* Image Live Preview */}
              {imagePreview && (
                <div className="relative mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 aspect-[16/8] max-h-40">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow"
                    title="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* 2. Optional Video Section */}
            <div className="space-y-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-indigo-500" />
                  Video Banner (Optional)
                </span>
                <button
                  type="button"
                  onClick={() => setShowVideoOptions(!showVideoOptions)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  {showVideoOptions ? "Hide Video Options" : "+ Add Video"}
                </button>
              </div>

              {showVideoOptions && (
                <div className="pt-2 space-y-2.5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Video Source</Label>
                    <div className="inline-flex rounded-lg p-0.5 bg-slate-200 dark:bg-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setVideoMode("url")}
                        className={`px-2 py-0.5 rounded font-medium ${
                          videoMode === "url" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white" : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        Video URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode("upload")}
                        className={`px-2 py-0.5 rounded font-medium ${
                          videoMode === "upload" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white" : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        Upload Video
                      </button>
                    </div>
                  </div>

                  {videoMode === "url" ? (
                    <Input
                      value={formData.video}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      placeholder="e.g. https://example.com/banner-promo.mp4"
                      className="font-mono text-xs bg-white dark:bg-slate-950"
                    />
                  ) : (
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-slate-200 file:text-slate-800 cursor-pointer"
                    />
                  )}

                  {videoPreview && (
                    <div className="relative mt-2 rounded-lg overflow-hidden border bg-black aspect-[16/8] max-h-36">
                      <video src={videoPreview} controls className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Redirect / Target URL */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Redirect Link (Optional)</Label>
              <Input
                value={formData.redirectUrl}
                onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                placeholder="e.g. /exams or /pricing or https://..."
                className="text-xs sm:text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Clicking the slide navigates here. You can use internal paths like <code className="text-indigo-500">/exams</code> or full web links.
              </p>
            </div>

            {/* 4. Text Overlays (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Title (Optional)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. UP Police Constable 2026"
                  className="text-xs sm:text-sm"
                />
                <p className="text-[10px] text-muted-foreground">Leave empty if banner already contains text.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Subtitle (Optional)</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. 25 Full Mock Tests Live"
                  className="text-xs sm:text-sm"
                />
                <p className="text-[10px] text-muted-foreground">Short description below title.</p>
              </div>
            </div>

            {/* 5. Order and Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Label className="text-xs font-semibold">Display Order:</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-20 h-8 text-xs font-bold"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold cursor-pointer" htmlFor="active-toggle">
                  {formData.isActive ? "Status: Active (Visible)" : "Status: Hidden"}
                </Label>
                <Switch
                  id="active-toggle"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setIsEditDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {createMutation.isLoading || updateMutation.isLoading
                  ? "Saving Slide..."
                  : isEditDialogOpen
                  ? "Save Changes"
                  : "Create Slide"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Slide Banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this slide banner from the homepage? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
