"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { examCategoryAPI, mediaAPI, getImageUrl } from "@/lib/api"
import MediaLibrary from "@/components/media/MediaLibrary"
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
  FolderOpen,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Folder,
  BookOpen,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Image as ImageIcon,
} from "lucide-react"
import toast from "react-hot-toast"

const COLORS = [
  { name: "Blue", value: "blue" },
  { name: "Green", value: "green" },
  { name: "Red", value: "red" },
  { name: "Purple", value: "purple" },
  { name: "Orange", value: "orange" },
  { name: "Pink", value: "pink" },
  { name: "Teal", value: "teal" },
  { name: "Cyan", value: "cyan" },
  { name: "Yellow", value: "yellow" },
  { name: "Indigo", value: "indigo" },
]

export default function CategoriesPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "blue",
    icon: "folder",
    image: "",
    order: 0,
    isActive: true,
    showInFooter: false,
  })

  // Image upload state for category
  const [selectedCategoryImageFile, setSelectedCategoryImageFile] = useState<File | null>(null)
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null)
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)

  // Course management state
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [isCreatingCourse, setIsCreatingCourse] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [selectedCategoryForCourse, setSelectedCategoryForCourse] = useState<any>(null)
  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    image: "",
    isActive: true,
  })
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Fetch all categories
  const { data: categoriesData, isLoading, error, refetch: refetchCategories } = useQuery(
    "admin-categories",
    async () => {
      const response = await examCategoryAPI.getAllCategoriesAdmin()
      return response
    },
    {
      staleTime: 0,
      refetchOnWindowFocus: true,
    }
  )

  const categories = categoriesData?.data?.categories || []
  
  // Show error if any
  if (error) {
    console.error('Error fetching categories:', error)
  }

  // Create mutation
  const createMutation = useMutation(
    (data: any) => examCategoryAPI.createCategory(data),
    {
      onSuccess: () => {
        toast.success("Category created successfully!")
        queryClient.invalidateQueries("admin-categories")
        setIsCreating(false)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create category")
      },
    }
  )

  // Update mutation
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => examCategoryAPI.updateCategory(id, data),
    {
      onSuccess: () => {
        toast.success("Category updated successfully!")
        queryClient.invalidateQueries("admin-categories")
        setEditingCategory(null)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update category")
      },
    }
  )

  // Delete mutation
  const deleteMutation = useMutation(
    (id: string) => examCategoryAPI.deleteCategory(id),
    {
      onSuccess: (response: any) => {
        const deletedCount = response?.data?.deletedExams || 0
        if (deletedCount > 0) {
          toast.success(`Category deleted! ${deletedCount} exam(s)/test(s) were also removed.`)
        } else {
          toast.success("Category deleted successfully!")
        }
        queryClient.invalidateQueries("admin-categories")
        queryClient.invalidateQueries("admin-exams")
        queryClient.invalidateQueries("admin-stats")
      },
      onError: (error: any) => {
        console.error('[DELETE ERROR]', error)
        const errorMsg = error?.response?.data?.message || error?.message || "Failed to delete category"
        toast.error(errorMsg)
      },
    }
  )

  // Toggle status mutation
  const toggleMutation = useMutation(
    (id: string) => examCategoryAPI.toggleCategoryStatus(id),
    {
      onSuccess: () => {
        toast.success("Category status updated!")
        queryClient.invalidateQueries("admin-categories")
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to toggle status")
      },
    }
  )

  // Fetch courses for expanded category
  const { data: coursesData, isLoading: coursesLoading } = useQuery(
    ["category-courses", expandedCategory],
    () => examCategoryAPI.getCategoryCourses(expandedCategory!),
    { enabled: !!expandedCategory }
  )

  const categoryCourses = coursesData?.data?.courses || []

  // Create course mutation
  const createCourseMutation = useMutation(
    ({ categoryId, data }: { categoryId: string; data: any }) =>
      examCategoryAPI.createCategoryCourse(categoryId, data),
    {
      onSuccess: () => {
        toast.success("Course created successfully!")
        queryClient.invalidateQueries(["category-courses", expandedCategory])
        setIsCreatingCourse(false)
        resetCourseForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create course")
      },
    }
  )

  // Update course mutation
  const updateCourseMutation = useMutation(
    ({ courseId, data }: { courseId: string; data: any }) =>
      examCategoryAPI.updateCategoryCourse(courseId, data),
    {
      onSuccess: () => {
        toast.success("Course updated successfully!")
        queryClient.invalidateQueries(["category-courses", expandedCategory])
        setEditingCourse(null)
        resetCourseForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update course")
      },
    }
  )

  // Delete course mutation
  const deleteCourseMutation = useMutation(
    (courseId: string) => examCategoryAPI.deleteCategoryCourse(courseId),
    {
      onSuccess: () => {
        toast.success("Course deleted successfully!")
        queryClient.invalidateQueries(["category-courses", expandedCategory])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete course")
      },
    }
  )

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: "blue",
      icon: "folder",
      image: "",
      order: 0,
      isActive: true,
      showInFooter: false,
    })
    setSelectedCategoryImageFile(null)
    setCategoryImagePreview(null)
  }

  const resetCourseForm = () => {
    setCourseFormData({
      title: "",
      description: "",
      image: "",
      isActive: true,
    })
    setSelectedImageFile(null)
    setImagePreview(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImageFile(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault()

    // Create FormData for file upload
    const formData = new FormData()
    formData.append('title', courseFormData.title)
    formData.append('description', courseFormData.description)
    formData.append('isActive', String(courseFormData.isActive))

    // Add image file if selected
    if (selectedImageFile) {
      formData.append('courseImage', selectedImageFile)
    }

    if (editingCourse) {
      updateCourseMutation.mutate({
        courseId: editingCourse.id,
        data: formData,
      })
    } else if (selectedCategoryForCourse) {
      createCourseMutation.mutate({
        categoryId: selectedCategoryForCourse.id,
        data: formData,
      })
    }
  }

  const handleEditCourse = (course: any) => {
    setEditingCourse(course)
    setCourseFormData({
      title: course.title,
      description: course.description || "",
      image: course.image || "",
      isActive: course.isActive,
    })
    // Set preview if image exists
    if (course.image) {
      setImagePreview(getImageUrl(course.image))
    }
    setIsCreatingCourse(true)
  }

  const handleDeleteCourse = (courseId: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      deleteCourseMutation.mutate(courseId)
    }
  }

  const toggleExpandCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
    setIsCreatingCourse(false)
    setEditingCourse(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let imagePath = formData.image

    // Upload image if a new file is selected
    if (selectedCategoryImageFile) {
      try {
        const formDataUpload = new FormData()
        formDataUpload.append('images', selectedCategoryImageFile)
        formDataUpload.append('type', 'category')
        formDataUpload.append('category', formData.name.toLowerCase().replace(/\s+/g, '-'))

        const response = await mediaAPI.uploadImage(formDataUpload)
        
        // Backend returns { media: [{ url, ... }] } or { url, ... }
        const uploadedMedia = response.data.media?.[0] || response.data
        imagePath = uploadedMedia.url || uploadedMedia.path || ''
      } catch (error) {
        console.error('[DEBUG] Image upload failed:', error)
        // Continue with form submission even if image upload fails
      }
    }

    const submitData = { ...formData, image: imagePath }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      image: category.image || "",
      order: category.order,
      isActive: category.isActive,
      showInFooter: category.showInFooter || false,
    })
    setCategoryImagePreview(category.image ? getImageUrl(category.image) : null)
    setSelectedCategoryImageFile(null)
    setIsCreating(true)
  }

  const handleDelete = (category: any) => {
    const examCount = category.examCount || 0
    const pyqCount = category.pyqCount || 0
    const testCount = category.testCount || 0
    const totalCount = examCount + pyqCount + testCount
    
    let warningMessage = `Are you sure you want to delete "${category.name}"?\n\n`
    
    if (totalCount > 0) {
      warningMessage += `⚠️ WARNING: This will also delete ALL related content:\n`
      if (examCount > 0) warningMessage += `   • ${examCount} Exam Group(s)\n`
      if (pyqCount > 0) warningMessage += `   • ${pyqCount} PYQ Folder(s)\n`
      if (testCount > 0) warningMessage += `   • ${testCount} Test(s)\n`
      warningMessage += `\nThis action cannot be undone!`
    } else {
      warningMessage += `This category is empty.\n\nThis action cannot be undone!`
    }
    
    if (confirm(warningMessage)) {
      deleteMutation.mutate(category.id)
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
            <h1 className="text-3xl font-bold">Exam Categories</h1>
            <p className="text-muted-foreground">Manage exam categories that appear on the exams page</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Category
          </Button>
        </div>

        {/* Create/Edit Course Form */}
        {isCreatingCourse && selectedCategoryForCourse && (
          <Card className="mb-8 border-blue-200">
            <CardHeader>
              <CardTitle>
                {editingCourse ? "Edit Course" : `Create Course for ${selectedCategoryForCourse.name}`}
              </CardTitle>
              <CardDescription>
                {editingCourse ? "Update course details" : "Add a new course to this category"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Course Title *</label>
                    <Input
                      value={courseFormData.title}
                      onChange={(e) =>
                        setCourseFormData({ ...courseFormData, title: e.target.value })
                      }
                      placeholder="e.g., SSC CGL Complete Course"
                      required
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Course Image</label>
                    <div className="flex gap-4 items-start">
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-24 w-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null)
                              setSelectedImageFile(null)
                              setCourseFormData({ ...courseFormData, image: '' })
                            }}
                            className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        {/* File Upload */}
                        <div className="border-2 border-dashed border-muted rounded-lg p-4 hover:border-primary/50 transition-colors">
                          <input
                            type="file"
                            id="courseImage"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="courseImage"
                            className="flex flex-col items-center cursor-pointer"
                          >
                            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground text-center">
                              Click to upload image<br/>
                              <span className="text-xs">(JPG, PNG, GIF - Max 5MB)</span>
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={courseFormData.description}
                      onChange={(e) =>
                        setCourseFormData({ ...courseFormData, description: e.target.value })
                      }
                      placeholder="Brief description of this course..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={courseFormData.isActive}
                        onCheckedChange={(checked) =>
                          setCourseFormData({ ...courseFormData, isActive: checked })
                        }
                      />
                      <span className="text-sm">{courseFormData.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingCourse(false)
                      setEditingCourse(null)
                      resetCourseForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCourseMutation.isLoading || updateCourseMutation.isLoading}
                    className="gap-2"
                  >
                    {createCourseMutation.isLoading || updateCourseMutation.isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingCourse ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Update Course
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create Course
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Category Form */}
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingCategory ? "Edit Category" : "Create New Category"}</CardTitle>
              <CardDescription>
                {editingCategory ? "Update category details" : "Add a new category for organizing exams"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., SSC, Banking, Railway"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color</label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {COLORS.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this category..."
                    />
                  </div>

                  {/* Category Image Upload */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Category Image</label>
                    <div className="flex items-start gap-4">
                      {categoryImagePreview && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                          <img
                            src={categoryImagePreview}
                            alt="Category preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCategoryImageFile(null)
                              setCategoryImagePreview(null)
                              setFormData({ ...formData, image: "" })
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setSelectedCategoryImageFile(file)
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  setCategoryImagePreview(reader.result as string)
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                            className="hidden"
                            id="category-image-upload"
                          />
                          <label htmlFor="category-image-upload">
                            <Button
                              type="button"
                              variant="outline"
                              className="cursor-pointer"
                              asChild
                            >
                              <span className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                {categoryImagePreview ? "Change Image" : "Upload Image"}
                              </span>
                            </Button>
                          </label>
                          <span className="text-xs text-muted-foreground">or</span>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setMediaLibraryOpen(true)}
                          >
                            <Folder className="h-4 w-4 mr-1" />
                            Select from Library
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Recommended: 400x300px, Max 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display Order</label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <span className="text-sm">{formData.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Show in Footer</label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.showInFooter}
                        onCheckedChange={(checked) => setFormData({ ...formData, showInFooter: checked })}
                      />
                      <span className="text-sm">{formData.showInFooter ? "Visible" : "Hidden"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Display this category in the footer links</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false)
                      setEditingCategory(null)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                    className="gap-2"
                  >
                    {createMutation.isLoading || updateMutation.isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingCategory ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Update Category
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create Category
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories List with Courses */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-32 bg-muted" />
                <CardContent className="h-24" />
              </Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No categories found</h3>
            <p className="text-muted-foreground mb-4">Create categories to organize your exams</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Category
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((category: any) => {
              const color = category.color || 'blue'
              const colorMap: Record<string, string> = {
                blue: '#3b82f6',
                green: '#22c55e',
                red: '#ef4444',
                purple: '#a855f7',
                orange: '#f97316',
                pink: '#ec4899',
                teal: '#14b8a6',
                cyan: '#06b6d4',
                yellow: '#eab308',
                indigo: '#6366f1'
              }
              const mainColor = colorMap[color] || colorMap.blue
              
              return (
              <Card key={category.id} className={`group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 relative ${!category.isActive ? 'opacity-60' : ''}`}>
                {/* Category Image Watermark Background */}
                {category.image && (
                  <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                    <img
                      src={getImageUrl(category.image)}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Color Header Bar (only if no image) */}
                {!category.image && (
                  <div
                    className="h-3"
                    style={{ background: `linear-gradient(to right, ${mainColor}, ${mainColor}dd)` }}
                  />
                )}

                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <div className="h-12 w-12 rounded-xl overflow-hidden shadow-sm">
                          <img
                            src={getImageUrl(category.image)}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${mainColor}20, ${mainColor}10)` }}
                        >
                          <FolderOpen className="h-6 w-6" style={{ color: mainColor }} />
                        </div>
                      )}
                      <div className="flex-1">
                      <CardTitle className="text-lg font-bold">{category.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Order: {category.order || 0} • {category.isActive ? <span className="text-green-600">Active</span> : <span className="text-gray-500">Inactive</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        disabled={deleteMutation.isLoading}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {category.description || "No description provided"}
                  </p>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-2xl font-bold text-blue-600">{category.examCount || 0}</p>
                      <p className="text-xs text-blue-500 font-medium">Exams</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-2xl font-bold text-amber-600">{category.pyqCount || 0}</p>
                      <p className="text-xs text-amber-500 font-medium">PYQs</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-2xl font-bold text-green-600">{category.testCount || 0}</p>
                      <p className="text-xs text-green-500 font-medium">Tests</p>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <Link href={`/admin/exams?category=${encodeURIComponent(category.name)}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                        <BookOpen className="h-3 w-3" />
                        View Exams
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs flex-1"
                      onClick={() => {
                        setSelectedCategoryForCourse(category)
                        setIsCreatingCourse(true)
                        setEditingCourse(null)
                        resetCourseForm()
                      }}
                    >
                      <Plus className="h-3 w-3" />
                      Add Course
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpandCategory(category.id)}
                    >
                      {expandedCategory === category.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {/* Expanded Courses Section */}
                {expandedCategory === category.id && (
                  <CardContent className="pt-0 border-t bg-muted/30">
                    <div className="py-4">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Courses in this category
                      </h4>

                      {coursesLoading ? (
                        <div className="space-y-2">
                          {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                          ))}
                        </div>
                      ) : categoryCourses.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">
                          <GraduationCap className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">No courses yet</p>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                              setSelectedCategoryForCourse(category)
                              setIsCreatingCourse(true)
                              setEditingCourse(null)
                              resetCourseForm()
                            }}
                          >
                            Create first course
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {categoryCourses.map((course: any, index: number) => (
                            <div
                              key={course.id}
                              className="group relative bg-white rounded-xl border border-gray-200 hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                              {/* Top Color Bar */}
                              <div className={`h-1 bg-gradient-to-r ${[
                                'from-blue-500 to-cyan-400',
                                'from-purple-500 to-pink-400',
                                'from-green-500 to-emerald-400',
                                'from-orange-500 to-yellow-400'
                              ][index % 4]}`} />

                              <div className="p-4">
                                {/* Header with Image and Title */}
                                <div className="flex items-start gap-4">
                                  {/* Course Logo - Bigger */}
                                  <div className="h-16 w-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                    {course.image ? (
                                      <img
                                        src={getImageUrl(course.image) || ''}
                                        alt={course.title}
                                        className="max-h-14 max-w-14 object-contain p-1"
                                        onError={(e) => {
                                          ;(e.target as HTMLImageElement).style.display = 'none'
                                        }}
                                      />
                                    ) : (
                                      <BookOpen className="h-7 w-7 text-muted-foreground" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{course.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                      {course.description || "No description"}
                                    </p>
                                  </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                                  <Badge variant={course.isActive ? "success" : "secondary"} className="text-xs h-5">
                                    {course.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {course.examCount || 0} exams
                                  </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 mt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs flex-1"
                                    onClick={() => handleEditCourse(course)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => handleDeleteCourse(course.id)}
                                    disabled={deleteCourseMutation.isLoading}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
              )
            })}
          </div>
        )}

        {/* Important Note */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">How It Works</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-4">
              <li><strong>Categories:</strong> Create exam categories (SSC, Banking, Railway, etc.)</li>
              <li><strong>Courses:</strong> Add courses to each category - these will appear when users select the category</li>
              <li><strong>Exams:</strong> Regular exams with matching category names will also appear</li>
              <li>Click the arrow (▼) on any category to view and manage its courses</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Footer />

      {/* Media Library Dialog */}
      <MediaLibrary
        open={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={(imagePath) => {
          setFormData({ ...formData, image: imagePath })
          setCategoryImagePreview(getImageUrl(imagePath))
          setSelectedCategoryImageFile(null)
        }}
      />
    </div>
  )
}
