require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const teacherRoutes = require("./routes/teacherRoutes");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/userRoutes");
const beneficiaryRoutes = require("./routes/beneficiaryRoutes");
const questionRoutes = require("./routes/questionRoutes");

const app = express();
app.use(express.json());

const allowedOrigins = ["http://localhost:5173", "https://bestbraincontest.org", "http://localhost:5174"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin); // ✅ Allow the request if the origin is in the list
    } else {
      callback(new Error("Not allowed by CORS")); // ❌ Reject if not in the list
    }
  },
  methods: ["POST", "GET", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Use routes
app.use("/api", teacherRoutes);
app.use("/api", contactRoutes);
app.use("/api", authRoutes);
app.use("/api", beneficiaryRoutes);
app.use('/api', questionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));