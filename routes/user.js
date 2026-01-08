const express = require("express");
const User = require("../models/User");
const userAuth = require("../middleware/userAuth");

const router = express.Router();

/* =========================
   ➕ ADD EXERCISE TO WORKOUT
========================= */
router.post("/add-exercise", userAuth, async (req, res) => {
  const { exerciseId, targetCount = 0, targetTime = 0 } = req.body;

  const user = await User.findById(req.user.id);

  const exists = user.workout.some(
    (w) => w.exercise.toString() === exerciseId
  );

  if (exists) {
    return res.status(400).json({ message: "Already added" });
  }

  user.workout.push({
    exercise: exerciseId,
    targetCount,
    targetTime,
    completedCount: 0,
  });

  await user.save();
  res.json({ message: "Exercise added to workout" });
});

/* =========================
   👤 GET USER (WORKOUT)
========================= */
router.get("/me", userAuth, async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("workout.exercise");

  // remove deleted exercises
  user.workout = user.workout.filter((w) => w.exercise !== null);
  await user.save();

  res.json(user);
});

/* =========================
   🔁 UPDATE WORKOUT ORDER / DELETE
========================= */
router.put("/workout", userAuth, async (req, res) => {
  const { workout } = req.body;

  const user = await User.findById(req.user.id);
  user.workout = workout;

  await user.save();
  res.json(user.workout);
});

/* =========================
   💾 SAVE WORKOUT (HISTORY + AUTO INCREMENT)
========================= */
router.post("/save-workout", userAuth, async (req, res) => {
  const { exercises } = req.body;

  if (!Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({ message: "Exercises required" });
  }

  const user = await User.findById(req.user.id)
    .populate("workout.exercise");

  const today = new Date().toISOString().split("T")[0];

  if (user.workoutHistory.find((d) => d.date === today)) {
    return res.status(400).json({ message: "Workout already saved today" });
  }

  /* 📅 SAVE HISTORY */
  user.workoutHistory.push({
    date: today,
    exercises: exercises.map((e) => ({
      exercise: e.exercise,
      targetCount: e.targetCount || 0,
      targetTime: e.targetTime || 0,
      completed: e.completed,
    })),
  });

  /* 🔥 AUTO INCREMENT LOGIC */
  if (user.settings.autoIncrement) {
    user.workout.forEach((w) => {
      const done = exercises.find(
        (e) =>
          e.exercise.toString() === w.exercise._id.toString() &&
          e.completed
      );

      if (done) {
        if (w.exercise.type === "count") {
          w.completedCount += user.settings.incrementBy;
          w.targetCount += user.settings.incrementBy;
        }

        if (w.exercise.type === "time") {
          w.targetTime += user.settings.incrementBy;
        }
      }
    });
  }

  await user.save();
  res.json({ message: "Workout saved successfully" });
});

/* =========================
   📊 PROGRESS
========================= */
router.get("/progress", userAuth, async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("workoutHistory.exercises.exercise");

  res.json(user.workoutHistory);
});

/* =========================
   ⚙️ SETTINGS
========================= */
router.get("/settings", userAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.settings);
});


router.put("/settings", userAuth, async (req, res) => {
  const { autoIncrement, incrementBy, restTime } = req.body;

  const user = await User.findById(req.user.id);

  user.settings.autoIncrement = autoIncrement;
  user.settings.incrementBy = incrementBy;
  user.settings.restTime = restTime;

  await user.save();

  res.json(user.settings);
});

module.exports = router;
