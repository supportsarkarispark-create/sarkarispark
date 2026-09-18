"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery } from "react-query"
import { mediaAPI, getImageUrl } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Search, Upload, X, Folder, Image as ImageIcon, Trash2, Check } from "lucide-react"
import ImageCropper from "./ImageCropper"

interface ImagePickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (imageUrl: string) => void
  multiple?: boolean
  enableCrop?: boolean
  cropAspectRatio?: number
}

export default function ImagePicker({ isOpen, onClose, onSelect, multiple = false, enableCrop = false, cropAspectRatio = 1 }: ImagePickerProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFolder, setActiveFolder] = useState("all")
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string>("")

  // Fetch media
  const { data: mediaData, isLoading, refetch } = useQuery(
    ["media", activeFolder],
    () => mediaAPI.getAll({ folder: activeFolder === "all" ? undefined : activeFolder }),
    { enabled: isOpen }
  )

  // Fetch folders
  const { data: foldersData } = useQuery(["media-folders"], () => mediaAPI.getFolders(), { enabled: isOpen })

  const media = mediaData?.data?.media || []
  const folders = foldersData?.data?.folders || []

  // Filter by search
  const filteredMedia = media.filter((item: any) =>
    item.originalName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (imageUrl: string) => {
    if (enableCrop) {
      setImageToCrop(imageUrl)
      setShowCropper(true)
    } else if (multiple) {
      setSelectedImages((prev) =>
        prev.includes(imageUrl) ? prev.filter((url) => url !== imageUrl) : [...prev, imageUrl]
      )
    } else {
      onSelect(imageUrl)
      onClose()
    }
  }

  const handleCropComplete = async (croppedImage: string) => {
    // Convert base64 to blob and upload
    try {
      const response = await fetch(croppedImage)
      const blob = await response.blob()
      const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" })

      const formData = new FormData()
      formData.append("images", file)
      formData.append("folder", "founder")

      const uploadResponse = await mediaAPI.upload(formData)
      const uploadedUrl = uploadResponse?.data?.media?.[0]?.url

      if (uploadedUrl) {
        if (multiple) {
          setSelectedImages((prev) => [...prev, uploadedUrl])
        } else {
          onSelect(uploadedUrl)
        }
      }
    } catch (error) {
      console.error("Failed to upload cropped image:", error)
      // Fallback to base64 if upload fails
      if (multiple) {
        setSelectedImages((prev) => [...prev, croppedImage])
      } else {
        onSelect(croppedImage)
      }
    }
  }

  const handleConfirmMultiple = () => {
    if (multiple && selectedImages.length > 0) {
      onSelect(selectedImages.join(","))
      onClose()
      setSelectedImages([])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFiles(e.target.files)
    }
  }

  const handleUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) return

    setIsUploading(true)
    const formData = new FormData()
    for (let i = 0; i < uploadFiles.length; i++) {
      formData.append("images", uploadFiles[i])
    }
    formData.append("folder", activeFolder === "all" ? "general" : activeFolder)

    try {
      await mediaAPI.upload(formData)
      setUploadFiles(null)
      refetch()
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      await mediaAPI.delete(id)
      refetch()
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Media Library
          </DialogTitle>
          <DialogDescription>
            Select an image from your library or upload new ones
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="library" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 flex flex-col overflow-hidden mt-4">
            {/* Search and Filter */}
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
            </div>

            {/* Image Grid */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No images found</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {filteredMedia.map((item: any) => (
                    <div
                      key={item._id}
                      onClick={() => handleSelect(item.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-all ${
                        selectedImages.includes(item.url)
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={getImageUrl(item.url)}
                        alt={item.originalName}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Selection Overlay */}
                      {selectedImages.includes(item.url) && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => handleDelete(item._id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* File Name */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-white text-xs truncate">{item.originalName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Multiple Select Actions */}
            {multiple && selectedImages.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {selectedImages.length} image(s) selected
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedImages([])}>
                    Clear
                  </Button>
                  <Button onClick={handleConfirmMultiple}>Confirm Selection</Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Upload Images</p>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop images here, or click to browse
              </p>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="image-upload" className="cursor-pointer">
                  Choose Files
                </label>
              </Button>

              {uploadFiles && uploadFiles.length > 0 && (
                <div className="mt-6 text-left">
                  <p className="text-sm font-medium mb-2">Selected files:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {Array.from(uploadFiles).map((file, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-4"
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : `Upload ${uploadFiles.length} Image(s)`}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>

      <ImageCropper
        isOpen={showCropper}
        onClose={() => setShowCropper(false)}
        image={getImageUrl(imageToCrop)}
        onCropComplete={handleCropComplete}
        aspectRatio={cropAspectRatio}
      />
    </Dialog>
  )
}
