import supabase from "../config/supabase.js";

/**
 * Middleware to verify Supabase Auth JWT token from Authorization header
 */
export const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authorization header missing or invalid format (Bearer <token> required)",
      });
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired session token",
      });
    }

    // Fetch user profile from Supabase profiles table by authenticated user ID
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile && user.email) {
      const { data: profileByEmail } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();
      if (profileByEmail) {
        profile = profileByEmail;
      }
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "User profile not found in database",
      });
    }

    const rawRole = (profile.role || "").trim().toLowerCase();
    const role = (rawRole === "system administrator" || rawRole === "admin") ? "admin" : "worker";

    req.user = {
      id: profile.erp_id || profile.id || user.id,
      authId: user.id,
      email: user.email,
      name: profile.name || profile.full_name || user.user_metadata?.name || "User",
      role,
      status: profile.status || "active",
      department: profile.department || "",
    };

    if (req.user.status === "inactive") {
      return res.status(403).json({
        success: false,
        error: "Account has been deactivated. Contact an administrator.",
      });
    }

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({
      success: false,
      error: "Authentication service error",
    });
  }
};

/**
 * Role-based access control middleware
 * @param  {...string} roles Allowed roles ('admin', 'worker')
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    // Map candidate to worker
    const userRole = req.user.role === "candidate" ? "worker" : req.user.role;
    const normalizedRoles = roles.map((r) => (r === "candidate" ? "worker" : r));

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Required role [${roles.join(", ")}]. Current role: [${req.user.role}]`,
      });
    }

    next();
  };
};

/**
 * Strict Admin-only middleware
 */
export const requireAdmin = requireRole("admin");

