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
import ImagePicker from "@/components/admin/ImagePicker"
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  X,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
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
  const { user, isLoading: authLoading } = useAuth()
  const isAdmin = user?.role === "admin" || user?.role === "superadmin"

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSlide, setSelectedSlide] = useState<SliderForm | null>(null)
  const [formData, setFormData] = useState<SliderForm>(EMPTY_FORM)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/login?redirect=/admin/slider")
    }
  }, [user, isAdmin, authLoading, router])

  // Fetch sliders
  const { data: slidersData, isLoading } = useQuery(
    ["admin-sliders"],
    () => sliderAPI.getAllSlidersAdmin(),
    {
      enabled: !!user && isAdmin,
    }
  )

  const sliders = slidersData?.data?.sliders || []
  const activeSliders = sliders.filter((s: SliderForm) => s.isActive)

  // Mutations
  const createMutation = useMutation(
    (formDataToSend: FormData) => sliderAPI.createSlider(formDataToSend),
    {
      onSuccess: () => {
        toast.success("Slide added successfully")
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
        toast.success("Slide updated successfully")
        queryClient.invalidateQueries(["admin-sliders"])
        queryClient.invalidateQueries(["sliders"])
        setIsEditDialogOpen(false)
        setSelectedSlide(null)
        resetForm()
      },
      onError: () => {
        toast.error("Failed to update slide")
      },
    }
  )

  const deleteMutation = useMutation(
    (id: string) => sliderAPI.deleteSlider(id),
    {
      onSuccess: () => {
        toast.success("Slide deleted successfully")
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
    setImagePreview(slide.image || null)
    setVideoPreview(slide.video || null)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (slide: SliderForm) => {
    setSelectedSlide(slide)
    setIsDeleteDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a temporary image to get dimensions
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        try {
          // Calculate aspect ratio for slider (16:9 = 1920x1080)
          const targetWidth = 1920
          const targetHeight = 1080
          const targetAspectRatio = targetWidth / targetHeight
          
          // Create canvas for cropping
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          let sourceX = 0
          let sourceY = 0
          let sourceWidth = img.width
          let sourceHeight = img.height
          
          const imageAspectRatio = img.width / img.height
          
          // Calculate crop dimensions to match 16:9 aspect ratio
          if (imageAspectRatio > targetAspectRatio) {
            // Image is wider than target, crop sides
            sourceWidth = img.height * targetAspectRatio
            sourceX = (img.width - sourceWidth) / 2
          } else {
            // Image is taller than target, crop top/bottom
            sourceHeight = img.width / targetAspectRatio
            sourceY = (img.height - sourceHeight) / 2
          }
          
          canvas.width = targetWidth
          canvas.height = targetHeight
          
          // Draw cropped image to canvas
          if (ctx) {
            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight)
            
            // Convert canvas to blob
            canvas.toBlob((blob) => {
              if (blob) {
                const croppedFile = new File([blob], file.name, { type: file.type })
                setFormData({ ...formData, imageFile: croppedFile })
                const previewUrl = URL.createObjectURL(croppedFile)
                setImagePreview(previewUrl)
              } else {
                // Fallback to original file if blob conversion fails
                setFormData({ ...formData, imageFile: file })
                const previewUrl = URL.createObjectURL(file)
                setImagePreview(previewUrl)
              }
              URL.revokeObjectURL(url)
            }, file.type, 0.95)
          } else {
            // Fallback if canvas context is not available
            setFormData({ ...formData, imageFile: file })
            const previewUrl = URL.createObjectURL(file)
            setImagePreview(previewUrl)
            URL.revokeObjectURL(url)
          }
        } catch (error) {
          console.error('Image cropping error:', error)
          // Fallback to original file if cropping fails
          setFormData({ ...formData, imageFile: file })
          const previewUrl = URL.createObjectURL(file)
          setImagePreview(previewUrl)
          URL.revokeObjectURL(url)
        }
      }
      
      img.onerror = () => {
        console.error('Image load error')
        // Fallback to original file if image load fails
        setFormData({ ...formData, imageFile: file })
        const previewUrl = URL.createObjectURL(file)
        setImagePreview(previewUrl)
        URL.revokeObjectURL(url)
      }
      
      img.src = url
    }
  }

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, videoFile: file })
      const previewUrl = URL.createObjectURL(file)
      setVideoPreview(previewUrl)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "", imageFile: null })
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveVideo = () => {
    setFormData({ ...formData, video: "", videoFile: null })
    setVideoPreview(null)
  }

  const handleImageSelect = (imageUrl: string) => {
    setFormData({ ...formData, image: imageUrl, imageFile: null })
    setImagePreview(getApiImageUrl(imageUrl))
    setIsImagePickerOpen(false)
  }

  const prepareFormData = (): FormData => {
    const formDataToSend = new FormData()
    formDataToSend.append("title", formData.title || "")
    formDataToSend.append("subtitle", formData.subtitle || "")
    formDataToSend.append("redirectUrl", formData.redirectUrl || "")
    formDataToSend.append("videoDuration", String(formData.videoDuration || 0))
    formDataToSend.append("isActive", String(formData.isActive))
    formDataToSend.append("order", String(formData.order || 0))

    // Handle image
    if (formData.imageFile) {
      formDataToSend.append("image", formData.imageFile)
    } else if (formData.image && typeof formData.image === "string") {
      formDataToSend.append("imageUrl", formData.image)
    }

    // Handle video
    if (formData.videoFile) {
      formDataToSend.append("video", formData.videoFile)
    } else if (formData.video && typeof formData.video === "string") {
      formDataToSend.append("videoUrl", formData.video)
    }

    return formDataToSend
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.image && !formData.imageFile) {
      toast.error("Please upload an image or provide an image URL")
      return
    }
    
    const formDataToSend = prepareFormData()

    if (isEditDialogOpen && selectedSlide) {
      updateMutation.mutate({ id: selectedSlide._id!, formDataToSend })
    } else {
      createMutation.mutate(formDataToSend)
    }
  }

  const handleDeleteConfirm = () => {
    if (selectedSlide?._id) {
      deleteMutation.mutate(selectedSlide._id)
    }
  }

  const nextPreview = () => {
    setPreviewIndex((prev) => (prev + 1) % activeSliders.length)
  }

  const prevPreview = () => {
    setPreviewIndex((prev) => (prev - 1 + activeSliders.length) % activeSliders.length)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.push("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Slider Management</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: List */}
        <div className="h-[calc(100vh-200px)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">All Slides ({sliders.length})</h2>
            <Button onClick={handleAddClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Slide
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : sliders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No slides configured yet</p>
                <Button onClick={handleAddClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Slide
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2">
              {sliders.map((slide: SliderForm, index: number) => (
                <Card key={slide._id} className={!slide.isActive ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        {slide.image ? (
                          <img
                            src={getApiImageUrl(slide.image)}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold truncate">{slide.title || "Untitled"}</h3>
                            <p className="text-sm text-muted-foreground truncate">{slide.subtitle}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">Order: {slide.order}</span>
                              {!slide.isActive && (
                                <span className="text-xs text-red-500">(Inactive)</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditClick(slide)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => handleDeleteClick(slide)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="h-[calc(100vh-200px)] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-6">Live Preview</h2>
          <Card className="overflow-hidden w-full">
            {activeSliders.length > 0 ? (
              <div className="relative">
                {/* Slide Image */}
                <div className="relative h-[400px] bg-muted">
                  <img
                    src={getApiImageUrl(activeSliders[previewIndex]?.image)}
                    alt={activeSliders[previewIndex]?.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay Text */}
                  {(activeSliders[previewIndex]?.title || activeSliders[previewIndex]?.subtitle) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                      {activeSliders[previewIndex]?.title && (
                        <h3 className="text-white font-semibold text-lg">
                          {activeSliders[previewIndex].title}
                        </h3>
                      )}
                      {activeSliders[previewIndex]?.subtitle && (
                        <p className="text-white/80 text-sm">
                          {activeSliders[previewIndex].subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between p-4 bg-card border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPreview}
                    disabled={activeSliders.length <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {previewIndex + 1} / {activeSliders.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPreview}
                    disabled={activeSliders.length <= 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Dots */}
                {activeSliders.length > 1 && (
                  <div className="flex justify-center gap-2 pb-4">
                    {activeSliders.map((_: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setPreviewIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === previewIndex ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">No active slides to preview</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Slide" : "Add Slide"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen ? "Update the slide details below" : "Add a new slide to the homepage slider"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Image *</Label>
              {(imagePreview || formData.image) && (
                <div className="relative mb-3 max-h-32 overflow-hidden rounded-lg">
                  <img
                    src={imagePreview || formData.image}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsImagePickerOpen(true)}
                className="w-full gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                {formData.image ? "Change Image from Library" : "Select from Media Library"}
              </Button>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Title (Optional)</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., SSC CGL 2024"
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label>Subtitle (Optional)</Label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., Apply before 31st Dec"
              />
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
              <Label>Video (Optional)</Label>
              {(videoPreview || formData.video) && (
                <div className="relative mb-3 max-h-32 overflow-hidden rounded-lg">
                  <video
                    src={videoPreview || formData.video}
                    controls
                    className="w-full h-32 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveVideo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                If provided, the video will play for a short time instead of the image
              </p>
            </div>

            {/* Video Duration */}
            <div className="space-y-2">
              <Label>Video Duration (Optional)</Label>
              <Input
                type="number"
                value={formData.videoDuration}
                onChange={(e) => setFormData({ ...formData, videoDuration: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Video play duration in seconds (0 = play full video)
              </p>
            </div>

            {/* Redirect URL */}
            <div className="space-y-2">
              <Label>Redirect URL (Optional)</Label>
              <Input
                value={formData.redirectUrl}
                onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                placeholder="e.g., /exams/ssc-cgl or https://external-link.com"
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                Clicking the slide will navigate to this URL
              </p>
            </div>

            {/* Order */}
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <DialogFooter>
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
              >
                {createMutation.isLoading || updateMutation.isLoading
                  ? "Saving..."
                  : isEditDialogOpen
                  ? "Update"
                  : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Slide</DialogTitle>
            <DialogDescription>This action cannot be undone</DialogDescription>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this slide? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Picker Dialog */}
      <ImagePicker
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelect={handleImageSelect}
      />
    </div>
  )
}
