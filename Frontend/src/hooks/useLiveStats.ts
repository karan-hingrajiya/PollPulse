/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { socket } from "@/common/socket";
import { apiClient } from "@/common/api-client";

interface PlatformStats {
  totalPolls: number;
  totalResponses: number;
}

export function useLiveStats() {
  const [stats, setStats] = useState<PlatformStats>({
    totalPolls: 0,
    totalResponses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const prevStats = useRef<PlatformStats>({ totalPolls: 0, totalResponses: 0 });

  useEffect(() => {
    // 1. Fetch real initial stats from backend
    apiClient
      .get("/api/stats")
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          setStats(data);
          prevStats.current = data;
        }
      })
      .catch(() => {
        // silently fail — show zeros rather than crash
      })
      .finally(() => setIsLoading(false));

    // 2. Connect socket and join the stats room
    socket.connect();
    socket.emit("join_stats");

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // 3. When backend emits new counts, update state
    socket.on("stats_update", (data: PlatformStats) => {
      prevStats.current = stats;
      setStats(data);
    });

    return () => {
      socket.emit("leave_stats");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("stats_update");
      socket.disconnect();
    };
  }, []);

  return { stats, isLoading, isConnected };
}
