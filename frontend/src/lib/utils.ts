import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function getSiteUrl(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://sarkarispark.vercel.app")

  url = url.trim()

  // Fix mistakenly configured .vercel without .app
  if (url.includes("sarkarispark.vercel") && !url.includes("sarkarispark.vercel.app")) {
    url = url.replace("sarkarispark.vercel", "sarkarispark.vercel.app")
  }

  if (url.endsWith(".vercel")) {
    url = url + ".app"
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`
  }

  return url.replace(/\/+$/, "")
}
