"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { settingsAPI, getImageUrl } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ImagePicker from "@/components/admin/ImagePicker"
import {
  ArrowLeft,
  Save,
  Loader2,
  Building2,
  Info,
  Target,
  Globe,
  Star,
  Plus,
  Trash2,
  GripVertical,
  Clock,
  Award,
  ImageIcon,
} from "lucide-react"
import toast from "react-hot-toast"

export default function AdminAboutPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: settingsData, isLoading } = useQuery(
    ["settings"],
    () => settingsAPI.getSettings()
  )

  const settings = settingsData?.data?.settings

  const [showImagePicker, setShowImagePicker] = useState(false)

  // About Section States
  const [aboutSection, setAboutSection] = useState({
    title: "",
    subtitle: "",
    description: "",
    founder: { name: "", role: "", image: "", description: "" },
    mission: { title: "", content: "" },
    vision: { title: "", content: "" },
    stats: { yearsExperience: "", studentsHelped: "", successRate: "" },
    values: [] as { icon: string; title: string; description: string }[],
    features: [] as { icon: string; title: string; description: string }[],
    journey: { title: "", milestones: [] as { year: string; title: string; description: string }[] },
  })

  // Initialize form when data loads
  useEffect(() => {
    if (settings) {
      if (settings.aboutSection) {
        setAboutSection(settings.aboutSection)
      }
    }
  }, [settings])

  const updateMutation = useMutation(
    (data: any) => settingsAPI.updateSettings(data),
    {
      onSuccess: () => {
        toast.success("About page updated successfully")
        queryClient.invalidateQueries(["settings"])
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update")
      },
    }
  )

  const handleSave = () => {
    updateMutation.mutate({
      aboutSection,
    })
  }

  // About Section Helpers
  const addValue = () => {
    setAboutSection(prev => ({
      ...prev,
      values: [...prev.values, { icon: "Star", title: "", description: "" }]
    }))
  }

  const updateValue = (index: number, field: string, value: string) => {
    setAboutSection(prev => ({
      ...prev,
      values: prev.values.map((v, i) => i === index ? { ...v, [field]: value } : v)
    }))
  }

  const removeValue = (index: number) => {
    setAboutSection(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }))
  }

  const addFeature = () => {
    setAboutSection(prev => ({
      ...prev,
      features: [...prev.features, { icon: "CheckCircle", title: "", description: "" }]
    }))
  }

  const updateFeature = (index: number, field: string, value: string) => {
    setAboutSection(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? { ...f, [field]: value } : f)
    }))
  }

  const removeFeature = (index: number) => {
    setAboutSection(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const addMilestone = () => {
    setAboutSection(prev => ({
      ...prev,
      journey: {
        ...prev.journey,
        milestones: [...prev.journey.milestones, { year: "", title: "", description: "" }]
      }
    }))
  }

  const updateMilestone = (index: number, field: string, value: string) => {
    setAboutSection(prev => ({
      ...prev,
      journey: {
        ...prev.journey,
        milestones: prev.journey.milestones.map((m, i) => i === index ? { ...m, [field]: value } : m)
      }
    }))
  }

  const removeMilestone = (index: number) => {
    setAboutSection(prev => ({
      ...prev,
      journey: {
        ...prev.journey,
        milestones: prev.journey.milestones.filter((_, i) => i !== index)
      }
    }))
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
              <Building2 className="h-8 w-8 text-pink-500" />
              About Page Content
            </h1>
            <p className="text-muted-foreground">
              Manage the About page content and sections
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
            {/* Founder Section */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Globe className="h-5 w-5" />
                  Founder Information
                </CardTitle>
                <CardDescription>
                  Founder details displayed on the About page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Founder Name</label>
                    <Input
                      value={aboutSection.founder?.name || ""}
                      onChange={(e) => setAboutSection(prev => ({ ...prev, founder: { ...prev.founder, name: e.target.value } }))}
                      placeholder="e.g., Dr. Rajesh Kumar"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Founder Role</label>
                    <Input
                      value={aboutSection.founder?.role || ""}
                      onChange={(e) => setAboutSection(prev => ({ ...prev, founder: { ...prev.founder, role: e.target.value } }))}
                      placeholder="e.g., Founder & CEO"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Founder Image</label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowImagePicker(true)}
                      className="gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      {aboutSection.founder?.image ? "Change Image" : "Select Image"}
                    </Button>
                    {aboutSection.founder?.image && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAboutSection(prev => ({ ...prev, founder: { ...prev.founder, image: "" } }))}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  {aboutSection.founder?.image && (
                    <div className="mt-2">
                      <img
                        src={getImageUrl(aboutSection.founder.image)}
                        alt="Founder preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-amber-200"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Founder Description</label>
                  <textarea
                    value={aboutSection.founder?.description || ""}
                    onChange={(e) => setAboutSection(prev => ({ ...prev, founder: { ...prev.founder, description: e.target.value } }))}
                    placeholder="Founder's background and vision..."
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* About Section - Header */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Info className="h-5 w-5" />
                  Header Content
                </CardTitle>
                <CardDescription>
                  Main header content for the About page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Page Title</label>
                  <Input
                    value={aboutSection.title}
                    onChange={(e) => setAboutSection(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., About Sarkari Spark"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subtitle</label>
                  <Input
                    value={aboutSection.subtitle}
                    onChange={(e) => setAboutSection(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="e.g., Empowering Aspirants, Building Futures"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={aboutSection.description}
                    onChange={(e) => setAboutSection(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Main description..."
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mission & Vision */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Target className="h-5 w-5" />
                  Mission & Vision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mission Title</label>
                    <Input
                      value={aboutSection.mission.title}
                      onChange={(e) => setAboutSection(prev => ({ ...prev, mission: { ...prev.mission, title: e.target.value } }))}
                      placeholder="e.g., Our Mission"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vision Title</label>
                    <Input
                      value={aboutSection.vision.title}
                      onChange={(e) => setAboutSection(prev => ({ ...prev, vision: { ...prev.vision, title: e.target.value } }))}
                      placeholder="e.g., Our Vision"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mission Content</label>
                    <textarea
                      value={aboutSection.mission.content}
                      onChange={(e) => setAboutSection(prev => ({ ...prev, mission: { ...prev.mission, content: e.target.value } }))}
                      placeholder="Mission content..."
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vision Content</label>
                    <textarea
                      value={aboutSection.vision.content}
                      onChange={(e) => setAboutSection(prev => ({ ...prev, vision: { ...prev.vision, content: e.target.value } }))}
                      placeholder="Vision content..."
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Award className="h-5 w-5" />
                  Statistics
                </CardTitle>
                <CardDescription>
                  Stats displayed in the About page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Years Experience</label>
                    <Input
                      value={aboutSection.stats.yearsExperience}
                      onChange={(e) => setAboutSection(prev => ({ ...prev, stats: { ...prev.stats, yearsExperience: e.target.value } }))}
                      placeholder="e.g., 5+"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Students Helped</label>
                    <Input
                      value={aboutSection.stats.studentsHelped}
                      onChange={(e) => setAboutSection(prev => ({ ...prev, stats: { ...prev.stats, studentsHelped: e.target.value } }))}
                      placeholder="e.g., 100K+"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Success Rate</label>
                    <Input
                      value={aboutSection.stats.successRate}
                      onChange={(e) => setAboutSection(prev => ({ ...prev, stats: { ...prev.stats, successRate: e.target.value } }))}
                      placeholder="e.g., 85%"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Core Values */}
            <Card className="border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Star className="h-5 w-5" />
                  Core Values
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addValue}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Value
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {aboutSection.values.map((value, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 bg-muted/50 rounded-lg">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1 grid md:grid-cols-3 gap-3">
                      <Input
                        value={value.icon}
                        onChange={(e) => updateValue(index, "icon", e.target.value)}
                        placeholder="Icon name (e.g., Target)"
                      />
                      <Input
                        value={value.title}
                        onChange={(e) => updateValue(index, "title", e.target.value)}
                        placeholder="Value title"
                      />
                      <Input
                        value={value.description}
                        onChange={(e) => updateValue(index, "description", e.target.value)}
                        placeholder="Value description"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeValue(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {aboutSection.values.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No values added yet</p>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Globe className="h-5 w-5" />
                  Features
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {aboutSection.features.map((feature, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 bg-muted/50 rounded-lg">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1 grid md:grid-cols-3 gap-3">
                      <Input
                        value={feature.icon}
                        onChange={(e) => updateFeature(index, "icon", e.target.value)}
                        placeholder="Icon name (e.g., CheckCircle)"
                      />
                      <Input
                        value={feature.title}
                        onChange={(e) => updateFeature(index, "title", e.target.value)}
                        placeholder="Feature title"
                      />
                      <Input
                        value={feature.description}
                        onChange={(e) => updateFeature(index, "description", e.target.value)}
                        placeholder="Feature description"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {aboutSection.features.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No features added yet</p>
                )}
              </CardContent>
            </Card>

            {/* Journey Milestones */}
            <Card className="border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Clock className="h-5 w-5" />
                  Journey Milestones
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Milestone
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Journey Title</label>
                  <Input
                    value={aboutSection.journey.title}
                    onChange={(e) => setAboutSection(prev => ({ ...prev, journey: { ...prev.journey, title: e.target.value } }))}
                    placeholder="e.g., Our Journey"
                  />
                </div>
                {aboutSection.journey.milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 bg-muted/50 rounded-lg">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                    <div className="flex-1 grid md:grid-cols-3 gap-3">
                      <Input
                        value={milestone.year}
                        onChange={(e) => updateMilestone(index, "year", e.target.value)}
                        placeholder="Year (e.g., 2020)"
                      />
                      <Input
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, "title", e.target.value)}
                        placeholder="Milestone title"
                      />
                      <Input
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, "description", e.target.value)}
                        placeholder="Milestone description"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeMilestone(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {aboutSection.journey.milestones.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No milestones added yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ImagePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(imageUrl) => setAboutSection(prev => ({ ...prev, founder: { ...prev.founder, image: imageUrl } }))}
        enableCrop={true}
        cropAspectRatio={1}
      />

      <Footer />
    </div>
  )
}
