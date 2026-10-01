const mongoose = require("mongoose");

const challengeActivitySchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    day: {
      type: Number,
      required: true,
      min: 1,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "challenge_activities",
  }
);

// A user can complete a particular task only once.
challengeActivitySchema.index(
  {
    challengeId: 1,
    userId: 1,
    taskId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "ChallengeActivity",
  challengeActivitySchema
);