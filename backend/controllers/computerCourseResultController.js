const { ComputerCourseResult, ComputerCourseExam, ComputerCourseQuestion, Course } = require('../models');

exports.submitResult = async (req, res, next) => {
  try {
    const {
      examId,
      answers,
      timeTaken,
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      wrongAnswers,
      totalMarks,
      obtainedMarks,
      percentage,
      passed
    } = req.body;

    const userId = req.user.id;

    const exam = await ComputerCourseExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Recalculate stats for security
    let calcCorrectAnswers = 0;
    let calcWrongAnswers = 0;
    let calcObtainedMarks = 0;
    let calcTotalMarks = 0;
    
    const validatedAnswers = [];
    for (const answer of answers) {
      const question = await ComputerCourseQuestion.findById(answer.questionId);
      if (!question) continue;

      const isCorrect = question.correctOption === answer.selectedOption;
      const marksObtained = isCorrect ? question.marks : 0;

      if (isCorrect) {
        calcCorrectAnswers++;
        calcObtainedMarks += marksObtained;
      } else {
        calcWrongAnswers++;
      }
      calcTotalMarks += question.marks;

      validatedAnswers.push({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        marksObtained
      });
    }

    const calcPercentage = calcTotalMarks > 0 ? (calcObtainedMarks / calcTotalMarks) * 100 : 0;
    const calcPassed = calcPercentage >= (exam.passingMarks || 0);

    const result = await ComputerCourseResult.create({
      userId,
      examId,
      courseId: exam.courseId,
      answers: validatedAnswers,
      totalQuestions: exam.totalQuestions || validatedAnswers.length,
      answeredQuestions: validatedAnswers.length,
      correctAnswers: calcCorrectAnswers,
      wrongAnswers: calcWrongAnswers,
      totalMarks: calcTotalMarks,
      obtainedMarks: calcObtainedMarks,
      percentage: parseFloat(calcPercentage.toFixed(2)),
      passed: calcPassed,
      timeTaken,
      timeLimit: exam.duration
    });

    res.status(201).json({
      success: true,
      message: 'Result submitted successfully',
      result: {
        id: result._id,
        examId: result.examId,
        courseId: result.courseId,
        totalQuestions: result.totalQuestions,
        answeredQuestions: result.answeredQuestions,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
        totalMarks: result.totalMarks,
        obtainedMarks: result.obtainedMarks,
        percentage: result.percentage,
        passed: result.passed,
        timeTaken: result.timeTaken,
        completedAt: result.completedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyResults = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const results = await ComputerCourseResult.find({ userId })
      .populate('examId', 'title description duration totalQuestions totalMarks passingMarks')
      .populate('courseId', 'title image')
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      results: results.map(result => ({
        id: result._id,
        exam: result.examId ? {
          id: result.examId._id,
          title: result.examId.title,
          description: result.examId.description,
          duration: result.examId.duration,
          totalQuestions: result.examId.totalQuestions,
          totalMarks: result.examId.totalMarks,
          passingMarks: result.examId.passingMarks
        } : null,
        course: result.courseId ? {
          id: result.courseId._id,
          title: result.courseId.title,
          image: result.courseId.image
        } : null,
        totalQuestions: result.totalQuestions,
        answeredQuestions: result.answeredQuestions,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
        totalMarks: result.totalMarks,
        obtainedMarks: result.obtainedMarks,
        percentage: result.percentage,
        passed: result.passed,
        timeTaken: result.timeTaken,
        completedAt: result.completedAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

exports.getResult = async (req, res, next) => {
  try {
    const result = await ComputerCourseResult.findById(req.params.id)
      .populate('examId', 'title description duration totalQuestions totalMarks passingMarks')
      .populate('courseId', 'title image')
      .populate('answers.questionId', 'question options explanation correctOption marks');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    if (result.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this result'
      });
    }

    res.status(200).json({
      success: true,
      result: {
        id: result._id,
        exam: result.examId ? {
          id: result.examId._id,
          title: result.examId.title,
          description: result.examId.description,
          duration: result.examId.duration,
          totalQuestions: result.examId.totalQuestions,
          totalMarks: result.examId.totalMarks,
          passingMarks: result.examId.passingMarks
        } : null,
        course: result.courseId ? {
          id: result.courseId._id,
          title: result.courseId.title,
          image: result.courseId.image
        } : null,
        answers: result.answers,
        totalQuestions: result.totalQuestions,
        answeredQuestions: result.answeredQuestions,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
        totalMarks: result.totalMarks,
        obtainedMarks: result.obtainedMarks,
        percentage: result.percentage,
        passed: result.passed,
        timeTaken: result.timeTaken,
        completedAt: result.completedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.checkCompletion = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const userId = req.user.id;

    const result = await ComputerCourseResult.findOne({ userId, examId });

    res.status(200).json({
      success: true,
      hasCompleted: !!result,
      result: result ? {
        id: result._id,
        percentage: result.percentage,
        passed: result.passed,
        completedAt: result.completedAt
      } : null
    });
  } catch (error) {
    next(error);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { limit = 10 } = req.query;

    const results = await ComputerCourseResult.find({ examId })
      .populate('userId', 'name avatar')
      .sort({ percentage: -1, timeTaken: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: results.length,
      leaderboard: results.map((result, index) => ({
        rank: index + 1,
        user: result.userId ? {
          id: result.userId._id,
          name: result.userId.name,
          avatar: result.userId.avatar
        } : null,
        percentage: result.percentage,
        obtainedMarks: result.obtainedMarks,
        totalMarks: result.totalMarks,
        timeTaken: result.timeTaken,
        completedAt: result.completedAt
      }))
    });
  } catch (error) {
    next(error);
  }
};
