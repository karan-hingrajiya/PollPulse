import express, { urlencoded } from "express";
import { getCollection } from "./common/config/db/connection.js";
import cookieParser from "cookie-parser";
import ApiError from "./common/utils/api-error.js";
import router from "./module/auth/auth.route.js";
import errorHandler from "./common/middleware/error-handler.js";
import pollRouter from "./module/polls/polls.route.js";
import responseRouter from "./module/responses/responses.route.js";
import analyticsRouter from "./module/analytics/analytics.route.js";
import statsRouter from "./module/stats/stats.route.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", router);
app.use("/api/poll", pollRouter);
app.use("/api/response", responseRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/stats", statsRouter);

app.all("{*path}", (req, res) => {
  throw ApiError.notFound(`Requested URL ${req.originalUrl} not found`);
});

// Global error handling middleware
app.use(errorHandler);

export default app;
