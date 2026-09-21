import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import supabase from "./config/supabase.js";
import errorHandler from "./middleware/errorHandler.js";

// Modular Routes
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import executionRoutes from "./routes/executionRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Service Health & API Root
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Research ERP Backend Engine",
    architecture: "Node.js + Express + Supabase + GitHub Webhooks + Code Execution Engine",
    version: "1.0.0",
    endpoints: [
      "/api/auth/login",
      "/api/auth/me",
      "/api/projects",
      "/api/tasks",
      "/api/meetings",
      "/api/documents",
      "/api/notifications",
      "/api/profiles",
      "/api/attendance",
      "/api/github/repos",
      "/api/github/commits",
      "/api/github/webhook",
      "/api/executions/run",
      "/api/executions",
      "/test-supabase",
    ],
  });
});

// Supabase connectivity check
app.get("/test-supabase", async (req, res) => {
  const { data, error } = await supabase.from("projects").select("*").limit(1);

  if (error) {
    return res.status(500).json({
      connected: false,
      error: error.message,
    });
  }

  res.json({
    connected: true,
    message: "Supabase connection verified successfully",
    sample: data,
  });
});

// Mount modular API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/executions", executionRoutes);

// Centralized Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Research ERP Backend] Running at http://localhost:${PORT}`);
  console.log(`[Research ERP Backend] Code Execution Sandbox: Ready`);
  console.log(`[Research ERP Backend] GitHub Webhook Endpoint: Ready at http://localhost:${PORT}/api/github/webhook`);
});