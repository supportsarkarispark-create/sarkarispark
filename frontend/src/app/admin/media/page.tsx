"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { mediaAPI, getImageUrl } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent } from "@/components/ui/Card"
import Navbar from "@/components/layout/Navbar"
import {
  Search,
  Upload,
  Trash2,
  Folder,
  Image as ImageIcon,
  X,
  Grid3X3,
  List,
  Copy,
  Check
} from "lucide-react"

export default function MediaLibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFolder, setActiveFolder] = useState("all")
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const queryClient = useQueryClient()

  // Fetch media
  const { data: mediaData, isLoading } = useQuery(
    ["media", activeFolder],
    () => mediaAPI.getAll({ folder: activeFolder === "all" ? undefined : activeFolder })
  )

  // Fetch folders
  const { data: foldersData } = useQuery(["media-folders"], () => mediaAPI.getFolders())

  const media = mediaData?.data?.media || []
  const folders = foldersData?.data?.folders || []

  // Filter by search
  const filteredMedia = media.filter((item: any) =>
    item.originalName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Upload mutation
  const uploadMutation = useMutation(
    async () => {
      if (!uploadFiles || uploadFiles.length === 0) return
      const formData = new FormData()
      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append("images", uploadFiles[i])
      }
      formData.append("folder", activeFolder === "all" ? "general" : activeFolder)
      return mediaAPI.upload(formData)
    },
    {
      onSuccess: () => {
        setUploadFiles(null)
        queryClient.invalidateQueries(["media"])
      },
    }
  )

  // Delete mutation
  const deleteMutation = useMutation(
    (id: string) => mediaAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["media"])
      },
    }
  )

  const handleUpload = async () => {
    setIsUploading(true)
    await uploadMutation.mutateAsync()
    setIsUploading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return
    await deleteMutation.mutateAsync(id)
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(getImageUrl(url))
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ImageIcon className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Media Library</h1>
              </div>
              <p className="text-white/80">Manage all your images in one place</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Upload Images</p>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop images here, or click to browse. Supports JPG, PNG, GIF, WebP, SVG.
              </p>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setUploadFiles(e.target.files)}
                className="hidden"
                id="media-upload"
              />
              <div className="flex gap-2 justify-center">
                <Button asChild variant="outline">
                  <label htmlFor="media-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
                {uploadFiles && uploadFiles.length > 0 && (
                  <Button onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? "Uploading..." : `Upload ${uploadFiles.length} Image(s)`}
                  </Button>
                )}
              </div>

              {uploadFiles && uploadFiles.length > 0 && (
                <div className="mt-4 text-left max-w-md mx-auto">
                  <p className="text-sm font-medium mb-2">Selected files:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {Array.from(uploadFiles).map((file, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={activeFolder}
              onChange={(e) => setActiveFolder(e.target.value)}
              className="px-3 py-2 border rounded-md bg-white"
            >
              <option value="all">All Folders</option>
              {folders.map((folder: string) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-primary text-white" : "bg-white"}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-primary text-white" : "bg-white"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted" />
              </Card>
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No images found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Upload some images to get started"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map((item: any) => (
              <Card key={item._id} className="group overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={getImageUrl(item.url)}
                    alt={item.originalName}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopyUrl(item.url)}
                    >
                      {copiedUrl === item.url ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium truncate">{item.originalName}</p>
                  <p className="text-xs text-muted-foreground">
                    {(item.size / 1024).toFixed(1)} KB
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMedia.map((item: any) => (
              <Card key={item._id} className="group">
                <CardContent className="p-4 flex items-center gap-4">
                  <img
                    src={getImageUrl(item.url)}
                    alt={item.originalName}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.originalName}</p>
                    <p className="text-sm text-muted-foreground">
                      {(item.size / 1024).toFixed(1)} KB • {item.mimetype} • {item.folder}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyUrl(item.url)}
                    >
                      {copiedUrl === item.url ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item._id)}
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
    </div>
  )
}
