"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useQuery, useMutation } from "react-query"
import { useParams, useRouter } from "next/navigation"
import { computerCourseExamsAPI, computerCourseQuestionsAPI, computerCourseResultsAPI } from "@/lib/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import {
  Clock, ChevronLeft, ChevronRight, Flag, AlertCircle,
  CheckCircle, Timer, ArrowRight, Trophy, Target, BarChart3,
  Crown, Star, Lock
} from "lucide-react"

interface Answer {
  questionId: string
  selectedOption: number
}

export default function ComputerExamAttemptPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [examStarted, setExamStarted] = useState(false)
  const [examFinished, setExamFinished] = useState(false)
  const [resultData, setResultData] = useState<any>(null)

  const { data: examData, isLoading: examLoading } = useQuery(
    ["computer-exam", examId],
    () => computerCourseExamsAPI.getExam(examId)
  )

  const { data: questionsData, isLoading: questionsLoading } = useQuery(
    ["computer-exam-questions", examId],
    () => computerCourseQuestionsAPI.getExamQuestions(examId)
  )

  const submitResultMutation = useMutation(
    (data: any) => computerCourseResultsAPI.submitResult(data),
    {
      onSuccess: (response) => {
        setResultData(response.data?.result)
      },
      onError: (error: any) => {
        console.error("Failed to save result:", error)
      }
    }
  )

  const exam = useMemo(() => examData?.data?.exam, [examData])
  const questions = useMemo(() => questionsData?.data?.questions || [], [questionsData])

  const handleSubmitExam = useCallback(() => {
    setExamFinished(true)
    let correct = 0
    let totalMarks = 0
    let obtainedMarks = 0
    let wrong = 0

    const validatedAnswers = answers.map(answer => {
      const question = questions.find((q: any) => q.id === answer.questionId)
      const isCorrect = question ? question.correctOption === answer.selectedOption : false
      const marksObtained = isCorrect ? (question?.marks || 0) : 0

      if (isCorrect) {
        correct++
        obtainedMarks += marksObtained
      } else {
        wrong++
      }
      if (question) {
        totalMarks += question.marks
      }

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        marksObtained
      }
    })

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0
    const passed = percentage >= (exam?.passingMarks || 0)
    const timeTaken = exam?.duration * 60 - timeRemaining

    const resultPayload = {
      examId,
      answers: validatedAnswers,
      totalQuestions: questions.length,
      answeredQuestions: answers.length,
      correctAnswers: correct,
      wrongAnswers: wrong,
      totalMarks,
      obtainedMarks,
      percentage: parseFloat(percentage.toFixed(2)),
      passed,
      timeTaken
    }

    submitResultMutation.mutate(resultPayload)
    setResultData(resultPayload)
  }, [answers, questions, exam, examId, timeRemaining, submitResultMutation])

  useEffect(() => {
    if (exam && examStarted && !examFinished) {
      setTimeRemaining(exam.duration * 60)
    }
  }, [exam, examStarted, examFinished])

  useEffect(() => {
    if (timeRemaining > 0 && examStarted && !examFinished) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining, examStarted, examFinished, handleSubmitExam])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours > 0 ? hours + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartExam = () => {
    setExamStarted(true)
  }

  const handleAnswerSelect = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex]
    const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQuestion.id)

    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers]
      newAnswers[existingAnswerIndex].selectedOption = optionIndex
      setAnswers(newAnswers)
    } else {
      setAnswers([...answers, { questionId: currentQuestion.id, selectedOption: optionIndex }])
    }
  }

  const handleFlagQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex]
    if (flaggedQuestions.includes(currentQuestion.id)) {
      setFlaggedQuestions(flaggedQuestions.filter(id => id !== currentQuestion.id))
    } else {
      setFlaggedQuestions([...flaggedQuestions, currentQuestion.id])
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  if (examLoading || questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Exam Not Available</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">This exam doesn&apos;t have any questions yet.</p>
            <Button onClick={() => router.push(`/computer-exams/${examId}`)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Premium Exam Access Block
  if (exam.accessType === 'premium') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-amber-300">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl text-amber-900">Premium Exam</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-amber-800">
              This is a premium exam. Please upgrade to access it.
            </p>
            <Button onClick={() => router.push('/pricing')} className="w-full gap-2 bg-amber-500 hover:bg-amber-600">
              <Star className="h-4 w-4" />
              Upgrade to Premium
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push(`/computer-exams/${examId}`)}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Login Required Block
  if (exam.accessType === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-blue-300">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl text-blue-900">Login Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-blue-800">
              Please login to access this exam.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full gap-2 bg-blue-500 hover:bg-blue-600">
              <Lock className="h-4 w-4" />
              Login
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push(`/computer-exams/${examId}`)}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ready to Start?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-xl text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{exam.duration} minutes</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="font-semibold">{questions.length} Questions</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Passing Marks</p>
                <p className="font-semibold">{exam.passingMarks}%</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl text-center">
                <Timer className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="font-semibold">{exam.totalMarks}</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Before You Start</p>
                  <ul className="text-sm text-amber-800 mt-2 space-y-1">
                    <li>• Ensure stable internet connection</li>
                    <li>• Do not refresh or close the browser</li>
                    <li>• Timer cannot be paused once started</li>
                    <li>• Answer all questions before submitting</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => router.push(`/computer-exams/${examId}`)}>
                Cancel
              </Button>
              <Button className="flex-1 gap-2" onClick={handleStartExam}>
                Start Exam
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (examFinished && resultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className={`h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center ${resultData.passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {resultData.passed ? (
                <Trophy className="h-10 w-10 text-green-600" />
              ) : (
                <Target className="h-10 w-10 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {resultData.passed ? "Congratulations!" : "Keep Practicing!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-5xl font-bold mb-2 ${resultData.passed ? 'text-green-600' : 'text-red-600'}`}>
                {resultData.percentage}%
              </div>
              <p className="text-lg text-muted-foreground">
                {resultData.obtainedMarks} / {resultData.totalMarks} Marks
              </p>
              <Badge className={`mt-4 text-sm ${resultData.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {resultData.passed ? "PASSED" : "FAILED"}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-muted-foreground">Correct</p>
                <p className="text-xl font-semibold text-green-600">{resultData.correctAnswers}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl text-center">
                <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <p className="text-sm text-muted-foreground">Wrong</p>
                <p className="text-xl font-semibold text-red-600">{resultData.wrongAnswers}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-xl font-semibold">{Math.floor(resultData.timeTaken / 60)}m</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => router.push(`/computer-exams/${examId}`)}>
                Back to Exam
              </Button>
              <Button className="flex-1 gap-2" onClick={() => router.push('/dashboard/computer-results')}>
                <BarChart3 className="h-4 w-4" />
                View All Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)
  const isFlagged = flaggedQuestions.includes(currentQuestion.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold">{exam.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-muted'}`}>
                <Timer className="h-5 w-5" />
                <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
              </div>
              <Button variant="destructive" size="sm" onClick={handleSubmitExam}>Submit</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Question Palette</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q: any, index: number) => {
                    const isAnswered = answers.some(a => a.questionId === q.id)
                    const isFlagged = flaggedQuestions.includes(q.id)
                    const isCurrent = index === currentQuestionIndex

                    return (
                      <button
                        key={q.id}
                        onClick={() => handleQuestionClick(index)}
                        className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                          isCurrent ? 'bg-primary text-primary-foreground' :
                          isAnswered ? 'bg-green-100 text-green-700' :
                          isFlagged ? 'bg-amber-100 text-amber-700' :
                          'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-green-100"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-amber-100"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-primary"></div>
                    <span>Current</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Answered</span>
                    <span>{answers.length} / {questions.length}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${(answers.length / questions.length) * 100}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Question {currentQuestionIndex + 1}</Badge>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{currentQuestion.marks} Marks</Badge>
                    <Button variant="ghost" size="sm" onClick={handleFlagQuestion} className={isFlagged ? 'text-amber-600' : ''}>
                      <Flag className={`h-4 w-4 ${isFlagged ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg font-medium">{currentQuestion.question}</p>

                <div className="space-y-3">
                  {currentQuestion.options.map((option: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        currentAnswer?.selectedOption === index ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          currentAnswer?.selectedOption === index ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span>{option.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button onClick={handleSubmitExam} variant="destructive" className="gap-2">
                  Submit Exam
                  <CheckCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
