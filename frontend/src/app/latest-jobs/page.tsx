"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import Link from "next/link"
import { latestJobsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import LatestNotificationsSection from "@/components/common/LatestNotificationsSection"
import {
  ExternalLink,
  Calendar,
  Building2,
  Search,
  Sparkles,
  Clock,
  Briefcase,
} from "lucide-react"

export default function LatestJobsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const { data: jobsData, isLoading } = useQuery(
    ["latest-jobs"],
    () => latestJobsAPI.getLatestJobs()
  )

  const jobs = jobsData?.data?.jobs || []
  const filteredJobs = searchQuery
    ? jobs.filter((j: any) =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.organization.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : jobs

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Latest Government Jobs
            </h1>
            <p className="text-white/80 text-lg">
              Stay updated with the newest job notifications from various government sectors
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job: any) => (
              <Card key={job._id} className="overflow-hidden hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
                <CardContent className="p-5">
                  {/* Tags */}
                  <div className="flex gap-2 mb-3">
                    {job.isLatest && (
                      <Badge className="bg-green-500">
                        <Sparkles className="h-3 w-3 mr-1" />
                        New
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                    {job.title}
                  </h3>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {job.organization}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Posted: {new Date(job.postDate).toLocaleDateString("en-IN")}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                      <Clock className="h-4 w-4" />
                      Last Date: {new Date(job.lastDate).toLocaleDateString("en-IN")}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Action Button */}
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full gap-2">
                      <Briefcase className="h-4 w-4" />
                      Apply Now
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Latest Notifications Board */}
      <LatestNotificationsSection className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 mt-12" />

      <Footer />
    </div>
  )
}
