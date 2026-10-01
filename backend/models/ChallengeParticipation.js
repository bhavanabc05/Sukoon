const mongoose = require("mongoose");

const challengeParticipationSchema = new mongoose.Schema(
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

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    completedDays: {
      type: [Number],
      default: [],
    },

    currentDay: {
      type: Number,
      default: 1,
    },

    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ["active", "completed", "left"],
      default: "active",
    },

    lastActivityAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "challenge_participations",
  }
);

// A user can join a particular challenge only once.
challengeParticipationSchema.index(
  { challengeId: 1, userId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ChallengeParticipation",
  challengeParticipationSchema
);