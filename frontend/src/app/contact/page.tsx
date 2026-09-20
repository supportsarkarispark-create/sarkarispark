"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "react-query"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Facebook,
  Instagram,
  Youtube,
  GraduationCap,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { settingsAPI } from "@/lib/api"
import api from "@/lib/api"

export default function ContactPage() {
  const { data: settingsData } = useQuery(["settings"], () => settingsAPI.getSettings())
  
  const contactInfo = settingsData?.data?.settings?.contactInfo || {
    email: "support@sarkarispark.com",
    phone: "+91 98765 43210",
    address: "New Delhi, India",
    whatsapp: "",
    facebook: "",
    instagram: "",
    youtube: "",
  }

  const faqs = [
    {
      _id: "faq-1",
      question: "Kya Sarkari Spark par Free Mock Tests available hain?",
      answer: "Haan! Har ek exam category (SSC, UP Police, Railway, Banking) ke pehle 1 se 2 mock tests bilkul 100% FREE hain taaki aap platform aur question quality bina kisi payment ke test kar sakein."
    },
    {
      _id: "faq-2",
      question: "Test submit karne ke baad result kab milta hai?",
      answer: "Test submit karte hi aapko turant Instant Scorecard, All-India Rank, Section-wise Accuracy, Percentile aur sabhi sawalon ke detailed step-by-step solutions mil jaate hain."
    },
    {
      _id: "faq-3",
      question: "Kya sawal Hindi aur English dono bhashao me hain?",
      answer: "Ji bilkul! Sarkari Spark ke sabhi mock tests aur solutions 100% Bilingual (Hindi + English) hain. Aap exam dete samay bhi ek click me language badal sakte hain."
    },
    {
      _id: "faq-4",
      question: "Kya main mobile phone par bhi test de sakta hoon?",
      answer: "Haan, Sarkari Spark mobile, tablet aur laptop har device ke liye fully optimized hai. Aap bina kisi rukawat ke apne phone browser me test attempt kar sakte hain."
    }
  ]
  const faqsLoading = false
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  const handleMouseEnter = (id: string) => {
    setOpenItems(new Set([id]))
  }

  const handleMouseLeave = () => {
    setOpenItems(new Set())
  }

  const socialLinks = [
    { icon: Facebook, href: contactInfo.facebook || "#", label: "Facebook", color: "bg-blue-600 hover:bg-blue-700" },
    { icon: Instagram, href: contactInfo.instagram || "#", label: "Instagram", color: "bg-pink-600 hover:bg-pink-700" },
    { icon: Youtube, href: contactInfo.youtube || "#", label: "YouTube", color: "bg-red-600 hover:bg-red-700" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAyIDIgMiA0IDJzNCAyIDQgMnptMCAwYzAtMiAyLTQgMi00cy0yLTItNC0yYzAgMiAyIDIgNCAyczQgMiA0IDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 py-8 md:py-12 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white border border-white/30 rounded-full mb-3 text-sm">
              <GraduationCap className="h-4 w-4" />
              Get in Touch
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Contact Us
            </h1>
            <p className="text-base md:text-lg text-blue-100">
              Have questions? We&apos;re here to help you crack your dream government job
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Contact Information Card */}
          <Card className="border-2 border-indigo-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription className="text-blue-100">
                Reach out to us through any of these channels
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Email */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <p className="text-sm text-muted-foreground">{contactInfo.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Phone</h3>
                  <p className="text-sm text-muted-foreground">{contactInfo.phone}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Address</h3>
                  <p className="text-sm text-muted-foreground">{contactInfo.address}</p>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Send className="h-4 w-4 text-indigo-600" />
                  Follow Us
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white text-sm ${social.color} transition-all transform hover:scale-105`}
                      aria-label={social.label}
                    >
                      <social.icon className="h-4 w-4" />
                      <span className="truncate">{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div className="mt-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 mb-4 shadow-lg text-center">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
                <HelpCircle className="h-6 w-6" />
                Frequently Asked Questions
              </h2>
              <p className="text-indigo-100">Find answers to common questions</p>
            </div>
            {faqsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : faqs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No FAQs available</p>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq: any, index: number) => (
                  <div
                    key={faq._id}
                    className="border-2 border-indigo-100 rounded-xl overflow-hidden transition-all duration-300 hover:border-indigo-300 hover:shadow-md"
                    onMouseEnter={() => handleMouseEnter(faq._id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div
                      className="w-full text-left p-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-foreground flex items-center gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        {faq.question}
                      </span>
                      {openItems.has(faq._id) ? (
                        <ChevronUp className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                    {openItems.has(faq._id) && (
                      <div className="px-4 pb-4 pt-0 bg-white">
                        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
