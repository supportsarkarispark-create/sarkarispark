"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { paymentsAPI, couponsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { toast } from "react-hot-toast"
import {
  ShieldCheck,
  CheckCircle2,
  Tag,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Layers,
  Crown,
  Lock,
  Search,
  Gift,
} from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentPage() {
  const { user, loginWithToken } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<any>(null)
  const [selectedPlanType, setSelectedPlanType] = useState<"allExams" | "singleExam" | "customSelection">("allExams")
  const [selectedDuration, setSelectedDuration] = useState<"monthly" | "sixMonths" | "yearly">("yearly")
  const [selectedExams, setSelectedExams] = useState<string[]>([])
  const [examSearch, setExamSearch] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [publicCoupons, setPublicCoupons] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [pendingUser, setPendingUser] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pendingPaymentUser")
      if (stored) {
        try {
          setPendingUser(JSON.parse(stored))
        } catch (_) {}
      }
    }
    loadPricingAndExams()
  }, [])

  const loadPricingAndExams = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const [settingsRes, examsRes, couponsRes] = await Promise.all([
        fetch(`${baseUrl}/settings`),
        fetch(`${baseUrl}/exams`),
        fetch(`${baseUrl}/coupons/public`).catch(() => null),
      ])

      const settingsData = await settingsRes.json()
      const examsData = await examsRes.json()
      if (couponsRes && couponsRes.ok) {
        const couponsData = await couponsRes.json().catch(() => null)
        if (couponsData?.success && Array.isArray(couponsData.coupons)) {
          setPublicCoupons(couponsData.coupons)
        }
      }

      if (settingsData.success && settingsData.settings?.subscriptionPricing) {
        const pricing = settingsData.settings.subscriptionPricing
        setPlans(pricing)

        // Find active plan categories
        const activeCategories = ["allExams", "singleExam", "customSelection"].filter((cat) => {
          const p = pricing[cat]
          return p && (p.monthly?.isActive === true || p.sixMonths?.isActive === true || p.yearly?.isActive === true)
        })

        if (activeCategories.length > 0) {
          const defaultCat = (activeCategories.includes(selectedPlanType) ? selectedPlanType : activeCategories[0]) as any
          setSelectedPlanType(defaultCat)

          const activeDurs = ["monthly", "sixMonths", "yearly"].filter(
            (d) => pricing[defaultCat]?.[d]?.isActive === true
          )
          if (activeDurs.length > 0) {
            setSelectedDuration((activeDurs.includes(selectedDuration) ? selectedDuration : activeDurs[0]) as any)
          }
        }
      } else {
        // Safe default fallback
        setPlans({
          singleExam: {
            monthly: { price: 99, discountPrice: null, isActive: true },
            sixMonths: { price: 249, discountPrice: null, isActive: true },
            yearly: { price: 399, discountPrice: null, isActive: true },
          },
          customSelection: {
            monthly: { pricePerExam: 79, minExams: 2, maxExams: 10, discountPrice: null, isActive: true },
            sixMonths: { pricePerExam: 199, minExams: 2, maxExams: 10, discountPrice: null, isActive: true },
            yearly: { pricePerExam: 349, minExams: 2, maxExams: 10, discountPrice: null, isActive: true },
          },
          allExams: {
            monthly: { price: 299, discountPrice: null, isActive: true },
            sixMonths: { price: 799, discountPrice: null, isActive: true },
            yearly: { price: 1499, discountPrice: null, isActive: true },
          },
        })
      }

      if (examsData.success && examsData.exams) {
        setExams(examsData.exams)
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  const handleSelectPlanType = (type: "allExams" | "singleExam" | "customSelection") => {
    setSelectedPlanType(type)
    if (type === "allExams") setSelectedExams([])

    // Auto-select first active duration for this plan
    const activeDurs = ["monthly", "sixMonths", "yearly"].filter(
      (d) => plans?.[type]?.[d]?.isActive === true
    )
    if (activeDurs.length > 0 && !activeDurs.includes(selectedDuration)) {
      setSelectedDuration(activeDurs[0] as any)
    }
  }

  // Calculate Pricing Details (Original MRP, Final Offer Price, Plan Savings)
  const getPricingDetails = () => {
    if (!plans) {
      return { regularTotal: 0, offerTotal: 0, planSavings: 0, hasPlanDiscount: false, discountPercent: 0 }
    }
    const durPricing = plans?.[selectedPlanType]?.[selectedDuration]
    if (!durPricing || durPricing.isActive === false) {
      return { regularTotal: 0, offerTotal: 0, planSavings: 0, hasPlanDiscount: false, discountPercent: 0 }
    }

    if (selectedPlanType === "customSelection") {
      const examCount = Math.max(selectedExams.length, 1)
      const regularUnit = durPricing.pricePerExam || 79
      const offerUnit =
        durPricing.discountPrice && durPricing.discountPrice < regularUnit
          ? durPricing.discountPrice
          : regularUnit
      const regularTotal = regularUnit * examCount
      const offerTotal = offerUnit * examCount
      const planSavings = Math.max(0, regularTotal - offerTotal)
      const discountPercent = regularTotal > 0 ? Math.round((planSavings / regularTotal) * 100) : 0
      return { regularTotal, offerTotal, planSavings, hasPlanDiscount: planSavings > 0, discountPercent }
    }

    const regularTotal = durPricing.price || 0
    const offerTotal =
      durPricing.discountPrice && durPricing.discountPrice < regularTotal
        ? durPricing.discountPrice
        : regularTotal
    const planSavings = Math.max(0, regularTotal - offerTotal)
    const discountPercent = regularTotal > 0 ? Math.round((planSavings / regularTotal) * 100) : 0
    return { regularTotal, offerTotal, planSavings, hasPlanDiscount: planSavings > 0, discountPercent }
  }

  const { regularTotal, offerTotal, planSavings, hasPlanDiscount, discountPercent } = getPricingDetails()
  const basePrice = offerTotal
  const finalPrice = Math.max(0, basePrice - discountAmount)
  const totalSavings = planSavings + discountAmount

  const handleApplyCoupon = async (specificCode?: string) => {
    const code = (specificCode || couponCode).trim().toUpperCase()
    if (!code) {
      toast.error("Please enter a coupon code")
      return
    }

    setValidatingCoupon(true)
    try {
      const response = await couponsAPI.validateCoupon({
        code,
        amount: basePrice,
        planType: selectedPlanType,
      })

      if (response.data.valid) {
        setAppliedCoupon(response.data.coupon)
        setDiscountAmount(response.data.coupon.discountAmount)
        setCouponCode(code)
        toast.success(`Coupon applied! You saved ₹${response.data.coupon.discountAmount}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid coupon code")
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode("")
    setAppliedCoupon(null)
    setDiscountAmount(0)
    toast.success("Coupon removed")
  }

  // Live dynamic re-validation of applied coupon if plan, duration, or exam count changes
  useEffect(() => {
    if (appliedCoupon?.code) {
      couponsAPI.validateCoupon({
        code: appliedCoupon.code,
        amount: basePrice,
        planType: selectedPlanType,
      }).then((response) => {
        if (response.data?.valid) {
          setAppliedCoupon(response.data.coupon)
          setDiscountAmount(response.data.coupon.discountAmount)
        }
      }).catch((error) => {
        const msg = error.response?.data?.message || "Coupon is not applicable for this plan"
        setAppliedCoupon(null)
        setDiscountAmount(0)
        toast.error(`Coupon removed: ${msg}`)
      })
    }
  }, [basePrice, selectedPlanType])

  const handlePayment = async () => {
    const currentUser = user || pendingUser
    if (!currentUser) {
      router.push("/login?redirect=/payment")
      return
    }

    // Validation for Single Exam
    if (selectedPlanType === "singleExam" && selectedExams.length !== 1) {
      toast.error("Please choose 1 exam to activate this plan")
      return
    }

    // Validation for Custom Selection
    if (selectedPlanType === "customSelection") {
      const minExams = plans?.customSelection?.[selectedDuration]?.minExams || 2
      const maxExams = plans?.customSelection?.[selectedDuration]?.maxExams || 10

      if (selectedExams.length < minExams) {
        toast.error(`Please select at least ${minExams} exams`)
        return
      }
      if (selectedExams.length > maxExams) {
        toast.error(`Maximum ${maxExams} exams allowed`)
        return
      }
    }

    setLoading(true)
    try {
      const response = await paymentsAPI.createOrder({
        planType: selectedPlanType,
        duration: selectedDuration,
        selectedExams: selectedPlanType === "allExams" ? [] : selectedExams,
        couponCode: appliedCoupon?.code,
      })

      // 1. Handle 100% Free / Coupon Discount (Amount is ₹0)
      if (response.data?.isFree || response.data?.payment?.amount === 0) {
        if (response.data?.token && response.data?.user) {
          loginWithToken(response.data.token, response.data.user)
        }

        if (typeof window !== "undefined") {
          localStorage.removeItem("pendingPaymentUser")
          localStorage.removeItem("paymentToken")
        }

        toast.success(
          response.data?.message || "100% Discount applied! Your Pro subscription has been activated for FREE! 🎉",
          { duration: 5000 }
        )
        setLoading(false)
        router.push("/dashboard")
        return
      }

      // 2. Normal Paid Order via Razorpay
      const { order, payment } = response.data

      if (!order) {
        throw new Error(response.data?.message || "Payment order creation failed")
      }

      // Load Razorpay SDK
      if (!window.Razorpay) {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        script.onload = () => {
          try {
            initiateRazorpay(order, payment, currentUser)
          } catch (err: any) {
            console.error("Razorpay initiation error:", err)
            toast.error("Failed to open Razorpay gateway")
            setLoading(false)
          }
        }
        script.onerror = () => {
          toast.error("Failed to load payment gateway")
          setLoading(false)
        }
        document.body.appendChild(script)
      } else {
        initiateRazorpay(order, payment, currentUser)
      }
    } catch (error: any) {
      console.error("Order creation failed:", error)
      toast.error(error.response?.data?.message || error.message || "Payment initiation failed")
      setLoading(false)
    }
  }

  const initiateRazorpay = (order: any, payment: any, currentUser: any) => {
    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: "Sarkari Spark",
      description: payment.description || "Pro Test Series Subscription",
      order_id: order.id,
      handler: async function (response: any) {
        try {
          const verifyRes = await paymentsAPI.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })

          if (verifyRes.data?.token && verifyRes.data?.user) {
            loginWithToken(verifyRes.data.token, verifyRes.data.user)
          }

          if (typeof window !== "undefined") {
            localStorage.removeItem("pendingPaymentUser")
            localStorage.removeItem("paymentToken")
          }

          toast.success("Payment successful! Account activate ho gaya hai. Welcome to Sarkari Spark!", { duration: 5000 })
          router.push("/dashboard")
        } catch (err: any) {
          console.error("Verification error:", err)
          toast.error(err.response?.data?.message || "Payment verification failed")
        } finally {
          setLoading(false)
        }
      },
      prefill: {
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        contact: currentUser?.phone || "",
      },
      theme: {
        color: "#4f46e5",
      },
      modal: {
        ondismiss: function () {
          setLoading(false)
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const filteredExams = exams.filter((e) =>
    e.title.toLowerCase().includes(examSearch.toLowerCase()) ||
    (e.category && e.category.toLowerCase().includes(examSearch.toLowerCase()))
  )

  if (!plans) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-20 md:pb-0">
      <div>
        <Navbar />

        {/* Compact Checkout Header */}
        <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white py-8 border-b border-indigo-900/30">
          <div className="container mx-auto px-4 max-w-5xl text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Secure Checkout
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              Upgrade to Sarkari Spark Pro
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mx-auto">
              Get unlimited access to real TCS-pattern mock tests, rank analytics, and complete syllabus papers.
            </p>
          </div>
        </div>

        {/* Main 2-Column Split Content */}
        <main className="container mx-auto px-4 max-w-5xl py-8 md:py-10">
          {pendingUser && !user && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Account Activation Pending</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                    {pendingUser.name} <span className="font-normal text-muted-foreground text-xs sm:text-sm">({pendingUser.email})</span>
                  </p>
                </div>
              </div>
              <div className="text-xs bg-amber-500/20 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-full font-medium">
                Payment hote hi account login ho jayega
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Plan Customization & Inclusions (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">

              {/* Step 1: Select Plan Category */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Step 1: Choose Your Access Scope
                  </h2>
                </div>

                {(() => {
                  const availablePlanCategories = [
                    {
                      id: "allExams",
                      title: "All Exams Pass",
                      desc: "All 650+ Mock Tests",
                      badge: "Recommended",
                      icon: Crown,
                    },
                    {
                      id: "singleExam",
                      title: "Single Exam",
                      desc: "1 Target Exam",
                      badge: null,
                      icon: BookOpen,
                    },
                    {
                      id: "customSelection",
                      title: "Custom Combo",
                      desc: "Pick 2 to 10 Exams",
                      badge: null,
                      icon: Layers,
                    },
                  ].filter((item) => {
                    const planObj = plans?.[item.id]
                    if (!planObj) return false
                    return (
                      planObj.monthly?.isActive === true ||
                      planObj.sixMonths?.isActive === true ||
                      planObj.yearly?.isActive === true
                    )
                  })

                  if (availablePlanCategories.length === 0) {
                    return (
                      <div className="p-6 text-center text-slate-500">
                        <Lock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="font-semibold text-sm">Koi bhi subscription plan active nahi hai.</p>
                      </div>
                    )
                  }

                  return (
                    <div className="grid sm:grid-cols-3 gap-3">
                      {availablePlanCategories.map((item) => {
                        const Icon = item.icon
                        const isSelected = selectedPlanType === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectPlanType(item.id as any)}
                            className={`relative text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                            }`}
                          >
                            {item.badge && (
                              <span className="absolute -top-2.5 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {item.badge}
                              </span>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`p-1.5 rounded-lg ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                          </button>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>

              {/* Step 2: Choose Duration */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Step 2: Choose Duration
                </h2>

                {(() => {
                  const availableDurations = [
                    { id: "monthly", label: "1 Month", defaultBadge: null },
                    { id: "sixMonths", label: "6 Months", defaultBadge: "Save 30%" },
                    { id: "yearly", label: "1 Year", defaultBadge: "Best Value • 50% Off" },
                  ].filter((dur) => {
                    const durPricing = plans?.[selectedPlanType]?.[dur.id]
                    return durPricing?.isActive === true
                  })

                  if (availableDurations.length === 0) {
                    return (
                      <div className="p-4 text-center text-slate-500">
                        <p className="text-sm font-medium">Is plan ke liye koi duration active nahi hai.</p>
                      </div>
                    )
                  }

                  return (
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {availableDurations.map((dur) => {
                        const isSelected = selectedDuration === dur.id
                        const durPricing = plans?.[selectedPlanType]?.[dur.id]
                        const regularP =
                          selectedPlanType === "customSelection"
                            ? (durPricing?.pricePerExam || 0)
                            : (durPricing?.price || 0)
                        const hasDiscount =
                          durPricing?.discountPrice && durPricing.discountPrice < regularP
                        const offerP = hasDiscount ? durPricing.discountPrice : regularP
                        const savings = regularP - offerP
                        const percentOff = regularP > 0 ? Math.round((savings / regularP) * 100) : 0
                        const badgeText = hasDiscount ? `${percentOff}% OFF` : dur.defaultBadge

                        return (
                          <button
                            key={dur.id}
                            type="button"
                            onClick={() => setSelectedDuration(dur.id as any)}
                            className={`relative text-center p-2.5 sm:p-3.5 rounded-xl border-2 transition-all ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300 dark:ring-indigo-900"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            {badgeText && (
                              <span
                                className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm ${
                                  isSelected
                                    ? "bg-amber-400 text-slate-950 font-extrabold"
                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                }`}
                              >
                                {badgeText}
                              </span>
                            )}
                            <div className="font-semibold text-[11px] sm:text-xs mb-1 opacity-90">{dur.label}</div>
                            
                            <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                              <span className="text-base sm:text-xl font-black tracking-tight">
                                ₹{offerP}
                              </span>
                              {hasDiscount && (
                                <span
                                  className={`text-[10px] sm:text-xs line-through font-normal ${
                                    isSelected ? "text-indigo-200" : "text-slate-400"
                                  }`}
                                >
                                  ₹{regularP}
                                </span>
                              )}
                              {selectedPlanType === "customSelection" && (
                                <span className="text-[10px] font-normal">/exam</span>
                              )}
                            </div>

                            {hasDiscount && (
                              <div
                                className={`text-[10px] font-semibold mt-1 ${
                                  isSelected ? "text-indigo-100" : "text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                Save ₹{savings}{selectedPlanType === "customSelection" ? "/exam" : ""}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>

              {/* Step 3: Exam Selector (Only if Single Exam or Custom Selection) */}
              {(selectedPlanType === "singleExam" || selectedPlanType === "customSelection") && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {selectedPlanType === "singleExam" ? "Select Your 1 Exam" : "Select Your Exams (2 to 10)"}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Selected: <strong className="text-indigo-600">{selectedExams.length}</strong> exam(s)
                      </p>
                    </div>

                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search exam..."
                        value={examSearch}
                        onChange={(e) => setExamSearch(e.target.value)}
                        className="pl-8 text-xs h-8 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto pr-1 space-y-2 border border-slate-100 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-950/50">
                    {filteredExams.map((exam) => {
                      const checked = selectedExams.includes(exam._id)
                      return (
                        <label
                          key={exam._id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            checked
                              ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100 font-medium"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type={selectedPlanType === "singleExam" ? "radio" : "checkbox"}
                              name="exam-select"
                              checked={checked}
                              onChange={() => {
                                if (selectedPlanType === "singleExam") {
                                  setSelectedExams([exam._id])
                                } else {
                                  if (checked) {
                                    setSelectedExams(selectedExams.filter((id) => id !== exam._id))
                                  } else {
                                    if (selectedExams.length >= 10) {
                                      toast.error("Maximum 10 exams allowed")
                                      return
                                    }
                                    setSelectedExams([...selectedExams, exam._id])
                                  }
                                }
                              }}
                              className="accent-indigo-600 rounded"
                            />
                            <span>{exam.title}</span>
                          </div>
                          {exam.category && (
                            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              {exam.category}
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* What You Get Highlights */}
              <div className="bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  What You Get in Sarkari Spark Pro:
                </h3>
                <div className="grid sm:grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Latest TCS & NTA Exam Pattern Mocks</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Real-time All-India Rank & Percentile</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Complete Bilingual Solutions (Hindi / English)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Single Active Device Instant Activation</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Summary & Checkout Card (5 Cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/60 shadow-lg p-6 space-y-5">
                
                {/* Header */}
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md">
                    Order Summary
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                    {selectedPlanType === "allExams"
                      ? "All Exams Pro Pass"
                      : selectedPlanType === "singleExam"
                      ? "Single Exam Pass"
                      : "Custom Combo Pass"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Duration: <span className="font-semibold capitalize text-slate-700 dark:text-slate-300">{selectedDuration === "sixMonths" ? "6 Months" : selectedDuration}</span>
                  </p>
                </div>

                {/* Coupon Box */}
                <div className="space-y-3">
                  {!appliedCoupon ? (
                    <>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <Input
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleApplyCoupon()
                              }
                            }}
                            className="pl-8 text-xs uppercase h-9 rounded-lg font-semibold tracking-wider"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyCoupon()}
                          disabled={validatingCoupon || !couponCode.trim()}
                          className="h-9 px-3.5 text-xs font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800"
                        >
                          {validatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                        </Button>
                      </div>

                      {/* Available Offers Cards */}
                      {publicCoupons.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                              <Gift className="w-3.5 h-3.5" />
                              Available Offers & Coupons:
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">Tap to apply</span>
                          </div>

                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {publicCoupons.map((c: any) => {
                              const isPlanMatch = !c.applicableOn || c.applicableOn === "all" || c.applicableOn === selectedPlanType
                              const meetsMin = !c.minPurchaseAmount || basePrice >= c.minPurchaseAmount
                              const canApply = isPlanMatch && meetsMin

                              return (
                                <div
                                  key={c._id || c.code}
                                  className={`p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${
                                    canApply
                                      ? "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/60 hover:border-amber-400 shadow-xs"
                                      : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 opacity-60"
                                  }`}
                                >
                                  <div className="space-y-0.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-black text-xs tracking-wider text-indigo-700 dark:text-indigo-300">
                                        {c.code}
                                      </span>
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 rounded-md">
                                        {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                                      </span>
                                      {!isPlanMatch && (
                                        <span className="text-[9px] text-slate-500 bg-slate-200/60 dark:bg-slate-800 px-1 rounded">
                                          {c.applicableOn === "singleExam" ? "Single Exam only" : c.applicableOn === "customSelection" ? "Custom only" : "All Exams Pro only"}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                      {c.description || (c.minPurchaseAmount > 0 ? `Min order ₹${c.minPurchaseAmount}` : "Valid on checkout")}
                                    </p>
                                  </div>

                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={!canApply || validatingCoupon}
                                    onClick={() => handleApplyCoupon(c.code)}
                                    className="h-7 px-2.5 text-xs font-bold text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 shrink-0"
                                  >
                                    {validatingCoupon && couponCode === c.code ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      "Apply"
                                    )}
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Coupon <strong>{appliedCoupon.code}</strong> Applied!</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-0.5 px-2 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <X className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                      <p className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                        🎉 You are saving ₹{discountAmount} on this order with this coupon!
                      </p>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Original Plan MRP</span>
                    <span className={hasPlanDiscount ? "line-through text-slate-400" : "font-medium"}>
                      ₹{regularTotal}
                    </span>
                  </div>

                  {hasPlanDiscount && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        Plan Discount ({discountPercent}% OFF)
                      </span>
                      <span>-₹{planSavings}</span>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-emerald-500" />
                        Coupon ({appliedCoupon?.code || "APPLIED"})
                      </span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  {totalSavings > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 font-bold">
                      <span className="flex items-center gap-1">
                        🎉 Total Savings:
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">₹{totalSavings}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <span className="text-sm font-bold">Total Payable</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      ₹{finalPrice}
                    </span>
                  </div>
                </div>

                {/* Pay / Free Activate Button */}
                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className={`w-full h-12 text-white font-bold text-sm rounded-xl shadow-md transition-all gap-2 ${
                    finalPrice === 0
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25"
                      : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {finalPrice === 0 ? "Activating Free Subscription..." : "Initiating Razorpay..."}
                    </>
                  ) : finalPrice === 0 ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Claim Free Access (₹0) & Activate
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pay ₹{finalPrice} & Activate
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                {/* Trust and Payment Modes */}
                <div className="pt-2 text-center space-y-2">
                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {finalPrice === 0 ? "100% Free with Coupon • No Bank/Card Required" : "UPI, Credit/Debit Cards, NetBanking Supported"}
                  </p>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline font-medium"
                  >
                    Cancel and return
                  </button>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
