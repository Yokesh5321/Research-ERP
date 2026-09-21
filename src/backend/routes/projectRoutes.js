import { Router } from "express";
import supabase from "../config/supabase.js";
import { PROJECTS } from "../../data/projects.js";

const router = Router();

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

    if (error || !data || data.length === 0) {
      // Return seeded projects if database query has no results or table not populated yet
      let list = PROJECTS;
      if (status) list = list.filter((p) => p.status === status);
      if (category) list = list.filter((p) => p.category === category);
      if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
      return res.json({ success: true, count: list.length, data: list, source: "seed" });
    }

    return res.json({ success: true, count: data.length, data, source: "supabase" });
  } catch (err) {
    console.error("Fetch projects error:", err);
    return res.json({ success: true, count: PROJECTS.length, data: PROJECTS, source: "fallback" });
  }
});

/**
 * GET /api/projects/:id
 * Retrieve a single project with its tasks
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data: project } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    const { data: tasks } = await supabase.from("tasks").select("*").eq("project_id", id);

    if (project) {
      return res.json({ success: true, data: { ...project, tasks: tasks || [] } });
    }

    const fallbackProject = PROJECTS.find((p) => p.id === id);
    if (!fallbackProject) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    return res.json({ success: true, data: fallbackProject });
  } catch (err) {
    console.error("Fetch project detail error:", err);
    return res.status(500).json({ success: false, error: "Error fetching project detail" });
  }
});

/**
 * POST /api/projects
 * Create a new research project
 */
router.post("/", async (req, res) => {
  try {
    const { name, description, category, priority = "medium", startDate, endDate, managerId, team = [] } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Project name is required" });
    }

    const newProject = {
      id: `p-${Date.now().toString().slice(-4)}`,
      name,
      description: description || "",
      category: category || "Artificial Intelligence",
      priority,
      status: "planning",
      progress: 0,
      start_date: startDate || new Date().toISOString().split("T")[0],
      end_date: endDate || null,
      manager_id: managerId || "admin-001",
      team,
      total_tasks: 0,
      completed_tasks: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("projects").insert([newProject]).select().single();

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: data || newProject,
    });
  } catch (err) {
    console.error("Create project error:", err);
    return res.status(500).json({ success: false, error: "Failed to create project" });
  }
});

export default router;
