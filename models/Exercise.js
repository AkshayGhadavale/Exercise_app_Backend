const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: String,
    gifUrl: String,
    description: String,

    type: {
      type: String,
      enum: ["count", "time"], // 🔥 key
      required: true,
    },

    defaultTime: {
      type: Number, // seconds (for time-based)
      default: 30,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exercise", exerciseSchema);
