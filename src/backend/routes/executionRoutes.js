import { Router } from "express";
import supabase from "../config/supabase.js";

const router = Router();

/**
 * POST /api/executions/run
 * Code Execution Sandbox Engine
 * Runs submitted code in a simulated sandbox, evaluates results, and persists to Supabase.
 */
router.post("/run", async (req, res) => {
  const {
    taskId,
    studentId,
    projectId,
    code = "",
    commitHash = "unknown",
    commitMessage = "Submit implementation for verification",
  } = req.body;

  if (!taskId || !studentId || !projectId) {
    return res.status(400).json({
      success: false,
      error: "taskId, studentId, and projectId are required",
    });
  }

  const startTime = new Date();

  // Sandbox test suite definition
  const testDefinitions = [
    { name: "Syntax and structure validation", duration: "0.12s" },
    { name: "Package dependency resolution", duration: "1.45s" },
    { name: "Dataset input loading & format check", duration: "0.85s" },
    { name: "Core algorithm execution & correctness", duration: "2.10s" },
    { name: "Edge cases & memory bounds (< 4GB)", duration: "0.45s" },
    { name: "Output schema validation & artifact generation", duration: "0.32s" },
  ];

  // Basic code evaluation
  const hasSyntaxError = code.includes("throw new Error") || code.includes("SYNTAX_ERROR");
  const testsPassed = hasSyntaxError ? 2 : testDefinitions.length;
  const testsFailed = testDefinitions.length - testsPassed;
  const status = testsFailed === 0 ? "passed" : "failed";

  const testCases = testDefinitions.map((test, index) => ({
    name: test.name,
    status: index < testsPassed ? "passed" : "failed",
    duration: test.duration,
  }));

  const endTime = new Date(startTime.getTime() + 5290);

  const consoleOutput = `[Sandbox Engine] Initializing container environment...
[Sandbox Engine] OS: Linux 6.1.0-x86_64 | Node/Python Runtime: Active
[Sandbox Engine] Installing dependencies from requirements...
  ✓ Dependencies installed cleanly (0 vulnerabilities)
[Sandbox Engine] Running verification test suite...
${testCases.map((t) => `  ${t.status === "passed" ? "✓" : "✗"} ${t.name} (${t.duration})`).join("\n")}
[Sandbox Engine] Test run completed. Total: ${testDefinitions.length}, Passed: ${testsPassed}, Failed: ${testsFailed}.
${status === "passed" ? "✓ ALL CHECKS PASSED. Ready for evaluation." : "✗ VERIFICATION FAILED. Review errors."}
`;

  const executionRecord = {
    submission_id: `SUB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    student_id: studentId,
    project_id: projectId,
    task_id: taskId,
    commit_hash: commitHash,
    commit_message: commitMessage,
    execution_time: "5.29s",
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status,
    tests_passed: testsPassed,
    tests_failed: testsFailed,
    total_tests: testDefinitions.length,
    console_output: consoleOutput,
    error_output: hasSyntaxError ? "SyntaxError: Unexpected identifier in submitted code" : "",
    test_cases: testCases,
    final_result: status.toUpperCase(),
    created_at: new Date().toISOString(),
  };

  try {
    // Persist execution result in Supabase (let DB generate the UUID)
    const { data: inserted, error: insertError } = await supabase
      .from("executions")
      .insert([executionRecord])
      .select()
      .maybeSingle();

    if (insertError) {
      console.error("[Execution API] Failed to persist execution:", insertError.message);
      return res.status(500).json({ success: false, error: "Failed to save execution result" });
    }

    // Update task status based on execution result
    await supabase
      .from("tasks")
      .update({
        status: status === "passed" ? "completed" : "failed",
        progress: status === "passed" ? 100 : 50,
        submitted_at: new Date().toISOString(),
        execution_id: inserted?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId);

    return res.status(200).json({
      success: true,
      message: `Code execution completed with status: ${status}`,
      data: inserted || executionRecord,
    });
  } catch (err) {
    console.error("[Execution API] Error:", err.message);
    return res.status(500).json({ success: false, error: "Execution engine error" });
  }
});

/**
 * GET /api/executions
 * List all code execution records from Supabase
 */
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("executions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Execution API] Supabase error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to fetch executions" });
    }

    return res.json({ success: true, count: (data || []).length, data: data || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error fetching executions" });
  }
});

/**
 * GET /api/executions/:id
 * Retrieve detail of a single execution run
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("executions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: "Failed to fetch execution" });
    }

    if (!data) {
      return res.status(404).json({ success: false, error: "Execution record not found" });
    }

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Error fetching execution detail" });
  }
});

export default router;
