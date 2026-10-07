import { Router } from "express";
import supabase from "../config/supabase.js";

const router = Router();

const normalizeProject = (p) => {
  if (!p) return null;
  const sDate = p.startDate || p.start_date || new Date().toISOString().split("T")[0];
  const eDate = p.endDate || p.end_date || null;
  const repo = p.githubRepo || p.github_repo || "";
  const cAt = p.createdAt || p.created_at || new Date().toISOString();
  const uAt = p.updatedAt || p.updated_at || new Date().toISOString();
  const tTasks = p.totalTasks !== undefined ? p.totalTasks : (p.total_tasks || 0);
  const cTasks = p.completedTasks !== undefined ? p.completedTasks : (p.completed_tasks || 0);

  return {
    ...p,
    id: p.id,
    name: p.name,
    description: p.description || "",
    category: p.category || "Artificial Intelligence",
    priority: p.priority || "medium",
    status: p.status || "planning",
    progress: p.progress || 0,
    manager_id: p.manager_id || p.manager || null,
    startDate: sDate,
    start_date: sDate,
    endDate: eDate,
    end_date: eDate,
    githubRepo: repo,
    github_repo: repo,
    createdAt: cAt,
    created_at: cAt,
    updatedAt: uAt,
    updated_at: uAt,
    totalTasks: tTasks,
    total_tasks: tTasks,
    completedTasks: cTasks,
    completed_tasks: cTasks,
    team: Array.isArray(p.team) ? p.team : [],
  };
};

/**
 * GET /api/projects
 * List all projects with optional query filters (status, category, search)
 */
router.get("/", async (req, res) => {
  try {
    const { status, category, search } = req.query;

    let query = supabase.from("projects").select("*");
    if (status) query = query.eq("status", status);
    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("[Project API] Supabase error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to fetch projects from database" });
    }

    const list = (data || []).map(normalizeProject);
    return res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    console.error("Fetch projects error:", err);
    return res.status(500).json({ success: false, error: "Server error while fetching projects" });
  }
});

/**
 * GET /api/projects/:id
 * Retrieve a single project with its tasks
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (projectError) {
      console.error("[Project API] Supabase error:", projectError.message);
      return res.status(500).json({ success: false, error: "Failed to fetch project" });
    }

    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    const { data: tasks } = await supabase.from("tasks").select("*").eq("project_id", id);

    return res.json({
      success: true,
      data: normalizeProject({ ...project, tasks: tasks || [] }),
    });
  } catch (err) {
    console.error("Fetch project detail error:", err);
    return res.status(500).json({ success: false, error: "Server error while fetching project" });
  }
});

/**
 * POST /api/projects
 * Create a new research project — persisted to Supabase only
 */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      priority = "medium",
      startDate,
      endDate,
      manager,
      managerId,
      team = [],
      githubRepo,
      status = "planning",
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Project name is required" });
    }

    const sDate = startDate || new Date().toISOString().split("T")[0];

    const newProject = {
      name,
      description: description || "",
      category: category || "Artificial Intelligence",
      priority,
      status: status || "planning",
      progress: 0,
      start_date: sDate,
      end_date: endDate || null,
      manager_id: managerId || manager || null,
      team: Array.isArray(team) ? team : [],
      github_repo: githubRepo || "",
      total_tasks: 0,
      completed_tasks: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("projects")
      .insert([newProject])
      .select()
      .maybeSingle();

    if (error) {
      console.error("[Project API] Insert error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to create project: " + error.message });
    }

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: normalizeProject(data),
    });
  } catch (err) {
    console.error("Create project error:", err);
    return res.status(500).json({ success: false, error: "Failed to create project" });
  }
});

/**
 * PUT /api/projects/:id
 * Update a project
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: "Failed to update project: " + error.message });
    }

    return res.json({
      success: true,
      message: "Project updated successfully",
      data: normalizeProject(data),
    });
  } catch (err) {
    console.error("Update project error:", err);
    return res.status(500).json({ success: false, error: "Failed to update project" });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project (cascades to tasks)
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      return res.status(500).json({ success: false, error: "Failed to delete project: " + error.message });
    }

    return res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    console.error("Delete project error:", err);
    return res.status(500).json({ success: false, error: "Failed to delete project" });
  }
});

export default router;
