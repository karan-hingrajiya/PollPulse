import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Single shared socket instance — not auto-connected
// Components call socket.connect() and socket.disconnect() themselves
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnectionAttempts: 3,
  reconnectionDelay: 2000,
});