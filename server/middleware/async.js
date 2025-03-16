// Async handler to wrap controller functions
// This eliminates the need for try/catch blocks in controllers
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler; 