"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { authAPI } from "@/lib/api"
import toast from "react-hot-toast"

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  subscriptionType: "free" | "premium"
  subscriptionExpiry?: string
  avatar?: string
  profile?: {
    education?: string
    city?: string
    state?: string
    targetExams?: string[]
    preferredLanguage?: string
  }
  stats?: any
  createdAt?: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<any>
  loginWithToken: (token: string, user: any) => void
  logout: () => void
  updateUser: (data: any) => Promise<void>
  uploadAvatar: (formData: FormData) => Promise<void>
  updatePassword: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      fetchUser()
    } else {
      setIsLoading(false)
    }

    const handleSessionExpired = (e: any) => {
      const msg =
        e?.detail?.message ||
        "Aapka account kisi doosre device par login ho gaya hai. Suraksha ke liye is device se logout kar diya gaya hai."
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      toast.error(msg, { duration: 6000, id: "session-expired-toast" })
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?reason=session_expired"
      }
    }

    window.addEventListener("session-expired", handleSessionExpired)
    return () => {
      window.removeEventListener("session-expired", handleSessionExpired)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe()
      setUser(response.data.user)
      localStorage.setItem("user", JSON.stringify(response.data.user))
    } catch (error: any) {
      console.error('[DEBUG] fetchUser error:', error.response?.status, error.response?.data)
      // Only logout if it's a 401 (unauthorized), not for network errors
      if (error.response?.status === 401) {
        if (error.response?.data?.sessionExpired) {
          toast.error(
            error.response?.data?.message ||
              "Aapka account kisi doosre device par login ho gaya hai.",
            { duration: 6000, id: "session-expired-toast" }
          )
        }
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password })
      const { token, user } = response.data

      if (!token) {
        throw new Error('No token received from server')
      }

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.removeItem("pendingPaymentUser")
      localStorage.removeItem("paymentToken")
      setUser(user)
      toast.success("Welcome back!")
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message)
      if (error.response?.data?.requiresPayment) {
        const pendingUser = error.response.data.user || { email }
        const paymentToken = error.response.data.paymentToken
        if (typeof window !== "undefined") {
          localStorage.setItem("pendingPaymentUser", JSON.stringify(pendingUser))
          if (paymentToken) localStorage.setItem("paymentToken", paymentToken)
        }
      } else {
        toast.error(error.response?.data?.message || "Login failed")
      }
      throw error
    }
  }

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    try {
      const response = await authAPI.register(data)
      const { token, user, requiresPayment, paymentToken } = response.data

      if (requiresPayment) {
        if (typeof window !== "undefined") {
          localStorage.setItem("pendingPaymentUser", JSON.stringify(user))
          if (paymentToken) localStorage.setItem("paymentToken", paymentToken)
        }
        return response.data
      }

      if (token && user) {
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        localStorage.removeItem("pendingPaymentUser")
        localStorage.removeItem("paymentToken")
        setUser(user)
        toast.success("Account created successfully!")
      }
      return response.data
    } catch (error: any) {
      console.error('Register error:', error)
      const errorMsg = error.response?.data?.message || error.message || "Registration failed"
      toast.error(errorMsg)
      throw error
    }
  }

  const loginWithToken = (token: string, userData: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.removeItem("pendingPaymentUser")
      localStorage.removeItem("paymentToken")
    }
    setUser(userData)
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (_) {}
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    toast.success("Logged out successfully")
    window.location.href = "/"
  }

  const updateUser = async (data: any) => {
    try {
      const response = await authAPI.updateProfile(data)
      setUser(response.data.user)
      localStorage.setItem("user", JSON.stringify(response.data.user))
      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed")
      throw error
    }
  }

  const uploadAvatar = async (formData: FormData) => {
    try {
      const response = await authAPI.uploadAvatar(formData)
      setUser(response.data.user)
      localStorage.setItem("user", JSON.stringify(response.data.user))
      toast.success("Profile picture updated")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload profile picture")
      throw error
    }
  }

  const updatePassword = async (data: any) => {
    try {
      const res = await authAPI.updatePassword(data)
      if (res.data.token) {
        localStorage.setItem("token", res.data.token)
      }
      toast.success("Password changed successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password")
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithToken, logout, updateUser, uploadAvatar, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
