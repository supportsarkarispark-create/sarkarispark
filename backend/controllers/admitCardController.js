const { AdmitCard, User, Exam } = require('../models');

// @desc    Get user's admit cards
// @route   GET /api/admitcards
// @access  Private
exports.getMyAdmitCards = async (req, res, next) => {
  try {
    const admitCards = await AdmitCard.find({ 
      userId: req.user.id,
      status: { $in: ['published', 'draft'] }
    })
      .populate('examId', 'title category duration')
      .sort({ 'examDetails.date': -1 });

    res.status(200).json({
      success: true,
      count: admitCards.length,
      admitCards: admitCards.map(ac => ({
        id: ac._id,
        exam: ac.examId,
        rollNumber: ac.rollNumber,
        registrationNumber: ac.registrationNumber,
        candidateName: ac.candidateName,
        examDetails: ac.examDetails,
        status: ac.status,
        isDownloaded: ac.isDownloaded,
        downloadedAt: ac.downloadedAt,
        generatedAt: ac.generatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single admit card
// @route   GET /api/admitcards/:id
// @access  Private
exports.getAdmitCard = async (req, res, next) => {
  try {
    const admitCard = await AdmitCard.findById(req.params.id)
      .populate('examId', 'title category duration totalMarks totalQuestions instructions')
      .populate('userId', 'name email rollNumber');

    if (!admitCard) {
      return res.status(404).json({
        success: false,
        message: 'Admit card not found'
      });
    }

    // Check if admit card belongs to user or user is admin
    if (admitCard.userId._id.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this admit card'
      });
    }

    // Update download info
    if (!admitCard.isDownloaded) {
      admitCard.isDownloaded = true;
      admitCard.downloadedAt = new Date();
    }
    admitCard.downloadCount += 1;
    await admitCard.save();

    res.status(200).json({
      success: true,
      admitCard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search admit card by roll number
// @route   GET /api/admitcards/search
// @access  Public
exports.searchAdmitCard = async (req, res, next) => {
  try {
    const { rollNumber, examId } = req.query;

    if (!rollNumber || !examId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roll number and exam ID'
      });
    }

    const admitCard = await AdmitCard.findOne({ 
      rollNumber, 
      examId,
      status: 'published'
    })
      .populate('examId', 'title category duration')
      .populate('userId', 'name');

    if (!admitCard) {
      return res.status(404).json({
        success: false,
        message: 'Admit card not found'
      });
    }

    res.status(200).json({
      success: true,
      admitCard: {
        id: admitCard._id,
        rollNumber: admitCard.rollNumber,
        registrationNumber: admitCard.registrationNumber,
        candidateName: admitCard.candidateName,
        exam: admitCard.examId,
        examDetails: admitCard.examDetails,
        instructions: admitCard.instructions,
        itemsToBring: admitCard.itemsToBring
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download admit card (generate PDF)
// @route   GET /api/admitcards/:id/download
// @access  Private
exports.downloadAdmitCard = async (req, res, next) => {
  try {
    const admitCard = await AdmitCard.findById(req.params.id)
      .populate('examId')
      .populate('userId', 'name email');

    if (!admitCard) {
      return res.status(404).json({
        success: false,
        message: 'Admit card not found'
      });
    }

    // Check authorization
    if (admitCard.userId._id.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // In a production environment, you would:
    // 1. Generate a PDF using a library like puppeteer or pdfkit
    // 2. Return the PDF file
    
    // For now, we'll return the data needed to generate the PDF on frontend
    
    // Update download count
    admitCard.downloadCount += 1;
    admitCard.isDownloaded = true;
    admitCard.downloadedAt = new Date();
    await admitCard.save();

    res.status(200).json({
      success: true,
      message: 'Admit card ready for download',
      data: {
        id: admitCard._id,
        rollNumber: admitCard.rollNumber,
        registrationNumber: admitCard.registrationNumber,
        candidateName: admitCard.candidateName,
        fatherName: admitCard.fatherName,
        motherName: admitCard.motherName,
        dateOfBirth: admitCard.dateOfBirth,
        category: admitCard.category,
        gender: admitCard.gender,
        photo: admitCard.photo,
        signature: admitCard.signature,
        exam: {
          title: admitCard.examId.title,
          category: admitCard.examId.category,
          duration: admitCard.examId.duration
        },
        examDetails: admitCard.examDetails,
        instructions: admitCard.instructions,
        itemsToBring: admitCard.itemsToBring,
        downloadUrl: admitCard.downloadLink || `/api/admitcards/${admitCard._id}/pdf`
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admit card details (Admin only)
// @route   PUT /api/admitcards/:id
// @access  Private/Admin
exports.updateAdmitCard = async (req, res, next) => {
  try {
    const {
      candidateName,
      fatherName,
      motherName,
      dateOfBirth,
      category,
      gender,
      examDetails,
      instructions,
      itemsToBring,
      status
    } = req.body;

    const updateFields = {};
    if (candidateName) updateFields.candidateName = candidateName;
    if (fatherName !== undefined) updateFields.fatherName = fatherName;
    if (motherName !== undefined) updateFields.motherName = motherName;
    if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
    if (category) updateFields.category = category;
    if (gender) updateFields.gender = gender;
    if (examDetails) updateFields.examDetails = examDetails;
    if (instructions) updateFields.instructions = instructions;
    if (itemsToBring) updateFields.itemsToBring = itemsToBring;
    if (status) updateFields.status = status;

    const admitCard = await AdmitCard.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!admitCard) {
      return res.status(404).json({
        success: false,
        message: 'Admit card not found'
      });
    }

    res.status(200).json({
      success: true,
      admitCard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload admit card photo/signature
// @route   PUT /api/admitcards/:id/upload
// @access  Private
exports.uploadDocuments = async (req, res, next) => {
  try {
    const { photo, signature } = req.body;

    const updateFields = {};
    if (photo) updateFields.photo = photo;
    if (signature) updateFields.signature = signature;

    const admitCard = await AdmitCard.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!admitCard) {
      return res.status(404).json({
        success: false,
        message: 'Admit card not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      admitCard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete admit card (Admin only)
// @route   DELETE /api/admitcards/:id
// @access  Private/Admin
exports.deleteAdmitCard = async (req, res, next) => {
  try {
    const admitCard = await AdmitCard.findById(req.params.id);

    if (!admitCard) {
      return res.status(404).json({
        success: false,
        message: 'Admit card not found'
      });
    }

    await admitCard.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Admit card deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
