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

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../../dist");

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
  "http://localhost:5000",
  "http://127.0.0.1:5000",
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

// ─── Service Health & API Root (/api and /api/health) ────────────────────────
const handleHealthCheck = (_req, res) => {
  res.json({
    status: "online",
    service: "Research ERP Backend Engine",
    architecture: "Node.js + Express + Supabase + GitHub Webhooks + Code Execution Engine",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "same-origin",
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
      "/api/certificates",
      "/api/github/repos",
      "/api/github/commits",
      "/api/github/webhook",
      "/api/executions/run",
      "/api/executions",
    ],
  });
};

app.get("/api", handleHealthCheck);
app.get("/api/health", handleHealthCheck);

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
// ─── Serve Frontend Application (Same-Host Setup) ─────────────────────────────
// Serve static assets compiled by Vite from the 'dist' directory
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback: any GET request not starting with /api returns index.html
  app.get(/(.*)/, (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: `API endpoint '${req.path}' not found` });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Helpful handler if frontend hasn't been built yet
  app.get(/(.*)/, (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: `API endpoint '${req.path}' not found` });
    }
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Research ERP - Setup Required</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 3rem; background: #0f172a; color: #f8fafc; text-align: center; }
            .card { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; }
            code { background: #090d16; padding: 4px 8px; border-radius: 4px; color: #38bdf8; }
            h1 { color: #38bdf8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Research ERP Server Running</h1>
            <p>Backend API is live at <code>/api</code>.</p>
            <p>To serve the frontend on this same port, build the client app by running:</p>
            <p><code>npm run build</code></p>
          </div>
        </body>
      </html>
    `);
  });
}

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