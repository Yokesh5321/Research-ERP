import { Router } from "express";
import supabase from "../config/supabase.js";
import { MEETINGS } from "../../data/meetings.js";

const router = Router();

/**
 * GET /api/meetings
 * List all scheduled meetings
 */
router.get("/", async (req, res) => {
  try {
    const { status, projectId } = req.query;
    let query = supabase.from("meetings").select("*");

    if (status) query = query.eq("status", status);
    if (projectId) query = query.eq("project_id", projectId);

    const { data, error } = await query.order("date", { ascending: true });

    if (error || !data || data.length === 0) {
      let list = MEETINGS;
      if (status) list = list.filter((m) => m.status === status);
      if (projectId) list = list.filter((m) => m.projectId === projectId || m.project_id === projectId);
      return res.json({ success: true, count: list.length, data: list, source: "seed" });
    }

    return res.json({ success: true, count: data.length, data, source: "supabase" });
  } catch (err) {
    console.error("Fetch meetings error:", err);
    return res.json({ success: true, count: MEETINGS.length, data: MEETINGS, source: "fallback" });
  }
});

/**
 * GET /api/meetings/:id
 * Single meeting detail
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await supabase.from("meetings").select("*").eq("id", id).maybeSingle();
    if (data) return res.json({ success: true, data });

    const fallback = MEETINGS.find((m) => m.id === id);
    if (!fallback) return res.status(404).json({ success: false, error: "Meeting not found" });

    return res.json({ success: true, data: fallback });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch meeting" });
  }
});

/**
 * POST /api/meetings
 * Create a new meeting
 */
router.post("/", async (req, res) => {
  try {
    const { title, projectId, date, time, duration = "60", participants = [], meetingLink, agenda = "", createdBy } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({ success: false, error: "Title, date, and time are required" });
    }

    const newMeeting = {
      id: `m-${Date.now().toString().slice(-4)}`,
      title,
      project_id: projectId || null,
      date,
      time,
      duration: duration.toString(),
      participants,
      meeting_link: meetingLink || "https://meet.google.com/erp-meeting",
      status: "upcoming",
      agenda,
      notes: "",
      created_by: createdBy || "admin-001",
      created_at: new Date().toISOString(),
    };

    const { data } = await supabase.from("meetings").insert([newMeeting]).select().maybeSingle();

    return res.status(201).json({
      success: true,
      message: "Meeting scheduled successfully",
      data: data || newMeeting,
    });
  } catch (err) {
    console.error("Create meeting error:", err);
    return res.status(500).json({ success: false, error: "Failed to create meeting" });
  }
});

/**
 * PUT /api/meetings/:id
 * Update meeting
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data } = await supabase.from("meetings").update(updates).eq("id", id).select().maybeSingle();
    return res.json({
      success: true,
      message: "Meeting updated successfully",
      data: data || { id, ...updates },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update meeting" });
  }
});

/**
 * DELETE /api/meetings/:id
 * Delete meeting
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await supabase.from("meetings").delete().eq("id", id);
    return res.json({ success: true, message: "Meeting deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to delete meeting" });
  }
});

export default router;
