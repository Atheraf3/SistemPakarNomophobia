import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export default function AdminRoute() {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    // Jika bukan admin, lempar ke halaman utama user
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
