import { Router } from "express";
import supabase from "../config/supabase.js";
import { PROJECTS } from "../../data/projects.js";

const router = Router();

// In-memory runtime store for projects initialized with seed data
let inMemoryProjects = [...PROJECTS];

const normalizeProject = (p) => {
  if (!p) return null;
  const mgr = p.manager || p.manager_id || "w-001";
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
    manager: mgr,
    manager_id: mgr,
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

    let dbData = null;
    try {
      let query = supabase.from("projects").select("*");
      if (status) query = query.eq("status", status);
      if (category) query = query.eq("category", category);
      if (search) query = query.ilike("name", `%${search}%`);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        dbData = data;
      }
    } catch (sbErr) {
      console.warn("[Project API] Supabase query warning:", sbErr.message);
    }

    let list = inMemoryProjects.map(normalizeProject);
    if (dbData) {
      const dbIds = new Set(dbData.map((d) => d.id));
      list = [...dbData.map(normalizeProject), ...list.filter((p) => !dbIds.has(p.id))];
    }

    if (status) list = list.filter((p) => p.status === status);
    if (category) list = list.filter((p) => p.category === category);
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

    return res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    console.error("Fetch projects error:", err);
    return res.json({ success: true, count: inMemoryProjects.length, data: inMemoryProjects.map(normalizeProject) });
  }
});

/**
 * GET /api/projects/:id
 * Retrieve a single project
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let dbProject = null;
    let dbTasks = [];

    try {
      const { data: project } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      const { data: tasks } = await supabase.from("tasks").select("*").eq("project_id", id);
      if (project) {
        dbProject = project;
        dbTasks = tasks || [];
      }
    } catch (e) {}

    const memoryProject = inMemoryProjects.find((p) => p.id === id);
    const target = dbProject ? { ...dbProject, tasks: dbTasks } : memoryProject;

    if (!target) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }

    return res.json({ success: true, data: normalizeProject(target) });
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

    const mgr = manager || managerId || "w-001";
    const sDate = startDate || new Date().toISOString().split("T")[0];
    const eDate = endDate || null;

    const newProject = normalizeProject({
      id: `p-${Date.now().toString().slice(-6)}`,
      name,
      description: description || "",
      category: category || "Artificial Intelligence",
      priority,
      status: status || "planning",
      progress: 0,
      startDate: sDate,
      start_date: sDate,
      endDate: eDate,
      end_date: eDate,
      manager: mgr,
      manager_id: mgr,
      team: Array.isArray(team) ? team : [],
      githubRepo: githubRepo || "",
      github_repo: githubRepo || "",
      totalTasks: 0,
      total_tasks: 0,
      completedTasks: 0,
      completed_tasks: 0,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 1. Add to in-memory store
    inMemoryProjects.unshift(newProject);

    // 2. Try inserting into Supabase
    try {
      await supabase.from("projects").insert([{
        id: newProject.id,
        name: newProject.name,
        description: newProject.description,
        category: newProject.category,
        priority: newProject.priority,
        status: newProject.status,
        progress: newProject.progress,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        manager_id: newProject.manager_id,
        team: newProject.team,
        github_repo: newProject.github_repo,
        total_tasks: 0,
        completed_tasks: 0,
      }]);
    } catch (sbErr) {
      console.warn("[Project API] Supabase insert warning:", sbErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
  } catch (err) {
    console.error("Create project error:", err);
    return res.status(500).json({ success: false, error: "Failed to create project" });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    inMemoryProjects = inMemoryProjects.filter((p) => p.id !== id);
    try {
      await supabase.from("projects").delete().eq("id", id);
    } catch (sbErr) {
      console.warn("[Project API] Supabase delete warning:", sbErr.message);
    }
    return res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    console.error("Delete project error:", err);
    return res.status(500).json({ success: false, error: "Failed to delete project" });
  }
});

export default router;
