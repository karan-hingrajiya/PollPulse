import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Poll room — creator dashboard joins this to get live response count
    socket.on("join_poll", (pollId) => {
      socket.join(`poll_${pollId}`);
    });

    socket.on("leave_poll", (pollId) => {
      socket.leave(`poll_${pollId}`);
    });

    // Stats room — landing page joins this to get live platform counts
    socket.on("join_stats", () => {
      socket.join("platform_stats");
    });

    socket.on("leave_stats", () => {
      socket.leave("platform_stats");
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized. Call initSocket first.");
  return io;
};

export const emitStatsUpdate = async () => {
  if (!io) return;
  try {
    const { getCollection } = await import("./db/connection.js");
    const [totalPolls, totalResponses] = await Promise.all([
      getCollection("polls").countDocuments({}),
      getCollection("responses").countDocuments({}),
    ]);
    io.to("platform_stats").emit("stats_update", {
      totalPolls,
      totalResponses,
    });
  } catch {
    // Non-critical — socket emit failing should never crash the app
  }
};
