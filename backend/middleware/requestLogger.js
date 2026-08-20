/**
 * Custom requestLogger Middleware
 * Logs incoming HTTP requests in the required format:
 * [METHOD] [PATH] [TIMESTAMP]
 * Example: [GET] /api/v1/appointments [2026-08-20T10:15:20.000Z]
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.originalUrl || req.url;
  console.log(`[${method}] ${path} [${timestamp}]`);
  next();
};

module.exports = requestLogger;
