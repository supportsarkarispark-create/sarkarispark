"use client"

import Link from "next/link"
import { useQuery } from "react-query"
import { settingsAPI, examCategoryAPI } from "@/lib/api"
import { GraduationCap, Sparkles, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin, Send, MessageCircle } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { data: settingsData } = useQuery(["settings"], () => settingsAPI.getSettings())
  const { data: categoriesData } = useQuery(["footer-categories"], () => examCategoryAPI.getCategories())
  
  const contactInfo = settingsData?.data?.settings?.contactInfo || {
    email: "support@sarkarispark.com",
    phone: "+91 98765 43210",
    address: "New Delhi, India",
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    telegram: "",
  }

  // Filter categories that should show in footer
  const footerCategories = categoriesData?.data?.categories?.filter((cat: any) => cat.showInFooter) || []

  const footerLinks = {
    exams: footerCategories.length > 0 
      ? footerCategories.map((cat: any) => ({
          label: cat.name,
          href: `/exams?categoryId=${cat.id}`
        }))
      : [
          { label: "SSC Exams", href: "/exams?category=SSC" },
          { label: "Banking Exams", href: "/exams?category=Banking" },
          { label: "Railway Exams", href: "/exams?category=Railway" },
          { label: "State Exams", href: "/exams?category=State" },
        ],
    resources: [
      { label: "Computer Courses", href: "/courses" },
      { label: "Mock Tests", href: "/exams" },
      { label: "Latest Jobs", href: "/latest-jobs" },
      { label: "Admit Card", href: "/admitcards" },
      { label: "Result", href: "/results" },
      { label: "Sarkari Kam", href: "/sarkari-kam" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
    support: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Feedback", href: "/feedback" },
    ],
  }

  const socialLinks = [
    { icon: Facebook, href: contactInfo.facebook || "#", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Twitter, href: contactInfo.twitter || "#", label: "Twitter", color: "hover:text-blue-400" },
    { icon: Instagram, href: contactInfo.instagram || "#", label: "Instagram", color: "hover:text-pink-600" },
    { icon: Youtube, href: contactInfo.youtube || "#", label: "YouTube", color: "hover:text-red-600" },
    { icon: Linkedin, href: contactInfo.linkedin || "#", label: "LinkedIn", color: "hover:text-blue-700" },
    { icon: Send, href: contactInfo.telegram || "#", label: "Telegram", color: "hover:text-blue-500" },
  ]

  return (
    <footer className="border-t bg-muted/50 pb-20 md:pb-0">
      <div className="container mx-auto px-4 pt-12 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 shadow-md">
                <GraduationCap className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black">
                  <Sparkles className="h-2 w-2 text-slate-950 fill-slate-950" />
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    Sarkari
                  </span>
                  <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
                    Spark
                  </span>
                </div>
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-0.5">
                  Govt Exam Portal
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Your trusted companion for government exam preparation. We help thousands of aspirants achieve their dreams.
            </p>
            <div className="space-y-2 text-sm">
              {contactInfo.email && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{contactInfo.email}</span>
                </div>
              )}
              {contactInfo.phone && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{contactInfo.phone}</span>
                </div>
              )}
              {contactInfo.address && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{contactInfo.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Exams</h3>
            <ul className="space-y-2">
              {footerLinks.exams.map((link: any, index: number) => (
                <li key={`exams-${index}-${link.href}`}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, index) => (
                <li key={`resources-${index}-${link.href}`}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={`company-${index}-${link.href}`}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={`support-${index}-${link.href}`}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Sarkari Spark. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-muted-foreground ${social.color} transition-colors`}
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
