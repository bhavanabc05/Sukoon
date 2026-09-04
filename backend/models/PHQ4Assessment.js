const mongoose = require("mongoose");

const phq4AssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    responses: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) =>
          value.length === 4 &&
          value.every((score) => Number.isInteger(score) && score >= 0 && score <= 3),
        message: "PHQ-4 must contain exactly 4 responses between 0 and 3.",
      },
    },

    anxietyScore: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },

    depressionScore: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 12,
    },

    interpretation: {
      type: String,
      required: true,
      enum: ["normal", "mild", "moderate", "severe"],
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "phq4_assesments",
  }
);

module.exports = mongoose.model(
  "PHQ4Assessment",
  phq4AssessmentSchema
);