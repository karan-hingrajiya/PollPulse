import app from "./src/app.js";
import "dotenv/config";
import { createServer } from "http";
import { connectDB } from "./src/common/config/db/connection.js";
import initUserDB from "./src/common/config/db/init_user_schema.js";
import { verifyTransporter } from "./src/common/config/mail.js";
import initPollsDb from "./src/common/config/db/init_polls_schema.js";
import initResponseDB from "./src/common/config/db/init_response_schema.js";
import { initSocket } from "./src/common/config/socket.js";

const PORT = process.env.PORT || 5000;

// Create raw HTTP server wrapping Express
const httpServer = createServer(app);

// Attach Socket.io to the HTTP server
initSocket(httpServer);

const server = async function () {
  await connectDB();
  if (process.env.NODE_ENV !== "development") {
    await verifyTransporter();
  }
  await initUserDB();
  await initPollsDb();
  await initResponseDB();

  httpServer.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
    );
  });
};

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

server()
  .then(() => {
    console.log("Server and DB connected successfully");
  })
  .catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
  });
