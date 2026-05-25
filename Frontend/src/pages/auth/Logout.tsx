import { useState } from "react";
import { apiClient } from "@/common/api-client";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export default function useLogout() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post("/api/auth/logout");

      // Clear the access token from local storage
      localStorage.removeItem("accessToken");

      // UX: Wait a short moment so the user sees the loading state smoothly
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success("Logged out successfully", {
        icon: <CheckCircle2 className="text-emerald-400" />,
      });

      navigate("/login");
    } catch (error) {
      toast.error("Failed to log out properly.");
      console.error(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { handleLogout, isLoggingOut };
}
