const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    googleId: String,
    picture: String,

    // 🏋️ ACTIVE WORKOUT PLAN
    workout: [
      {
        exercise: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        targetCount: {
          type: Number,
          default: 0,
        },
        targetTime: {
          type: Number,
          default: 0,
        },
      },
    ],

    // 📊 WORKOUT HISTORY (FOR PROGRESS)
    workoutHistory: [
      {
        date: {
          type: String, // YYYY-MM-DD
          required: true,
        },
        exercises: [
          {
            exercise: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Exercise",
              required: true,
            },
            targetCount: Number,
            targetTime: Number,
            completed: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],

    // ⚙️ USER SETTINGS
  settings: {
  autoIncrement: { type: Boolean, default: false },
  incrementBy: { type: Number, default: 1 },
  restTime: { type: Number, default: 10 } // ✅ NEW (seconds)
}
,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
