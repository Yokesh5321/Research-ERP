import { Router } from "express";
import supabase from "../config/supabase.js";
import { NOTIFICATIONS } from "../../data/notifications.js";

const router = Router();

/**
 * GET /api/notifications
 * List notifications for user
 */
router.get("/", async (req, res) => {
  try {
    const { userId, unreadOnly } = req.query;
    let query = supabase.from("notifications").select("*");

    if (userId) query = query.or(`user_id.eq.${userId},user_id.is.null`);
    if (unreadOnly === "true") query = query.eq("read", false);

    const { data, error } = await query.order("timestamp", { ascending: false });

    if (error || !data || data.length === 0) {
      let list = NOTIFICATIONS;
      if (userId) list = list.filter((n) => !n.userId || n.userId === userId);
      if (unreadOnly === "true") list = list.filter((n) => !n.read);
      return res.json({ success: true, count: list.length, data: list, source: "seed" });
    }

    return res.json({ success: true, count: data.length, data, source: "supabase" });
  } catch (err) {
    console.error("Fetch notifications error:", err);
    return res.json({ success: true, count: NOTIFICATIONS.length, data: NOTIFICATIONS, source: "fallback" });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark single notification as read
 */
router.patch("/:id/read", async (req, res) => {
  const { id } = req.params;
  try {
    const { data } = await supabase.from("notifications").update({ read: true }).eq("id", id).select().maybeSingle();
    return res.json({ success: true, message: "Marked as read", data: data || { id, read: true } });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to update notification" });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for a user
 */
router.patch("/read-all", async (req, res) => {
  const { userId } = req.body;
  try {
    let query = supabase.from("notifications").update({ read: true });
    if (userId) query = query.eq("user_id", userId);
    await query;
    return res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to mark all as read" });
  }
});

/**
 * POST /api/notifications
 * Dispatch a new notification
 */
router.post("/", async (req, res) => {
  try {
    const { type, title, message, userId, link, icon } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: "Title and message are required" });
    }

    const newNotif = {
      id: `n-${Date.now().toString().slice(-4)}`,
      type: type || "info",
      title,
      message,
      user_id: userId || null,
      read: false,
      timestamp: new Date().toISOString(),
      link: link || null,
      icon: icon || "bell",
      created_at: new Date().toISOString(),
    };

    const { data } = await supabase.from("notifications").insert([newNotif]).select().maybeSingle();

    return res.status(201).json({
      success: true,
      message: "Notification created",
      data: data || newNotif,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Failed to create notification" });
  }
});

export default router;
