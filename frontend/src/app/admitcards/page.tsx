"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import LatestNotificationsSection from "@/components/common/LatestNotificationsSection"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import {
  Search,
  Calendar,
  Download,
  ExternalLink,
  GraduationCap,
  FileText,
  TrendingUp,
  X,
} from "lucide-react"
import api from "@/lib/api"
import { format } from "date-fns"

export default function AdmitCardsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showLatest, setShowLatest] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const { data: admitCardsData, isLoading } = useQuery(
    ["sarkari-admit-cards", currentPage, searchQuery, showLatest],
    async () => {
      const params: any = {
        page: currentPage,
        limit: 20
      }
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      if (showLatest) {
        params.latest = "true"
      }
      
      const response = await api.get("/sarkari-admit-cards", { params })
      return response
    }
  )

  const admitCards = admitCardsData?.data?.admitCards || []
  const total = admitCardsData?.data?.total || 0
  const pages = admitCardsData?.data?.pages || 0

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Admit Cards</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Download admit cards for all government exams - SSC, Railway, Banking, UPSC and more
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 border-border/60 shadow-sm bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search admit cards by exam title or post..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={showLatest ? "default" : "outline"}
                  onClick={() => {
                    setShowLatest(!showLatest)
                    setCurrentPage(1)
                  }}
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Latest
                </Button>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setShowLatest(false)
                      setCurrentPage(1)
                    }}
                    className="gap-1 text-xs text-muted-foreground"
                  >
                    <X className="h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admit Cards List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : admitCards.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Admit Cards Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Check back later for new admit card updates"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setShowLatest(false)
                    setCurrentPage(1)
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Data Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <tr>
                      <th className="text-left p-4 font-semibold text-foreground">Image</th>
                      <th className="text-left p-4 font-semibold text-foreground">Title</th>
                      <th className="text-left p-4 font-semibold text-foreground">Post Name</th>
                      <th className="text-left p-4 font-semibold text-foreground">Release Date</th>
                      <th className="text-left p-4 font-semibold text-foreground">Last Date</th>
                      <th className="text-left p-4 font-semibold text-foreground">Status</th>
                      <th className="text-center p-4 font-semibold text-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admitCards.map((admitCard: any) => (
                      <tr key={admitCard._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          {admitCard.image ? (
                            <div
                              className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedImage(admitCard.image)}
                            >
                              <img
                                src={admitCard.image}
                                alt={admitCard.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{admitCard.title}</span>
                            {admitCard.descriptionText && (
                              <span
                                onClick={() => setSelectedImage(admitCard.descriptionImage)}
                                className="text-xs text-primary hover:underline mt-1 cursor-pointer"
                              >
                                {admitCard.descriptionText}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">{admitCard.postName || '-'}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">
                              {format(new Date(admitCard.admitCardReleaseDate), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {admitCard.lastDateToDownload ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground">
                                {format(new Date(admitCard.lastDateToDownload), "MMM dd, yyyy")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {admitCard.isLatest && (
                              <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Latest
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Link href={admitCard.downloadLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          </>
        )}

        {/* Image View Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Admit Card Image</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Admit Card"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Latest Notifications Board */}
      <LatestNotificationsSection className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 mt-12" />

      <Footer />
    </div>
  )
}
