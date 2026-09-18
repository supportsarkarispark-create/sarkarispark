"use client"

import { useState, useEffect } from "react"
import { mediaAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { Folder, Image as ImageIcon, X, Upload } from "lucide-react"
import { getImageUrl } from "@/lib/api"

interface MediaLibraryProps {
  open: boolean
  onClose: () => void
  onSelect: (imagePath: string) => void
}

export function MediaLibrary({ open, onClose, onSelect }: MediaLibraryProps) {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  useEffect(() => {
    if (open) {
      fetchImages()
    }
  }, [open])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const response = await mediaAPI.getImages()
      setImages(response.data?.images || [])
    } catch (error: any) {
      console.error("Failed to load images:", error)
      alert("Failed to load media library: " + (error.response?.data?.error || error.message))
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) return

    try {
      const formData = new FormData()
      formData.append('images', uploadFile)
      formData.append('folder', 'general')

      const response = await mediaAPI.uploadImage(formData)
      
      // Backend returns { success: true, media: [...] }
      const uploadedMedia = response.data?.media?.[0] || response.data
      const imageUrl = uploadedMedia?.url || uploadedMedia?.path

      if (imageUrl) {
        onSelect(imageUrl)
        onClose()
        setUploadFile(null)
        // Refresh the images list after upload
        fetchImages()
      } else {
        alert("Upload succeeded but no image URL returned")
      }
    } catch (error: any) {
      console.error("Upload failed:", error)
      alert("Upload failed: " + (error.response?.data?.error || error.message || "Unknown error"))
    }
  }

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Media Library
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload New Image */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Upload New Image</h4>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="flex-1 text-sm"
              />
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={!uploadFile}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
            </div>
          </div>

          {/* Select from Library */}
          <div>
            <h4 className="text-sm font-medium mb-3">Select from Library</h4>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading images...
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No images in library yet.</p>
                <p className="text-xs mt-1">Upload an image above to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === image
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedImage === image && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSelect} disabled={!selectedImage}>
              Select Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MediaLibrary
