import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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
import certificateRoutes from "./routes/certificateRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS Configuration ────────────────────────────────────────────────────────
// Allow requests from the deployed frontend URL (set FRONTEND_URL in production).
// In development, also allow localhost origins.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
].filter(Boolean); // remove undefined/empty entries

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      return callback(new Error(`CORS policy: origin '${origin}' is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-github-event", "x-hub-signature-256"],
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
// Raw body needed for GitHub webhook signature verification
app.use(
  express.json({
    verify: (req, _res, buf) => {
      if (req.path.startsWith("/api/github/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// ─── Service Health & API Root ────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "online",
    service: "Research ERP Backend Engine",
    architecture: "Node.js + Express + Supabase + GitHub Webhooks + Code Execution Engine",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "not configured",
    endpoints: [
      "/api/auth/login",
      "/api/auth/me",
      "/api/auth/register",
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
    ],
  });
});

// ─── Mount Modular API Routes ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/executions", executionRoutes);

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
// Bind to 0.0.0.0 so cloud platforms (Render, Railway, Fly.io) can route traffic.
app.listen(PORT, "0.0.0.0", () => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173 (dev only)";
  console.log(`[Research ERP Backend] Server running on port ${PORT}`);
  console.log(`[Research ERP Backend] CORS allowed origin: ${frontendUrl}`);
  console.log(`[Research ERP Backend] GitHub Webhook: /api/github/webhook`);
  console.log(`[Research ERP Backend] Supabase: ${process.env.SUPABASE_URL ? "connected" : "⚠ SUPABASE_URL not set!"}`);
  console.log(`[Research ERP Backend] Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "configured ✓" : "⚠ NOT SET — backend will fail!"}`);
});