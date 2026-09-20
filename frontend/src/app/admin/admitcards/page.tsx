"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  FileText,
  Calendar,
  Download,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react"
import toast from "react-hot-toast"
import { format } from "date-fns"

export default function AdminAdmitCardsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAdmitCard, setSelectedAdmitCard] = useState<any>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    postName: "",
    image: "",
    descriptionText: "",
    descriptionImage: "",
    admitCardReleaseDate: "",
    lastDateToDownload: "",
    downloadLink: "",
    isLatest: false
  })

  const { data: admitCardsData, isLoading } = useQuery(
    ["admin-sarkari-admit-cards", currentPage, searchQuery],
    async () => {
      const params: any = {
        page: currentPage,
        limit: 50
      }
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      const response = await api.get("/sarkari-admit-cards/admin/all", { params })
      return response
    }
  )

  const admitCards = admitCardsData?.data?.admitCards || []
  const total = admitCardsData?.data?.total || 0
  const pages = admitCardsData?.data?.pages || 0

  const createMutation = useMutation(
    async (data: any) => {
      const response = await api.post("/sarkari-admit-cards", data)
      return response
    },
    {
      onSuccess: () => {
        toast.success("Admit card created successfully")
        queryClient.invalidateQueries({ queryKey: ["admin-sarkari-admit-cards"] })
        setIsAddDialogOpen(false)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create admit card")
      }
    }
  )

  const updateMutation = useMutation(
    async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/sarkari-admit-cards/${id}`, data)
      return response
    },
    {
      onSuccess: () => {
        toast.success("Admit card updated successfully")
        queryClient.invalidateQueries({ queryKey: ["admin-sarkari-admit-cards"] })
        setIsEditDialogOpen(false)
        setSelectedAdmitCard(null)
        resetForm()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update admit card")
      }
    }
  )

  const deleteMutation = useMutation(
    async (id: string) => {
      const response = await api.delete(`/sarkari-admit-cards/${id}`)
      return response
    },
    {
      onSuccess: () => {
        toast.success("Admit card deleted successfully")
        queryClient.invalidateQueries({ queryKey: ["admin-sarkari-admit-cards"] })
        setIsDeleteDialogOpen(false)
        setSelectedAdmitCard(null)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete admit card")
      }
    }
  )

  const toggleLatestMutation = useMutation(
    async ({ id }: { id: string }) => {
      return await api.patch(`/sarkari-admit-cards/${id}/latest`)
    },
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(["admin-sarkari-admit-cards"])
        toast.success(response.data.message || "Latest status updated successfully")
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update latest status")
      }
    }
  )

  const toggleActiveMutation = useMutation(
    async (id: string) => {
      const response = await api.patch(`/sarkari-admit-cards/${id}/active`)
      return response
    },
    {
      onSuccess: () => {
        toast.success("Active status updated")
        queryClient.invalidateQueries({ queryKey: ["admin-sarkari-admit-cards"] })
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update active status")
      }
    }
  )

  const resetForm = () => {
    setFormData({
      title: "",
      postName: "",
      image: "",
      descriptionText: "",
      descriptionImage: "",
      admitCardReleaseDate: "",
      lastDateToDownload: "",
      downloadLink: "",
      isLatest: false
    })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({ id: selectedAdmitCard._id, data: formData })
  }

  const openEditDialog = (admitCard: any) => {
    setSelectedAdmitCard(admitCard)
    setFormData({
      title: admitCard.title || "",
      postName: admitCard.postName || "",
      image: admitCard.image || "",
      descriptionText: admitCard.descriptionText || "",
      descriptionImage: admitCard.descriptionImage || "",
      admitCardReleaseDate: admitCard.admitCardReleaseDate ? format(new Date(admitCard.admitCardReleaseDate), "yyyy-MM-dd") : "",
      lastDateToDownload: admitCard.lastDateToDownload ? format(new Date(admitCard.lastDateToDownload), "yyyy-MM-dd") : "",
      downloadLink: admitCard.downloadLink || "",
      isLatest: admitCard.isLatest || false
    })
    setIsEditDialogOpen(true)
  }

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need admin privileges to manage admit cards.</p>
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
                <Button variant="ghost" size="sm" className="hover:bg-background/80 text-muted-foreground">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back to Admin Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Sarkari Admit Cards</h1>
                <p className="text-muted-foreground text-sm">
                  Publish, update, and manage official exam admit cards & hall tickets
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => {
            resetForm()
            setIsAddDialogOpen(true)
          }} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Admit Card
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-border/60 shadow-sm bg-card/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admit cards by title or post name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 h-10"
                />
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="text-xs"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid - Admin Control Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-border/60 shadow-sm bg-card/90 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Cards</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">{total}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">All announcements</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card/90 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Latest Marked</p>
                  <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                    {admitCards.filter((ac: any) => ac.isLatest).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Featured badge on</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card/90 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Status</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                    {admitCards.filter((ac: any) => ac.isActive).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Live on public site</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card/90 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Student Views</p>
                  <p className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                    {admitCards.reduce((sum: number, ac: any) => sum + (ac.viewCount || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Total page views</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Eye className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admit Cards Table */}
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/40 border-b border-border/40 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                <span>Admit Card Records</span>
                <Badge variant="secondary" className="font-mono text-xs">{total}</Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : admitCards.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No admit cards found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchQuery ? "No results match your search query." : "Get started by adding your first government admit card announcement."}
                </p>
                <Button onClick={() => {
                  resetForm()
                  setIsAddDialogOpen(true)
                }} size="sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add First Admit Card
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="text-left p-4">Image</th>
                      <th className="text-left p-4">Title & Post</th>
                      <th className="text-left p-4">Dates</th>
                      <th className="text-left p-4">Views</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {admitCards.map((admitCard: any) => (
                      <tr key={admitCard._id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-4">
                          {admitCard.image ? (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(admitCard.image)}
                              className="h-12 w-12 rounded-lg overflow-hidden border border-border/80 bg-muted block hover:opacity-80 transition-opacity"
                              title="Click to view image"
                            >
                              <img
                                src={admitCard.image}
                                alt={admitCard.title}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-[10px] border border-dashed border-border text-center p-1">
                              No image
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="max-w-md">
                            <p className="font-semibold text-foreground leading-snug">{admitCard.title}</p>
                            {admitCard.postName && (
                              <p className="text-xs text-muted-foreground mt-0.5">{admitCard.postName}</p>
                            )}
                            {admitCard.downloadLink && (
                              <a
                                href={admitCard.downloadLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1.5"
                              >
                                <span>Official Download Link</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-foreground">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Release: {format(new Date(admitCard.admitCardReleaseDate), "dd MMM yyyy")}</span>
                            </div>
                            {admitCard.lastDateToDownload && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="font-mono text-[10px] bg-muted px-1 rounded">Last:</span>
                                <span>{format(new Date(admitCard.lastDateToDownload), "dd MMM yyyy")}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Eye className="h-3.5 w-3.5" />
                            <span className="font-mono font-medium text-foreground">{admitCard.viewCount || 0}</span>
                          </div>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <button
                              type="button"
                              onClick={() => toggleActiveMutation.mutate(admitCard._id)}
                              className="cursor-pointer"
                              title="Click to toggle Active / Inactive"
                            >
                              <Badge
                                variant={admitCard.isActive ? "default" : "secondary"}
                                className={`text-[11px] gap-1 cursor-pointer ${
                                  admitCard.isActive
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                              >
                                {admitCard.isActive ? (
                                  <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                  </>
                                ) : (
                                  "Inactive"
                                )}
                              </Badge>
                            </button>
                            {admitCard.isLatest && (
                              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] gap-1">
                                <TrendingUp className="h-2.5 w-2.5" />
                                Latest
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                              onClick={() => openEditDialog(admitCard)}
                              title="Edit Admit Card"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-8 p-0 ${
                                admitCard.isLatest
                                  ? "text-amber-600 hover:bg-amber-500/10"
                                  : "text-muted-foreground hover:bg-muted"
                              }`}
                              onClick={() => toggleLatestMutation.mutate({ id: admitCard._id })}
                              title={admitCard.isLatest ? "Unmark Latest" : "Mark as Latest"}
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelectedAdmitCard(admitCard)
                                setIsDeleteDialogOpen(true)
                              }}
                              title="Delete Admit Card"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {pages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
              disabled={currentPage === pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Admit Card
            </DialogTitle>
            <DialogDescription>
              Create a new admit card announcement
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., SSC CGL 2024 Admit Card"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Post Name</label>
                <Input
                  value={formData.postName}
                  onChange={(e) => setFormData({ ...formData, postName: e.target.value })}
                  placeholder="e.g., Combined Graduate Level"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image (Direct URL or Upload)</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Paste image URL (e.g. https://i.ibb.co/...)"
                    className="flex-1"
                  />
                  <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3 whitespace-nowrap">
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setFormData({ ...formData, image: reader.result as string })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-border"
                      onError={(e) => {
                        (e.target as any).style.display = "none"
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive h-7 px-2"
                      onClick={() => setFormData({ ...formData, image: "" })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admit Card Release Date *</label>
                  <Input
                    type="date"
                    value={formData.admitCardReleaseDate}
                    onChange={(e) => setFormData({ ...formData, admitCardReleaseDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Date to Download</label>
                  <Input
                    type="date"
                    value={formData.lastDateToDownload}
                    onChange={(e) => setFormData({ ...formData, lastDateToDownload: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Download Link *</label>
                <Input
                  value={formData.downloadLink}
                  onChange={(e) => setFormData({ ...formData, downloadLink: e.target.value })}
                  placeholder="https://example.com/admit-card-download"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description Text</label>
                <Input
                  value={formData.descriptionText}
                  onChange={(e) => setFormData({ ...formData, descriptionText: e.target.value })}
                  placeholder="e.g., View Detailed Notification / Syllabus"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description Image (Direct URL or Upload)</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.descriptionImage}
                    onChange={(e) => setFormData({ ...formData, descriptionImage: e.target.value })}
                    placeholder="Paste description image URL (e.g. https://i.ibb.co/...)"
                    className="flex-1"
                  />
                  <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3 whitespace-nowrap">
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setFormData({ ...formData, descriptionImage: reader.result as string })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.descriptionImage && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={formData.descriptionImage}
                      alt="Description Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-border"
                      onError={(e) => {
                        (e.target as any).style.display = "none"
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive h-7 px-2"
                      onClick={() => setFormData({ ...formData, descriptionImage: "" })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isLatest"
                  checked={formData.isLatest}
                  onChange={(e) => setFormData({ ...formData, isLatest: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="isLatest" className="text-sm font-medium">Mark as Latest</label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isLoading}>
                {createMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create Admit Card
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Admit Card
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Post Name</label>
                <Input
                  value={formData.postName}
                  onChange={(e) => setFormData({ ...formData, postName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image (Direct URL or Upload)</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Paste image URL (e.g. https://i.ibb.co/...)"
                    className="flex-1"
                  />
                  <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3 whitespace-nowrap">
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setFormData({ ...formData, image: reader.result as string })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-border"
                      onError={(e) => {
                        (e.target as any).style.display = "none"
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive h-7 px-2"
                      onClick={() => setFormData({ ...formData, image: "" })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admit Card Release Date *</label>
                  <Input
                    type="date"
                    value={formData.admitCardReleaseDate}
                    onChange={(e) => setFormData({ ...formData, admitCardReleaseDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Date to Download</label>
                  <Input
                    type="date"
                    value={formData.lastDateToDownload}
                    onChange={(e) => setFormData({ ...formData, lastDateToDownload: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Download Link *</label>
                <Input
                  value={formData.downloadLink}
                  onChange={(e) => setFormData({ ...formData, downloadLink: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description Text</label>
                <Input
                  value={formData.descriptionText}
                  onChange={(e) => setFormData({ ...formData, descriptionText: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description Image (Direct URL or Upload)</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.descriptionImage}
                    onChange={(e) => setFormData({ ...formData, descriptionImage: e.target.value })}
                    placeholder="Paste description image URL (e.g. https://i.ibb.co/...)"
                    className="flex-1"
                  />
                  <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3 whitespace-nowrap">
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setFormData({ ...formData, descriptionImage: reader.result as string })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.descriptionImage && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={formData.descriptionImage}
                      alt="Description Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-border"
                      onError={(e) => {
                        (e.target as any).style.display = "none"
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive h-7 px-2"
                      onClick={() => setFormData({ ...formData, descriptionImage: "" })}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isLatestEdit"
                  checked={formData.isLatest}
                  onChange={(e) => setFormData({ ...formData, isLatest: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="isLatestEdit" className="text-sm font-medium">Mark as Latest</label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isLoading}>
                {updateMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Update Admit Card
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admit Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this admit card? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedAdmitCard && deleteMutation.mutate(selectedAdmitCard._id)}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-4">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Admit Card Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-2 bg-muted/20 rounded-lg">
            {previewImage && (
              <img
                src={previewImage}
                alt="Admit Card Preview"
                className="max-h-[75vh] w-auto rounded-lg object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
