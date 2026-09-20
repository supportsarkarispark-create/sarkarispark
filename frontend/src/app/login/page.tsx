"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { GraduationCap, Eye, EyeOff, Lock, AlertCircle, ArrowRight, ShieldAlert } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [requiresPayment, setRequiresPayment] = useState(false)
  const [paymentUser, setPaymentUser] = useState<any>(null)

  useEffect(() => {
    const reason = searchParams.get("reason")
    if (reason === "payment_required") {
      setError("Payment kiye bina login nahi kiya ja sakta. Kripya pehle payment karein.")
      setRequiresPayment(true)
      const stored = localStorage.getItem("pendingPaymentUser")
      if (stored) {
        try {
          setPaymentUser(JSON.parse(stored))
        } catch (_) {}
      }
    } else if (reason === "session_expired") {
      setError("Aapka account kisi doosre device par login ho gaya hai. Suraksha ke liye logout kar diya gaya hai.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setRequiresPayment(false)

    try {
      await login(formData.email, formData.password)
      router.push("/dashboard")
    } catch (err: any) {
      console.error('Login error in component:', err)
      const isPaymentReq = err.response?.data?.requiresPayment
      if (isPaymentReq) {
        setRequiresPayment(true)
        setPaymentUser(err.response?.data?.user || { email: formData.email })
        setError("Payment kiye bina login nahi kiya ja sakta. Kripya pehle subscription plan kharidein.")
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Login failed. Please try again."
        setError(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <GraduationCap className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold">
              <span className="text-primary">Sarkari</span> Spark
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {requiresPayment ? (
              <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-amber-900 dark:text-amber-200">
                      Payment Required for Account Access
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/90 mt-1 leading-relaxed">
                      Payment kiye bina login nahi kiya ja sakta. Sarkari Spark par mock tests aur exams access karne ke liye kripya subscription plan activate karein.
                    </p>
                    {paymentUser && (
                      <div className="mt-2 text-xs font-mono bg-amber-500/15 py-1 px-2 rounded inline-block text-amber-900 dark:text-amber-200">
                        Account: {paymentUser.email || paymentUser.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={() => router.push(`/payment?reason=login_required&email=${encodeURIComponent(paymentUser?.email || formData.email)}`)}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-5 shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Payment & Activate</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setRequiresPayment(false); setError(""); }}
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                  >
                    Try another email address
                  </Button>
                </div>
              </div>
            ) : error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs sm:text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs sm:text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 text-sm sm:text-base placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs sm:text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="h-12 px-3.5 pr-12 rounded-xl border-slate-200 dark:border-slate-800 text-sm sm:text-base placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors cursor-pointer focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-xs sm:text-sm">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span>Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-xs sm:text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full py-6" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
