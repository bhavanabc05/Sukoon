const mongoose = require("mongoose");

const guidedReflectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interventionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterventionLibrary",
      required: true,
    },

    emotionalState: {
      primaryEmotion: {
        type: String,
        required: true,
        trim: true,
      },

      secondaryEmotion: {
        type: String,
        required: true,
        trim: true,
      },

      specificEmotion: {
        type: String,
        required: true,
        trim: true,
      },

      intensity: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
    },

    context: {
      type: String,
      required: true,
      trim: true,
    },

    identifiedNeed: {
      type: String,
      required: true,
      trim: true,
    },

    selectedAction: {
      type: String,
      required: true,
      trim: true,
    },

    freeReflection: {
      type: String,
      default: "",
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "guided_reflections",
  }
);

module.exports = mongoose.model(
  "GuidedReflection",
  guidedReflectionSchema
);