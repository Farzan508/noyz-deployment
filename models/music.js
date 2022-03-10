const mongoose = require("mongoose");

const musicSchema = mongoose.Schema(
  {
    artistId: { type: mongoose.Types.ObjectId },
    musicName: { type: String },
    musicLink: { type: String },

    // albumName: { type: String },

    likes: [{ type: mongoose.Types.ObjectId }],
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Music", musicSchema);
