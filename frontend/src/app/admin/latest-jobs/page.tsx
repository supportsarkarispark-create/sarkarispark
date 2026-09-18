"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { latestJobsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Label } from "@/components/ui/Label"
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
  Calendar,
  Briefcase,
  Image as ImageIcon,
} from "lucide-react"
import toast from "react-hot-toast"

interface LatestJobForm {
  title: string
  description: string
  organization: string
  link: string
  isLatest: boolean
  postDate: string
  lastDate: string
  image?: string
}

const EMPTY_FORM: LatestJobForm = {
  title: "",
  description: "",
  organization: "",
  link: "",
  isLatest: true,
  postDate: new Date().toISOString().split('T')[0],
  lastDate: "",
}

interface LatestJobFormWithFile extends LatestJobForm {
  imageFile?: File | null
}

export default function AdminLatestJobsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [formData, setFormData] = useState<LatestJobFormWithFile>(EMPTY_FORM)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { data: jobsData, isLoading } = useQuery(
    ["admin-latest-jobs", searchQuery],
    () =>
      latestJobsAPI.getAllLatestJobsAdmin({
        search: searchQuery || undefined,
      })
  )

  const jobs = jobsData?.data?.jobs || []

  const createMutation = useMutation(
    (formDataToSend: FormData) => latestJobsAPI.createLatestJob(formDataToSend),
    {
      onSuccess: () => {
        toast.success("Job added successfully")
        queryClient.invalidateQueries(["admin-latest-jobs"])
        setIsAddDialogOpen(false)
        setFormData(EMPTY_FORM)
        setImagePreview(null)
      },
      onError: () => {
        toast.error("Failed to add job")
      },
    }
  )

  const updateMutation = useMutation(
    ({ id, formDataToSend }: { id: string; formDataToSend: FormData }) =>
      latestJobsAPI.updateLatestJob(id, formDataToSend),
    {
      onSuccess: () => {
        toast.success("Job updated successfully")
        queryClient.invalidateQueries(["admin-latest-jobs"])
        setIsEditDialogOpen(false)
        setSelectedJob(null)
        setImagePreview(null)
      },
      onError: () => {
        toast.error("Failed to update job")
      },
    }
  )

  const deleteMutation = useMutation(
    (id: string) => latestJobsAPI.deleteLatestJob(id),
    {
      onSuccess: () => {
        toast.success("Job deleted successfully")
        queryClient.invalidateQueries(["admin-latest-jobs"])
        setIsDeleteDialogOpen(false)
        setSelectedJob(null)
      },
      onError: () => {
        toast.error("Failed to delete job")
      },
    }
  )

  const toggleLatestMutation = useMutation(
    (id: string) => latestJobsAPI.toggleLatest(id),
    {
      onSuccess: () => {
        toast.success("Latest status updated")
        queryClient.invalidateQueries(["admin-latest-jobs"])
      },
      onError: () => {
        toast.error("Failed to update status")
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.organization || !formData.link || !formData.lastDate) {
      toast.error("Please fill in all required fields")
      return
    }

    const formDataToSend = new FormData()
    formDataToSend.append('title', formData.title)
    formDataToSend.append('description', formData.description)
    formDataToSend.append('organization', formData.organization)
    formDataToSend.append('link', formData.link)
    formDataToSend.append('isLatest', String(formData.isLatest))
    formDataToSend.append('postDate', formData.postDate)
    formDataToSend.append('lastDate', formData.lastDate)
    
    if (formData.imageFile) {
      formDataToSend.append('image', formData.imageFile)
    }
    
    if (isEditDialogOpen && selectedJob) {
      updateMutation.mutate({ id: selectedJob._id, formDataToSend })
    } else {
      createMutation.mutate(formDataToSend)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, imageFile: file })
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const openEditDialog = (job: any) => {
    setSelectedJob(job)
    setFormData({
      title: job.title,
      description: job.description,
      organization: job.organization,
      link: job.link,
      isLatest: job.isLatest,
      postDate: new Date(job.postDate).toISOString().split('T')[0],
      lastDate: new Date(job.lastDate).toISOString().split('T')[0],
      image: job.image,
    })
    setImagePreview(job.image || null)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (job: any) => {
    setSelectedJob(job)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Manage Latest Jobs</h1>
              <p className="text-muted-foreground text-sm">Create and manage job notifications</p>
            </div>
          </div>
          <Button onClick={() => { setFormData(EMPTY_FORM); setImagePreview(null); setIsAddDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Job
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table/Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job: any) => (
              <Card key={job._id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {job.image ? (
                        <img src={job.image} alt="" className="h-full w-full object-cover rounded" />
                      ) : (
                        <Building2 className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold line-clamp-1">{job.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {job.organization}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last Date: {new Date(job.lastDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={job.isLatest ? "text-green-600" : "text-muted-foreground"}
                      onClick={() => toggleLatestMutation.mutate(job._id)}
                      disabled={toggleLatestMutation.isLoading}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      {job.isLatest ? "Latest" : "Set Latest"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(job)}>
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(job)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <a href={job.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          setSelectedJob(null)
          setImagePreview(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "Edit Job" : "Add New Job"}</DialogTitle>
            <DialogDescription>
              Enter the job notification details below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. SSC CGL 2024 Recruitment"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Staff Selection Commission"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of the job"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Notification Link *</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postDate">Post Date</Label>
                <Input
                  id="postDate"
                  type="date"
                  value={formData.postDate}
                  onChange={(e) => setFormData({ ...formData, postDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastDate">Last Date to Apply *</Label>
                <Input
                  id="lastDate"
                  type="date"
                  value={formData.lastDate}
                  onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo/Image</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative h-20 w-20 rounded border overflow-hidden group">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setFormData({ ...formData, imageFile: null }); }}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded border-2 border-dashed flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isLatest"
                checked={formData.isLatest}
                onChange={(e) => setFormData({ ...formData, isLatest: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isLatest" className="cursor-pointer">Show as &quot;Latest Job&quot;</Label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
                {(createMutation.isLoading || updateMutation.isLoading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditDialogOpen ? "Update Job" : "Create Job"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the job notification for &quot;{selectedJob?.title}&quot;.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(selectedJob._id)}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
