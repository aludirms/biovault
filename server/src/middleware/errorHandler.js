export const errorHandler = (err, req, res, next) => {
  console.error(`[BioVault API Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || "An internal biobank server error occurred.",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
