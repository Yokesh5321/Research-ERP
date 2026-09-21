import { Router } from "express";
import supabase from "../config/supabase.js";
import { TASKS } from "../../data/tasks.js";

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

    if (error || !data || data.length === 0) {
      let list = TASKS;
      if (projectId) list = list.filter((t) => t.project === projectId || t.project_id === projectId);
      if (assignedTo) list = list.filter((t) => t.assignedTo === assignedTo || t.assigned_to === assignedTo);
      if (status) list = list.filter((t) => t.status === status);
      return res.json({ success: true, count: list.length, data: list, source: "seed" });
    }

    return res.json({ success: true, count: data.length, data, source: "supabase" });
  } catch (err) {
    console.error("Fetch tasks error:", err);
    return res.json({ success: true, count: TASKS.length, data: TASKS, source: "fallback" });
  }
});

/**
 * GET /api/tasks/:id
 * Retrieve single task details
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data: task } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();
    if (task) {
      return res.json({ success: true, data: task });
    }

    const fallbackTask = TASKS.find((t) => t.id === id);
    if (!fallbackTask) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    return res.json({ success: true, data: fallbackTask });
  } catch (err) {
    console.error("Fetch task detail error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch task" });
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post("/", async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority = "medium", dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, error: "Task title and project are required" });
    }

    const newTask = {
      id: `t-${Date.now().toString().slice(-4)}`,
      title,
      description: description || "",
      project_id: projectId,
      assigned_to: assignedTo || null,
      priority,
      status: "not_started",
      progress: 0,
      due_date: dueDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data } = await supabase.from("tasks").insert([newTask]).select().maybeSingle();

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: data || newTask,
    });
  } catch (err) {
    console.error("Create task error:", err);
    return res.status(500).json({ success: false, error: "Failed to create task" });
  }
});

/**
 * PUT /api/tasks/:id
 * Update task status, progress, or submission
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    updates.updated_at = new Date().toISOString();
    const { data } = await supabase.from("tasks").update(updates).eq("id", id).select().maybeSingle();

    return res.json({
      success: true,
      message: "Task updated successfully",
      data: data || { id, ...updates },
    });
  } catch (err) {
    console.error("Update task error:", err);
    return res.status(500).json({ success: false, error: "Failed to update task" });
  }
});

export default router;
