"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery, useMutation } from "react-query"
import { useParams, useRouter } from "next/navigation"
import { resultsAPI } from "@/lib/api"
import api from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Loader2,
  Timer,
  AlertTriangle,
} from "lucide-react"
import toast from "react-hot-toast"

interface Question {
  id: string
  question: string
  questionHindi?: string
  options: { text: string; textHindi?: string }[]
  marks: number
  explanation?: string
  explanationHindi?: string
}

interface ExamData {
  exam: {
    id: string
    title: string
    duration: number
    totalQuestions: number
    totalMarks: number
    instructions: string[]
  }
  questions: Question[]
}

export default function ExamAttemptPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [examStarted, setExamStarted] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [showHindi, setShowHindi] = useState(false)

  const { data, isLoading, error } = useQuery<ExamData>(
    ["examQuestions", examId],
    async () => {
      try {
        const response = await api.get(`/exams/${examId}/questions`)
        return response.data
      } catch (err: any) {
        console.error("API Error:", err.response?.data || err.message)
        throw err
      }
    },
    { 
      enabled: !!examId && examId !== 'undefined',
      cacheTime: 0,  // Don't cache - always fetch fresh
      staleTime: 0   // Always consider data stale
    }
  )

  // Log data changes
  useEffect(() => {
    // Reset all state for fresh attempt
    setCurrentQuestion(0)
    setAnswers({})
    setMarkedQuestions(new Set())
    setTimeLeft(0)
    setShowSubmitDialog(false)
    setShowInstructions(true)
    setExamStarted(false)
    setStartTime(null)
  }, [examId])

  const submitMutation = useMutation(
    async () => {
      if (!data || !startTime) return

      const timeTaken = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
      
      const formattedAnswers = data.questions.map((q) => ({
        questionId: q.id,
        selectedOption: answers[q.id] ?? -1,
        timeSpent: 0,
      }))

      return resultsAPI.submitResult({
        examId,
        answers: formattedAnswers,
        timeTaken,
        startedAt: startTime.toISOString(),
      })
    },
    {
      onSuccess: (response) => {
        toast.success("Exam submitted successfully!")
        router.push(`/results/${response?.data?.result?.id}`)
      },
      onError: () => {
        toast.error("Failed to submit exam. Please try again.")
      },
    }
  )

  useEffect(() => {
    if (data && examStarted) {
      setTimeLeft(data.exam.duration * 60)
    }
  }, [data, examStarted])

  const handleSubmit = useCallback(() => {
    submitMutation.mutate()
  }, [submitMutation])

  useEffect(() => {
    if (!examStarted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [examStarted, timeLeft, handleSubmit])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours > 0 ? `${hours}:` : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const toggleMarkQuestion = () => {
    setMarkedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion)
      } else {
        newSet.add(currentQuestion)
      }
      return newSet
    })
  }

  const handleStartExam = () => {
    setShowInstructions(false)
    setExamStarted(true)
    setStartTime(new Date())
  }

  const answeredCount = Object.keys(answers).length
  const markedCount = markedQuestions.size
  const totalQuestions = data?.exam.totalQuestions || 0
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exam questions...</p>
        </div>
      </div>
    )
  }

  if (showInstructions && data) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{data.exam.title}</h1>
              <p className="text-muted-foreground">Please read the instructions carefully before starting</p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">{data.exam.duration} mins</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">{data.exam.totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-xl text-center">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">{data.exam.totalMarks}</p>
                  <p className="text-sm text-muted-foreground">Total Marks</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Instructions:</h3>
                {(data.exam.instructions || [
                  "Read all questions carefully before answering.",
                  "Each question carries equal marks unless specified otherwise.",
                  "There is no negative marking for unattempted questions.",
                  "Timer will start once you click 'Start Exam'.",
                  "Do not refresh the page during the exam.",
                  "Submit your exam before the timer ends.",
                ]).map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm text-muted-foreground">{instruction}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Important</p>
                    <p className="text-sm text-amber-800">
                      Once started, the exam cannot be paused. Ensure you have stable internet connection and sufficient time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    <p className="text-blue-800">Loading exam questions...</p>
                  </div>
                </div>
              )}
              
              {/* Error state */}
              {!!error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Error Loading Exam</p>
                      <p className="text-sm text-red-600 mt-1">
                        {error instanceof Error ? error.message : 'Unknown error'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => router.push(`/exams/${examId}`)}>
                Go Back
              </Button>
              <Button 
                className="flex-1 btn-glow" 
                onClick={handleStartExam}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Start Exam"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = data?.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold hidden sm:block">{data?.exam.title}</h1>
              <Badge variant="secondary">
                Q {currentQuestion + 1} / {data?.exam.totalQuestions}
              </Badge>
              {/* Language Toggle */}
              {currentQ?.questionHindi && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHindi(!showHindi)}
                  className="gap-1"
                >
                  <span className="text-xs">{showHindi ? "English" : "हिंदी"}</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-semibold ${
                timeLeft < 300 ? "bg-red-100 text-red-600 animate-pulse" : "bg-primary/10 text-primary"
              }`}>
                <Timer className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
              <Button variant="destructive" size="sm" onClick={() => setShowSubmitDialog(true)}>
                Submit
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <Card className="min-h-[400px]">
              <CardContent className="p-8">
                {!currentQ && (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Questions Available</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-4">
                      {data?.questions?.length === 0 
                        ? "This exam does not have any questions yet. Please contact the administrator to add questions."
                        : "Loading questions failed. Please try again."
                      }
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => router.push(`/exams/${examId}`)}
                      >
                        Go Back
                      </Button>
                      <Button 
                        variant="default"
                        onClick={() => window.location.reload()}
                      >
                        Refresh Page
                      </Button>
                    </div>
                  </div>
                )}
                {currentQ && (
                  <div className="space-y-6">
                    {/* Question Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-base px-3 py-1">
                          Question {currentQuestion + 1}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Marks: {currentQ.marks}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMarkQuestion}
                        className={markedQuestions.has(currentQuestion) ? "text-amber-500" : ""}
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        {markedQuestions.has(currentQuestion) ? "Marked" : "Mark for Review"}
                      </Button>
                    </div>

                    {/* Question Text */}
                    <div className="prose prose-lg max-w-none">
                      <p className="text-lg leading-relaxed">
                        {showHindi && currentQ.questionHindi ? currentQ.questionHindi : currentQ.question}
                      </p>
                      {showHindi && currentQ.questionHindi && (
                        <p className="text-sm text-muted-foreground mt-2 border-t pt-2">
                          {currentQ.question}
                        </p>
                      )}
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {currentQ.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswer(currentQ.id, index)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            answers[currentQ.id] === index
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              answers[currentQ.id] === index
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground"
                            }`}>
                              {answers[currentQ.id] === index && <CheckCircle2 className="h-4 w-4" />}
                            </div>
                            <span className="text-base">
                              {showHindi && option.textHindi ? option.textHindi : option.text}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-6 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentQuestion((prev) => Math.min((data?.questions.length || 1) - 1, prev + 1))}
                        disabled={currentQuestion === (data?.questions.length || 1) - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Question Palette */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Question Palette</h3>
                
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {data?.questions?.length === 0 && (
                    <div className="col-span-5 text-center py-4 text-muted-foreground text-sm">
                      No questions available
                    </div>
                  )}
                  {data?.questions.map((q, index) => {
                    const isAnswered = answers[q.id] !== undefined
                    const isMarked = markedQuestions.has(index)
                    const isCurrent = index === currentQuestion

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestion(index)}
                        className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${
                          isCurrent
                            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                            : isAnswered
                            ? "bg-green-100 text-green-700"
                            : isMarked
                            ? "bg-amber-100 text-amber-700"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-green-100" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-amber-100" />
                    <span>Marked ({markedCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <span>Not Answered ({totalQuestions - answeredCount})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} out of {totalQuestions} questions.
              {answeredCount < totalQuestions && (
                <span className="text-amber-600 block mt-2">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  You have {totalQuestions - answeredCount} unanswered questions.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Exam
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isLoading}
            >
              {submitMutation.isLoading ? "Submitting..." : "Submit Exam"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
