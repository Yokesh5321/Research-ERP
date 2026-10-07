import { Router } from "express";
import supabase from "../config/supabase.js";

const router = Router();

/**
 * GET /api/tasks
 * List tasks with optional filtering by project, assignee, or status
 */
router.get("/", async (req, res) => {
  try {
    const { projectId, assignedTo, status } = req.query;

    let query = supabase.from("tasks").select("*");

    if (projectId) query = query.eq("project_id", projectId);
    if (assignedTo) query = query.eq("assigned_to", assignedTo);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("due_date", { ascending: true });

    if (error) {
      console.error("[Task API] Supabase error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to fetch tasks from database" });
    }

    return res.json({ success: true, count: (data || []).length, data: data || [] });
  } catch (err) {
    console.error("Fetch tasks error:", err);
    return res.status(500).json({ success: false, error: "Server error while fetching tasks" });
  }
});

/**
 * GET /api/tasks/:id
 * Retrieve single task details
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data: task, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: "Failed to fetch task" });
    }

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    return res.json({ success: true, data: task });
  } catch (err) {
    console.error("Fetch task detail error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch task" });
  }
});

/**
 * POST /api/tasks
 * Create a new task — persisted to Supabase only
 */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      project_id,
      assignedTo,
      assigned_to,
      priority = "medium",
      dueDate,
      due_date,
      githubRepo,
      github_repo,
      githubBranch,
      github_branch,
      expectedOutput,
      expected_output,
    } = req.body;

    const resolvedProjectId = projectId || project_id;
    if (!title || !resolvedProjectId) {
      return res.status(400).json({ success: false, error: "Task title and project are required" });
    }

    const newTask = {
      title,
      description: description || "",
      project_id: resolvedProjectId,
      assigned_to: assignedTo || assigned_to || null,
      priority,
      status: "not_started",
      progress: 0,
      due_date: dueDate || due_date || null,
      github_repo: githubRepo || github_repo || null,
      github_branch: githubBranch || github_branch || null,
      expected_output: expectedOutput || expected_output || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert([newTask])
      .select()
      .maybeSingle();

    if (error) {
      console.error("[Task API] Insert error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to create task: " + error.message });
    }

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data,
    });
  } catch (err) {
    console.error("Create task error:", err);
    return res.status(500).json({ success: false, error: "Failed to create task" });
  }
});

/**
 * PUT /api/tasks/:id
 * Update task status, progress, or other fields
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: "Failed to update task: " + error.message });
    }

    return res.json({
      success: true,
      message: "Task updated successfully",
      data,
    });
  } catch (err) {
    console.error("Update task error:", err);
    return res.status(500).json({ success: false, error: "Failed to update task" });
  }
});

export default router;
