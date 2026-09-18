"use client"

import { useState } from "react"
import { useQuery, useMutation } from "react-query"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { examsAPI, adminAPI, couponsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Switch } from "@/components/ui/Switch"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  ArrowLeft,
  Save,
  Loader2,
  Crown,
  Search,
  Filter,
  DollarSign,
  Check,
  X,
  Plus,
  Tag,
  Percent,
  Trash2,
  Edit,
  Eye,
  Sparkles,
  AlertCircle,
  Copy,
} from "lucide-react"
import toast from "react-hot-toast"

interface DurationPricingData {
  price?: number
  pricePerExam?: number
  discountPrice?: number | null
  isActive: boolean
  minExams?: number
  maxExams?: number
  features?: string[]
}

function SmartDurationPricingCard({
  title,
  data,
  onChange,
  isPerExam = false,
}: {
  title: string
  data: DurationPricingData
  onChange: (updated: DurationPricingData) => void
  isPerExam?: boolean
}) {
  const currentData = data || { price: 0, discountPrice: null, isActive: false }
  const mrp = isPerExam ? (currentData.pricePerExam ?? 0) : (currentData.price ?? 0)
  const rawOffer = currentData.discountPrice
  const offerPrice = rawOffer !== null && rawOffer !== undefined && rawOffer !== ("" as any) ? Number(rawOffer) : null
  const hasDiscount = offerPrice !== null && offerPrice > 0 && offerPrice < mrp
  const savings = hasDiscount ? mrp - offerPrice : 0
  const discountPercent = hasDiscount && mrp > 0 ? Math.round((savings / mrp) * 100) : 0
  const isSuspiciousDiscount = hasDiscount && offerPrice <= mrp * 0.35 && mrp >= 20

  const handleApplyPercent = (pct: number) => {
    if (mrp <= 0) return
    const calculatedOffer = Math.round(mrp * (1 - pct / 100))
    onChange({ ...currentData, discountPrice: calculatedOffer })
  }

  const handleApplyFlatDiscount = (discountAmt: number) => {
    if (mrp <= 0 || discountAmt <= 0) return
    const calculatedOffer = Math.max(1, mrp - discountAmt)
    onChange({ ...currentData, discountPrice: calculatedOffer })
  }

  return (
    <div
      className={`border-2 rounded-xl p-4 transition-all ${
        currentData.isActive
          ? "border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
          : "border-slate-200 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-950/40 opacity-75"
      }`}
    >
      {/* Header with Switch */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{title}</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              currentData.isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {currentData.isActive ? "● Active (Website par dikhega)" : "○ Inactive (Website par hidden)"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Show Plan:</span>
          <Switch
            checked={currentData.isActive}
            onCheckedChange={(checked) => onChange({ ...currentData, isActive: checked })}
          />
        </div>
      </div>

      {!currentData.isActive ? (
        <p className="text-xs text-slate-400 italic">
          Yeh duration option student payment page par nahi dikhega kyunki toggle OFF hai. Enable karne ke liye switch on karein.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* MRP Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{isPerExam ? "Regular MRP per Exam (₹)" : "Original MRP (₹)"}</span>
                <span className="text-[10px] font-normal text-slate-400">Asli keemat (Strikethrough)</span>
              </label>
              <Input
                type="number"
                min={0}
                value={mrp || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0
                  if (isPerExam) {
                    onChange({ ...currentData, pricePerExam: val })
                  } else {
                    onChange({ ...currentData, price: val })
                  }
                }}
                placeholder="e.g. 50, 299"
                className="h-10 font-semibold"
              />
            </div>

            {/* Offer / Selling Price Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="text-indigo-600 dark:text-indigo-400">
                  {isPerExam ? "Offer Price per Exam (₹)" : "Offer / Final Selling Price (₹)"}
                </span>
                <span className="text-[10px] font-normal text-slate-400">Student ye pay karega</span>
              </label>
              <Input
                type="number"
                min={0}
                value={currentData.discountPrice !== null && currentData.discountPrice !== undefined ? currentData.discountPrice : ""}
                onChange={(e) => {
                  const raw = e.target.value.trim()
                  onChange({ ...currentData, discountPrice: raw === "" ? null : parseInt(raw) || 0 })
                }}
                placeholder="Optional (Khali chhodne par MRP charge hogi)"
                className="h-10 font-semibold border-indigo-200 dark:border-indigo-800/80 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* If perExam, min/max exams */}
          {isPerExam && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Minimum Selected Exams</label>
                <Input
                  type="number"
                  min={1}
                  value={currentData.minExams ?? 2}
                  onChange={(e) => onChange({ ...currentData, minExams: parseInt(e.target.value) || 1 })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Maximum Selected Exams</label>
                <Input
                  type="number"
                  min={1}
                  value={currentData.maxExams ?? 10}
                  onChange={(e) => onChange({ ...currentData, maxExams: parseInt(e.target.value) || 10 })}
                  className="h-9"
                />
              </div>
            </div>
          )}

          {/* Quick Preset Buttons */}
          {mrp > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-500 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Quick Discount:
              </span>
              <button
                type="button"
                onClick={() => handleApplyPercent(10)}
                className="text-[11px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                10% OFF
              </button>
              <button
                type="button"
                onClick={() => handleApplyPercent(20)}
                className="text-[11px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                20% OFF
              </button>
              <button
                type="button"
                onClick={() => handleApplyPercent(30)}
                className="text-[11px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                30% OFF
              </button>
              <button
                type="button"
                onClick={() => handleApplyPercent(50)}
                className="text-[11px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                50% OFF
              </button>
              {offerPrice !== null && (
                <button
                  type="button"
                  onClick={() => onChange({ ...currentData, discountPrice: null })}
                  className="text-[11px] px-2 py-0.5 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 font-medium transition-colors ml-auto"
                >
                  Clear Discount (No Offer)
                </button>
              )}
            </div>
          )}

          {/* Live Student Preview Card */}
          <div className="pt-2">
            {hasDiscount ? (
              <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-emerald-900 dark:text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    Student View Preview (Website Par Aisa Dikhega):
                  </span>
                  <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {discountPercent}% OFF
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline gap-2 text-slate-800 dark:text-slate-100">
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{offerPrice}
                    {isPerExam && <span className="text-xs font-normal">/exam</span>}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{mrp}
                    {isPerExam && <span className="text-[10px]">/exam</span>}
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                    (Student ki ₹{savings} bachat hogi)
                  </span>
                </div>

                {/* Smart Safety Alert if discount seems accidental */}
                {isSuspiciousDiscount && (
                  <div className="pt-2 border-t border-emerald-200/70 dark:border-emerald-800/70 text-[11px] text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span>
                      ⚠️ <strong>Check Karein:</strong> Student se sirf <strong>₹{offerPrice}</strong> liye jayenge (₹{savings} chhoot milegi). Agar aap <strong>₹{offerPrice} ka discount</strong> dekar <strong>₹{mrp - offerPrice}</strong> me bechna chahte the:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyFlatDiscount(offerPrice)}
                      className="shrink-0 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 text-amber-900 dark:text-amber-100 font-bold px-2.5 py-1 rounded-md text-[10px] transition-colors border border-amber-300 dark:border-amber-700 shadow-sm"
                    >
                      Offer Price ₹{mrp - offerPrice} set karein →
                    </button>
                  </div>
                )}
              </div>
            ) : offerPrice !== null && offerPrice >= mrp ? (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-2.5 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Offer Price (₹{offerPrice}) Original MRP (₹{mrp}) se kam honi chahiye. Agar discount nahi dena hai, toh Offer Price box khali chhod dein.
                </span>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  Student View Preview: <strong className="text-slate-800 dark:text-slate-200">₹{mrp}{isPerExam ? "/exam" : ""}</strong> (Koi discount nahi • Regular MRP charge hogi)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PricingManagementPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [editingExam, setEditingExam] = useState<string | null>(null)
  const [localPricing, setLocalPricing] = useState<any>({})
  const [activeTab, setActiveTab] = useState<"pricing" | "subscription" | "coupons">("pricing")
  const [showCouponForm, setShowCouponForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<any>(null)
  const [subscriptionPricing, setSubscriptionPricing] = useState<any>({
    singleExam: {
      monthly: { price: 99, discountPrice: null, isActive: true, features: ['Access to 1 selected exam'] },
      sixMonths: { price: 249, discountPrice: null, isActive: true, features: ['Access to 1 selected exam'] },
      yearly: { price: 399, discountPrice: null, isActive: true, features: ['Access to 1 selected exam'] }
    },
    customSelection: {
      monthly: { pricePerExam: 79, minExams: 2, maxExams: 10, discountPrice: null, isActive: true, features: ['Select multiple exams'] },
      sixMonths: { pricePerExam: 199, minExams: 2, maxExams: 10, discountPrice: null, isActive: true, features: ['Select multiple exams'] },
      yearly: { pricePerExam: 349, minExams: 2, maxExams: 10, discountPrice: null, isActive: true, features: ['Select multiple exams'] }
    },
    allExams: {
      monthly: { price: 299, discountPrice: null, isActive: true, features: ['Access to all premium exams', 'Unlimited mock tests', 'Detailed analytics', 'Ad-free experience'] },
      sixMonths: { price: 799, discountPrice: null, isActive: true, features: ['Access to all premium exams', 'Unlimited mock tests', 'Detailed analytics', 'Ad-free experience'] },
      yearly: { price: 1499, discountPrice: null, isActive: true, features: ['All Monthly features', '2 months free', 'Priority support', 'Exclusive study materials'] }
    }
  })
  const [couponFormData, setCouponFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    maxDiscount: 0,
    minPurchaseAmount: 0,
    applicableOn: "all",
    usageLimit: null as number | null,
    userLimit: 1,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: ""
  })

  const { data: settingsData, refetch: refetchSettings } = useQuery(
    ["site-settings-pricing"],
    async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const res = await fetch(`${baseUrl}/settings`)
      return res.json()
    },
    {
      refetchOnWindowFocus: true,
      onSuccess: (data) => {
        if (data?.success && data?.settings?.subscriptionPricing) {
          setSubscriptionPricing(data.settings.subscriptionPricing)
        }
      }
    }
  )

  const { data: examsData, isLoading, refetch } = useQuery(
    ["exams-for-pricing"],
    () => examsAPI.getExams({ limit: 100 }),
    {
      refetchOnWindowFocus: false,
      enabled: activeTab === "pricing"
    }
  )

  const { data: couponsData, isLoading: couponsLoading, refetch: refetchCoupons } = useQuery(
    ["coupons"],
    () => couponsAPI.getCoupons(),
    {
      refetchOnWindowFocus: false,
      enabled: activeTab === "coupons"
    }
  )

  const createCouponMutation = useMutation(
    (data: any) => couponsAPI.createCoupon(data),
    {
      onSuccess: () => {
        toast.success("Coupon created successfully!")
        setShowCouponForm(false)
        setCouponFormData({
          code: "",
          description: "",
          discountType: "percentage",
          discountValue: 0,
          maxDiscount: 0,
          minPurchaseAmount: 0,
          applicableOn: "all",
          usageLimit: null,
          userLimit: 1,
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: ""
        })
        refetchCoupons()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create coupon")
      },
    }
  )

  const updateCouponMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => couponsAPI.updateCoupon(id, data),
    {
      onSuccess: () => {
        toast.success("Coupon updated successfully!")
        setShowCouponForm(false)
        setEditingCoupon(null)
        setCouponFormData({
          code: "",
          description: "",
          discountType: "percentage",
          discountValue: 0,
          maxDiscount: 0,
          minPurchaseAmount: 0,
          applicableOn: "all",
          usageLimit: null,
          userLimit: 1,
          validFrom: new Date().toISOString().split('T')[0],
          validUntil: ""
        })
        refetchCoupons()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update coupon")
      },
    }
  )

  const deleteCouponMutation = useMutation(
    (id: string) => couponsAPI.deleteCoupon(id),
    {
      onSuccess: () => {
        toast.success("Coupon deleted successfully!")
        refetchCoupons()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete coupon")
      },
    }
  )

  const updateSubscriptionPricingMutation = useMutation(
    async (data: any) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const res = await fetch(`${baseUrl}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ subscriptionPricing: data })
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update subscription pricing")
      }
      return res.json()
    },
    {
      onSuccess: (resData) => {
        if (resData?.settings?.subscriptionPricing) {
          setSubscriptionPricing(resData.settings.subscriptionPricing)
        }
        refetchSettings()
        toast.success("Subscription pricing updated successfully!")
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update subscription pricing")
      },
    }
  )

  const updateMutation = useMutation(
    ({ examId, pricing }: { examId: string; pricing: any }) => 
      adminAPI.updateExam(examId, { pricing }),
    {
      onSuccess: () => {
        toast.success("Pricing updated successfully!")
        setEditingExam(null)
        refetch()
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update pricing")
      },
    }
  )

  const handleSave = (examId: string) => {
    updateMutation.mutate({ examId, pricing: localPricing[examId] })
  }

  const handleCancel = (examId: string) => {
    setEditingExam(null)
    delete localPricing[examId]
  }

  const handlePricingChange = (examId: string, field: string, value: any) => {
    setLocalPricing((prev: any) => ({
      ...prev,
      [examId]: {
        ...prev[examId],
        [field]: value
      }
    }))
  }

  const handleNestedPricingChange = (examId: string, type: string, field: string, value: any) => {
    setLocalPricing((prev: any) => ({
      ...prev,
      [examId]: {
        ...prev[examId],
        pricing: {
          ...prev[examId]?.pricing,
          [type]: {
            ...prev[examId]?.pricing?.[type],
            [field]: value
          }
        }
      }
    }))
  }

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon._id, data: couponFormData })
    } else {
      createCouponMutation.mutate(couponFormData)
    }
  }

  const handleEditCoupon = (coupon: any) => {
    setEditingCoupon(coupon)
    setCouponFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount || 0,
      minPurchaseAmount: coupon.minPurchaseAmount || 0,
      applicableOn: coupon.applicableOn,
      usageLimit: coupon.usageLimit,
      userLimit: coupon.userLimit,
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : ""
    })
    setShowCouponForm(true)
  }

  const handleDeleteCoupon = (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      deleteCouponMutation.mutate(id)
    }
  }

  const handleCancelCouponForm = () => {
    setShowCouponForm(false)
    setEditingCoupon(null)
    setCouponFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      maxDiscount: 0,
      minPurchaseAmount: 0,
      applicableOn: "all",
      usageLimit: null,
      userLimit: 1,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: ""
    })
  }

  const handleApplyCouponTemplate = (type: 'flat50' | 'welcome10' | 'pro20' | 'mega50') => {
    const today = new Date().toISOString().split('T')[0]
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    if (type === 'flat50') {
      setCouponFormData({
        code: 'FLAT50',
        description: 'Flat ₹50 OFF on plans',
        discountType: 'fixed',
        discountValue: 50,
        maxDiscount: 0,
        minPurchaseAmount: 100,
        applicableOn: 'all',
        usageLimit: null,
        userLimit: 1,
        validFrom: today,
        validUntil: nextYear
      })
    } else if (type === 'welcome10') {
      setCouponFormData({
        code: 'WELCOME10',
        description: '10% Welcome discount for students',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 50,
        minPurchaseAmount: 0,
        applicableOn: 'all',
        usageLimit: null,
        userLimit: 1,
        validFrom: today,
        validUntil: nextYear
      })
    } else if (type === 'pro20') {
      setCouponFormData({
        code: 'PRO20',
        description: '20% special discount on All Exams Pro Pass',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 200,
        minPurchaseAmount: 0,
        applicableOn: 'allExams',
        usageLimit: null,
        userLimit: 1,
        validFrom: today,
        validUntil: nextYear
      })
    } else if (type === 'mega50') {
      setCouponFormData({
        code: 'MEGA50',
        description: '50% Mega Bumper Discount',
        discountType: 'percentage',
        discountValue: 50,
        maxDiscount: 500,
        minPurchaseAmount: 150,
        applicableOn: 'all',
        usageLimit: 100,
        userLimit: 1,
        validFrom: today,
        validUntil: nextYear
      })
    }
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

  const exams = examsData?.data?.exams || []
  const filteredExams = exams.filter((exam: any) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || exam.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories: string[] = Array.from(new Set(exams.map((e: any) => e.category as string)))
  const coupons = couponsData?.data?.coupons || []

  if (isLoading && activeTab === "pricing") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-primary" />
                Pricing Management
              </h1>
              <p className="text-muted-foreground">Manage exam pricing and coupon codes</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "pricing" ? "default" : "outline"}
            onClick={() => setActiveTab("pricing")}
          >
            <Crown className="h-4 w-4 mr-2" />
            Exam Pricing
          </Button>
          <Button
            variant={activeTab === "subscription" ? "default" : "outline"}
            onClick={() => setActiveTab("subscription")}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Subscription Pricing
          </Button>
          <Button
            variant={activeTab === "coupons" ? "default" : "outline"}
            onClick={() => setActiveTab("coupons")}
          >
            <Tag className="h-4 w-4 mr-2" />
            Coupon Codes
          </Button>
        </div>

        {/* Filters - Only show for pricing tab */}
        {activeTab === "pricing" && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search exams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Table */}
        {activeTab === "pricing" && (
          <Card>
            <CardHeader>
              <CardTitle>Exam Pricing</CardTitle>
              <CardDescription>
                {filteredExams.length} exams found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredExams.map((exam: any) => {
                const isEditing = editingExam === exam.id
                const currentPricing = localPricing[exam.id] || exam.pricing || {
                  oneTime: { price: 0, discountPrice: 0, isActive: true },
                  monthly: { price: 0, discountPrice: 0, isActive: false },
                  yearly: { price: 0, discountPrice: 0, isActive: false }
                }

                return (
                  <div key={exam.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{exam.title}</h3>
                          {exam.isPremium && (
                            <Badge variant="secondary" className="gap-1">
                              <Crown className="h-3 w-3" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{exam.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {exam.totalQuestions} questions • {exam.duration} mins
                        </p>
                      </div>
                      {!isEditing ? (
                        <Button
                          onClick={() => {
                            setEditingExam(exam.id)
                            setLocalPricing((prev: any) => ({
                              ...prev,
                              [exam.id]: exam.pricing || {
                                oneTime: { price: 0, discountPrice: 0, isActive: true },
                                monthly: { price: 0, discountPrice: 0, isActive: false },
                                yearly: { price: 0, discountPrice: 0, isActive: false }
                              }
                            }))
                          }}
                          size="sm"
                        >
                          Edit Pricing
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSave(exam.id)}
                            size="sm"
                            disabled={updateMutation.isLoading}
                          >
                            {updateMutation.isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => handleCancel(exam.id)}
                            variant="outline"
                            size="sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="space-y-3 pt-4 border-t">
                        {/* One-Time Purchase */}
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Switch
                                checked={currentPricing.pricing?.oneTime?.isActive || false}
                                onCheckedChange={(checked) => 
                                  handleNestedPricingChange(exam.id, 'oneTime', 'isActive', checked)
                                }
                              />
                              <span className="text-sm font-medium">One-Time Purchase</span>
                            </label>
                          </div>
                          {(currentPricing.pricing?.oneTime?.isActive || false) && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Original MRP (₹)</label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={currentPricing.pricing?.oneTime?.price || 0}
                                    onChange={(e) => 
                                      handleNestedPricingChange(exam.id, 'oneTime', 'price', parseInt(e.target.value) || 0)
                                    }
                                    className="h-8 text-xs font-medium"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Offer Price (₹)</label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={currentPricing.pricing?.oneTime?.discountPrice || 0}
                                    onChange={(e) => 
                                      handleNestedPricingChange(exam.id, 'oneTime', 'discountPrice', parseInt(e.target.value) || 0)
                                    }
                                    className="h-8 text-xs font-medium"
                                    placeholder="Optional"
                                  />
                                </div>
                              </div>
                              {currentPricing.pricing?.oneTime?.discountPrice > 0 && currentPricing.pricing?.oneTime?.discountPrice < currentPricing.pricing?.oneTime?.price && (
                                <p className="text-[11px] text-emerald-600 font-medium">
                                  Preview: Student pays ₹{currentPricing.pricing.oneTime.discountPrice} (Save ₹{currentPricing.pricing.oneTime.price - currentPricing.pricing.oneTime.discountPrice})
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Monthly Subscription */}
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Switch
                                checked={currentPricing.pricing?.monthly?.isActive || false}
                                onCheckedChange={(checked) => 
                                  handleNestedPricingChange(exam.id, 'monthly', 'isActive', checked)
                                }
                              />
                              <span className="text-sm font-medium">Monthly Subscription</span>
                            </label>
                          </div>
                          {(currentPricing.pricing?.monthly?.isActive || false) && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Original MRP (₹)</label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={currentPricing.pricing?.monthly?.price || 0}
                                    onChange={(e) => 
                                      handleNestedPricingChange(exam.id, 'monthly', 'price', parseInt(e.target.value) || 0)
                                    }
                                    className="h-8 text-xs font-medium"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Offer Price (₹)</label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={currentPricing.pricing?.monthly?.discountPrice || 0}
                                    onChange={(e) => 
                                      handleNestedPricingChange(exam.id, 'monthly', 'discountPrice', parseInt(e.target.value) || 0)
                                    }
                                    className="h-8 text-xs font-medium"
                                    placeholder="Optional"
                                  />
                                </div>
                              </div>
                              {currentPricing.pricing?.monthly?.discountPrice > 0 && currentPricing.pricing?.monthly?.discountPrice < currentPricing.pricing?.monthly?.price && (
                                <p className="text-[11px] text-emerald-600 font-medium">
                                  Preview: Student pays ₹{currentPricing.pricing.monthly.discountPrice} (Save ₹{currentPricing.pricing.monthly.price - currentPricing.pricing.monthly.discountPrice})
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Yearly Subscription */}
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Switch
                                checked={currentPricing.pricing?.yearly?.isActive || false}
                                onCheckedChange={(checked) => 
                                  handleNestedPricingChange(exam.id, 'yearly', 'isActive', checked)
                                }
                              />
                              <span className="text-sm font-medium">Yearly Subscription</span>
                            </label>
                          </div>
                          {(currentPricing.pricing?.yearly?.isActive || false) && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Original MRP (₹)</label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={currentPricing.pricing?.yearly?.price || 0}
                                    onChange={(e) => 
                                      handleNestedPricingChange(exam.id, 'yearly', 'price', parseInt(e.target.value) || 0)
                                    }
                                    className="h-8 text-xs font-medium"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Offer Price (₹)</label>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={currentPricing.pricing?.yearly?.discountPrice || 0}
                                    onChange={(e) => 
                                      handleNestedPricingChange(exam.id, 'yearly', 'discountPrice', parseInt(e.target.value) || 0)
                                    }
                                    className="h-8 text-xs font-medium"
                                    placeholder="Optional"
                                  />
                                </div>
                              </div>
                              {currentPricing.pricing?.yearly?.discountPrice > 0 && currentPricing.pricing?.yearly?.discountPrice < currentPricing.pricing?.yearly?.price && (
                                <p className="text-[11px] text-emerald-600 font-medium">
                                  Preview: Student pays ₹{currentPricing.pricing.yearly.discountPrice} (Save ₹{currentPricing.pricing.yearly.price - currentPricing.pricing.yearly.discountPrice})
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex gap-4 pt-4 border-t text-sm">
                        {currentPricing.pricing?.oneTime?.isActive && (
                          <div className="flex items-center gap-1">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>One-Time: ₹{currentPricing.pricing.oneTime.price}</span>
                          </div>
                        )}
                        {currentPricing.pricing?.monthly?.isActive && (
                          <div className="flex items-center gap-1">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Monthly: ₹{currentPricing.pricing.monthly.price}</span>
                          </div>
                        )}
                        {currentPricing.pricing?.yearly?.isActive && (
                          <div className="flex items-center gap-1">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>Yearly: ₹{currentPricing.pricing.yearly.price}</span>
                          </div>
                        )}
                        {!currentPricing.pricing?.oneTime?.isActive && 
                         !currentPricing.pricing?.monthly?.isActive && 
                         !currentPricing.pricing?.yearly?.isActive && (
                          <span className="text-muted-foreground">No pricing set</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {filteredExams.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No exams found matching your search
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Subscription Pricing Section */}
        {activeTab === "subscription" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Subscription Pricing</h2>
            </div>

            <div className="space-y-6">
              {/* Plan 1: Single Exam */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    Plan 1: Single Exam (Per Exam Pass)
                  </CardTitle>
                  <CardDescription>Student 1 target exam select karega aur uske liye pay karega</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "monthly", label: "Monthly (1 Month)" },
                    { id: "sixMonths", label: "6 Months Plan" },
                    { id: "yearly", label: "Yearly (1 Year Plan)" },
                  ].map((dur) => (
                    <SmartDurationPricingCard
                      key={dur.id}
                      title={dur.label}
                      data={subscriptionPricing?.singleExam?.[dur.id] || { price: 0, discountPrice: null, isActive: false }}
                      onChange={(updated) =>
                        setSubscriptionPricing({
                          ...subscriptionPricing,
                          singleExam: {
                            ...subscriptionPricing.singleExam,
                            [dur.id]: updated,
                          },
                        })
                      }
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Plan 2: Custom Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    Plan 2: Custom Combo Selection (Pay per selected exam)
                  </CardTitle>
                  <CardDescription>Student 2 se 10 exams select karega aur per exam ke hisaab se pay karega</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "monthly", label: "Monthly (1 Month)" },
                    { id: "sixMonths", label: "6 Months Plan" },
                    { id: "yearly", label: "Yearly (1 Year Plan)" },
                  ].map((dur) => (
                    <SmartDurationPricingCard
                      key={dur.id}
                      title={dur.label}
                      isPerExam={true}
                      data={subscriptionPricing?.customSelection?.[dur.id] || { pricePerExam: 0, discountPrice: null, isActive: false, minExams: 2, maxExams: 10 }}
                      onChange={(updated) =>
                        setSubscriptionPricing({
                          ...subscriptionPricing,
                          customSelection: {
                            ...subscriptionPricing.customSelection,
                            [dur.id]: updated,
                          },
                        })
                      }
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Plan 3: All Exams */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    Plan 3: All Exams Pro Access (Full Test Series)
                  </CardTitle>
                  <CardDescription>Student ko platform ke sabhi premium tests aur exams ka unlimited access milega</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "monthly", label: "Monthly (1 Month)" },
                    { id: "sixMonths", label: "6 Months Plan" },
                    { id: "yearly", label: "Yearly (1 Year Plan)" },
                  ].map((dur) => (
                    <SmartDurationPricingCard
                      key={dur.id}
                      title={dur.label}
                      data={subscriptionPricing?.allExams?.[dur.id] || { price: 0, discountPrice: null, isActive: false }}
                      onChange={(updated) =>
                        setSubscriptionPricing({
                          ...subscriptionPricing,
                          allExams: {
                            ...subscriptionPricing.allExams,
                            [dur.id]: updated,
                          },
                        })
                      }
                    />
                  ))}
                </CardContent>
              </Card>

              <Button
                onClick={() => updateSubscriptionPricingMutation.mutate(subscriptionPricing)}
                disabled={updateSubscriptionPricingMutation.isLoading}
                className="w-full"
                size="lg"
              >
                {updateSubscriptionPricingMutation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Subscription Pricing
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {/* Coupons Section */}
        {activeTab === "coupons" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Tag className="h-6 w-6 text-indigo-600" />
                  Coupon Codes Management
                </h2>
                <p className="text-sm text-muted-foreground">
                  Create, toggle, and manage promo coupons for student checkout
                </p>
              </div>
              <Button onClick={() => setShowCouponForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Coupon
              </Button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Coupons</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{coupons.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active Codes</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {coupons.filter((c: any) => c.isActive).length}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inactive</span>
                <p className="text-2xl font-black text-slate-500 mt-1">
                  {coupons.filter((c: any) => !c.isActive).length}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 border rounded-xl p-3.5 shadow-xs">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Times Redeemed</span>
                <p className="text-2xl font-black text-indigo-600 mt-1">
                  {coupons.reduce((acc: number, c: any) => acc + (c.usedCount || 0), 0)}
                </p>
              </div>
            </div>

            {showCouponForm && (
              <Card className="mb-6 border-2 border-indigo-100 dark:border-indigo-900/60 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</span>
                    <span className="text-xs font-normal text-slate-500">Create smart discount codes for students</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Quick Preset Templates */}
                  <div className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Quick Templates:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyCouponTemplate('flat50')}
                      className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      FLAT ₹50 OFF
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCouponTemplate('welcome10')}
                      className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      10% WELCOME
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCouponTemplate('pro20')}
                      className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      20% PRO PASS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCouponTemplate('mega50')}
                      className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      50% MEGA
                    </button>
                  </div>

                  <form onSubmit={handleCouponSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Coupon Code (Uppercase)</label>
                        <Input
                          value={couponFormData.code}
                          onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                          placeholder="e.g. SPARK20, FLAT50"
                          className="uppercase font-bold tracking-wider"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description (Optional)</label>
                        <Input
                          value={couponFormData.description}
                          onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                          placeholder="e.g. 20% discount on all passes"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Discount Type</label>
                        <select
                          value={couponFormData.discountType}
                          onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value })}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
                        >
                          <option value="percentage">Percentage (%) Discount</option>
                          <option value="fixed">Fixed Amount (₹) Flat Discount</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {couponFormData.discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={couponFormData.discountValue || ""}
                          onChange={(e) => setCouponFormData({ ...couponFormData, discountValue: parseInt(e.target.value) || 0 })}
                          placeholder={couponFormData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 50'}
                          className="font-bold"
                          required
                        />
                      </div>
                    </div>

                    {couponFormData.discountType === 'percentage' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span>Maximum Discount Cap (₹)</span>
                          <span className="text-[10px] font-normal text-slate-400">0 ya empty chhodne par koi limit nahi</span>
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={couponFormData.maxDiscount || ""}
                          onChange={(e) => setCouponFormData({ ...couponFormData, maxDiscount: parseInt(e.target.value) || 0 })}
                          placeholder="e.g. 100"
                        />
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Minimum Purchase Amount (₹)</label>
                        <Input
                          type="number"
                          min={0}
                          value={couponFormData.minPurchaseAmount || ""}
                          onChange={(e) => setCouponFormData({ ...couponFormData, minPurchaseAmount: parseInt(e.target.value) || 0 })}
                          placeholder="e.g. 50 (Leave 0 for no minimum)"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Applicable Plan</label>
                        <select
                          value={couponFormData.applicableOn}
                          onChange={(e) => setCouponFormData({ ...couponFormData, applicableOn: e.target.value })}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
                        >
                          <option value="all">All Plans (Single Exam, Custom & All Exams)</option>
                          <option value="singleExam">Single Exam Pass Only</option>
                          <option value="customSelection">Custom Combo Only</option>
                          <option value="allExams">All Exams Pro Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Overall Usage Limit (Optional)</label>
                        <Input
                          type="number"
                          min={1}
                          value={couponFormData.usageLimit || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCouponFormData({ 
                              ...couponFormData, 
                              usageLimit: value ? parseInt(value) : null 
                            });
                          }}
                          placeholder="Leave empty for unlimited"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Uses Per Student Account</label>
                        <Input
                          type="number"
                          min={1}
                          value={couponFormData.userLimit}
                          onChange={(e) => setCouponFormData({ ...couponFormData, userLimit: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Valid From</label>
                        <Input
                          type="date"
                          value={couponFormData.validFrom}
                          onChange={(e) => setCouponFormData({ ...couponFormData, validFrom: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Valid Until (Optional)</label>
                        <Input
                          type="date"
                          value={couponFormData.validUntil}
                          onChange={(e) => setCouponFormData({ ...couponFormData, validUntil: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Live Student Preview */}
                    <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          Student Checkout Preview:
                        </span>
                        <Badge className="bg-emerald-600 text-white font-bold tracking-wider">
                          {couponFormData.code || "ENTERCODE"}
                        </Badge>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">
                        Student jab code <strong>{couponFormData.code || "..."}</strong> apply karega, toh{" "}
                        <strong className="text-emerald-700 dark:text-emerald-300">
                          {couponFormData.discountType === "percentage"
                            ? `${couponFormData.discountValue}% discount`
                            : `₹${couponFormData.discountValue} FLAT chhoot`}
                        </strong>{" "}
                        milegi.
                        {couponFormData.maxDiscount > 0 && couponFormData.discountType === "percentage" && ` (Max cap: ₹${couponFormData.maxDiscount})`}
                        {couponFormData.minPurchaseAmount > 0 && ` • Minimum order: ₹${couponFormData.minPurchaseAmount}`}
                        {` • Applicable on: ${
                          couponFormData.applicableOn === "singleExam"
                            ? "Single Exam"
                            : couponFormData.applicableOn === "customSelection"
                            ? "Custom Combo"
                            : couponFormData.applicableOn === "allExams"
                            ? "All Exams Pro"
                            : "All Plans"
                        }`}
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Button type="button" variant="outline" onClick={handleCancelCouponForm}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createCouponMutation.isLoading || updateCouponMutation.isLoading} className="gap-2">
                        {createCouponMutation.isLoading || updateCouponMutation.isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {editingCoupon ? "Update Coupon" : "Create Coupon"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Coupons</CardTitle>
                    <CardDescription>{coupons.length} coupons configured</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coupons.map((coupon: any) => (
                    <div
                      key={coupon._id}
                      className={`border-2 rounded-xl p-4 transition-all ${
                        coupon.isActive
                          ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                          : "border-slate-200 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-950/40 opacity-75"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-base tracking-wider text-indigo-600 dark:text-indigo-400">
                              {coupon.code}
                            </h3>
                            <Badge variant={coupon.isActive ? "default" : "secondary"}>
                              {coupon.isActive ? "● Active" : "○ Inactive"}
                            </Badge>
                            <Badge variant="outline" className="text-[11px] font-semibold bg-slate-50 dark:bg-slate-800">
                              {coupon.applicableOn === "singleExam"
                                ? "Single Exam Only"
                                : coupon.applicableOn === "customSelection"
                                ? "Custom Combo Only"
                                : coupon.applicableOn === "allExams"
                                ? "All Exams Pro Only"
                                : "All Plans"}
                            </Badge>
                          </div>

                          {coupon.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">{coupon.description}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Tag className="h-3.5 w-3.5" />
                              {coupon.discountType === 'percentage' 
                                ? `${coupon.discountValue}% OFF` 
                                : `₹${coupon.discountValue} FLAT OFF`}
                            </span>
                            {coupon.maxDiscount > 0 && coupon.discountType === 'percentage' && (
                              <span className="text-slate-500">Max: ₹{coupon.maxDiscount}</span>
                            )}
                            {coupon.minPurchaseAmount > 0 && (
                              <span className="text-slate-500">Min Order: ₹{coupon.minPurchaseAmount}</span>
                            )}
                            <span className="text-slate-400">
                              Used: {coupon.usedCount || 0}/{coupon.usageLimit || '∞'}
                            </span>
                            {coupon.validUntil && (
                              <span className="text-slate-400">
                                Exp: {new Date(coupon.validUntil).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-1.5 mr-2">
                            <span className="text-[11px] text-slate-400">Active:</span>
                            <Switch
                              checked={coupon.isActive}
                              onCheckedChange={(checked) =>
                                updateCouponMutation.mutate({
                                  id: coupon._id,
                                  data: { isActive: checked },
                                })
                              }
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(coupon.code)
                              toast.success(`Coupon code ${coupon.code} copied!`)
                            }}
                            className="h-8 gap-1 text-xs"
                            title="Copy code"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCoupon(coupon)}
                            className="h-8 text-xs"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            className="h-8 text-xs text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {coupons.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground space-y-2">
                      <Tag className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-semibold text-sm">Koi coupon code nahi mila</p>
                      <p className="text-xs text-slate-400">Naya coupon banane ke liye &quot;Create Coupon&quot; par click karein.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
