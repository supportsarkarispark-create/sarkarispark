"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import {
  Clock,
  FileQuestion,
  Target,
  Play,
  Crown,
  BarChart3,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BookOpen,
} from "lucide-react"

interface TestCardProps {
  test: {
    id: string
    title: string
    description?: string
    duration: number
    totalQuestions: number
    totalMarks: number
    difficulty?: string
    testNumber?: number
    isPremium?: boolean
    attempts?: number
    isAttempted?: boolean
    score?: number
  }
  parentTitle?: string
  variant?: "default" | "compact" | "detailed"
}

export function TestCard({ test, parentTitle, variant = "default" }: TestCardProps) {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 border-green-200"
      case "Medium":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "Hard":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-blue-100 text-blue-700 border-blue-200"
    }
  }

  const getGradientColor = (index?: number) => {
    const gradients = [
      "from-blue-500 to-cyan-400",
      "from-purple-500 to-pink-400",
      "from-green-500 to-emerald-400",
      "from-orange-500 to-yellow-400",
      "from-indigo-500 to-violet-400",
      "from-red-500 to-rose-400",
    ]
    return gradients[(test.testNumber || 1) % gradients.length]
  }

  if (variant === "compact") {
    return (
      <Link href={`/exams/${test.id}`}>
        <Card className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden border-0 shadow-sm">
          <div className={`h-1 bg-gradient-to-r ${getGradientColor()}`} />
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {test.title}
                </p>
                {parentTitle && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{parentTitle}</p>
                )}
              </div>
              {test.isPremium && <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {test.duration}m
              </span>
              <span className="flex items-center gap-1">
                <FileQuestion className="h-3 w-3" />
                {test.totalQuestions} Qs
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-md hover:-translate-y-1">
      {/* Top Gradient Bar */}
      <div className={`h-2 bg-gradient-to-r ${getGradientColor()}`} />

      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[11px] font-medium px-2 py-0.5">
              Test #{test.testNumber || 1}
            </Badge>
            <Badge className={`text-[11px] px-2 py-0.5 ${getDifficultyColor(test.difficulty)}`}>
              {test.difficulty || "Mixed"}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {test.isPremium && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
                <Crown className="h-3 w-3" />
                Premium
              </Badge>
            )}
            {test.isAttempted && (
              <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                <CheckCircle className="h-3 w-3" />
                Done
              </Badge>
            )}
          </div>
        </div>

        <CardTitle className="text-base line-clamp-2 font-bold text-gray-800 min-h-[40px]">
          {test.title}
        </CardTitle>

        {parentTitle && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <BookOpen className="h-3 w-3" />
            {parentTitle}
          </p>
        )}

        <CardDescription className="text-xs line-clamp-2 text-gray-500 mt-1 min-h-[32px]">
          {test.description || `Practice test with ${test.totalQuestions} questions to improve your skills`}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 pb-5 pt-0">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2.5 bg-blue-50 rounded-xl">
            <Clock className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <p className="text-sm font-bold text-blue-700">{test.duration}</p>
            <p className="text-[10px] text-gray-500">Minutes</p>
          </div>
          <div className="text-center p-2.5 bg-green-50 rounded-xl">
            <FileQuestion className="h-4 w-4 mx-auto mb-1 text-green-600" />
            <p className="text-sm font-bold text-green-700">{test.totalQuestions}</p>
            <p className="text-[10px] text-gray-500">Questions</p>
          </div>
          <div className="text-center p-2.5 bg-purple-50 rounded-xl">
            <Target className="h-4 w-4 mx-auto mb-1 text-purple-600" />
            <p className="text-sm font-bold text-purple-700">{test.totalMarks}</p>
            <p className="text-[10px] text-gray-500">Marks</p>
          </div>
        </div>

        {/* Attempted Status */}
        {test.isAttempted && test.score !== undefined && (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg mb-3">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">
              Your Score: <strong>{test.score}%</strong>
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href={`/exams/${test.id}`} className="flex-1">
            <Button
              size="sm"
              className={`w-full gap-1 text-sm h-10 ${
                test.isAttempted
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
              }`}
            >
              <Play className="h-4 w-4" />
              {test.isAttempted ? "Retake Test" : "Start Test"}
            </Button>
          </Link>
          {test.isAttempted && (
            <Link href={`/results?examId=${test.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-sm h-10 px-3"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TestCard
