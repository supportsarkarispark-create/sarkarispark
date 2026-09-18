import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("paymentToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Single-device session expiry handling
    if (error.response?.status === 401) {
      if (error.response?.data?.sessionExpired && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("session-expired", {
            detail: { message: error.response?.data?.message }
          })
        )
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data: any) => api.put("/auth/profile", data),
  uploadAvatar: (formData: FormData) =>
    api.post("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/auth/password", data),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  logout: () => api.post("/auth/logout"),
} 

// Questions API
export const questionsAPI = {
  getQuestions: (examId: string) => api.get(`/questions/exam/${examId}`),
  getSubjects: (examId: string) => api.get(`/questions/subjects/${examId}`),
  getTopics: (examId: string, subject?: string) =>
    api.get(`/questions/topics/${examId}`, { params: { subject } }),
}

// Results API
export const resultsAPI = {
  submitResult: (data: any) => api.post("/results", data),
  getMyResults: (params?: any) => api.get("/results", { params }),
  getResult: (id: string) => api.get(`/results/${id}`),
  getAnalytics: () => api.get("/results/analytics"),
  searchResult: (rollNumber: string, examId: string) =>
    api.get("/results/search", { params: { rollNumber, examId } }),
  getLeaderboard: (examId: string, params?: any) =>
    api.get(`/results/leaderboard/${examId}`, { params }),
  getAllResults: (params?: any) => api.get("/results/admin/all", { params }),
  getResultStats: () => api.get("/results/admin/stats"),
  deleteResult: (id: string) => api.delete(`/results/admin/${id}`),
}

// Payments API
export const paymentsAPI = {
  getPlans: () => api.get("/payments/plans"),
  createOrder: (data: { planType: string; duration?: string; selectedExams?: string[]; examId?: string; pricingType?: string; couponCode?: string }) =>
    api.post("/payments/order", data),
  verifyPayment: (data: any) => api.post("/payments/verify", data),
  getMyPayments: () => api.get("/payments"),
  getSubscriptionStatus: () => api.get("/payments/subscription-status"),
  checkExamAccess: (examId: string) => api.get(`/payments/check-exam-access/${examId}`),
}

// Coupons API
export const couponsAPI = {
  getCoupons: (params?: any) => api.get("/coupons", { params }),
  getPublicCoupons: () => api.get("/coupons/public"),
  getCoupon: (id: string) => api.get(`/coupons/${id}`),
  createCoupon: (data: any) => api.post("/coupons", data),
  updateCoupon: (id: string, data: any) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/coupons/${id}`),
  validateCoupon: (data: any) => api.post("/coupons/validate", data),
  applyCoupon: (data: any) => api.post("/coupons/apply", data),
}

// Exams API
export const examsAPI = {
  getExams: (params?: any) => api.get("/exams", { params }),
  getExam: (id: string) => api.get(`/exams/${id}`),
  getExamTests: (id: string) => api.get(`/exams/${id}/tests`),
  getCategories: () => api.get("/exams/categories"),
}

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get("/admin/dashboard"),
  getAnalytics: (period?: string) => api.get("/admin/analytics", { params: { period } }),

  // Users
  getUsers: (params?: any) => api.get("/admin/users", { params }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  // Exams Management
  createExam: (data: any) => api.post("/exams", data),
  updateExam: (id: string, data: any) => api.put(`/exams/${id}`, data),
  deleteExam: (id: string) => api.delete(`/exams/${id}`),

  // Questions Management
  getQuestions: (examId: string, params?: any) => api.get(`/questions/exam/${examId}`, { params }),
  getQuestion: (id: string) => api.get(`/questions/${id}`),
  createQuestion: (data: any) => api.post("/questions", data),
  createBulkQuestions: (examId: string, questions: any[]) => api.post(`/questions/bulk`, { examId, questions }),
  updateQuestion: (id: string, data: any) => api.put(`/questions/${id}`, data),
  deleteQuestion: (id: string) => api.delete(`/questions/${id}`),
  importQuestions: (examId: string, format: 'json' | 'csv', data: string) =>
    api.post(`/questions/import`, { examId, format, data }),

  // Results
  getAllResults: (params?: any) => api.get("/results/all", { params }),
  publishResults: (data: any) => api.post("/admin/results/publish", data),

  // Payments
  getPayments: (params?: any) => api.get("/admin/payments", { params }),

  // Admit Cards
  getAdmitCards: (params?: any) => api.get("/admin/admitcards", { params }),
  generateAdmitCards: (data: any) => api.post("/admin/admitcards", data),
  deleteAdmitCard: (id: string) => api.delete(`/admin/admitcards/${id}`),
}

// Admit Cards API
export const admitCardsAPI = {
  getMyAdmitCards: () => api.get("/admitcards"),
  getAdmitCard: (id: string) => api.get(`/admitcards/${id}`),
  downloadAdmitCard: (id: string) => api.get(`/admitcards/${id}/download`),
  searchAdmitCard: (rollNumber: string, examId: string) =>
    api.get("/admitcards/search", { params: { rollNumber, examId } }),
}

// Settings API
export const settingsAPI = {
  getSettings: () => api.get("/settings"),
  updateSettings: (data: any) => api.put("/settings", data),
}

// Slider API
export const sliderAPI = {
  getSliders: () => api.get("/sliders"),
  getSlider: (id: string) => api.get(`/sliders/${id}`),
  createSlider: (data: FormData) => api.post("/sliders", data, {
    headers: { "Content-Type": undefined } // Let browser set multipart/form-data with boundary
  }),
  updateSlider: (id: string, data: FormData) => api.put(`/sliders/${id}`, data, {
    headers: { "Content-Type": undefined } // Let browser set multipart/form-data with boundary
  }),
  deleteSlider: (id: string) => api.delete(`/sliders/${id}`),
  getAllSlidersAdmin: () => api.get("/sliders/admin/all"),
}

// Exam Categories API
export const examCategoryAPI = {
  getCategories: () => api.get("/exam-categories"),
  getCategory: (id: string) => api.get(`/exam-categories/${id}`),
  getAllCategoriesAdmin: () => api.get("/exam-categories/admin/all"),
  createCategory: (data: any) => api.post("/exam-categories", data),
  updateCategory: (id: string, data: any) => api.put(`/exam-categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/exam-categories/${id}`),
  toggleCategoryStatus: (id: string) => api.patch(`/exam-categories/${id}/toggle`),
  // Category courses
  getCategoryCourses: (categoryId: string) => api.get(`/exam-categories/${categoryId}/courses`),
  createCategoryCourse: (categoryId: string, data: FormData) =>
    api.post(`/exam-categories/${categoryId}/courses`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateCategoryCourse: (courseId: string, data: FormData) =>
    api.put(`/exam-categories/courses/${courseId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteCategoryCourse: (courseId: string) => api.delete(`/exam-categories/courses/${courseId}`),
}

// Courses API
export const coursesAPI = {
  getCourses: (params?: any) => api.get("/courses", { params }),
  getCourse: (id: string) => api.get(`/courses/${id}`),
}


// Computer Course Exams API
export const computerCourseExamsAPI = {
  getCourseExams: (courseId: string) => api.get(`/computer-course-exams/course/${courseId}`),
  getExam: (id: string) => api.get(`/computer-course-exams/${id}`),
  getAllExamsAdmin: () => api.get("/computer-course-exams/admin/all"),
  createExam: (data: any) => api.post("/computer-course-exams", data),
  updateExam: (id: string, data: any) => api.put(`/computer-course-exams/${id}`, data),
  deleteExam: (id: string) => api.delete(`/computer-course-exams/${id}`),
  toggleExamStatus: (id: string) => api.patch(`/computer-course-exams/${id}/toggle`),
}

// Computer Course Questions API
export const computerCourseQuestionsAPI = {
  getExamQuestions: (examId: string) => api.get(`/computer-course-questions/exam/${examId}`),
  getExamQuestionsAdmin: (examId: string) => api.get(`/computer-course-questions/exam/${examId}/admin`),
  getQuestion: (id: string) => api.get(`/computer-course-questions/${id}`),
  createQuestion: (data: any) => api.post("/computer-course-questions", data),
  createBulkQuestions: (data: any) => api.post("/computer-course-questions/bulk", data),
  importQuestions: (data: any) => api.post("/computer-course-questions/import", data),
  updateQuestion: (id: string, data: any) => api.put(`/computer-course-questions/${id}`, data),
  deleteQuestion: (id: string) => api.delete(`/computer-course-questions/${id}`),
  deleteAllExamQuestions: (examId: string) => api.delete(`/computer-course-questions/exam/${examId}`),
  toggleQuestionStatus: (id: string) => api.patch(`/computer-course-questions/${id}/toggle`),
}

// Study Materials API
export const studyMaterialAPI = {
  getCourseMaterials: (courseId: string) => api.get(`/study-materials/course/${courseId}`),
  getMaterial: (id: string) => api.get(`/study-materials/${id}`),
  incrementDownload: (id: string) => api.patch(`/study-materials/${id}/download`),
  getAllMaterialsAdmin: () => api.get("/study-materials/admin/all"),
  createMaterial: (data: FormData) => api.post("/study-materials", data),
  updateMaterial: (id: string, data: FormData) => api.put(`/study-materials/${id}`, data),
  deleteMaterial: (id: string) => api.delete(`/study-materials/${id}`),
  toggleMaterialStatus: (id: string) => api.patch(`/study-materials/${id}/toggle`),
}

// Government Results API
export const govResultsAPI = {
  getGovResults: (params?: any) => api.get("/gov-results", { params }),
  getGovResult: (id: string) => api.get(`/gov-results/${id}`),
  getAllGovResultsAdmin: () => api.get("/gov-results/admin/all"),
  createGovResult: (data: FormData) => api.post("/gov-results", data),
  updateGovResult: (id: string, data: FormData) => api.put(`/gov-results/${id}`, data),
  deleteGovResult: (id: string) => api.delete(`/gov-results/${id}`),
  toggleLatest: (id: string) => api.put(`/gov-results/${id}/toggle-latest`),
}

// Latest Jobs API
export const latestJobsAPI = {
  getLatestJobs: (params?: any) => api.get("/latest-jobs", { params }),
  getLatestJob: (id: string) => api.get(`/latest-jobs/${id}`),
  getAllLatestJobsAdmin: (params?: any) => api.get("/latest-jobs/admin/all", { params }),
  createLatestJob: (data: FormData) => api.post("/latest-jobs", data),
  updateLatestJob: (id: string, data: FormData) => api.put(`/latest-jobs/${id}`, data),
  deleteLatestJob: (id: string) => api.delete(`/latest-jobs/${id}`),
  toggleLatest: (id: string) => api.put(`/latest-jobs/${id}/toggle-latest`),
}

// Computer Course Results API
export const computerCourseResultsAPI = {
  getLeaderboard: (examId: string, limit?: number) => api.get(`/computer-course-results/leaderboard/${examId}`, { params: { limit } }),
  submitResult: (data: any) => api.post("/computer-course-results", data),
  getMyResults: () => api.get("/computer-course-results/my-results"),
  checkCompletion: (examId: string) => api.get(`/computer-course-results/check/${examId}`),
  getResult: (id: string) => api.get(`/computer-course-results/${id}`),
}

// Media API
export const mediaAPI = {
  getAll: (params?: { page?: number; limit?: number; folder?: string }) =>
    api.get("/media", { params }),
  getFolders: () => api.get("/media/folders"),
  getImages: () => api.get("/media/images"),
  upload: (formData: FormData) =>
    api.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadImage: (formData: FormData) =>
    api.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: { altText?: string; folder?: string }) =>
    api.put(`/media/${id}`, data),
  delete: (id: string) => api.delete(`/media/${id}`),
}

// Helper to get full image URL
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return ""
  if (path.startsWith("http")) return path

  // Remove /api or /api/ from the end of API_URL to get base URL
  let baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || "http://localhost:5000"

  // Ensure path starts with / and baseUrl does not end with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl

  return `${normalizedBaseUrl}${normalizedPath}`
}

// Feedback API
export const feedbackAPI = {
  getApproved: () => api.get("/feedback"),
  getAll: () => api.get("/feedback/admin"),
  create: (data: any) => api.post("/feedback", data),
  update: (id: string, data: any) => api.put(`/feedback/${id}`, data),
  delete: (id: string) => api.delete(`/feedback/${id}`),
  toggleApproval: (id: string) => api.patch(`/feedback/${id}/approve`),
  toggleFeatured: (id: string) => api.patch(`/feedback/${id}/feature`),
}

// Sarkari Admit Card API
export const sarkariAdmitCardAPI = {
  getSarkariAdmitCards: (params?: any) => api.get("/sarkari-admit-cards", { params }),
  getSarkariAdmitCard: (id: string) => api.get(`/sarkari-admit-cards/${id}`),
  getAllSarkariAdmitCardsAdmin: () => api.get("/sarkari-admit-cards/admin/all"),
}

// Sarkari Works API
export const sarkariWorksAPI = {
  getSarkariWorks: (params?: any) => api.get("/sarkari-works", { params }),
  getSarkariWork: (id: string) => api.get(`/sarkari-works/${id}`),
  getAllSarkariWorksAdmin: (params?: any) => api.get("/sarkari-works/admin/all", { params }),
  createSarkariWork: (data: any) => api.post("/sarkari-works", data),
  updateSarkariWork: (id: string, data: any) => api.put(`/sarkari-works/${id}`, data),
  deleteSarkariWork: (id: string) => api.delete(`/sarkari-works/${id}`),
}

