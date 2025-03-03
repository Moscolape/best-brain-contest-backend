require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const teacherRoutes = require("./routes/teacherRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Use routes
app.use("/api", teacherRoutes);
app.use("/api", contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));