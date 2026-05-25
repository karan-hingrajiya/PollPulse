import ApiError from "../utils/api-error.js";

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError && err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    // For non-operational errors, log them for the developer
    console.error("UNHANDLED ERROR:", err);
  }

  // In development, send a detailed error stack
  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      status: "error",
      message,
      stack: err.stack,
    });
  }

  // In production, send a clean, generic message
  return res.status(statusCode).json({
    status: false,
    message,
  });
};

export default errorHandler;
