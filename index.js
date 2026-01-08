const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ⭐ IMPORTANT: serve uploads
app.use("/uploads", express.static("uploads"));



app.use("/auth", require("./routes/auth"));
app.use("/admin", require("./routes/adminAuth")); // ✔ router
app.use("/exercises", require("./routes/exercise"));
app.use("/user", require("./routes/user"));
app.use("/admin", require("./routes/admin"));




mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Mongo error", err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
