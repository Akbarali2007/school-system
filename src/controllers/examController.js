const Exam = require('../models/Exam.model');

// 1. Saare exams laana
exports.getExams = async (req, res, next) => {
  try {
    // Sirf us school ke exams dikhayenge jiske user logged in hai
    const exams = await Exam.find({ school: req.user.schoolId }).sort({ date: -1 });
    res.status(200).json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    next(error);
  }
};

// 2. Ek exam ki detail
exports.getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

// 3. Naya exam create karna
exports.createExam = async (req, res, next) => {
  try {
    const examData = { ...req.body, school: req.user.schoolId };
    const exam = await Exam.create(examData);
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

// 4. Exam update karna
exports.updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

// 5. Exam delete karna
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// 6. Result Publish karna
exports.publishResult = async (req, res, next) => {
  try {
    const { obtainedMarks, grade } = req.body;
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { obtainedMarks, grade, status: 'result-declared' },
      { new: true }
    );
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};