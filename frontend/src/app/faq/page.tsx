"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
import api from "@/lib/api"

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(["faq-1"]))

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
  const isLoading = false

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAyIDIgMiA0IDJzNCAyIDQgMnptMCAwYzAtMiAyLTQgMi00cy0yLTItNC0yYzAgMiAyIDIgNCAzczQgMiA0IDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 py-8 md:py-12 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white border border-white/30 rounded-full mb-3 text-sm">
              <HelpCircle className="h-4 w-4" />
              Frequently Asked Questions
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-base md:text-lg text-blue-100">
              Find answers to common questions about our platform and services
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* FAQ Accordion */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No FAQs Available</h3>
                    <p className="text-muted-foreground">
                      Check back later for updates
                    </p>
                  </CardContent>
                </Card>
              ) : (
                faqs.map((faq: any) => (
                  <Card key={faq._id} className="border-2">
                    <button
                      onClick={() => toggleItem(faq._id)}
                      className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-semibold">{faq.question}</span>
                      {openItems.has(faq._id) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    {openItems.has(faq._id) && (
                      <div className="px-4 pb-4 pt-0 border-t">
                        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
