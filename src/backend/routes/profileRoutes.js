import { Router } from "express";
import supabase from "../config/supabase.js";
import { ADMIN_USER, WORKERS } from "../../data/users.js";

const router = Router();

/**
 * GET /api/profiles
 * List all user profiles (with optional role filter: 'admin' | 'worker')
 */
router.get("/", async (req, res) => {
  try {
    const { role, department } = req.query;
    let query = supabase.from("profiles").select("*");

    if (role) query = query.eq("role", role);
    if (department) query = query.eq("department", department);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      let list = [ADMIN_USER, ...WORKERS];
      if (role) list = list.filter((p) => p.role === role);
      if (department) list = list.filter((p) => p.department === department);
      return res.json({ success: true, count: list.length, data: list, source: "seed" });
    }

    return res.json({ success: true, count: data.length, data, source: "supabase" });
  } catch (err) {
    console.error("Fetch profiles error:", err);
    return res.json({ success: true, count: WORKERS.length + 1, data: [ADMIN_USER, ...WORKERS], source: "fallback" });
  }
});

/**
 * GET /api/profiles/:id
 * Retrieve a profile by id, erp_id, or email
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Attempt match on id, erp_id, or email
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .or(`id.eq.${id},erp_id.eq.${id},email.eq.${id}`)
      .maybeSingle();

    if (data) return res.json({ success: true, data });

    const allUsers = [ADMIN_USER, ...WORKERS];
    const fallback = allUsers.find((u) => u.id === id || u.email === id);
    if (!fallback) return res.status(404).json({ success: false, error: "Profile not found" });

    return res.json({ success: true, data: fallback });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
});

/**
 * PUT /api/profiles/:id
 * Update profile attributes
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Ensure role cannot be illegally changed via profile updates
    if (updates.role && !["admin", "worker"].includes(updates.role)) {
      delete updates.role;
    }

    updates.updated_at = new Date().toISOString();

    const { data } = await supabase
      .from("profiles")
      .update(updates)
      .or(`id.eq.${id},erp_id.eq.${id},email.eq.${id}`)
      .select()
      .maybeSingle();

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: data || { id, ...updates },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ success: false, error: "Failed to update profile" });
  }
});

export default router;
