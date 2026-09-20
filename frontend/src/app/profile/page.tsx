"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Badge } from "@/components/ui/Badge"
import { Progress } from "@/components/ui/Progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Target,
  Languages,
  Crown,
  Award,
  Trophy,
  BookOpen,
  Calendar,
  Settings,
  Shield,
  Clock,
  Save,
  Loader2,
  Camera,
  ChevronRight,
  Sparkles,
  Zap,
  Trash2,
} from "lucide-react"
import toast from "react-hot-toast"
import { getImageUrl } from "@/lib/api"

const EXAM_CATEGORIES = ["SSC", "Banking", "Railway", "UPSC", "State", "Defence", "Teaching", "Other"]

export default function ProfilePage() {
  const { user, updateUser, uploadAvatar, updatePassword } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    education: "",
    city: "",
    state: "",
    targetExams: [] as string[],
    preferredLanguage: "en",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        education: user.profile?.education || "",
        city: user.profile?.city || "",
        state: user.profile?.state || "",
        targetExams: user.profile?.targetExams || [],
        preferredLanguage: user.profile?.preferredLanguage || "en",
      })
    }
  }, [user])

  const handleToggleExam = (exam: string) => {
    setFormData((prev) => ({
      ...prev,
      targetExams: prev.targetExams.includes(exam)
        ? prev.targetExams.filter((e) => e !== exam)
        : [...prev.targetExams, exam],
    }))
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1 * 1024 * 1024) {
      toast.error("Image size should be less than 1MB")
      return
    }

    const formData = new FormData()
    formData.append("avatar", file)

    setIsUploading(true)
    try {
      await uploadAvatar(formData)
    } catch (error) {
    } finally {
      setIsUploading(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (!user?.avatar) return

    if (!confirm("Are you sure you want to delete your profile picture?")) {
      return
    }

    setIsUploading(true)
    try {
      await updateUser({ avatar: "" })
      toast.success("Profile picture deleted successfully")
    } catch (error) {
      toast.error("Failed to delete profile picture")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateUser(formData)
    } catch (error) {
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsChangingPassword(true)
    try {
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setIsPasswordDialogOpen(false)
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col justify-between pb-20 md:pb-0">
        <Navbar />
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Login to View Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Apna profile dekhne aur edit karne ke liye kripya apne account me login karein.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login">
                <Button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-5">
                  Login to Account
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full rounded-xl font-bold text-sm py-5">
                  Create New Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950">
      <Navbar />

      {/* Dynamic Header */}
      <div className="relative h-48 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 h-full flex items-end pb-6">
          <div className="flex items-center gap-6 z-10">
            <div className="relative group">
              <div className="h-32 w-32 rounded-3xl border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                {isUploading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                ) : user.avatar ? (
                  <img src={getImageUrl(user.avatar)} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <User className="h-16 w-16 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <label className="absolute -bottom-2 -right-2 p-2.5 bg-white dark:bg-slate-800 text-primary rounded-2xl shadow-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700 group-hover:scale-110">
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                </label>
                {user.avatar && (
                  <button
                    type="button"
                    onClick={handleAvatarDelete}
                    disabled={isUploading}
                    className="absolute -bottom-2 left-0 p-2.5 bg-red-500 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-red-600 transition-all border border-red-400 group-hover:scale-110"
                    title="Delete profile picture"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="text-white mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md px-3 py-1">
                  {user.subscriptionType === "free" ? "Free Member" : "Pro Member"}
                </Badge>
              </div>
              <p className="text-white/80 mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4" /> {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-4">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Quick Stats & Profile Navigation */}
          <div className="lg:col-span-4 space-y-6">
            {/* Completion Card */}
            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Profile Strength</h3>
                  <span className="text-primary font-bold">75%</span>
                </div>
                <Progress value={75} className="h-2 bg-slate-100 dark:bg-slate-800" />
                <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Complete your academic details to get better recommendations
                </p>
              </CardContent>
            </Card>

            {/* Performance Card */}
            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-500" />
                  Learning Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-2">
                      <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      {user.stats?.totalExamsAttempted || 0}
                    </p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Attempts</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-2">
                      <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      {user.stats?.averageScore || 0}%
                    </p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Avg Score</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5" />
                      <span className="text-sm font-bold">Overall Rank</span>
                    </div>
                    <span className="text-lg font-black">#{user.stats?.rank || "---"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Card */}
            <Card className="border-none shadow-xl shadow-indigo-200/20 dark:shadow-none bg-gradient-to-br from-indigo-600 to-blue-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 opacity-10 -translate-y-1/4 translate-x-1/4">
                <Crown className="h-48 w-48" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-400" />
                  Subscription Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-xs opacity-70 uppercase font-bold tracking-widest mb-1">Active Plan</p>
                  <p className="text-2xl font-black uppercase">{user.subscriptionType} Access</p>
                  {user.subscriptionExpiry && (
                    <p className="text-xs mt-2 flex items-center gap-1 opacity-80">
                      <Calendar className="h-3 w-3" />
                      Expires: {new Date(user.subscriptionExpiry).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {user.subscriptionType === "free" ? (
                  <Link href="/payment" className="w-full">
                    <Button className="w-full bg-white text-indigo-700 hover:bg-slate-50 font-bold h-12 rounded-xl shadow-lg">
                      Upgrade to Premium
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/payment" className="w-full">
                    <Button className="w-full bg-white text-indigo-700 hover:bg-slate-50 font-bold h-12 rounded-xl shadow-lg flex items-center justify-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      View Plan & Days Left
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-8 space-y-8">
            <form onSubmit={handleSubmit}>
              <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-50 dark:border-slate-800 pb-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Personal Information</CardTitle>
                      <CardDescription>Update your account settings and preferences</CardDescription>
                    </div>
                    <Button type="submit" disabled={isSaving} className="h-11 px-8 rounded-xl shadow-lg shadow-primary/20 gap-2">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Profile
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  {/* Basic Details Section */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User className="h-4 w-4" /> Basic Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-600 dark:text-slate-400 font-semibold">Full Name</Label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="pl-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-600 dark:text-slate-400 font-semibold">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="email"
                            value={user.email}
                            readOnly
                            className="pl-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-600 dark:text-slate-400 font-semibold">Phone Number</Label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="pl-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-all"
                            placeholder="+91 00000 00000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Section */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Academic & Location
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="education" className="text-slate-600 dark:text-slate-400 font-semibold">Qualification</Label>
                        <Input
                          id="education"
                          value={formData.education}
                          onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
                          placeholder="e.g. Graduate"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-slate-600 dark:text-slate-400 font-semibold">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
                          placeholder="Your City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-slate-600 dark:text-slate-400 font-semibold">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
                          placeholder="Your State"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Learning Preferences Section */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Target className="h-4 w-4" /> Exam Preferences
                    </h3>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-slate-600 dark:text-slate-400 font-semibold">Target Exams</Label>
                        <div className="flex flex-wrap gap-3">
                          {EXAM_CATEGORIES.map((exam) => (
                            <button
                              key={exam}
                              type="button"
                              onClick={() => handleToggleExam(exam)}
                              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border ${
                                formData.targetExams.includes(exam)
                                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/30"
                                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary"
                              }`}
                            >
                              {exam}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-slate-600 dark:text-slate-400 font-semibold">Preferred Language</Label>
                        <div className="flex gap-4">
                          {[
                            { label: "English", value: "en" },
                            { label: "Hindi", value: "hi" },
                          ].map((lang) => (
                            <button
                              key={lang.value}
                              type="button"
                              onClick={() => setFormData({ ...formData, preferredLanguage: lang.value })}
                              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 font-bold transition-all ${
                                formData.preferredLanguage === lang.value
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700"
                              }`}
                            >
                              <Languages className="h-5 w-5" />
                              {lang.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>

            {/* Account Security Card */}
            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="border-b border-slate-50 dark:border-slate-800">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                      <Clock className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-slate-800 dark:text-slate-100 font-bold">Account Activity</p>
                      <p className="text-sm text-slate-500">
                        Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="h-12 px-8 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold gap-2"
                    onClick={() => setIsPasswordDialogOpen(true)}
                    type="button"
                  >
                    <Settings className="h-4 w-4" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modern Dialog for Password */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none">
          <DialogHeader className="p-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <DialogTitle className="text-2xl font-bold">Secure Update</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update your password to keep your account safe
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="p-8 space-y-6 bg-white dark:bg-slate-900">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                required
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                required
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsPasswordDialogOpen(false)} className="flex-1 rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingPassword} className="flex-1 rounded-xl h-12 shadow-lg shadow-primary/20">
                {isChangingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Update Now
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
