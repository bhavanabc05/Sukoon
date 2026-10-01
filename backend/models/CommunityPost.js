const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    category: {
      type: String,
      enum: [
        "General",
        "Work",
        "Stress",
        "Wellbeing",
        "Support",
        "Celebration",
      ],
      default: "General",
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "community_posts",
  }
);

module.exports = mongoose.model(
  "CommunityPost",
  communityPostSchema
);