"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  FileText,
  Video,
  FileQuestion,
  FileArchive,
  BookOpen,
  Download,
  Eye,
  EyeOff
} from "lucide-react"
import toast from "react-hot-toast"
import api from "@/lib/api"

interface StudyMaterial {
  id: string
  title: string
  description: string
  type: string
  courseId: string
  fileUrl: string
  fileName: string
  fileSize: number
  isActive: boolean
  downloadCount: number
  createdAt: string
}

interface Course {
  id: string
  title: string
}

const ITEMS_PER_PAGE = 10

export default function AdminStudyMaterialsPage() {
  const queryClient = useQueryClient()
  
  // Search and pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  
  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null)
  const [deletingMaterial, setDeletingMaterial] = useState<StudyMaterial | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Notes",
    courseId: "",
    file: null as File | null
  })
  
  // Fetch study materials
  const { data: materialsData, isLoading: materialsLoading } = useQuery(
    ["admin-study-materials"],
    async () => {
      const response = await api.get("/study-materials/admin/all")
      return response.data
    }
  )
  
  // Fetch courses
  const { data: coursesData } = useQuery(
    ["courses"],
    async () => {
      const response = await api.get("/courses/admin")
      return response.data
    }
  )
  
  const materials = materialsData?.data?.materials || []
  const courses = coursesData?.courses || []
  
  // Create mutation
  const createMutation = useMutation(
    async (data: FormData) => {
      const response = await api.post("/study-materials", data, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      return response.data
    },
    {
      onSuccess: () => {
        toast.success("Study material created successfully")
        setIsDialogOpen(false)
        resetForm()
        queryClient.invalidateQueries(["admin-study-materials"])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create study material")
      }
    }
  )
  
  // Update mutation
  const updateMutation = useMutation(
    async ({ id, data }: { id: string, data: FormData }) => {
      const response = await api.put(`/study-materials/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      return response.data
    },
    {
      onSuccess: () => {
        toast.success("Study material updated successfully")
        setIsDialogOpen(false)
        resetForm()
        queryClient.invalidateQueries(["admin-study-materials"])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update study material")
      }
    }
  )
  
  // Delete mutation
  const deleteMutation = useMutation(
    async (id: string) => {
      const response = await api.delete(`/study-materials/${id}`)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success("Study material deleted successfully")
        setIsDeleteDialogOpen(false)
        setDeletingMaterial(null)
        queryClient.invalidateQueries(["admin-study-materials"])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete study material")
      }
    }
  )
  
  // Toggle status mutation
  const toggleMutation = useMutation(
    async (id: string) => {
      const response = await api.patch(`/study-materials/${id}/toggle`)
      return response.data
    },
    {
      onSuccess: () => {
        toast.success("Status updated successfully")
        queryClient.invalidateQueries(["admin-study-materials"])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update status")
      }
    }
  )
  
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "Notes",
      courseId: "",
      file: null
    })
    setEditingMaterial(null)
  }
  
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = new FormData()
    data.append("title", formData.title)
    data.append("description", formData.description)
    data.append("type", formData.type)
    data.append("courseId", formData.courseId)
    if (formData.file) {
      data.append("file", formData.file)
    }
    
    createMutation.mutate(data)
  }
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingMaterial) return
    
    const data = new FormData()
    data.append("title", formData.title)
    data.append("description", formData.description)
    data.append("type", formData.type)
    data.append("courseId", formData.courseId)
    if (formData.file) {
      data.append("file", formData.file)
    }
    
    updateMutation.mutate({ id: editingMaterial.id, data })
  }
  
  const handleEdit = (material: StudyMaterial) => {
    setEditingMaterial(material)
    setFormData({
      title: material.title,
      description: material.description,
      type: material.type,
      courseId: material.courseId,
      file: null
    })
    setIsDialogOpen(true)
  }
  
  const handleDelete = (material: StudyMaterial) => {
    setDeletingMaterial(material)
    setIsDeleteDialogOpen(true)
  }
  
  const handleToggle = (material: StudyMaterial) => {
    toggleMutation.mutate(material.id)
  }
  
  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'Video': return <Video className="h-5 w-5" />
      case 'PYQ': return <FileQuestion className="h-5 w-5" />
      case 'Notes': return <FileText className="h-5 w-5" />
      case 'Ebook': return <BookOpen className="h-5 w-5" />
      case 'Syllabus': return <FileArchive className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }
  
  // Filter materials
  const filteredMaterials = materials.filter((material: StudyMaterial) =>
    material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.type.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Pagination
  const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE)
  const paginatedMaterials = filteredMaterials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Study Materials</h1>
            <p className="text-muted-foreground">Manage study materials for courses</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Material
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Materials Grid */}
        {materialsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-24 bg-muted" />
                <CardContent className="h-20" />
              </Card>
            ))}
          </div>
        ) : paginatedMaterials.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No study materials found</h3>
            <p className="text-muted-foreground mb-4">Add study materials to get started</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Material
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedMaterials.map((material: StudyMaterial) => {
              const course = courses.find((c: Course) => c.id === material.courseId)
              return (
                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getMaterialIcon(material.type)}
                        <Badge variant="secondary">{material.type}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(material)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggle(material)}
                        >
                          {material.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(material)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {material.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Course:</span>
                        <span className="font-medium">{course?.title || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Downloads:</span>
                        <span className="font-medium">{material.downloadCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`font-medium ${material.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {material.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
      
      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? 'Edit Study Material' : 'Add Study Material'}</DialogTitle>
            <DialogDescription>
              {editingMaterial ? 'Update the study material details' : 'Add a new study material for a course'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingMaterial ? handleUpdate : handleCreate}>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter material title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Notes">Notes</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="PYQ">Previous Year Questions</SelectItem>
                    <SelectItem value="Ebook">Ebook</SelectItem>
                    <SelectItem value="Syllabus">Syllabus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Course</label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course: Course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">File</label>
                <Input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  accept=".pdf,.doc,.docx,.mp4,.zip"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: PDF, DOC, DOCX, MP4, ZIP
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
                {createMutation.isLoading || updateMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {editingMaterial ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Study Material</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingMaterial?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingMaterial && deleteMutation.mutate(deletingMaterial.id)}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
