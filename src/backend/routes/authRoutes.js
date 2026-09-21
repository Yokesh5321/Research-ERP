import { Router } from "express";
import supabase from "../config/supabase.js";
import { verifyAuth } from "../middleware/auth.js";

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

    // Retrieve profile from Supabase by user ID (.eq("id", data.user.id))
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

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
    const role = (rawRole === "system administrator" || rawRole === "admin") ? "admin" : "worker";
    const status = profile.status || "active";

    if (status === "inactive") {
      return res.status(403).json({
        success: false,
        error: "This account has been deactivated. Please contact an administrator.",
      });
    }

    // Role Enforcement according to portal type
    if (loginType === "admin") {
      if (role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Access denied. Please use Candidate Login.",
        });
      }
    } else if (loginType === "candidate") {
      if (role !== "worker") {
        return res.status(403).json({
          success: false,
          error: "Access denied. Please use Admin Login.",
        });
      }
    }

    return res.json({
      success: true,
      message: `Successfully authenticated as ${role}`,
      token: data.session?.access_token,
      user: {
        id: profile.erp_id || profile.id || data.user.id,
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
 * Returns current authenticated user
 */
router.get("/me", verifyAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

/**
 * POST /api/auth/register
 * Creates a new user with their portal type (admin or candidate/worker)
 */
router.post("/register", async (req, res) => {
  const {
    email,
    password,
    name,
    role = "worker", // 'admin' | 'worker'
    department = "Research",
    designation = role === "admin" ? "System Administrator" : "Research Scholar",
    phone = "",
  } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      error: "Email, password, and name are required",
    });
  }

  const normalizedRole = role === "admin" ? "admin" : "worker";

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          role: normalizedRole,
          department,
          designation,
          phone,
        },
      },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
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

