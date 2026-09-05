const mongoose = require("mongoose");

const interventionSchema = new mongoose.Schema(
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

    type: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "recommended",
        "started",
        "completed",
        "dismissed",
      ],
      default: "started",
    },

    recommendedAt: {
      type: Date,
      default: Date.now,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "interventions",
  }
);

module.exports = mongoose.model(
  "Intervention",
  interventionSchema
);