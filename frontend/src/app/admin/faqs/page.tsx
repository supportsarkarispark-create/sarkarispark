"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  HelpCircle,
  FolderOpen
} from "lucide-react"
import toast from "react-hot-toast"

export default function AdminFaqsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState<any>(null)

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General"
  })

  const { data: faqsData, isLoading } = useQuery(
    ["admin-faqs"],
    async () => {
      const response = await api.get("/faqs")
      return response.data
    }
  )

  const faqs = Array.isArray(faqsData?.data) ? faqsData.data : Array.isArray(faqsData?.faqs) ? faqsData.faqs : []

  const createMutation = useMutation(
    (data: any) => api.post("/faqs", data),
    {
      onSuccess: () => {
        toast.success("FAQ created successfully")
        setIsAddDialogOpen(false)
        resetForm()
        queryClient.invalidateQueries(["admin-faqs"])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create FAQ")
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, data }: any) => api.put(`/faqs/${id}`, data),
    {
      onSuccess: () => {
        toast.success("FAQ updated successfully")
        setIsEditDialogOpen(false)
        resetForm()
        queryClient.invalidateQueries(["admin-faqs"])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update FAQ")
      }
    }
  )

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/faqs/${id}`),
    {
      onSuccess: () => {
        toast.success("FAQ deleted successfully")
        setIsDeleteDialogOpen(false)
        setSelectedFaq(null)
        queryClient.invalidateQueries(["admin-faqs"])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete FAQ")
      }
    }
  )

  const resetForm = () => {
    setFormData({
      question: "",
      answer: "",
      category: "General"
    })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({ id: selectedFaq._id, data: formData })
  }

  const handleDelete = () => {
    if (selectedFaq) {
      deleteMutation.mutate(selectedFaq._id)
    }
  }

  const openEditDialog = (faq: any) => {
    setSelectedFaq(faq)
    setFormData({
      question: faq.question || "",
      answer: faq.answer || "",
      category: faq.category || "General"
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (faq: any) => {
    setSelectedFaq(faq)
    setIsDeleteDialogOpen(true)
  }

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <HelpCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don&apos;t have permission to access this page.</p>
          <Link href="/">
            <Button>Go Back Home</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 font-sans">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="icon" className="rounded-xl">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Manage FAQs</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">Manage student queries, bilingual answers & categories for homepage & help desk</p>
            </div>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            Add New FAQ
          </Button>
        </div>

        {/* FAQ List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.length === 0 ? (
              <Card className="rounded-3xl border-slate-200 dark:border-slate-800">
                <CardContent className="p-12 text-center">
                  <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="text-xl font-semibold mb-2">No FAQs Found</h3>
                  <p className="text-muted-foreground mb-4 text-sm">Get started by adding your first FAQ</p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First FAQ
                  </Button>
                </CardContent>
              </Card>
            ) : (
              faqs.map((faq: any) => (
                <Card key={faq._id} className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30">
                            {faq.category || "General"}
                          </Badge>
                          {faq.order !== undefined && (
                            <span className="text-[11px] text-slate-400 font-mono">Order: {faq.order}</span>
                          )}
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{faq.question}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl h-9 w-9"
                          onClick={() => openEditDialog(faq)}
                        >
                          <Edit className="h-4 w-4 text-indigo-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl h-9 w-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => openDeleteDialog(faq)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      <Footer />

      {/* Add FAQ Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
            <DialogDescription>Create a new frequently asked question for homepage & help desk</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Exams & Mock Tests, Results & Rankings, General"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Question *</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter your question"
                required
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Answer *</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Enter the answer"
                required
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {createMutation.isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Create FAQ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>Update the FAQ details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Exams & Mock Tests, Results & Rankings, General"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Question *</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter your question"
                required
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Answer *</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Enter the answer"
                required
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {updateMutation.isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Update FAQ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete FAQ Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-semibold">{selectedFaq?.question}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
