/**
 * Centralized Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`[Backend Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
