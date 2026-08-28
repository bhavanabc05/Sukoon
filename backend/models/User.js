const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: String,
    passwordHash: String,
    fullName: String,
    profession: String,
    specialization: String,
    organization: String,
    preferredLanguage: String,
    createdAt: Date,
  },
  {
    collection: "users",
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;