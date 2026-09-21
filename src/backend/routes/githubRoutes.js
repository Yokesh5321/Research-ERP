import { Router } from "express";
import supabase from "../config/supabase.js";
import { GITHUB_COMMITS, GITHUB_REPOS } from "../../data/github.js";

const router = Router();

/**
 * GET /api/github/repos
 * List all integrated GitHub repositories
 */
router.get("/repos", (req, res) => {
  res.json({
    success: true,
    data: GITHUB_REPOS || [
      { id: "repo-01", name: "research-org/medical-image-ai", branch: "main", stars: 42, forks: 12 },
      { id: "repo-02", name: "research-org/nlp-sentiment", branch: "main", stars: 18, forks: 4 },
      { id: "repo-03", name: "research-org/realtime-object-detection", branch: "main", stars: 55, forks: 19 },
    ],
  });
});

/**
 * GET /api/github/commits
 * List all repository commits
 */
router.get("/commits", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("github_commits")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error || !data || data.length === 0) {
      return res.json({ success: true, count: GITHUB_COMMITS.length, data: GITHUB_COMMITS, source: "seed" });
    }

    return res.json({ success: true, count: data.length, data, source: "supabase" });
  } catch (err) {
    return res.json({ success: true, count: GITHUB_COMMITS.length, data: GITHUB_COMMITS, source: "fallback" });
  }
});

/**
 * POST /api/github/webhook
 * GitHub Webhook endpoint for handling repository events (push, pull_request)
 */
router.post("/webhook", async (req, res) => {
  const event = req.headers["x-github-event"] || "push";
  const payload = req.body;

  console.log(`[GitHub Webhook] Received event: ${event}`);

  try {
    if (event === "push") {
      const commits = payload.commits || [];
      const repoName = payload.repository?.full_name || "research-org/repository";
      const branch = (payload.ref || "refs/heads/main").replace("refs/heads/", "");

      const commitRecords = commits.map((c) => ({
        id: `gh-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        repo: repoName,
        branch,
        sha: (c.id || "").substring(0, 7) || "a1b2c3d",
        message: c.message || "Commit received via webhook",
        author_id: c.author?.username || "candidate",
        author_name: c.author?.name || "Scholar",
        timestamp: c.timestamp || new Date().toISOString(),
        status: "passed",
        additions: c.added?.length || 1,
        deletions: c.removed?.length || 0,
        changed_files: (c.modified?.length || 0) + (c.added?.length || 0),
        created_at: new Date().toISOString(),
      }));

      if (commitRecords.length > 0) {
        await supabase.from("github_commits").insert(commitRecords);
      }

      return res.json({
        success: true,
        message: `Processed ${commitRecords.length} commits from webhook push to ${repoName}`,
        commits: commitRecords,
      });
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
