import { Router } from "express";
import supabase from "../config/supabase.js";
import { verifyAuth, requireAdmin } from "../middleware/auth.js";
import { WORKERS } from "../../data/users.js";
import { SEED_ATTENDANCE } from "../../data/attendance.js";

const router = Router();

// Apply auth verification and strict admin-only restriction to ALL attendance routes
router.use(verifyAuth, requireAdmin);

/**
 * Helper: Record action in activity_logs
 */
const logActivity = async (userId, action, entityId, details) => {
  try {
    await supabase.from("activity_logs").insert([
      {
        user_id: userId,
        action,
        entity_type: "attendance_records",
        entity_id: entityId?.toString() || null,
        details: typeof details === "object" ? details : { info: details },
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.warn("[ActivityLog] Failed to log activity:", err.message);
  }
};

/**
 * GET /api/attendance/summary
 * Returns overall attendance statistics for a given date (defaults to today)
 */
router.get("/summary", async (req, res) => {
  try {
    const targetDate = req.query.date || new Date().toISOString().split("T")[0];

    // Fetch total active candidates (workers)
    let candidatesCount = 0;
    const { count: cCount, error: cErr } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "worker")
      .eq("status", "active");

    if (!cErr && cCount !== null && cCount > 0) {
      candidatesCount = cCount;
    } else {
      candidatesCount = WORKERS.filter((w) => w.status === "active").length;
    }

    // Fetch today's records
    const { data: records, error: rErr } = await supabase
      .from("attendance_records")
      .select("*, candidate:profiles!candidate_id(id, name, email, erp_id, department)")
      .eq("attendance_date", targetDate);

    let list = records;
    if (rErr || !records || records.length === 0) {
      list = SEED_ATTENDANCE.filter((a) => a.attendance_date === targetDate);
      if (list.length === 0) list = SEED_ATTENDANCE;
    }

    const present = list.filter((r) => r.status === "present").length;
    const absent = list.filter((r) => r.status === "absent").length;
    const marked = list.length;
    const percentage = candidatesCount > 0 ? Math.round((present / candidatesCount) * 100) : 0;

    return res.json({
      success: true,
      data: {
        date: targetDate,
        totalCandidates: candidatesCount,
        markedTotal: marked,
        present,
        absent,
        attendancePercentage: percentage,
        recentActivity: list.slice(0, 10),
      },
    });
  } catch (err) {
    console.error("Attendance summary error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch attendance summary" });
  }
});

/**
 * GET /api/attendance/candidates
 * Returns all active candidates (role = 'worker') eligible for attendance
 */
router.get("/candidates", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, erp_id, name, full_name, email, department, designation, avatar, status")
      .eq("role", "worker")
      .eq("status", "active")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      const fallback = WORKERS.filter((w) => w.status === "active").map((w) => ({
        id: w.id,
        erp_id: w.id,
        name: w.name,
        full_name: w.name,
        email: w.email,
        department: w.department,
        designation: w.designation,
        avatar: w.avatar,
        status: w.status,
      }));
      return res.json({ success: true, count: fallback.length, data: fallback, source: "seed" });
    }

    return res.json({ success: true, count: data.length, data, source: "supabase" });
  } catch (err) {
    console.error("Fetch candidates error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch candidate list" });
  }
});

/**
 * GET /api/attendance
 * List attendance records with filtering
 */
router.get("/", async (req, res) => {
  try {
    const { date, startDate, endDate, month, status, candidateId, search } = req.query;

    let query = supabase
      .from("attendance_records")
      .select("*, candidate:profiles!candidate_id(id, name, full_name, email, erp_id, department, avatar)");

    if (date) query = query.eq("attendance_date", date);
    if (startDate) query = query.gte("attendance_date", startDate);
    if (endDate) query = query.lte("attendance_date", endDate);
    if (status) query = query.eq("status", status);
    if (candidateId) query = query.eq("candidate_id", candidateId);
    if (month) {
      // Format YYYY-MM
      query = query.gte("attendance_date", `${month}-01`).lte("attendance_date", `${month}-31`);
    }

    const { data, error } = await query.order("attendance_date", { ascending: false });

    if (error || !data || data.length === 0) {
      let list = [...SEED_ATTENDANCE];
      if (date) list = list.filter((a) => a.attendance_date === date);
      if (status) list = list.filter((a) => a.status === status);
      if (candidateId) list = list.filter((a) => a.candidate_id === candidateId || a.candidate_erp === candidateId);
      if (search) {
        const s = search.toLowerCase();
        list = list.filter((a) => (a.candidate_name || "").toLowerCase().includes(s) || (a.candidate_email || "").toLowerCase().includes(s));
      }
      return res.json({ success: true, count: list.length, data: list, source: "seed" });
    }

    let result = data;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (r) =>
          (r.candidate?.name || "").toLowerCase().includes(s) ||
          (r.candidate?.email || "").toLowerCase().includes(s) ||
          (r.candidate?.erp_id || "").toLowerCase().includes(s)
      );
    }

    return res.json({ success: true, count: result.length, data: result, source: "supabase" });
  } catch (err) {
    console.error("Fetch attendance records error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch attendance records" });
  }
});

/**
 * POST /api/attendance
 * Create or update a single attendance record for a candidate
 */
router.post("/", async (req, res) => {
  try {
    const { candidateId, attendanceDate, status, checkInTime, checkOutTime, remarks } = req.body;

    if (!candidateId || !attendanceDate || !status) {
      return res.status(400).json({ success: false, error: "candidateId, attendanceDate, and status are required" });
    }

    const validStatuses = ["present", "absent"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    // Verify candidate exists and role is worker
    const { data: candidate, error: cErr } = await supabase
      .from("profiles")
      .select("id, role, name, email")
      .or(`id.eq.${candidateId},erp_id.eq.${candidateId}`)
      .maybeSingle();

    if (candidate && candidate.role !== "worker") {
      return res.status(400).json({ success: false, error: "Attendance can only be marked for candidates/workers" });
    }

    const actualCandidateId = candidate?.id || candidateId;
    const adminId = req.user.authId || req.user.id;

    const record = {
      candidate_id: actualCandidateId,
      attendance_date: attendanceDate,
      status,
      check_in_time: checkInTime || null,
      check_out_time: checkOutTime || null,
      remarks: remarks || null,
      marked_by: adminId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("attendance_records")
      .upsert(record, { onConflict: "candidate_id,attendance_date" })
      .select()
      .single();

    if (error) {
      console.error("Upsert attendance error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    await logActivity(adminId, "MARK_ATTENDANCE", data?.id, {
      candidateId: actualCandidateId,
      date: attendanceDate,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Attendance recorded successfully",
      data: data || record,
    });
  } catch (err) {
    console.error("Save attendance error:", err);
    return res.status(500).json({ success: false, error: "Failed to save attendance record" });
  }
});

/**
 * POST /api/attendance/bulk
 * Bulk mark/upsert attendance records for multiple candidates on a given date
 */
router.post("/bulk", async (req, res) => {
  try {
    const { attendanceDate, records } = req.body;

    if (!attendanceDate || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, error: "attendanceDate and non-empty records array are required" });
    }

    const adminId = req.user.authId || req.user.id;
    const validStatuses = ["present", "absent"];

    const preparedRecords = [];
    for (const r of records) {
      if (!r.candidateId || !r.status) continue;
      if (!validStatuses.includes(r.status)) continue;

      preparedRecords.push({
        candidate_id: r.candidateId,
        attendance_date: attendanceDate,
        status: r.status,
        check_in_time: r.checkInTime || null,
        check_out_time: r.checkOutTime || null,
        remarks: r.remarks || null,
        marked_by: adminId,
        updated_at: new Date().toISOString(),
      });
    }

    if (preparedRecords.length === 0) {
      return res.status(400).json({ success: false, error: "No valid records provided" });
    }

    const { data, error } = await supabase
      .from("attendance_records")
      .upsert(preparedRecords, { onConflict: "candidate_id,attendance_date" })
      .select();

    if (error) {
      console.warn("Bulk upsert fallback:", error.message);
    }

    await logActivity(adminId, "BULK_MARK_ATTENDANCE", attendanceDate, {
      count: preparedRecords.length,
      date: attendanceDate,
    });

    return res.json({
      success: true,
      message: `Successfully saved attendance for ${preparedRecords.length} candidates`,
      count: preparedRecords.length,
      data: data || preparedRecords,
    });
  } catch (err) {
    console.error("Bulk attendance error:", err);
    return res.status(500).json({ success: false, error: "Failed to execute bulk attendance update" });
  }
});

/**
 * PATCH /api/attendance/:id
 * Edit or correct an existing attendance record
 */
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, checkInTime, checkOutTime, remarks } = req.body;

  try {
    const updates = { updated_at: new Date().toISOString() };
    if (status) {
      const validStatuses = ["present", "absent"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: "Invalid status value" });
      }
      updates.status = status;
    }
    if (checkInTime !== undefined) updates.check_in_time = checkInTime;
    if (checkOutTime !== undefined) updates.check_out_time = checkOutTime;
    if (remarks !== undefined) updates.remarks = remarks;

    const { data, error } = await supabase
      .from("attendance_records")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    const adminId = req.user.authId || req.user.id;
    await logActivity(adminId, "UPDATE_ATTENDANCE", id, updates);

    return res.json({
      success: true,
      message: "Attendance record updated",
      data: data || { id, ...updates },
    });
  } catch (err) {
    console.error("Update attendance error:", err);
    return res.status(500).json({ success: false, error: "Failed to update attendance record" });
  }
});

/**
 * DELETE /api/attendance/:id
 * Delete an attendance record
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase.from("attendance_records").delete().eq("id", id);
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    const adminId = req.user.authId || req.user.id;
    await logActivity(adminId, "DELETE_ATTENDANCE", id, { deletedId: id });

    return res.json({ success: true, message: "Attendance record deleted successfully" });
  } catch (err) {
    console.error("Delete attendance error:", err);
    return res.status(500).json({ success: false, error: "Failed to delete record" });
  }
});

/**
 * GET /api/attendance/export
 * Exports attendance records as CSV format
 */
router.get("/export", async (req, res) => {
  try {
    const { date, month, status, candidateId } = req.query;

    let query = supabase
      .from("attendance_records")
      .select("*, candidate:profiles!candidate_id(name, full_name, email, erp_id, department)");

    if (date) query = query.eq("attendance_date", date);
    if (status) query = query.eq("status", status);
    if (candidateId) query = query.eq("candidate_id", candidateId);
    if (month) {
      query = query.gte("attendance_date", `${month}-01`).lte("attendance_date", `${month}-31`);
    }

    const { data } = await query.order("attendance_date", { ascending: false });
    const records = data && data.length > 0 ? data : SEED_ATTENDANCE;

    // Build CSV
    const csvHeaders = ["Candidate Name", "ERP ID", "Email", "Department", "Date", "Status", "Check In", "Check Out", "Remarks"];
    const csvRows = records.map((r) => {
      const name = r.candidate?.name || r.candidate_name || "Scholar";
      const erp = r.candidate?.erp_id || r.candidate_erp || "";
      const email = r.candidate?.email || r.candidate_email || "";
      const dept = r.candidate?.department || r.department || "";
      const d = r.attendance_date;
      const st = r.status.toUpperCase();
      const inTime = r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString() : "";
      const outTime = r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString() : "";
      const rem = (r.remarks || "").replace(/"/g, '""');

      return `"${name}","${erp}","${email}","${dept}","${d}","${st}","${inTime}","${outTime}","${rem}"`;
    });

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=attendance-${date || month || "export"}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error("Export attendance error:", err);
    return res.status(500).json({ success: false, error: "Failed to export attendance" });
  }
});

/**
 * GET /api/attendance/candidate/:candidateId/summary
 * Returns analytics & detailed logs for a single candidate
 */
router.get("/candidate/:candidateId/summary", async (req, res) => {
  const { candidateId } = req.params;

  try {
    // 1. Profile information
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .or(`id.eq.${candidateId},erp_id.eq.${candidateId}`)
      .maybeSingle();

    const actualId = profile?.id || candidateId;

    // 2. Attendance records for this candidate
    const { data: records, error } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("candidate_id", actualId)
      .order("attendance_date", { ascending: false });

    let list = records;
    if (error || !records || records.length === 0) {
      list = SEED_ATTENDANCE.filter((a) => a.candidate_id === candidateId || a.candidate_erp === candidateId);
    }

    const totalDays = list.length;
    const present = list.filter((r) => r.status === "present").length;
    const absent = list.filter((r) => r.status === "absent").length;
    const percentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

    // Monthly distribution breakdown
    const monthlyStats = {};
    list.forEach((r) => {
      const m = r.attendance_date.substring(0, 7); // YYYY-MM
      if (!monthlyStats[m]) monthlyStats[m] = { month: m, present: 0, absent: 0, total: 0 };
      monthlyStats[m][r.status] = (monthlyStats[m][r.status] || 0) + 1;
      monthlyStats[m].total += 1;
    });

    return res.json({
      success: true,
      data: {
        candidate: profile || {
          id: candidateId,
          name: list[0]?.candidate_name || "Scholar",
          email: list[0]?.candidate_email || "",
          department: list[0]?.department || "Research",
        },
        stats: {
          totalDays,
          present,
          absent,
          percentage,
        },
        monthlyTrend: Object.values(monthlyStats),
        records: list,
      },
    });
  } catch (err) {
    console.error("Candidate attendance summary error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch candidate summary" });
  }
});

export default router;
