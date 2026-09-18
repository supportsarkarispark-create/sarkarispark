"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { govResultsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
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
  Sparkles,
  Image as ImageIcon,
} from "lucide-react"
import toast from "react-hot-toast"

const categories = ["SSC", "Banking", "Railway", "UPSC", "State", "Defence", "Teaching", "Other"]

interface GovResultForm {
  title: string
  description: string
  organization: string
  link: string
  image: string
  category: string
  isLatest: boolean
}

const EMPTY_FORM: GovResultForm = {
  title: "",
  description: "",
  organization: "",
  link: "",
  image: "",
  category: "SSC",
  isLatest: true,
}

// Extended interface for form with file
interface GovResultFormWithFile extends GovResultForm {
  imageFile?: File | null
}

export default function AdminGovResultsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [formData, setFormData] = useState<GovResultFormWithFile>(EMPTY_FORM)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { data: resultsData, isLoading } = useQuery(
    ["admin-gov-results", selectedCategory, searchQuery],
    () =>
      govResultsAPI.getGovResults({
        category: selectedCategory === "All" ? undefined : selectedCategory,
        search: searchQuery || undefined,
      })
  )

  const results = resultsData?.data?.results || []

  const createMutation = useMutation(
    (formData: FormData) => govResultsAPI.createGovResult(formData),
    {
      onSuccess: () => {
        toast.success("Result added successfully")
        queryClient.invalidateQueries(["admin-gov-results"])
        setIsAddDialogOpen(false)
        setFormData(EMPTY_FORM)
        setImagePreview(null)
      },
      onError: () => {
        toast.error("Failed to add result")
      },
    }
  )

  const updateMutation = useMutation(
    ({ id, formData }: { id: string; formData: FormData }) =>
      govResultsAPI.updateGovResult(id, formData),
    {
      onSuccess: () => {
        toast.success("Result updated successfully")
        queryClient.invalidateQueries(["admin-gov-results"])
        setIsEditDialogOpen(false)
        setSelectedResult(null)
        setImagePreview(null)
      },
      onError: () => {
        toast.error("Failed to update result")
      },
    }
  )

  const deleteMutation = useMutation(
    (id: string) => govResultsAPI.deleteGovResult(id),
    {
      onSuccess: () => {
        toast.success("Result deleted successfully")
        queryClient.invalidateQueries(["admin-gov-results"])
        setIsDeleteDialogOpen(false)
        setSelectedResult(null)
      },
      onError: () => {
        toast.error("Failed to delete result")
      },
    }
  )

  const toggleLatestMutation = useMutation(
    (id: string) => govResultsAPI.toggleLatest(id),
    {
      onSuccess: () => {
        toast.success("Latest status updated")
        queryClient.invalidateQueries(["admin-gov-results"])
      },
      onError: () => {
        toast.error("Failed to update status")
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create FormData for file upload
    const formDataToSend = new FormData()
    formDataToSend.append('title', formData.title)
    formDataToSend.append('description', formData.description)
    formDataToSend.append('organization', formData.organization)
    formDataToSend.append('link', formData.link)
    formDataToSend.append('category', formData.category)
    formDataToSend.append('isLatest', String(formData.isLatest))
    
    // Handle image: prefer file over URL
    if (formData.imageFile) {
      formDataToSend.append('image', formData.imageFile)
    } else if (formData.image) {
      formDataToSend.append('image', formData.image)
    }
    
    if (isEditDialogOpen && selectedResult) {
      updateMutation.mutate({ id: selectedResult._id, formData: formDataToSend })
    } else {
      createMutation.mutate(formDataToSend)
    }
  }

  // Handle file change with preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, imageFile: file })
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  // Handle removing image
  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "", imageFile: null })
    setImagePreview(null)
  }

  const openEditDialog = (result: any) => {
    setSelectedResult(result)
    setFormData({
      title: result.title,
      description: result.description,
      organization: result.organization,
      link: result.link,
      image: result.image || "",
      category: result.category,
      isLatest: result.isLatest,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (result: any) => {
    setSelectedResult(result)
    setIsDeleteDialogOpen(true)
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
              <Building2 className="h-8 w-8" />
              Manage Government Results
            </h1>
            <p className="text-muted-foreground">
              Add, edit, and manage government exam results
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Result
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4" />
            <p>No results found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result: any) => (
              <Card key={result._id} className="overflow-hidden">
                {/* Image */}
                <div className="h-40 bg-muted flex items-center justify-center relative">
                  {result.image ? (
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">{result.organization}</p>
                    </div>
                  )}
                  {result.isLatest && (
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Latest
                    </Badge>
                  )}
                </div>

                <CardContent className="p-5">
                  <Badge variant="outline" className="mb-2">
                    {result.category}
                  </Badge>

                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {result.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {result.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Building2 className="h-4 w-4" />
                    {result.organization}
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(result)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => openDeleteDialog(result)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={() => {
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          setFormData(EMPTY_FORM)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Result" : "Add Government Result"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Update the government exam result details"
                : "Add a new government exam result"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., SSC CGL 2024 Result"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Short description..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Organization</label>
                <Input
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  placeholder="e.g., SSC"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">External Link</label>
              <Input
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://..."
                type="url"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                <ImageIcon className="h-4 w-4 inline mr-1" />
                Image (Upload or URL)
              </label>
              
              {/* Image Preview */}
              {(imagePreview || formData.image) && (
                <div className="mb-3 relative">
                  <img
                    src={imagePreview || formData.image}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </Button>
                </div>
              )}
              
              {/* File Upload */}
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mb-2"
              />
              
              {/* Or URL option */}
              <div className="text-xs text-muted-foreground text-center mb-1">OR enter URL</div>
              <Input
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://..."
                type="url"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isLatest"
                checked={formData.isLatest}
                onChange={(e) =>
                  setFormData({ ...formData, isLatest: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <label htmlFor="isLatest" className="text-sm">
                Mark as Latest
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setIsEditDialogOpen(false)
                  setFormData(EMPTY_FORM)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                {createMutation.isLoading || updateMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isEditDialogOpen ? (
                  "Update"
                ) : (
                  "Add Result"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Result</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedResult?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(selectedResult._id)}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
