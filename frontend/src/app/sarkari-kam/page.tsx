"use client"

import { useState, useMemo } from "react"
import { useQuery } from "react-query"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { sarkariWorksAPI, getImageUrl } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import {
  Building2,
  Search,
  ExternalLink,
  Loader2,
  Briefcase,
  Layers,
  ArrowRight,
  Sparkles,
  HelpCircle
} from "lucide-react"

interface SarkariWork {
  _id: string
  title: string
  description: string
  link: string
  category: string
  image?: string
  isActive: boolean
}

export default function SarkariKamPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const { data: worksResponse, isLoading } = useQuery(
    ["public-sarkari-works"],
    () => sarkariWorksAPI.getSarkariWorks(),
    { refetchOnWindowFocus: false }
  )

  const rawWorks = useMemo<SarkariWork[]>(() => worksResponse?.data?.works || [], [worksResponse])
  const categoriesList = useMemo<string[]>(() => worksResponse?.data?.categories || [], [worksResponse])

  // Filter works by search and category
  const filteredWorks = useMemo(() => {
    return rawWorks.filter((work) => {
      const matchesSearch =
        work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        work.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory =
        selectedCategory === "All" ||
        (selectedCategory === "General" && !work.category) ||
        work.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [rawWorks, searchQuery, selectedCategory])

  // Group works by category for grouped layout
  const groupedWorks = useMemo(() => {
    const groups: Record<string, SarkariWork[]> = {}
    
    filteredWorks.forEach((work) => {
      const cat = work.category || "General"
      if (!groups[cat]) {
        groups[cat] = []
      }
      groups[cat].push(work)
    })

    return groups
  }, [filteredWorks])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/40 via-background to-purple-50/40 dark:from-slate-950 dark:via-background dark:to-slate-900">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10 text-center max-w-4xl">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 dark:bg-white/10 px-3 py-1 text-sm tracking-wide flex-inline gap-1">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            Official Portals Directory
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
            Sarkari Kam (सरकारी काम)
          </h1>
          <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto font-medium">
            सभी सरकारी योजनाओं और लोक कल्याणकारी कार्यों के सीधे लिंक, आधिकारिक वेबसाइट और आवेदन पत्र एक ही स्थान पर प्राप्त करें।
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        
        {/* Search & Filters Toolbar */}
        <Card className="mb-10 shadow-md border-muted/50 backdrop-blur-sm bg-card/90">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search government works, links, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-11 w-full bg-muted/30 focus-visible:ring-primary border-muted/80 rounded-lg shadow-sm"
                />
              </div>

              {/* Category selector */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-auto">
                <Button
                  variant={selectedCategory === "All" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("All")}
                  className="h-10 px-4 rounded-full font-medium"
                >
                  All Works
                </Button>
                {categoriesList.map((cat) => {
                  const label = cat || "General"
                  return (
                    <Button
                      key={label}
                      variant={selectedCategory === label ? "default" : "outline"}
                      onClick={() => setSelectedCategory(label)}
                      className="h-10 px-4 rounded-full font-medium"
                    >
                      {label}
                    </Button>
                  )
                })}
                {/* General category fallback */}
                {rawWorks.some(w => !w.category) && !categoriesList.includes("") && (
                  <Button
                    variant={selectedCategory === "General" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("General")}
                    className="h-10 px-4 rounded-full font-medium"
                  >
                    General
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Works Lists */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium animate-pulse">Loading government works portals...</p>
          </div>
        ) : filteredWorks.length === 0 ? (
          <Card className="border-dashed py-16 text-center shadow-sm">
            <CardContent className="space-y-4">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <HelpCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No Government Works Found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                No portals matched your current search parameters. Try clearing the search or category filters.
              </p>
              <Button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }} variant="outline">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* If a category is explicitly selected, render simple list, otherwise render beautiful groups */}
            {selectedCategory !== "All" ? (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Layers className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">{selectedCategory}</h2>
                  <Badge variant="secondary" className="text-xs">{filteredWorks.length} cards</Badge>
                </div>
                <div className="flex flex-col gap-6">
                  {filteredWorks.map((work) => <WorkCard key={work._id} work={work} />)}
                </div>
              </div>
            ) : (
              Object.entries(groupedWorks).map(([category, works]) => (
                <div key={category} className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-muted/65">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Building2 className="h-4.5 w-4.5" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{category}</h2>
                    <Badge variant="outline" className="text-xs bg-muted/20">{works.length} Portals</Badge>
                  </div>

                  <div className="flex flex-col gap-6">
                    {works.map((work) => <WorkCard key={work._id} work={work} />)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

function WorkCard({ work }: { work: SarkariWork }) {
  return (
    <div className="p-[1px] bg-gradient-to-r from-muted-foreground/15 via-muted/20 to-muted-foreground/10 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-600 rounded-xl transition-all duration-500 group shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 flex w-full">
      <Card className="w-full bg-card dark:bg-slate-950/95 border-0 rounded-[11px] overflow-hidden flex flex-col md:flex-row items-stretch gap-4 p-2.5">
        
        {/* Left Side: Smaller Compact Cover Image or Abstract Fallback Graphic */}
        <div className="w-full md:w-36 h-24 md:h-auto rounded-lg overflow-hidden relative shrink-0">
          {work.image ? (
            <div className="h-full w-full relative bg-muted">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 to-transparent z-10"></div>
              <img
                src={getImageUrl(work.image)}
                alt={work.title}
                className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />
            </div>
          ) : (
            <div className="h-full w-full bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 flex items-center justify-center relative overflow-hidden min-h-[96px] md:min-h-0">
              {/* Glowing Mesh Blobs */}
              <div className="absolute top-1 right-1 w-14 h-14 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
              <div className="absolute -bottom-1 -left-1 w-16 h-16 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
              
              {/* Decorative Vector Lines */}
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:10px_10px]"></div>
              
              <div className="z-10 flex flex-col items-center gap-1.5">
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-300 group-hover:scale-105 group-hover:bg-white/10 transition-all duration-500 backdrop-blur-sm shadow-inner">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="text-[7px] font-bold tracking-widest text-indigo-200/40 uppercase">Portal</span>
              </div>
            </div>
          )}
        </div>

        {/* Middle: Content (Title, Badges, Description) */}
        <div className="flex-1 flex flex-col justify-between py-0.5 space-y-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 px-2 py-0 text-[10px] font-semibold rounded-full tracking-wide shadow-none flex items-center gap-1 transition-colors">
                <Sparkles className="h-2.5 w-2.5 text-yellow-500 animate-pulse" />
                {work.category || "General"}
              </Badge>
              <span className="text-[9px] font-bold tracking-wider text-muted-foreground/80 uppercase flex items-center gap-1">
                <Building2 className="h-2.5 w-2.5 text-primary/50" />
                Government Service
              </span>
            </div>
            
            <CardTitle className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
              {work.title}
            </CardTitle>
            
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {work.description}
            </p>
          </div>
          
          <div className="text-[10px] font-mono text-muted-foreground/50 flex items-center gap-1 shrink-0">
            <Briefcase className="h-3 w-3" />
            <span>Direct Apply verified</span>
          </div>
        </div>

        {/* Right Side: Sleeker Compact Button */}
        <div className="flex items-center justify-center md:border-l border-muted/50 md:pl-4 md:w-44 shrink-0 mt-3 md:mt-0">
          <a
            href={work.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full gap-1.5 font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white border-0 shadow-sm hover:shadow-indigo-500/10 rounded-lg transition-all duration-300 h-10 hover:scale-[1.02] active:scale-[0.98] text-xs flex items-center justify-center">
              Apply / Visit
              <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </a>
        </div>

      </Card>
    </div>
  )
}
