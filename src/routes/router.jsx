import { createBrowserRouter } from "react-router-dom";

// Layouts & Protected Routes
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AdminRoute from "@/components/layout/AdminRoute";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// User Pages
import HomePage from "@/pages/user/HomePage";
import DiagnosisPage from "@/pages/user/DiagnosisPage";
import HistoryPage from "@/pages/user/HistoryPage";
import ProfilePage from "@/pages/user/ProfilePage";
import AboutPage from "@/pages/user/AboutPage";
import NotFoundPage from "@/pages/NotFoundPage";

// Admin Pages
import ManagePenyakitPage from "@/pages/admin/ManagePenyakitPage";
import ManageGejalaPage from "@/pages/admin/ManageGejalaPage";
import ManageKnowledgeBasePage from "@/pages/admin/ManageKnowledgeBasePage";
import ManageUsersPage from "@/pages/admin/ManageUsersPage";
import ManageSolutionsPage from "@/pages/admin/ManageSolutionsPage";

export const router = createBrowserRouter([
  // 1. Rute Publik (Auth)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // 2. Rute Publik / Semi-Terproteksi (User) di dalam MainLayout
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      // Harus Login untuk kuesioner dan riwayat
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "diagnosis",
            element: <DiagnosisPage />,
          },
          {
            path: "history",
            element: <HistoryPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ]
      }
    ],
  },

  // 3. Rute Terproteksi Khusus Admin
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            // Secara default arahkan ke manage penyakit jika route /admin dipukul
            element: <ManagePenyakitPage />,
          },
          {
            path: "penyakit",
            element: <ManagePenyakitPage />,
          },
          {
            path: "gejala",
            element: <ManageGejalaPage />,
          },
          {
            path: "knowledge-base",
            element: <ManageKnowledgeBasePage />,
          },
          {
            path: "users",
            element: <ManageUsersPage />,
          },
          {
            path: "solusi",
            element: <ManageSolutionsPage />,
          },
        ]
      }
    ]
  },

  // 4. Fallback 404
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
