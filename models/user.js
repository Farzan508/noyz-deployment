const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fullName: { type: String, required: true },

    username: { type: String, unique: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    image: { type: String },

    emailConfirmationCode: { type: String },

    isEmailVerified: { type: Boolean, default: false },

    passwordResetToken: { type: String, default: "null" },

    // likedSongs: [{ type: mongoose.Types.ObjectId }],

    genre: [{ type: String }],

    walletAddress: { type: String, unique: true, default: "null" },

    userStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
