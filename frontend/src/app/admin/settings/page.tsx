"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { settingsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  ArrowLeft,
  Save,
  Loader2,
  Settings,
  Users,
  BookOpen,
  FileQuestion,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Send,
} from "lucide-react"
import toast from "react-hot-toast"

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: settingsData, isLoading } = useQuery(
    ["settings"],
    () => settingsAPI.getSettings()
  )

  const settings = settingsData?.data?.settings

  const [heroStats, setHeroStats] = useState({
    activeStudents: "",
    mockTests: "",
    questions: "",
    selections: "",
  })

  const [heroBadge, setHeroBadge] = useState("")
  const [heroTitle, setHeroTitle] = useState({ line1: "", line2: "" })
  const [heroDescription, setHeroDescription] = useState("")

  // Contact Info State
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
    address: "",
    whatsapp: "",
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    telegram: "",
  })

  // Initialize form when data loads
  useEffect(() => {
    if (settings) {
      setHeroStats(settings.heroStats || {
        activeStudents: "",
        mockTests: "",
        questions: "",
        selections: "",
      })
      setHeroBadge(settings.heroBadge || "")
      setHeroTitle(settings.heroTitle || { line1: "", line2: "" })
      setHeroDescription(settings.heroDescription || "")
      if (settings.contactInfo) {
        setContactInfo(settings.contactInfo)
      }
    }
  }, [settings])

  const updateMutation = useMutation(
    (data: any) => settingsAPI.updateSettings(data),
    {
      onSuccess: () => {
        toast.success("Settings updated successfully")
        queryClient.invalidateQueries(["settings"])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update settings")
      },
    }
  )

  const handleSave = () => {
    updateMutation.mutate({
      heroStats,
      heroBadge,
      heroTitle,
      heroDescription,
      contactInfo,
    })
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
              <Settings className="h-8 w-8" />
              Site Settings
            </h1>
            <p className="text-muted-foreground">
              Manage homepage hero section content
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isLoading}
            className="gap-2"
          >
            {updateMutation.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero Stats Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Hero Section Stats
                </CardTitle>
                <CardDescription>
                  These numbers appear in the stats section below the hero
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Active Students</label>
                    <Input
                      value={heroStats.activeStudents}
                      onChange={(e) =>
                        setHeroStats({ ...heroStats, activeStudents: e.target.value })
                      }
                      placeholder="e.g., 1L+"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mock Tests</label>
                    <Input
                      value={heroStats.mockTests}
                      onChange={(e) =>
                        setHeroStats({ ...heroStats, mockTests: e.target.value })
                      }
                      placeholder="e.g., 500+"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Questions</label>
                    <Input
                      value={heroStats.questions}
                      onChange={(e) =>
                        setHeroStats({ ...heroStats, questions: e.target.value })
                      }
                      placeholder="e.g., 50K+"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selections</label>
                    <Input
                      value={heroStats.selections}
                      onChange={(e) =>
                        setHeroStats({ ...heroStats, selections: e.target.value })
                      }
                      placeholder="e.g., 10K+"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hero Content Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Hero Content
                </CardTitle>
                <CardDescription>
                  Main hero section text and badge
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Badge Text</label>
                  <Input
                    value={heroBadge}
                    onChange={(e) => setHeroBadge(e.target.value)}
                    placeholder="e.g., Trusted by 1,00,000+ Students"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title Line 1</label>
                    <Input
                      value={heroTitle.line1}
                      onChange={(e) =>
                        setHeroTitle({ ...heroTitle, line1: e.target.value })
                      }
                      placeholder="e.g., Crack Your Dream"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title Line 2</label>
                    <Input
                      value={heroTitle.line2}
                      onChange={(e) =>
                        setHeroTitle({ ...heroTitle, line2: e.target.value })
                      }
                      placeholder="e.g., Government Job"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={heroDescription}
                    onChange={(e) => setHeroDescription(e.target.value)}
                    placeholder="Hero section description..."
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Section */}
            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Website contact details and social media links (displayed in footer and contact page)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700">Contact Details</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        Email Address
                      </label>
                      <Input
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="e.g., support@sarkarispark.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        Phone Number
                      </label>
                      <Input
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="e.g., +91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        Address
                      </label>
                      <Input
                        value={contactInfo.address}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="e.g., New Delhi, India"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-gray-500" />
                        WhatsApp
                      </label>
                      <Input
                        value={contactInfo.whatsapp}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                        placeholder="e.g., +91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm text-gray-700">Social Media Links</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        Facebook
                      </label>
                      <Input
                        value={contactInfo.facebook}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, facebook: e.target.value }))}
                        placeholder="https://facebook.com/sarkarispark"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Twitter className="h-4 w-4 text-blue-400" />
                        Twitter
                      </label>
                      <Input
                        value={contactInfo.twitter}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, twitter: e.target.value }))}
                        placeholder="https://twitter.com/sarkarispark"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-pink-600" />
                        Instagram
                      </label>
                      <Input
                        value={contactInfo.instagram}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, instagram: e.target.value }))}
                        placeholder="https://instagram.com/sarkarispark"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Youtube className="h-4 w-4 text-red-600" />
                        YouTube
                      </label>
                      <Input
                        value={contactInfo.youtube}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, youtube: e.target.value }))}
                        placeholder="https://youtube.com/sarkarispark"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-blue-700" />
                        LinkedIn
                      </label>
                      <Input
                        value={contactInfo.linkedin}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, linkedin: e.target.value }))}
                        placeholder="https://linkedin.com/company/sarkarispark"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Send className="h-4 w-4 text-blue-500" />
                        Telegram
                      </label>
                      <Input
                        value={contactInfo.telegram}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, telegram: e.target.value }))}
                        placeholder="https://t.me/sarkarispark"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
