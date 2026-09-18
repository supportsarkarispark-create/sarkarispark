const mongoose = require('mongoose');
const { Result, Exam, Question, User } = require('../models');

// @desc    Submit exam result
// @route   POST /api/results
// @access  Private
exports.submitResult = async (req, res, next) => {
  try {
    const { examId, answers, timeTaken, startedAt } = req.body;
    const userId = req.user.id;

    // Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Get all questions with correct answers (only active ones)
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ 
      _id: { $in: questionIds },
      examId,
      isActive: true  // Only count active (non-deleted) questions
    });

    // Create a map for quick lookup
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

    // Process answers
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let obtainedMarks = 0;
    let skippedQuestions = 0;

    const processedAnswers = answers.map(answer => {
      const question = questionMap.get(answer.questionId);
      
      if (!question) {
        return null;
      }

      const isCorrect = answer.selectedOption === question.correctAnswer;
      let marksObtained = 0;

      if (answer.selectedOption === -1) {
        skippedQuestions++;
      } else if (isCorrect) {
        correctAnswers++;
        marksObtained = question.marks;
        obtainedMarks += marksObtained;
      } else {
        wrongAnswers++;
        marksObtained = -(question.negativeMark || exam.negativeMarking || 0);
        obtainedMarks += marksObtained;
      }

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        timeSpent: answer.timeSpent || 0,
        marksObtained
      };
    }).filter(Boolean);

    // Calculate percentage
    const percentage = exam.totalMarks > 0 ? (obtainedMarks / exam.totalMarks) * 100 : 0;

    // Determine status
    const status = percentage >= exam.passingMarks ? 'Passed' : 'Failed';

    // Calculate subject-wise and topic-wise analysis
    const subjectAnalysis = {};
    const topicAnalysis = {};

    processedAnswers.forEach(answer => {
      const question = questionMap.get(answer.questionId.toString());
      
      // Subject analysis
      if (question.subject) {
        if (!subjectAnalysis[question.subject]) {
          subjectAnalysis[question.subject] = {
            subject: question.subject,
            totalQuestions: 0,
            correct: 0,
            wrong: 0,
            skipped: 0
          };
        }
        subjectAnalysis[question.subject].totalQuestions++;
        if (answer.selectedOption === -1) {
          subjectAnalysis[question.subject].skipped++;
        } else if (answer.isCorrect) {
          subjectAnalysis[question.subject].correct++;
        } else {
          subjectAnalysis[question.subject].wrong++;
        }
      }

      // Topic analysis
      if (question.topic) {
        if (!topicAnalysis[question.topic]) {
          topicAnalysis[question.topic] = {
            topic: question.topic,
            totalQuestions: 0,
            correct: 0,
            wrong: 0,
            skipped: 0
          };
        }
        topicAnalysis[question.topic].totalQuestions++;
        if (answer.selectedOption === -1) {
          topicAnalysis[question.topic].skipped++;
        } else if (answer.isCorrect) {
          topicAnalysis[question.topic].correct++;
        } else {
          topicAnalysis[question.topic].wrong++;
        }
      }
    });

    // Calculate accuracy for analysis
    const subjectWiseAnalysis = Object.values(subjectAnalysis).map(s => ({
      ...s,
      accuracy: s.totalQuestions > 0 ? (s.correct / (s.totalQuestions - s.skipped)) * 100 : 0
    }));

    const topicWiseAnalysis = Object.values(topicAnalysis).map(t => ({
      ...t,
      accuracy: t.totalQuestions > 0 ? (t.correct / (t.totalQuestions - t.skipped)) * 100 : 0
    }));

    // Create result
    const result = await Result.create({
      userId,
      examId,
      answers: processedAnswers,
      totalQuestions: exam.totalQuestions,
      attemptedQuestions: correctAnswers + wrongAnswers,
      correctAnswers,
      wrongAnswers,
      skippedQuestions,
      totalMarks: exam.totalMarks,
      obtainedMarks: Math.max(0, obtainedMarks),
      percentage: Math.round(percentage * 100) / 100,
      timeTaken,
      timeLimit: exam.duration * 60, // Convert to seconds
      isCompleted: true,
      isTimeUp: timeTaken >= exam.duration * 60,
      status,
      subjectWiseAnalysis,
      topicWiseAnalysis,
      startedAt: new Date(startedAt),
      submittedAt: new Date(),
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent']
    });

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: {
        'stats.totalExamsAttempted': 1,
        'stats.totalQuestionsSolved': correctAnswers + wrongAnswers,
        'stats.correctAnswers': correctAnswers,
        'stats.wrongAnswers': wrongAnswers
      }
    });

    // Update exam attempts count
    await Exam.findByIdAndUpdate(examId, {
      $inc: { attempts: 1 }
    });

    res.status(201).json({
      success: true,
      result: {
        id: result._id,
        exam: {
          id: exam._id,
          title: exam.title,
          category: exam.category
        },
        score: result.obtainedMarks,
        totalMarks: result.totalMarks,
        percentage: result.percentage,
        status: result.status,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
        skippedQuestions: result.skippedQuestions,
        accuracy: result.accuracy,
        timeTaken: result.timeTaken,
        submittedAt: result.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's results
// @route   GET /api/results
// @access  Private
exports.getMyResults = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const results = await Result.find({ userId: req.user.id, isCompleted: true })
      .populate('examId', 'title category duration totalMarks totalQuestions')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Result.countDocuments({ userId: req.user.id, isCompleted: true });

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      results: results.map(r => ({
        id: r._id,
        exam: r.examId || null,
        examId: r.examId?._id || r.examId,
        score: r.obtainedMarks,
        totalMarks: r.totalMarks,
        percentage: r.percentage,
        status: r.status,
        correctAnswers: r.correctAnswers,
        wrongAnswers: r.wrongAnswers,
        timeTaken: r.timeTaken,
        submittedAt: r.submittedAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single result with details
// @route   GET /api/results/:id
// @access  Private
exports.getResult = async (req, res, next) => {
  try {
    let result = await Result.findById(req.params.id)
      .populate('examId', 'title category duration totalMarks totalQuestions negativeMarking instructions')
      .populate('answers.questionId');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Check if result belongs to user or user is admin
    if (result.userId.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this result'
      });
    }

    // Convert to plain object and rename examId to exam for frontend compatibility
    result = result.toObject();
    if (result.examId) {
      result.exam = result.examId;
      delete result.examId;
    }

    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get result by roll number
// @route   GET /api/results/search
// @access  Public
exports.searchResult = async (req, res, next) => {
  try {
    const { rollNumber, examId } = req.query;

    if (!rollNumber || !examId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roll number and exam ID'
      });
    }

    // Find user by roll number
    const user = await User.findOne({ rollNumber });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No result found with this roll number'
      });
    }

    const result = await Result.findOne({ userId: user._id, examId, isCompleted: true })
      .populate('examId', 'title category duration totalMarks')
      .populate('userId', 'name rollNumber');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No result found'
      });
    }

    res.status(200).json({
      success: true,
      result: {
        id: result._id,
        user: {
          name: result.userId.name,
          rollNumber: result.userId.rollNumber
        },
        exam: result.examId,
        score: result.obtainedMarks,
        totalMarks: result.totalMarks,
        percentage: result.percentage,
        status: result.status,
        rank: result.rank,
        submittedAt: result.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's performance analytics
// @route   GET /api/results/analytics
// @access  Private
exports.getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all completed results
    const results = await Result.find({ userId, isCompleted: true })
      .populate('examId', 'title category');

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        analytics: {
          totalExams: 0,
          averageScore: 0,
          highestScore: 0,
          totalTimeSpent: 0,
          subjectWise: [],
          progressOverTime: []
        }
      });
    }

    // Calculate overall stats
    const totalExams = results.length;
    const totalScore = results.reduce((sum, r) => sum + r.percentage, 0);
    const averageScore = totalScore / totalExams;
    const highestScore = Math.max(...results.map(r => r.percentage));
    const totalTimeSpent = results.reduce((sum, r) => sum + r.timeTaken, 0);

    // Subject-wise performance
    const subjectStats = {};
    results.forEach(result => {
      result.subjectWiseAnalysis.forEach(subject => {
        if (!subjectStats[subject.subject]) {
          subjectStats[subject.subject] = {
            subject: subject.subject,
            totalQuestions: 0,
            correct: 0,
            exams: 0
          };
        }
        subjectStats[subject.subject].totalQuestions += subject.totalQuestions;
        subjectStats[subject.subject].correct += subject.correct;
        subjectStats[subject.subject].exams += 1;
      });
    });

    const subjectWise = Object.values(subjectStats).map(s => ({
      subject: s.subject,
      accuracy: s.totalQuestions > 0 ? (s.correct / s.totalQuestions) * 100 : 0,
      totalQuestions: s.totalQuestions,
      exams: s.exams
    }));

    // Progress over time (last 10 exams)
    const progressOverTime = results
      .slice(-10)
      .map(r => ({
        date: r.submittedAt,
        exam: r.examId.title,
        percentage: r.percentage,
        score: r.obtainedMarks
      }));

    res.status(200).json({
      success: true,
      analytics: {
        totalExams,
        averageScore: Math.round(averageScore * 100) / 100,
        highestScore: Math.round(highestScore * 100) / 100,
        totalTimeSpent,
        subjectWise,
        progressOverTime,
        recentResults: results.slice(0, 5).map(r => ({
          id: r._id,
          exam: r.examId.title,
          percentage: r.percentage,
          status: r.status,
          date: r.submittedAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard for an exam
// @route   GET /api/results/leaderboard/:examId
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const results = await Result.find({ examId, isCompleted: true })
      .populate('userId', 'name rollNumber')
      .sort({ percentage: -1, timeTaken: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add rank to each result
    const rankedResults = results.map((result, index) => ({
      rank: skip + index + 1,
      user: {
        name: result.userId.name,
        rollNumber: result.userId.rollNumber
      },
      percentage: result.percentage,
      score: result.obtainedMarks,
      totalMarks: result.totalMarks,
      correctAnswers: result.correctAnswers,
      wrongAnswers: result.wrongAnswers,
      timeTaken: result.timeTaken,
      submittedAt: result.submittedAt
    }));

    const total = await Result.countDocuments({ examId, isCompleted: true });

    res.status(200).json({
      success: true,
      count: rankedResults.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      leaderboard: rankedResults
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all results (Admin only)
// @route   GET /api/results/admin/all
// @access  Private/Admin
exports.getAllResults = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, examId, userId, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { isCompleted: true };
    if (examId) query.examId = examId;
    if (userId) query.userId = userId;

    let resultsQuery = Result.find(query)
      .populate('examId', 'title category')
      .populate('userId', 'name email rollNumber')
      .sort({ submittedAt: -1 });

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { rollNumber: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      query.userId = { $in: userIds };
    }

    const results = await resultsQuery.skip(skip).limit(parseInt(limit));
    const total = await Result.countDocuments(query);

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get exam-wise results stats (Admin only)
// @route   GET /api/results/admin/stats
// @access  Private/Admin
exports.getResultStats = async (req, res, next) => {
  try {
    const { examId } = req.query;
    
    const matchStage = examId ? { examId: new mongoose.Types.ObjectId(examId), isCompleted: true } : { isCompleted: true };

    const stats = await Result.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalResults: { $sum: 1 },
          avgPercentage: { $avg: '$percentage' },
          avgScore: { $avg: '$obtainedMarks' },
          maxScore: { $max: '$obtainedMarks' },
          minScore: { $min: '$obtainedMarks' },
          passedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Passed'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] }
          }
        }
      }
    ]);

    const examStats = await Result.aggregate([
      { $match: { isCompleted: true } },
      {
        $group: {
          _id: '$examId',
          totalAttempts: { $sum: 1 },
          avgPercentage: { $avg: '$percentage' }
        }
      },
      {
        $lookup: {
          from: 'exams',
          localField: '_id',
          foreignField: '_id',
          as: 'exam'
        }
      },
      { $unwind: '$exam' },
      {
        $project: {
          examTitle: '$exam.title',
          totalAttempts: 1,
          avgPercentage: { $round: ['$avgPercentage', 2] }
        }
      },
      { $sort: { totalAttempts: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalResults: 0,
        avgPercentage: 0,
        avgScore: 0,
        passedCount: 0,
        failedCount: 0
      },
      examStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete result (Admin only)
// @route   DELETE /api/results/admin/:id
// @access  Private/Admin
exports.deleteResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    await Result.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Result deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
