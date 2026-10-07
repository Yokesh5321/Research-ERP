import { Router } from "express";
import supabase from "../config/supabase.js";
import { verifyAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/auth/login
 * Validates credentials and verifies user role matches the chosen login portal (admin vs candidate)
 */
router.post("/login", async (req, res) => {
  const { email, password, loginType = "candidate" } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required",
    });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data?.user) {
      return res.status(401).json({
        success: false,
        error: error?.message || "Invalid email or password",
      });
    }

    // Retrieve profile from Supabase by auth user ID
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    // Fallback: look up by email if profile ID doesn't match yet
    if (!profile && data.user.email) {
      const { data: profileByEmail } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", data.user.email)
        .maybeSingle();
      if (profileByEmail) {
        profile = profileByEmail;
      }
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "User profile not found in database. Please contact an administrator.",
      });
    }

    const rawRole = (profile.role || "").trim().toLowerCase();
    const role = rawRole === "admin" ? "admin" : "worker";
    const status = profile.status || "active";

    if (status === "inactive") {
      return res.status(403).json({
        success: false,
        error: "This account has been deactivated. Please contact an administrator.",
      });
    }

    // Portal enforcement: admin login requires admin role, candidate login requires worker role
    if (loginType === "admin" && role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Please use Candidate Login.",
      });
    }

    if (loginType === "candidate" && role !== "worker") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Please use Admin Login.",
      });
    }

    return res.json({
      success: true,
      message: `Successfully authenticated as ${role}`,
      token: data.session?.access_token,
      user: {
        id: profile.id,
        authId: data.user.id,
        email: data.user.email,
        name: profile.name || profile.full_name || data.user.user_metadata?.name || "User",
        role,
        department: profile.department || "",
        designation: profile.designation || (role === "admin" ? "System Administrator" : "Research Scholar"),
        phone: profile.phone || "",
        skills: profile.skills || [],
        status,
      },
    });
  } catch (err) {
    console.error("Login endpoint error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal authentication error",
    });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user profile
 */
router.get("/me", verifyAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

/**
 * POST /api/auth/register
 * Creates a new user account (admin or worker).
 * Uses supabase.auth.admin.createUser() so the account is immediately confirmed.
 * This endpoint should be protected — only admins should create accounts in production.
 * The service_role key (used in backend supabase client) is required for admin.createUser().
 */
router.post("/register", async (req, res) => {
  const {
    email,
    password,
    name,
    role = "worker", // 'admin' | 'worker'
    department = "Research",
    designation,
    phone = "",
  } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: "Email, password, and name are required",
    });
  }

  const normalizedRole = role === "admin" ? "admin" : "worker";
  const normalizedDesignation =
    designation ||
    (normalizedRole === "admin" ? "System Administrator" : "Research Scholar");

  try {
    // Use admin.createUser() — requires service_role key.
    // This creates a confirmed user immediately (no email verification needed).
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        name: name.trim(),
        role: normalizedRole,
        department,
        designation: normalizedDesignation,
        phone,
      },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // The database trigger handle_new_user() will automatically create the profile.
    // We can also upsert the profile here to ensure it has all fields.
    if (data.user) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: email.trim(),
          name: name.trim(),
          full_name: name.trim(),
          role: normalizedRole,
          department,
          designation: normalizedDesignation,
          phone,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }

    return res.status(201).json({
      success: true,
      message: `User created successfully as ${normalizedRole === "admin" ? "Admin" : "Candidate (Worker)"}`,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name,
        role: normalizedRole,
      },
    });
  } catch (err) {
    console.error("Register endpoint error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to create user",
    });
  }
});

export default router;
