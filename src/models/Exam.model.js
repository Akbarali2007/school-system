const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    examType: { type: String, required: true }, // Midterm, Final, Quiz
    className: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    duration: { type: Number, required: true }, // minutes
    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, default: null },
    grade: { type: String, default: null },
    status: {
      type: String,
      enum: ['upcoming', 'result-declared'],
      default: 'upcoming',
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);