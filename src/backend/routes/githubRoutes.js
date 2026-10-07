import { Router } from "express";
import supabase from "../config/supabase.js";
import crypto from "crypto";

const router = Router();

/**
 * GET /api/github/repos
 * List all integrated GitHub repositories from Supabase
 */
router.get("/repos", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("github_repos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      // Return empty list — no fallback to mock data
      return res.json({ success: true, count: 0, data: [] });
    }

    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch repositories" });
  }
});

/**
 * GET /api/github/commits
 * List all repository commits from Supabase
 */
router.get("/commits", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("github_commits")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("[GitHub API] Supabase error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to fetch commits" });
    }

    return res.json({ success: true, count: (data || []).length, data: data || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch commits" });
  }
});

/**
 * POST /api/github/webhook
 * GitHub Webhook endpoint — must be publicly reachable (not localhost!)
 * Configure in GitHub: Repository → Settings → Webhooks → Payload URL = https://your-backend/api/github/webhook
 */
router.post("/webhook", async (req, res) => {
  const event = req.headers["x-github-event"] || "push";
  const signature = req.headers["x-hub-signature-256"];
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

  // Verify GitHub webhook signature if secret is configured
  if (webhookSecret && signature) {
    const rawBody = req.rawBody;
    if (rawBody) {
      const expectedSig =
        "sha256=" +
        crypto
          .createHmac("sha256", webhookSecret)
          .update(rawBody)
          .digest("hex");

      if (
        !crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(expectedSig)
        )
      ) {
        console.warn("[GitHub Webhook] Signature verification failed — invalid secret");
        return res.status(401).json({ success: false, error: "Invalid webhook signature" });
      }
    }
  }

  const payload = req.body;
  console.log(`[GitHub Webhook] Received event: ${event}`);

  try {
    if (event === "push") {
      const commits = payload.commits || [];
      const repoName = payload.repository?.full_name || "unknown/repository";
      const branch = (payload.ref || "refs/heads/main").replace("refs/heads/", "");
      const pusherUsername = payload.pusher?.name || payload.sender?.login || "unknown";

      const commitRecords = commits.map((c) => ({
        id: `gh-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        repo: repoName,
        branch,
        sha: (c.id || "").substring(0, 7) || "unknown",
        message: c.message || "Commit received via webhook",
        author_id: c.author?.username || pusherUsername,
        author_name: c.author?.name || pusherUsername,
        timestamp: c.timestamp || new Date().toISOString(),
        status: "pending",
        additions: c.added?.length || 0,
        deletions: c.removed?.length || 0,
        changed_files: (c.modified?.length || 0) + (c.added?.length || 0),
        created_at: new Date().toISOString(),
      }));

      if (commitRecords.length > 0) {
        const { error: insertError } = await supabase
          .from("github_commits")
          .insert(commitRecords);

        if (insertError) {
          console.error("[GitHub Webhook] Failed to store commits:", insertError.message);
        }
      }

      return res.json({
        success: true,
        message: `Processed ${commitRecords.length} commits from ${repoName}`,
        commits: commitRecords,
      });
    }

    if (event === "ping") {
      return res.json({ success: true, message: "Webhook ping received successfully" });
    }

    return res.json({
      success: true,
      message: `Webhook event '${event}' acknowledged`,
    });
  } catch (err) {
    console.error("[GitHub Webhook Error]:", err);
    return res.status(500).json({ success: false, error: "Webhook processing error" });
  }
});

export default router;
