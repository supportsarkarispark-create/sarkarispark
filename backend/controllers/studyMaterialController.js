const { StudyMaterial, Course } = require('../models');
const { validationResult } = require('express-validator');

// @desc    Get study materials by course
// @route   GET /api/study-materials/course/:courseId
// @access  Public
exports.getCourseMaterials = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { type } = req.query;

    const query = { 
      courseId,
      isActive: true 
    };

    if (type) query.type = type;

    const materials = await StudyMaterial.find(query)
      .sort({ type: 1, order: 1, createdAt: -1 });

    // Group by type
    const grouped = materials.reduce((acc, material) => {
      if (!acc[material.type]) acc[material.type] = [];
      acc[material.type].push({
        id: material._id,
        title: material.title,
        description: material.description,
        type: material.type,
        fileUrl: material.fileUrl,
        fileSize: material.fileSize,
        fileType: material.fileType,
        thumbnail: material.thumbnail,
        year: material.year,
        language: material.language,
        isPremium: material.isPremium,
        downloadCount: material.downloadCount,
        createdAt: material.createdAt
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: materials.length,
      materials: grouped
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single study material
// @route   GET /api/study-materials/:id
// @access  Public
exports.getMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id)
      .populate('courseId', 'title');

    if (!material || !material.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    res.status(200).json({
      success: true,
      material: {
        id: material._id,
        title: material.title,
        description: material.description,
        courseId: material.courseId?._id,
        courseTitle: material.courseId?.title,
        type: material.type,
        fileUrl: material.fileUrl,
        fileSize: material.fileSize,
        fileType: material.fileType,
        thumbnail: material.thumbnail,
        year: material.year,
        language: material.language,
        isPremium: material.isPremium,
        downloadCount: material.downloadCount,
        createdAt: material.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create study material (Admin only)
// @route   POST /api/study-materials
// @access  Private/Admin
exports.createMaterial = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Handle file upload
    let fileUrl = req.body.fileUrl;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const materialData = {
      ...req.body,
      fileUrl,
      createdBy: req.user.id
    };

    const material = await StudyMaterial.create(materialData);

    res.status(201).json({
      success: true,
      material: {
        id: material._id,
        title: material.title,
        description: material.description,
        type: material.type,
        fileUrl: material.fileUrl,
        year: material.year,
        language: material.language,
        isPremium: material.isPremium,
        order: material.order
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update study material (Admin only)
// @route   PUT /api/study-materials/:id
// @access  Private/Admin
exports.updateMaterial = async (req, res, next) => {
  try {
    let material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    // Handle file upload
    let fileUrl = material.fileUrl;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    }

    const updateData = {
      ...req.body,
      fileUrl
    };

    material = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      material: {
        id: material._id,
        title: material.title,
        description: material.description,
        type: material.type,
        fileUrl: material.fileUrl,
        year: material.year,
        language: material.language,
        isPremium: material.isPremium,
        order: material.order,
        isActive: material.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete study material (Admin only)
// @route   DELETE /api/study-materials/:id
// @access  Private/Admin
exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    await material.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Study material deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle material status (Admin only)
// @route   PATCH /api/study-materials/:id/toggle
// @access  Private/Admin
exports.toggleMaterialStatus = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    material.isActive = !material.isActive;
    await material.save();

    res.status(200).json({
      success: true,
      isActive: material.isActive,
      message: `Study material ${material.isActive ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment download count
// @route   PATCH /api/study-materials/:id/download
// @access  Public
exports.incrementDownload = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material || !material.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    material.downloadCount += 1;
    await material.save();

    res.status(200).json({
      success: true,
      downloadCount: material.downloadCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all materials for admin
// @route   GET /api/study-materials/admin/all
// @access  Private/Admin
exports.getAllMaterialsAdmin = async (req, res, next) => {
  try {
    const { courseId, type } = req.query;

    const query = {};
    if (courseId) query.courseId = courseId;
    if (type) query.type = type;

    const materials = await StudyMaterial.find(query)
      .populate('courseId', 'title')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      materials: materials.map(mat => ({
        id: mat._id,
        title: mat.title,
        description: mat.description,
        courseId: mat.courseId?._id,
        courseTitle: mat.courseId?.title,
        type: mat.type,
        fileUrl: mat.fileUrl,
        fileSize: mat.fileSize,
        year: mat.year,
        language: mat.language,
        isPremium: mat.isPremium,
        isActive: mat.isActive,
        downloadCount: mat.downloadCount,
        createdAt: mat.createdAt,
        createdBy: mat.createdBy
      }))
    });
  } catch (error) {
    next(error);
  }
};
