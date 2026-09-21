import { Router } from "express";
import supabase from "../config/supabase.js";
import { DOCUMENTS } from "../../data/documents.js";

const router = Router();

/**
 * GET /api/documents
 * List all registered documents
 */
router.get("/", async (req, res) => {
  try {
    const { category, projectId, search } = req.query;
    let query = supabase.from("documents").select("*");

    if (category) query = query.eq("category", category);
    if (projectId) query = query.eq("project_id", projectId);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      let list = DOCUMENTS;
      if (category) list = list.filter((d) => d.category === category);
      if (projectId) list = list.filter((d) => d.projectId === projectId || d.project_id === projectId);
      if (search) list = list.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
      return res.json({ success: true, count: list.length, data: list, source: "seed" });
    }

    return res.json({ success: true, count: data.length, data, source: "supabase" });
  } catch (err) {
    console.error("Fetch documents error:", err);
    return res.json({ success: true, count: DOCUMENTS.length, data: DOCUMENTS, source: "fallback" });
  }
});

/**
 * GET /api/documents/:id
 * Single document detail
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await supabase.from("documents").select("*").eq("id", id).maybeSingle();
    if (data) return res.json({ success: true, data });

    const fallback = DOCUMENTS.find((d) => d.id === id);
    if (!fallback) return res.status(404).json({ success: false, error: "Document not found" });

    return res.json({ success: true, data: fallback });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch document" });
  }
});

/**
 * POST /api/documents
 * Upload document metadata (with optional Supabase storage file_url)
 */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      category = "Project Documents",
      projectId,
      uploadedBy,
      version = "1.0",
      size = "1.0 MB",
      type = "pdf",
      tags = [],
      fileUrl = null,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: "Document name is required" });
    }

    const newDoc = {
      id: `d-${Date.now().toString().slice(-4)}`,
      name,
      category,
      project_id: projectId || null,
      uploaded_by: uploadedBy || "admin-001",
      version,
      date: new Date().toISOString().split("T")[0],
      size,
      type,
      tags,
      file_url: fileUrl,
      created_at: new Date().toISOString(),
    };

    const { data } = await supabase.from("documents").insert([newDoc]).select().maybeSingle();

    return res.status(201).json({
      success: true,
      message: "Document created successfully",
      data: data || newDoc,
    });
  } catch (err) {
    console.error("Create document error:", err);
    return res.status(500).json({ success: false, error: "Failed to create document" });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete document
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await supabase.from("documents").delete().eq("id", id);
    return res.json({ success: true, message: "Document deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to delete document" });
  }
});

export default router;
