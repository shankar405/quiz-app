import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";

import userRoutes from "./src/routes/userRoutes.js";
import matchRoutes from "./src/routes/matchRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";

dotenv.config();

const app = express();
app.use(cors({
 origin: ["http://localhost:5173", "http://127.0.0.1:5173","https://quiz-app-opal-eight.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// DB Connection
connectDB();

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
// ROUTES
app.use("/user", userRoutes);
app.use("/match", matchRoutes);
app.use("/quiz", quizRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
