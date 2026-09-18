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
  AlertCircle
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
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Sarkari Admit Cards</h1>
            <p className="text-muted-foreground">
              Manage government exam admit card announcements
            </p>
          </div>
          <Button onClick={() => {
            resetForm()
            setIsAddDialogOpen(true)
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Admit Card
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search admit cards..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Latest</p>
              <p className="text-2xl font-bold text-green-600">
                {admitCards.filter((ac: any) => ac.isLatest).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-blue-600">
                {admitCards.filter((ac: any) => ac.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold text-purple-600">
                {admitCards.reduce((sum: number, ac: any) => sum + (ac.viewCount || 0), 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admit Cards Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Admit Cards ({total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : admitCards.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No admit cards found</p>
                <Button onClick={() => {
                  resetForm()
                  setIsAddDialogOpen(true)
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Admit Card
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-medium">Title</th>
                      <th className="text-left p-4 font-medium">Post Name</th>
                      <th className="text-left p-4 font-medium">Release Date</th>
                      <th className="text-left p-4 font-medium">Last Date</th>
                      <th className="text-left p-4 font-medium">Views</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admitCards.map((admitCard: any) => (
                      <tr key={admitCard._id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <div>
                            <p className="font-medium line-clamp-1">{admitCard.title}</p>
                            {admitCard.postName && (
                              <p className="text-xs text-muted-foreground">{admitCard.postName}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(admitCard.admitCardReleaseDate), "MMM dd, yyyy")}
                          </div>
                        </td>
                        <td className="p-4">
                          {admitCard.lastDateToDownload ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(admitCard.lastDateToDownload), "MMM dd, yyyy")}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {admitCard.viewCount || 0}
                          </div>
                        </td>
                        <td className="p-4">
                          {admitCard.isLatest && (
                            <Badge className="bg-amber-100 text-amber-800 gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Latest
                            </Badge>
                          )}
                          <Badge variant={admitCard.isActive ? "default" : "secondary"}>
                            {admitCard.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(admitCard)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLatestMutation.mutate({ id: admitCard._id })}
                              title="Toggle Featured"
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActiveMutation.mutate(admitCard._id)}
                              title="Toggle Active"
                            >
                              {admitCard.isActive ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAdmitCard(admitCard)
                                setIsDeleteDialogOpen(true)
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
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
                <label className="text-sm font-medium">Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      // Handle file upload - for now store as base64 or send to upload endpoint
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setFormData({ ...formData, image: reader.result as string })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
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
                  placeholder="e.g., View Description"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description Image</label>
                <Input
                  type="file"
                  accept="image/*"
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
                {formData.descriptionImage && (
                  <div className="mt-2">
                    <img
                      src={formData.descriptionImage}
                      alt="Description Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
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
                <label className="text-sm font-medium">Image</label>
                <Input
                  type="file"
                  accept="image/*"
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
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
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
                <label className="text-sm font-medium">Description Image</label>
                <Input
                  type="file"
                  accept="image/*"
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
                {formData.descriptionImage && (
                  <div className="mt-2">
                    <img
                      src={formData.descriptionImage}
                      alt="Description Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
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
      <Footer />
    </div>
  )
}
