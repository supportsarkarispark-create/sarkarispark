"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { sarkariWorksAPI, getImageUrl } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Building2,
  Loader2,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Briefcase,
  X,
  Image as ImageIcon
} from "lucide-react"
import ImagePicker from "@/components/admin/ImagePicker"
import toast from "react-hot-toast"

interface SarkariWorkForm {
  title: string
  description: string
  link: string
  category: string
  image: string
  order: number
  isActive: boolean
}

const EMPTY_FORM: SarkariWorkForm = {
  title: "",
  description: "",
  link: "",
  category: "",
  image: "",
  order: 0,
  isActive: true,
}

export default function AdminSarkariKamPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All")
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingWork, setEditingWork] = useState<any>(null)
  const [deletingWork, setDeletingWork] = useState<any>(null)
  const [formData, setFormData] = useState<SarkariWorkForm>(EMPTY_FORM)
  const [newCategoryInput, setNewCategoryInput] = useState("")
  const [useCustomCategory, setUseCustomCategory] = useState(false)
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)

  // Fetch admin cards
  const { data: worksResponse, isLoading } = useQuery(
    ["admin-sarkari-works"],
    () => sarkariWorksAPI.getAllSarkariWorksAdmin(),
    { refetchOnWindowFocus: false }
  )

  const works = useMemo(() => worksResponse?.data?.works || [], [worksResponse])
  const categoriesList = useMemo(() => 
    (worksResponse?.data?.categories || []).filter((c: string) => c !== ""),
    [worksResponse]
  )

  // Mutations
  const createMutation = useMutation(
    (data: any) => sarkariWorksAPI.createSarkariWork(data),
    {
      onSuccess: () => {
        toast.success("Work portal added successfully")
        queryClient.invalidateQueries(["admin-sarkari-works"])
        setIsAddEditDialogOpen(false)
        resetFormState()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create portal")
      },
    }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => sarkariWorksAPI.updateSarkariWork(id, data),
    {
      onSuccess: () => {
        toast.success("Work portal updated successfully")
        queryClient.invalidateQueries(["admin-sarkari-works"])
        setIsAddEditDialogOpen(false)
        resetFormState()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update portal")
      },
    }
  )

  const deleteMutation = useMutation(
    (id: string) => sarkariWorksAPI.deleteSarkariWork(id),
    {
      onSuccess: () => {
        toast.success("Work portal deleted successfully")
        queryClient.invalidateQueries(["admin-sarkari-works"])
        setIsDeleteDialogOpen(false)
        setDeletingWork(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete portal")
      },
    }
  )

  const toggleStatusMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => sarkariWorksAPI.updateSarkariWork(id, data),
    {
      onSuccess: () => {
        toast.success("Portal status updated")
        queryClient.invalidateQueries(["admin-sarkari-works"])
      },
      onError: (error: any) => {
        toast.error("Failed to update status")
      },
    }
  )

  const resetFormState = () => {
    setFormData(EMPTY_FORM)
    setEditingWork(null)
    setNewCategoryInput("")
    setUseCustomCategory(false)
  }

  const openAddDialog = () => {
    resetFormState()
    setIsAddEditDialogOpen(true)
  }

  const openEditDialog = (work: any) => {
    setEditingWork(work)
    setFormData({
      title: work.title,
      description: work.description,
      link: work.link,
      category: work.category || "",
      image: work.image || "",
      order: work.order || 0,
      isActive: work.isActive,
    })
    setNewCategoryInput("")
    setUseCustomCategory(false)
    setIsAddEditDialogOpen(true)
  }

  const openDeleteDialog = (work: any) => {
    setDeletingWork(work)
    setIsDeleteDialogOpen(true)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalCategory = useCustomCategory ? newCategoryInput.trim() : formData.category.trim()

    const submitData = {
      ...formData,
      category: finalCategory,
    }

    if (editingWork) {
      updateMutation.mutate({ id: editingWork._id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleToggleStatus = (work: any) => {
    toggleStatusMutation.mutate({
      id: work._id,
      data: { isActive: !work.isActive },
    })
  }

  // Local filtering
  const filteredWorks = useMemo(() => {
    return works.filter((work: any) => {
      const matchesSearch =
        work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory =
        selectedCategoryFilter === "All" ||
        (selectedCategoryFilter === "General" && !work.category) ||
        work.category === selectedCategoryFilter

      return matchesSearch && matchesCategory
    })
  }, [works, searchQuery, selectedCategoryFilter])

  // Security check: only admins
  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this panel</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-slate-950">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Panel
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2 tracking-tight">
              <Building2 className="h-8 w-8 text-primary" />
              Manage Sarkari Kam
            </h1>
            <p className="text-muted-foreground">
              Add, edit, categorize, and manage links for various government works cards
            </p>
          </div>
          <Button onClick={openAddDialog} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add New Card
          </Button>
        </div>

        {/* Filters Toolbar */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="w-full md:w-[220px]">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="All">All Categories</option>
                <option value="General">General (Uncategorized)</option>
                {categoriesList.map((cat: string) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Admin Cards Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <span className="text-muted-foreground font-medium">Loading cards data...</span>
          </div>
        ) : filteredWorks.length === 0 ? (
          <Card className="text-center py-12 border-dashed shadow-sm">
            <CardContent className="space-y-3">
              <Briefcase className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground font-medium">No government works cards found.</p>
              <Button size="sm" onClick={openAddDialog}>
                Add your first card
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map((work: any) => (
              <Card key={work._id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="p-4 bg-muted/40 border-b flex items-center justify-between">
                    <Badge variant={work.category ? "secondary" : "outline"} className="max-w-[130px] truncate">
                      {work.category || "General (Uncategorized)"}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(work)}
                        className={`h-8 w-8 rounded-full ${work.isActive ? 'text-green-600 hover:text-green-700' : 'text-red-500 hover:text-red-600'}`}
                        disabled={toggleStatusMutation.isLoading}
                      >
                        {work.isActive ? <Eye className="h-4.5 w-4.5" /> : <EyeOff className="h-4.5 w-4.5" />}
                      </Button>
                      <Badge variant={work.isActive ? "success" : "destructive"}>
                        {work.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary">
                      {work.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {work.description}
                    </p>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2 font-mono">
                      <span>Order weight: {work.order}</span>
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 border-t border-muted/50 mt-auto flex gap-2">
                  <a
                    href={work.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full gap-1.5 h-9" size="sm">
                      <ExternalLink className="h-4 w-4" />
                      Visit Link
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => openEditDialog(work)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => openDeleteDialog(work)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Add / Edit Dialog */}
      <Dialog
        open={isAddEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddEditDialogOpen(false)
            resetFormState()
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingWork ? "Edit Government Work Card" : "Add Government Work Card"}
            </DialogTitle>
            <DialogDescription>
              {editingWork
                ? "Update details of the government card"
                : "Add a new link directory card for official portals"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Aadhar Card Correction Portal"
                required
              />
            </div>

            {/* Link */}
            <div>
              <label className="text-sm font-medium mb-1 block">External Link URL *</label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://uidai.gov.in"
                type="url"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-1 block">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write a brief description of the service and portal..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[90px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              />
            </div>

            {/* Image Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium mb-1 block">Card Cover Image</label>
              <div className="flex items-center gap-4">
                {formData.image ? (
                  <div className="relative h-16 w-28 rounded-lg overflow-hidden border border-muted bg-muted">
                    <img
                      src={getImageUrl(formData.image)}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-28 rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/20">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImagePickerOpen(true)}
                >
                  Choose Image
                </Button>
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Category</label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => setUseCustomCategory(!useCustomCategory)}
                >
                  {useCustomCategory ? "Select Existing" : "Create New Category"}
                </Button>
              </div>
              
              {useCustomCategory ? (
                <Input
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="Type new category name..."
                  required
                />
              ) : (
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">None (Uncategorized)</option>
                  {categoriesList.map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Order weight & Active status */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-sm font-medium mb-1 block">Display Order</label>
                <Input
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  type="number"
                  min={0}
                />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                  Mark Active
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddEditDialogOpen(false)
                  resetFormState()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
                {createMutation.isLoading || updateMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : null}
                {editingWork ? "Update Portal" : "Create Portal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Government Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingWork?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deletingWork._id)}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image Picker Dialog */}
      <ImagePicker
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelect={(url) => setFormData({ ...formData, image: url })}
      />
      
    </div>
  )
}
