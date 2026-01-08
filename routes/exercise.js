const express = require("express");
const router = express.Router();

const Exercise = require("../models/Exercise");
const adminAuth = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

/* =========================
   ADD EXERCISE (ADMIN)
========================= */
router.post(
  "/",
  adminAuth,
  upload.single("gif"),
  async (req, res) => {
    try {
      const { name, description, type, defaultTime } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "GIF required" });
      }

      const exercise = await Exercise.create({
        name,
        description,
        type,
        defaultTime: type === "time" ? Number(defaultTime) || 30 : undefined,
        gifUrl: `/uploads/${req.file.filename}`,
      });

      res.json(exercise);
    } catch (err) {
      console.error("ADD EXERCISE ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/* =========================
   GET EXERCISES
========================= */
router.get("/", async (req, res) => {
  const { search } = req.query;

  const query = search
    ? { name: { $regex: search, $options: "i" } }
    : {};

  const exercises = await Exercise.find(query);
  res.json(exercises);
});

/* =========================
   UPDATE EXERCISE (ADMIN) ✅ FIXED
========================= */
router.put(
  "/:id",
  adminAuth,
  upload.single("gif"),
  async (req, res) => {
    try {
      const exercise = await Exercise.findById(req.params.id);

      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      // 🔹 Update all fields safely
      exercise.name = req.body.name ?? exercise.name;
      exercise.description =
        req.body.description ?? exercise.description;
      exercise.type = req.body.type ?? exercise.type;

      // 🔹 Handle time-based exercise
      if (exercise.type === "time") {
        exercise.defaultTime =
          Number(req.body.defaultTime) || exercise.defaultTime || 30;
      } else {
        exercise.defaultTime = undefined;
      }

      // 🔹 Update GIF only if new file uploaded
      if (req.file) {
        exercise.gifUrl = `/uploads/${req.file.filename}`;
      }

      await exercise.save();

      res.json(exercise);
    } catch (err) {
      console.error("UPDATE EXERCISE ERROR:", err);
      res.status(500).json({ message: "Update failed" });
    }
  }
);

/* =========================
   DELETE EXERCISE (ADMIN)
========================= */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ message: "Exercise deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
